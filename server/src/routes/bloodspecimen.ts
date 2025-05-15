import express, { Request, Response } from "express";
import pool from "../database";
const router = express.Router();

router.get("/bloodunitcount",async(req:Request,res:Response)=>{
    try{
        const [bloodbank] = await pool.query(
            "SELECT SUM(quantity) as unitcount FROM bloodspecimen"
        ) 

        const bloodUnitCount = (bloodbank as any)[0].unitcount;
        console.log(bloodUnitCount);
        res.status(200).json({ count : bloodUnitCount});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
    }
})