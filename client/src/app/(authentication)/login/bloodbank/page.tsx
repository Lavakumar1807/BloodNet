"use client";

import Link from "next/link";
import Image from "next/image";
import Image5 from "@/Images/Image5.jpg"
import { PiBankFill } from "react-icons/pi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function BloodBankLogin(){
    const [bloodbankname,setBloodBankName] = useState("");
    const [password,setPassword] = useState("");
    const router = useRouter();

    const handleSumbit = async (e:React.FormEvent)=>{
        e.preventDefault();

        try{
          const response = await axios.post("http://localhost:5000/login/bloodbank",{
             bloodbankname,
             password
          },
          {
            withCredentials: true
          });
          alert(response.data.message);

          setBloodBankName("");
          setPassword("");
          router.push("/explore");
        }catch(error){
          console.log("Error in Blood Bank Login : ",error);
          alert("Error in Blood Bank Login ! Please enter valid Credentials")
        }
    }

    return(
        <div className="relative w-screen h-screen bg-black text-white flex justify-center items-center p-10">
            <Image
                src={Image5}
                alt="Image5"
                fill
                className="object-cover"
              />
            <div className="absolute top-20">
                <h1 className="text-[40px] font-medium font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Blood Bank Login</h1>
            </div>
            <div className=" absolute top-10 right-10  text-white text-[17px] font-medium">
              <button className="border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black "><Link href="/">Home</Link></button>
            </div>
            <div className="absolute w-[63vmin] h-auto border-2 border-gray-600 rounded-2xl flex justify-center item-center flex-col p-5 font-mono gap-3 shadow-lg shadow-gray-400">
              <PiBankFill className="text-[100px] text-center w-[100%] text-red-700"/>
              <form onSubmit={handleSumbit} className=" flex justify-center item-center flex-col text-white font-medium gap-5 ">
                <input 
                 type="text" 
                 name="bloodbankname" 
                 placeholder="Blood Bank Name..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px] "
                 onChange={(e) => setBloodBankName(e.target.value)}
                />
                <input 
                 type="password" 
                 name="password" 
                 placeholder="Password..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px]"
                 onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="p-2  rounded-[10px] bg-gradient-to-r from-red-800 to-red-500 shadow-lg hover:cursor-pointer text-black text-[20px] hover:shadow-[0_0_5px_5px_rgb(180,20,20,0.7)]">Login</button>
              </form>
              
            </div>
        </div>
    );
}

export default BloodBankLogin;