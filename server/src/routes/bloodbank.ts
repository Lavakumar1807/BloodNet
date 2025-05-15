import express, { Request, Response ,NextFunction} from "express";
import pool from "../database";
import { hashPassword,comparePasswords } from "../hashPassword";
import { RowDataPacket } from 'mysql2';
const router = express.Router();

const jwt = require("jsonwebtoken");
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;


interface BloodBankInfo extends RowDataPacket{
    id : number
    bloodbankname : string
    location : string
    contactnumber : number
    role : string
    password: string
}

router.get('/bloodbanks',async(req:Request,res:Response)=>{
    try{
        const [bloodbanks] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank"
        )
        const bloodBankCount = (bloodbanks as any).length;
        res.status(200).json({ bloodbanks : bloodbanks , count : bloodBankCount});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})

router.get('/bloodbanklocations',async(req:Request,res:Response)=>{
    try{
        const [locations] = await pool.query(
            "SELECT DISTINCT location FROM bloodbank"
        )
        res.status(200).json({ locations : locations});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})

router.get('/bloodbanks/:location',async(req:Request,res:Response)=>{
    try{
        const { location } = req.params;
        const [bloodbanks] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank WHERE location = ? ",[location]
        )
        res.status(200).json({ bloodbanks : bloodbanks});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})


router.post('/register/bloodbank' , async(req:Request,res:Response)=>{
    try{
        const { bloodbankname,location,contactnumber,password } = req.body;
        const hashedPassword = await hashPassword(password);

        const [bloodbank] = await pool.query(
            "INSERT INTO bloodbank (bloodbankname,location,contactnumber,password) VALUES (?,?,?,?)",[bloodbankname,location,contactnumber,hashedPassword]
        )

        const insertId = (bloodbank as any).insertId; 
        res.status(201).json({ message : "BloodBank created" , bloodbankId : insertId});
        return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
});

interface BloodBankRow extends RowDataPacket {
    id : number
    password: string
}

router.post("/login/bloodbank", async(req:Request,res:Response)=>{
    try{
       const { bloodbankname,password } = req.body;

       const [bloodbank] = await pool.query<BloodBankRow[]>(
         "SELECT id,password FROM bloodbank WHERE bloodbankname = ?",[bloodbankname]
       )
       
       if(!bloodbank){
         res.status(404).json({ message : "No BloodBank Found"});
         return;
       }
       
       const hashedPassword = bloodbank[0].password;
       const check = await comparePasswords(password,hashedPassword);
       if(check){
        const token = jwt.sign({ id : bloodbank[0].id ,name: bloodbankname ,role: "bloodbank" }, SECRET_KEY, { expiresIn: "15d" });
        
        res.cookie("BNToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict", 
            maxAge: 15 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({message : "Login Successful :)"});
       }else{
         res.status(400).json({ message : "Wrong password"});
       }
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
})

router.get("/details/bloodbank/:bloodBankId",async(req:Request,res:Response)=>{
    try{
         const { bloodBankId } = req.params;
         const [bloodbank] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank WHERE id = ? ",[bloodBankId]
         )
         res.status(200).json({bloodbank : bloodbank});
    }catch(error){
        res.status(500).json({message : "Error in fetching Blood Bank Details"})
    }
})

interface BloodSpecimen extends RowDataPacket{
    quantity : string
    collected_date : string
    expiry_date : string
    status : string
    bloodgroup : string
    donor_id : string
}

interface DonorInfo extends RowDataPacket{
    id : number
    donorname : string
    age:number
    dateofbirth:string
    bloodgroup : string
    gender : string
    role : string 
    phonenumber : number
    staff_id:string
    password: string
  }

router.get("/bloodbank/transactions/:bloodbankId",async(req:Request,res:Response)=>{
    try{
         const { bloodbankId } = req.params;
         const [transactions] = await pool.query<BloodSpecimen[]>(
           "SELECT quantity,collected_date,donor_id FROM bloodspecimen WHERE bloodbank_id = ?",[bloodbankId]
         )

         const enrichedTransactions = await Promise.all(
         transactions.map(async (tx)=>{
           const donorId = tx.donor_id;
           const [donor] = await pool.query<DonorInfo[]>(
             "SELECT id,donorname,phonenumber,bloodgroup,role FROM donor WHERE id = ?",[donorId]
           )
           const donorname = donor[0].donorname;
           const phonenumber = donor[0].phonenumber;
           const role = donor[0].role;
           const bloodgroup = donor[0].bloodgroup;
           return {
             ...tx,
             role,
             donorname,
             bloodgroup,
             phonenumber
           }
         }));

         res.status(200).json({ transactions : enrichedTransactions});
    }catch(error){
      res.status(500).json({message : "Error in Donating Blood"})
    }
})


router.get("/bloodbank/bloodinventory/:bloodbankId",async(req:Request,res:Response)=>{
    try{
        const { bloodbankId } = req.params;
        const [bloodspecimen] = await pool.query<BloodSpecimen[]>(
            "SELECT * FROM bloodspecimen WHERE bloodbank_id = ?",[bloodbankId]
        )

        const bloodInventory = await Promise.all(
            bloodspecimen.map(async (blood)=>{
              const donorId = blood.donor_id;
              const [donor] = await pool.query<DonorInfo[]>(
                "SELECT id,donorname,phonenumber,bloodgroup,role FROM donor WHERE id = ?",[donorId]
              )
              const donorname = donor[0].donorname;
              const phonenumber = donor[0].phonenumber;
              return {
                ...blood,
                donorname,
                phonenumber
              }
        }));

        res.status(200).json({ bloodspecimen : bloodInventory});

    }catch(error){
        res.status(500).json({message : "Error in fetching Blood Inventory"})
    }
})

router.post("/bloodbank/notifications",async(req : Request,res : Response)=>{
    try{
      const { bloodbankId,title, message,role} = req.body;
      await pool.query(
        "INSERT INTO notifications (bloodbank_id,role,title,message) VALUES (?,?,?,?)",[bloodbankId,role,title,message]
      )
      res.status(200).json({ message : "Notification sent successfully"});
    }catch(error){
      res.status(500).json({ message : "Error in sending notifications"})
    }
});

router.get("/bloodbank/:bloodbankId/notifications",async(req : Request,res : Response)=>{
    try{
      const { bloodbankId } = req.params;
      const [notifications] = await pool.query(
        "SELECT * FROM notifications WHERE bloodbank_id = ?",[bloodbankId]
      )
      res.status(200).json({ notifications : notifications});
    }catch(error){
      res.status(500).json({ message : "Error in fetching notifications"})
    }
 });
export default router;