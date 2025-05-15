import express, { Request, Response } from "express";
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

router.post('/register/staff' , async(req:Request,res:Response)=>{
    try{
        const { staffname,phonenumber,password,bloodbankId,bloodbankpassword } = req.body;

        const [bloodbank] = await pool.query(
            "SELECT * FROM bloodbank WHERE id = ?",[bloodbankId]
        )
        if(!bloodbank){
           res.status(404).json({ message : "Bloodbank doesn't exist ! Please enter valid bloodbankId"});
           return;
        }

        const [bbank] = await pool.query<BloodBankRow[]>(
            "SELECT password FROM bloodbank WHERE id = ? ",[bloodbankId]
         )

        const bbhashedPassword = bbank[0].password;
        const check = await comparePasswords(bloodbankpassword,bbhashedPassword);
        if(!check){
            res.status(400).json({ message : "Wrong Blood Bank Password"});
            return;
        }

        const hashedPassword = await hashPassword(password);
        const [staff] = await pool.query(
            "INSERT INTO staff (staffname,phonenumber,password,bloodbank_id) VALUES (?,?,?,?)",[staffname,phonenumber,hashedPassword,bloodbankId]
        )

        const insertId = (staff as any).insertId; 
        res.status(201).json({ message : "Staff Registered Successfully" , StaffId : insertId});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})

interface StaffpwdRow extends RowDataPacket{
    id : string
    password : string
    staffname : string
}

router.post('/login/staff',async(req:Request,res:Response) => {
    try{
         const { staffId,password } = req.body;
         const [staff] = await pool.query<StaffpwdRow[]>(
            "SELECT id,password,staffname FROM staff WHERE id = ? ",[staffId]
         )

         if(!staff){
            res.status(404).json({ message : "Staff not Found"});
            return;
         }


         const hashedPassword = staff[0].password;
         const check = await comparePasswords(password,hashedPassword);
         if(check){
            const token = jwt.sign({ id : staff[0].id ,name: staff[0].staffname ,role: "staff" }, SECRET_KEY, { expiresIn: "15d" });
        
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
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
})

interface StaffInfo extends RowDataPacket{
    id : number
    staffname : string
    phonenumber : number
    role : string
    bloodbank_id:number
    password: string
}

router.get("/details/staff/:staffId",async(req:Request,res:Response)=>{
    try{
         const { staffId } = req.params;
         const [staff] = await pool.query<StaffInfo[]>(
            "SELECT * FROM staff WHERE id = ? ",[staffId]
         )
         res.status(200).json({staff : staff});
    }catch(error){
        res.status(500).json({message : "Error in fetching Staff Details"})
    }
})

export default router;