"use client";

import Link from "next/link";
import Image from "next/image";
import { FaHospital } from "react-icons/fa";
import Image1 from "@/Images/Image1.jpg"
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function HospitalRegister(){
  const [hospitalname,setHospitalName] = useState("");
  const [contactnumber,setPhonenumber] = useState("");
  const [password,setPassword] = useState("");
  const [bloodbankid,setBloodBankId] = useState("");
  const [bloodbankpassword,setBloodBankPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e : React.FormEvent)=>{
    e.preventDefault();

    try{
       const response = await axios.post("http://localhost:5000/register/hospital",{
                  hospitalname,
                  contactnumber,
                  password,
                  bloodbankid,
                  bloodbankpassword
                })
        
                setHospitalName("");
                setPhonenumber("");
                setPassword("");
                setBloodBankId("");
                setBloodBankPassword("");

                alert("Hospital Registered Successfully :)");
                router.push("/");
      }catch(error){
        alert("Error in Hospital Registration")
      }
  }

    return(
        <div className="relative w-screen h-screen bg-black text-white flex justify-center items-center p-10">
            <Image
                src={Image1}
                alt="Image1"
                fill
                className="object-cover"
              />
            <div className="absolute top-15">
                <h1 className="text-[40px] font-medium font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Hospital Registration</h1>
            </div>
            <div className=" absolute top-10 right-10  text-white text-[17px] font-medium">
              <button className="border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black"><Link href="/explore">Explore</Link></button>
            </div>
            <div className="absolute w-[65vmin] h-auto border-2 border-gray-600 rounded-2xl flex justify-center item-center flex-col p-5 font-mono gap-3 shadow-lg shadow-gray-400">
              <FaHospital className="text-[90px] text-center w-[100%] text-red-600"/>
              <form onSubmit={handleSubmit} className=" flex justify-center item-center flex-col text-white font-medium gap-5 ">
                <input 
                 type="text" 
                 name="hospitalname" 
                 placeholder="Hospital Name..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px] "
                 onChange={(e)=>setHospitalName(e.target.value)}
                 />
                <input 
                 type="tel" 
                 name="contactnumber" 
                 placeholder="Contact Number..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px] "
                 onChange={(e)=>setPhonenumber(e.target.value)}
                />
                
                <input 
                 type="password" 
                 name="password" 
                 placeholder="Password..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px]"
                 onChange={(e)=>setPassword(e.target.value)}
                />

                <div className="flex justify-between items-center gap-[10px]">
                 <input 
                  type="number" 
                  name="bloodbankid" 
                  placeholder="Blood Bank ID..." 
                  required 
                  className="border-1 border-gray-600 p-3 rounded-[10px] "
                  onChange={(e)=>setBloodBankId(e.target.value)}
                 />
                 <input 
                  type="password" 
                  name="bloodbankpassword" 
                  placeholder="Blood Bank Password..." 
                  required 
                  className="border-1 border-gray-600 p-3 rounded-[10px]"
                  onChange={(e)=>setBloodBankPassword(e.target.value)}
                />
                </div>
                <button type="submit" className="p-2  rounded-[10px] bg-gradient-to-r from-red-800 to-red-500 shadow-lg hover:cursor-pointer text-black text-[20px] hover:shadow-[0_0_5px_5px_rgb(180,20,20,0.7)]">Register</button>
              </form>
              
            </div>
        </div>
    );
}

export default HospitalRegister;