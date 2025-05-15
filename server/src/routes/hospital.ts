import express, { Request, Response, Router } from "express";
import pool from "../database";
import { comparePasswords, hashPassword } from "../hashPassword";
import { RowDataPacket } from 'mysql2';

const router = express.Router();

const jwt = require("jsonwebtoken");
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

interface BloodBankRow extends RowDataPacket{
    password : string
}

router.post("/register/hospital",async(req:Request,res:Response)=>{
    try{
      const {hospitalname,contactnumber,password,bloodbankid,bloodbankpassword} = req.body;

      const [bloodbank] = await pool.query(
        "SELECT * FROM bloodbank WHERE id = ?",[bloodbankid]
      )

      if(!bloodbank){
       res.status(404).json({ message : "Blood Bank doesn't exist ! Please enter valid bloodbankid"});
       return;
      }

    const [BloodBankpwd] = await pool.query<BloodBankRow[]>(
        "SELECT password FROM bloodbank WHERE id = ? ",[bloodbankid]
     )

    const hashedBloodBankPwd = BloodBankpwd[0].password;
    const check = await comparePasswords(bloodbankpassword,hashedBloodBankPwd);
    if(!check){
         res.status(400).json({ message : "Wrong Blood Bank Password"});
         return;
     }

     const hashedPassword = await hashPassword(password);
     const [hospital] = await pool.query(
        "INSERT INTO hospital (hospitalname,contactnumber,password,bloodbank_id) values (?,?,?,?)",[hospitalname,contactnumber,hashedPassword,bloodbankid]
     )

     console.log(hospital);

     const insertId = (hospital as any).insertId; 
     res.status(201).json({ message : "Hospital Registered Successfully" , HospitaltId : insertId});
     return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
});

interface HospitalRow extends RowDataPacket{
    id : string
    password : string
    hospitalname : string 
}

router.post("/login/hospital",async(req:Request,res:Response)=>{
    try{
      console.log("hii");
      const { hospitalId,password} = req.body;
      const [hospital] = await pool.query<HospitalRow[]>(
         "SELECT id,password,hospitalname From hospital WHERE id = (?)",[hospitalId]
      )

      console.log(hospital);
 
      if(!hospital){
         res.status(404).json({ message : "Recipient not Found"});
         return;
      }
 
      const hashedPassword = hospital[0].password;
      const check = await comparePasswords(password,hashedPassword);
      if(check){
          const token = jwt.sign({ id : hospital[0].id ,name: hospital[0].hospitalname ,role: "hospital" }, SECRET_KEY, { expiresIn: "15d" });
         
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
  hospitalname : string
  contactnumber : number
  role : string 
  password: string
  bloodbank_id:string
}

router.get("/details/hospital/:hospitalId",async(req:Request,res:Response)=>{
  try{
       const { hospitalId } = req.params;
       const [hospital] = await pool.query<RecipientInfo[]>(
          "SELECT * FROM hospital WHERE id = ? ",[hospitalId]
       )
       res.status(200).json({hospital : hospital});
  }catch(error){
      res.status(500).json({message : "Error in fetching Hospital Details"})
  }
});

export default router;