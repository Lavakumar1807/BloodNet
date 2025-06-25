import express, { Request, Response, Router } from "express";
import pool from "../database";
import redis from "../redisclient";

import { comparePasswords, hashPassword } from "../hashPassword";
import { RowDataPacket } from 'mysql2';

const router = express.Router();

interface StaffpwdRow extends RowDataPacket{
    password : string
}

const jwt = require("jsonwebtoken");
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRE_TIME = ((process.env.REDIS_EXPIRE_TIME as unknown) as number);

router.get("/donorcount" ,async(req:Request,res:Response) =>{
   try{
       const cacheKey = "donorcount";
       const cacheData = await redis.get(cacheKey);

       if(cacheData){
         res.status(200).json({ count : cacheData});
         return;
       }

       const [donor] = await pool.query(
           "SELECT COUNT(*) as bbcount FROM donor"
       ) 
       const donorCount = (donor as any)[0].bbcount;
       await redis.set(cacheKey,donorCount);
       await redis.expire(cacheKey,EXPIRE_TIME);
      
       res.status(200).json({ count : donorCount});
   }catch(error){
       res.status(500).json({ message : "Server Error" , Error : error});
   }
})

router.post("/register/donor",async(req:Request,res:Response)=>{
    try{
      const {donorname,dob, age,phonenumber,gender,bloodgroup,password,staffId,staffpassword} = req.body;
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
      const [donor] = await pool.query(
        "INSERT INTO donor (donorname,dateofbirth,age,bloodgroup,gender,phonenumber,password,staff_id) values (?,?,?,?,?,?,?,?)",[donorname,dob,age,bloodgroup,gender,phonenumber,hashedPassword,staffId]
      )

      const insertId = (donor as any).insertId; 
      res.status(201).json({ message : "Donor Registered Successfully" , DonorId : insertId});
      return 
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
});

interface DonorpwdRow extends RowDataPacket{
    id : string 
    password : string
    donorname : string
}

router.post("/login/donor",async(req:Request,res:Response)=>{
   try{
     const { donorId,password} = req.body;
     const [donor] = await pool.query<DonorpwdRow[]>(
        "SELECT id,password,donorname From donor WHERE id = (?)",[donorId]
     )

     if(!donor){
        res.status(404).json({ message : "Donor not Found"});
        return;
     }

     const hashedPassword = donor[0].password;
     const check = await comparePasswords(password,hashedPassword);
     if(check){
      const token = jwt.sign({ id : donor[0].id ,name: donor[0].donorname ,role: "donor" }, SECRET_KEY, { expiresIn: "15d" });
        
      res.cookie("BNToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      })

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

router.get("/details/donor/:donorId",async(req:Request,res:Response)=>{
  try{
       const { donorId } = req.params;
       const cacheKey = `donor:${donorId}`;
       const cacheData = await redis.get(cacheKey);

       if(cacheData){
         res.status(200).json({donor : JSON.parse(cacheData)});
         return;
       }

       const [donor] = await pool.query<DonorInfo[]>(
          "SELECT * FROM donor WHERE id = ? ",[donorId]
       )
       await redis.set(cacheKey,JSON.stringify(donor));
       await redis.expire(cacheKey,EXPIRE_TIME);

       res.status(200).json({donor : donor});
       return;
  }catch(error){
      res.status(500).json({message : "Error in fetching Donor Details"})
      return;
  }
})

interface BloodBankpwdRow extends RowDataPacket{
  bloodbankname : string
  password : string
}

router.post("/donate",async(req:Request,res:Response)=>{
  try{
      const {donorId,password,bloodQuantity,expDate,bloodbankId,bloodbankpassword} = req.body;
      const [donor] = await pool.query<DonorInfo[]>(
        "SELECT * FROM donor WHERE id = ?",[donorId]
      )
      const bloodGroup = donor[0].bloodgroup;
      const hashedPassword = donor[0].password;
      const check = await comparePasswords(password,hashedPassword);
      if(!check){
         res.status(401).json({ message : "Wrong Password"});
         return;
      }

      const [bloodbank] = await pool.query<BloodBankpwdRow[]>(
        "SELECT password FROM bloodbank WHERE id = ?",[bloodbankId]
      )

      const hashedBBPassword = bloodbank[0].password;
      const BBcheck = await comparePasswords(bloodbankpassword,hashedBBPassword);
      if(!BBcheck){
         res.status(401).json({ message : "Wrong Blood Bank Password"});
         return;
      }

      await pool.query(
        "INSERT INTO bloodspecimen (blood_group,quantity,expiry_date,donor_id,bloodbank_id) VALUES (?,?,?,?,?)",[bloodGroup,bloodQuantity,expDate,donorId,bloodbankId]
      )
      res.status(200).json({message : "Blood Donated Successfully"});

  }catch(error){
    res.status(500).json({message : "Error in Donating Blood"})
  }
})

interface BloodSpecimen extends RowDataPacket{
    quantity : string,
    collected_date : string
    bloodbank_id : string,
    bloodbankname : string
}

router.get("/donor/transactions/:donorId",async(req:Request,res:Response)=>{
     try{
          const { donorId } = req.params;

          const cacheKey = `donorTransactions:${donorId}`
          const cacheData = await redis.get(cacheKey);

          if(cacheData){
             res.status(200).json({ transactions : JSON.parse(cacheData) });
             return;
          }

          const [transactions] = await pool.query<BloodSpecimen[]>(
            `SELECT 
              bs.quantity, 
              bs.collected_date, 
              bs.bloodbank_id,
              bb.bloodbankname
            FROM bloodspecimen bs
            JOIN bloodbank bb ON bs.bloodbank_id = bb.id
            WHERE bs.donor_id = ?`,
            [donorId]
          );
          await redis.set(cacheKey,JSON.stringify(transactions));
          await redis.expire(cacheKey,EXPIRE_TIME);

          res.status(200).json({ transactions });
     }catch(error){
       res.status(500).json({message : "Error in Donating Blood"})
     }
})

export default router;