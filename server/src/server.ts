import express , { Request, Response,NextFunction } from "express";
import bloodbankRoutes from "./routes/bloodbank";
import staffRoutes from "./routes/staff";
import donorRoutes from "./routes/donor";
import hospitalRoutes from "./routes/hospital";
import recipientRoutes from "./routes/recipient";
import cors from "cors";
import { RowDataPacket } from 'mysql2';
import pool from "../src/database"

const jwt = require("jsonwebtoken");

import dotenv from 'dotenv';
dotenv.config();
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:3000",  
    methods: ["GET", "POST"],
    credentials: true,              
}));
  
app.use(express.json());
app.use(cookieParser());

app.get("/",(req : Request,res : Response)=>{
   res.send("Welcome to BloodNet");
});

const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req : Request, res : Response, next :  NextFunction) => {
    const token = req.cookies.BNToken;
  
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  
    jwt.verify(token, SECRET_KEY, (err : any, decoded:any) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }
  
      (req as any).user = decoded;
      next(); 
    });
};

app.use('/',bloodbankRoutes);
app.use('/',staffRoutes);
app.use('/',donorRoutes);
app.use('/',recipientRoutes);
app.use('/',hospitalRoutes);


app.get("/me", verifyToken ,async(req : Request,res : Response)=>{
    try{
        const user = (req as any).user;
        if(user){
           res.status(200).json({ check : true , user : user});
        }
        else{
            res.status(404).json({ check : false});
        }
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
})


app.get("/logout",async(req : Request,res : Response)=>{
    try{
       res.clearCookie("BNToken", {
           httpOnly: true,
           secure: false,       
           sameSite: "strict",
           path: "/",          
       });
       res.status(200).json({ message: "Logged out" }); 
    }catch(error){
       res.status(500).json({ message : "Server Error" , Error : error});
       return;
    }
})

interface BloodAvailabilityInfo extends RowDataPacket{
    quantity : string
    collected_date : string
    bloodbank_id : string
    expiry_date : string
    bloodbankname: string;
}

app.get("/bloodavailability/:location/:bloodgroup",async(req : Request,res : Response)=>{
    try{
        const location = req.params.location;
        const bloodgroup = req.params.bloodgroup;
        const [bloodavailability] = await pool.query<BloodAvailabilityInfo[]>(
            "SELECT bs.quantity,bs.collected_date,bs.bloodbank_id,bs.expiry_date,b.bloodbankname,b.contactnumber FROM bloodspecimen bs JOIN bloodbank b ON b.id = bs.bloodbank_id WHERE b.location = ? AND bs.blood_group = ?",[location,bloodgroup]
        )
        res.status(200).json({ bloodavailability : bloodavailability});
    }catch(error){
        res.status(500).json({ message : "Server Error" , Error : error});
        return;
    }
});

app.get("/:role/notifications",async(req : Request,res : Response)=>{
   try{
      const { role } = req.params;
      const [notifications] = await pool.query<BloodAvailabilityInfo[]>(
            "SELECT * FROM notifications WHERE role = ? OR role = 'all' ",[role]
      )

      const enrichedNotifications = await Promise.all(
        notifications.map(async (notification)=>{
            const bloodbankId = notification.bloodbank_id;
            const [bloodbank] = await pool.query<BloodAvailabilityInfo[]>(
                "SELECT bloodbankname FROM bloodbank WHERE id = ?",[bloodbankId]
            )
            const bloodbankname = bloodbank[0].bloodbankname;
            return {
                ...notification,
                bloodbankname,
            }
            }
        )
    );

      res.status(200).json({ notifications : enrichedNotifications});
   }catch(error){
         res.status(500).json({ message : "Server Error" , Error : error});
   }
})

app.listen(PORT , ()=>{
    console.log("Running on port : ",PORT);
})