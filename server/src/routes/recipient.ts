import express, { Request, Response, Router } from "express";
import pool from "../database";
import { comparePasswords, hashPassword } from "../hashPassword";
import { RowDataPacket } from 'mysql2';

const router = express.Router();

const jwt = require("jsonwebtoken");
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

interface StaffpwdRow extends RowDataPacket{
    password : string
}

router.post("/register/recipient",async(req:Request,res:Response)=>{
    try{
      const {recipientname,dob, age,phonenumber,gender,bloodgroup,password,staffId,staffpassword} = req.body;
      const [staff] = await pool.query(
        "SELECT * FROM staff WHERE id = ?",[staffId]
      )

      if(!staff){
       res.status(404).json({ message : "Staff doesn't exist ! Please enter valid bloodbankId"});
       return;
      }

    const [staffPwd] = await pool.query<StaffpwdRow[]>(
        "SELECT password FROM staff WHERE id = ? ",[staffId]
     )

    const hashedstaffPwd = staffPwd[0].password;
    const check = await comparePasswords(staffpassword,hashedstaffPwd);
    if(!check){
         res.status(400).json({ message : "Wrong Staff Password"});
         return;
     }

     const hashedPassword = await hashPassword(password);
     const [recipient] = await pool.query(
        "INSERT INTO recipient (recipientname,dateofbirth,age,bloodgroup,gender,phonenumber,password,staff_id) values (?,?,?,?,?,?,?,?)",[recipientname,dob,age,bloodgroup,gender,phonenumber,hashedPassword,staffId]
     )

     const insertId = (recipient as any).insertId; 
     res.status(201).json({ message : "Recipient Registered Successfully" , RecipientId : insertId});
     return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
});

interface RecipientpwdRow extends RowDataPacket{
    id : string
    password : string
    recipientname : string 
}

router.post("/login/recipient",async(req:Request,res:Response)=>{
   try{
     const { recipientId,password} = req.body;
     const [recipient] = await pool.query<RecipientpwdRow[]>(
        "SELECT id,password,recipientname From recipient WHERE id = (?)",[recipientId]
     )

     if(recipient.length == 0){
        res.status(404).json({ message : "Recipient not Found"});
        return;
     }

     const hashedPassword = recipient[0].password;
     const check = await comparePasswords(password,hashedPassword);
     if(check){
         const token = jwt.sign({ id : recipient[0].id ,name: recipient[0].recipientname ,role: "recipient" }, SECRET_KEY, { expiresIn: "15d" });
        
           res.cookie("BNToken", token, {
             httpOnly: true,
             secure: false,
             sameSite: "strict",
             maxAge: 15 * 24 * 60 * 60 * 1000,
         });

        res.status(200).json({message : "Login Successful"})
        return;
     }
     else{
        res.status(400).json({ message : "Wrong password"})
        return;
     }
     
   }catch(error){
     res.status(500).json({ message : "Server not found " , Error : error});
   }
})

interface RecipientInfo extends RowDataPacket{
  id : number
  recipientname : string
  phonenumber : number
  bloodgroup : string
  age:number
  dateofbirth:string
  gender : string
  password: string
  staff_id:string
  role : string 
}

router.get("/details/recipient/:recipientId",async(req:Request,res:Response)=>{
  try{
       const { recipientId } = req.params;
       const [recipient] = await pool.query<RecipientInfo[]>(
          "SELECT * FROM recipient WHERE id = ? ",[recipientId]
       )
       res.status(200).json({recipient : recipient});
  }catch(error){
      res.status(500).json({message : "Error in fetching Recipient Details"})
  }
})

router.get("/recipient/transactions/:recipientId" , async(req:Request,res:Response)=>{
    try{
        const { recipientId } = req.params;
        const [transactions] = await pool.query<RecipientInfo[]>(
            "SELECT * FROM transactions WHERE recipient_id = ? ",[recipientId]
        )
    }catch(error){
      res.status(500).json({ message : "Server Error" , Error : error});
      return;
    }
})


router.post("/requestblood",async (req: Request, res: Response) => {
   try{
     const {recipientId,password,bloodGroup,bloodQuantity,bloodbankId,bloodbankPassword} = req.body;
     const [recipientRows]: any = await pool.query(
      "SELECT password FROM recipient WHERE id = ?",[recipientId]
     )
     if (recipientRows.length === 0 || !(await comparePasswords(password, recipientRows[0].password))) {
       res.status(401).json({ message: "Invalid recipient credentials" });
       return;
     }
     
    const [bbRows]: any = await pool.query(
       "SELECT password FROM bloodbank WHERE id = ?",[bloodbankId]
    );
    if (bbRows.length === 0 || !(await comparePasswords(bloodbankPassword, bbRows[0].password))) {
       res.status(401).json({ message: "Invalid blood bank credentials" });
       return
    }

    const [specimens]: any = await pool.query(
      `SELECT * FROM bloodspecimen 
       WHERE blood_group = ? AND bloodbank_id = ? AND status = 'available'
       ORDER BY collected_date ASC`,
      [bloodGroup, bloodbankId]
    );

    let remaining = parseInt(bloodQuantity);

    for (const specimen of specimens) {
      if (remaining <= 0) break;

      const { id, quantity } = specimen;

      if (quantity <= remaining) {
        await pool.query("UPDATE bloodspecimen SET status = 'reserved' WHERE id = ?", [id]);
        remaining -= quantity;
      } else {
        await pool.query(
          "UPDATE bloodspecimen SET quantity = ? WHERE id = ?",
          [quantity - remaining, id]
        );
        remaining = 0;
      }
    }


    if (remaining > 0) {
      res.status(400).json({ message: "Insufficient blood available to fulfill request." });
      return;
    }

    await pool.query(
      "INSERT INTO bloodrequests (recipient_id, bloodbank_id, blood_group, quantity) VALUES (?, ?, ?, ?)",
      [recipientId, bloodbankId, bloodGroup, bloodQuantity]
    );

    res.status(200).json({ message: "Blood request fulfilled and recorded." });
    return;

   }catch(error){
      res.status(500).json({ message : "Server Error" , Error : error});
      return;
   }
});


interface TransactionInfo extends RowDataPacket{
  id : number
  bloodbank_id : number
  recipient_id : number
  blood_group : string
  quantity : number
  requested_at : string
}

router.get("/recipient/requestblood/:recipientId",async(req:Request,res:Response)=>{
  try{
    const { recipientId } = req.params;
    const [transactions] = await pool.query(
        "SELECT * FROM bloodrequests WHERE recipient_id = ? ",[recipientId]
    )
    
    const transaction = transactions as TransactionInfo[];

    res.status(200).json({transactions : transaction});
  }catch(error){
      console.error("Server Error:", error); 
      res.status(500).json({ message : "Server Error" , Error : error});
  }
})

export default router;