"use client";

import Link from "next/link";
import Image from "next/image";
import { FaUserAlt } from "react-icons/fa";
import Image2 from "@/Images/Image2.jpg"
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function DonorLogin(){
    const [donorId,setDonorId] = useState("");
    const [password,setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async(e:React.FormEvent)=>{
       e.preventDefault();

       try{
         const response = await axios.post("http://localhost:5000/login/donor",{
           donorId,
           password
         },
         {
          withCredentials: true
         })

         setDonorId("");
         setPassword("");
         alert(response.data.message);
         router.push("/explore");

       }catch(error){
          alert("Error in Donor Login ! Please enter valid Credentials")
       }
    }

    return(
        <div className="relative w-screen h-screen bg-black text-white flex justify-center items-center p-10">
            <Image
                src={Image2}
                alt="Image2"
                fill
                className="object-cover"
              />
            <div className="absolute top-20">
                <h1 className="text-[40px] font-medium font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Donor Login</h1>
            </div>
            <div className=" absolute top-10 right-10  text-white text-[17px] font-medium">
              <button className="border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black "><Link href="/">Home</Link></button>
            </div>
            <div className="absolute w-[63vmin] h-auto border-2 border-gray-600 rounded-2xl flex justify-center item-center flex-col p-5 font-mono gap-3 shadow-lg shadow-gray-400">
              <FaUserAlt className="text-[80px] text-center w-[100%]"/>
              <form onSubmit={handleSubmit} className=" flex justify-center item-center flex-col text-white font-medium gap-5 ">
                <input 
                 type="text" 
                 name="donorId" 
                 placeholder="Donor Id..." 
                 required 
                 className="border-1 border-gray-600 p-3 rounded-[10px] "
                 onChange={(e) => setDonorId(e.target.value)}
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

export default DonorLogin;