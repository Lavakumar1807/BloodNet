import express, { Request, Response ,NextFunction} from "express";

import pool from "../database";
import { RowDataPacket } from 'mysql2';
import redis from "../redisclient";

import { hashPassword,comparePasswords } from "../hashPassword";

const router = express.Router();

const jwt = require("jsonwebtoken");
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRE_TIME = ((process.env.REDIS_EXPIRE_TIME as unknown) as number);


interface BloodBankInfo extends RowDataPacket{
    id : number
    bloodbankname : string
    location : string
    contactnumber : number
    role : string
    password: string
}

router.get('/bloodbanks',async(req:Request,res:Response) : Promise<void> =>{
    try{
        const cacheKey = 'bloodbanks'
        const cacheData = await redis.get(cacheKey);

        if(cacheData){
          res.status(200).json({bloodbanks : JSON.parse(cacheData) , count : cacheData.length})
          return;
        }

        const [bloodbanks] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank"
        )
        const bloodBankCount = (bloodbanks as any).length;
        await redis.set(cacheKey,JSON.stringify(bloodbanks));
        await redis.expire(cacheKey,EXPIRE_TIME);
       
        res.status(200).json({ bloodbanks : bloodbanks , count : bloodBankCount});
        return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
})

router.get('/bloodbanklocations',async(req:Request,res:Response) : Promise<void> =>{
    try{
        const cacheKey = 'locations'
        const cacheData = await redis.get(cacheKey);

        if(cacheData){
           res.status(200).json({locations : JSON.parse(cacheData)});
           return;
        }

        const [locations] = await pool.query(
            "SELECT DISTINCT location FROM bloodbank"
        )
        await redis.set(cacheKey,JSON.stringify(locations));
        await redis.expire(cacheKey,EXPIRE_TIME);

        res.status(200).json({ locations : locations});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})

router.get('/bloodbanks/:location',async(req:Request,res:Response) : Promise<void>=>{
    try{
        const { location } = req.params;

        const cacheKey = `bloodbanks:${location}`
        const cacheData = await redis.get(cacheKey);

        if(cacheData){
          res.status(200).json({ bloodbanks : JSON.parse(cacheData)});
          return;
        }

        const [bloodbanks] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank WHERE location = ? ",[location]
        )
        await redis.set(cacheKey,JSON.stringify(bloodbanks));
        await redis.expire(cacheKey,EXPIRE_TIME);

        res.status(200).json({ bloodbanks : bloodbanks});
        return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
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
         
         const cacheKay = `bloodbank:${bloodBankId}`
         const cacheData = await redis.get(cacheKay);

         if(cacheData){
           res.status(200).json({bloodbank : JSON.parse(cacheData)});
           return;
         }

         const [bloodbank] = await pool.query<BloodBankInfo[]>(
            "SELECT * FROM bloodbank WHERE id = ? ",[bloodBankId]
         )
         await redis.set(cacheKay,JSON.stringify(bloodbank));
         await redis.expire(cacheKay,EXPIRE_TIME)

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

router.get("/bloodbank/transactions/:bloodbankId",async(req:Request,res:Response) : Promise<void>=>{
    try{
      const { bloodbankId } = req.params;

      const cacheKey = `bloodbankTransactions:${bloodbankId}`;
      const cacheTransactionData = await redis.get(cacheKey);

      if (!cacheTransactionData) {
        const [transactions] = await pool.query(
          `SELECT 
            bs.quantity, 
            bs.collected_date, 
            bs.donor_id, 
            d.donorname, 
            d.phonenumber, 
            d.bloodgroup, 
            d.role
          FROM bloodspecimen bs
          JOIN donor d ON bs.donor_id = d.id
          WHERE bs.bloodbank_id = ?`, 
          [bloodbankId]
        );

        await redis.set(cacheKey, JSON.stringify(transactions));
        await redis.expire(cacheKey, EXPIRE_TIME);

        res.status(200).json({ transactions });
        return;
      }

      const transactions = JSON.parse(cacheTransactionData);
      res.status(200).json({ transactions });
    }catch(error){
      res.status(500).json({message : "Error in Donating Blood"})
    }
})


router.get("/bloodbank/bloodinventory/:bloodbankId",async(req:Request,res:Response) : Promise<void> =>{
    try{
        const { bloodbankId } = req.params;
        
        const cacheKey = `bloodInventory:${bloodbankId}`;
        const cacheData = await redis.get(cacheKey);

        if(cacheData){
           res.status(200).json({ bloodspecimen: JSON.parse(cacheData) });
           return
        }

       const [bloodInventory] = await pool.query(
          `SELECT 
            bs.*, 
            d.donorname, 
            d.phonenumber 
          FROM bloodspecimen bs
          JOIN donor d ON bs.donor_id = d.id
          WHERE bs.bloodbank_id = ?`, 
          [bloodbankId]
        );
        await redis.set(cacheKey,JSON.stringify(bloodInventory));
        await redis.expire(cacheKey,EXPIRE_TIME);

        res.status(200).json({ bloodspecimen: bloodInventory });
        return;
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