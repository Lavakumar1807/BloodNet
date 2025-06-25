import express, { Request, Response } from "express";
import pool from "../database";
import redis from "../redisclient";
const router = express.Router();

const EXPIRE_TIME = ((process.env.REDIS_EXPIRE_TIME as unknown) as number);

router.get("/bloodunitcount",async(req:Request,res:Response)=>{
    try{
        
        const cacheKey = "bloodUnitCount";
        const cacheData = await redis.get(cacheKey);

        if(cacheData){
            res.status(200).json({message : "From redis",count : Number(cacheData)});
            return;
        }

        const [bloodbank] = await pool.query(
            "SELECT SUM(quantity) as unitcount FROM bloodspecimen"
        )
        const bloodUnitCount = (bloodbank as any)[0].unitcount || 0;

        await redis.set(cacheKey,bloodUnitCount);
        await redis.expire(cacheKey,EXPIRE_TIME)

        res.status(200).json({ count : Number(bloodUnitCount)});
        return;
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
})

export default router;