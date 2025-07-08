"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import axios from "axios";
import Image from "next/image";
import Image7 from "@/Images/Image7.jpeg"
import Image6 from "@/Images/Image6.jpg"
import Image8 from "@/Images/Image8.jpeg"
import Image9 from "@/Images/Image9.webp"

function Explore(){
    const [bloodbankCount,setBloodBankCount] = useState(0);
    const [donorCount,setDonorCount] = useState(0);
    const [bloodUnitsCount,setBloodUnitsCount] = useState(0);

    const getBloodBankCount = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/bloodbanks") ;
            setBloodBankCount(response.data.count);
        }catch(error){
            alert("Server ERROR!!")
        }
    }

    const getDonorCount = async()=>{
      try{
        const response = await axios.get("http://localhost:5000/donorcount");
        setDonorCount(response.data.count);
      }catch(error){
        alert("Server ERRROR!!");
      }
    }

    const getBloodUnitsCount = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/bloodunitcount");
            setBloodUnitsCount(response.data.count);
        }catch(error){
            alert("Server ERROR!!");
        }
    }

    

    useEffect(()=>{
        getBloodBankCount();
        getDonorCount();
        getBloodUnitsCount();
    },[bloodbankCount,donorCount,bloodUnitsCount]);

    return(
        <div className="w-full  bg-black flex justify-start items-start flex-col">
            <div className="w-[100%] pt-[80px] flex justify-start items-start flex-col gap-[80px]">
             <div className="w-[100%]">
             <Image
                    src={Image9}
                    alt="Image9"
                    className="w-[100%] object-cover"
                  /> 
             </div> 
             <div className="w-[100%] text-white flex justify-center items-center p-10 gap-20 flex-wrap">
                <div className=" w-[250px] h-[100px] p-6 rounded-[15px] bg-gradient-to-r from-red-800 to-red-600 font-medium text-2xl flex justify-center items-center text-center flex-col">
                   <div className="text-black">{bloodbankCount}</div>
                   <div className="text-black ">Blood Banks</div>
                </div>

                <div className=" w-[250px] h-[100px] p-6 rounded-[15px] bg-gradient-to-r from-red-800 to-red-600 font-medium text-2xl flex justify-center items-center text-center flex-col">
                   <div className="text-black">{donorCount}</div>
                   <div className="text-black ">Donors Registered</div>
                </div>

                <div className=" w-[250px] h-[100px] p-6 rounded-[15px] bg-gradient-to-r from-red-800 to-red-600 font-medium text-2xl flex justify-center items-center text-center flex-col">
                   <div className="text-black">{bloodUnitsCount}</div>
                   <div className="text-black ">Blood Units Collected</div>
                </div>
             </div> 

             <div className="w-[100%] p-[30px] box-border flex justify-around items-center flex-wrap gap-[20px]">
                <div className="w-[400px] h-[300px]">
                  <Image
                    src={Image7}
                    alt="Image7"
                    className="w-[400px] h-[300px] rounded-[10px]"
                  />
                </div>

                <div className="p-[10px] box-border w-[55%] min-h-[300px] text-wrap flex justify-center items-start flex-col gap-[20px]">
                    <h1 className="text-[40px] font-medium bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Want to Donate Blood</h1>
                    <h2 className="text-white text-[30px] font-medium">A small act of kindness, a lifetime of impact—donate blood with BloodNet</h2>
                    <button className="font-medium text-white border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/register/donor">Donor Register</Link></button>
                </div>
             </div>

             <div className="w-[100%] p-[30px] box-border flex justify-around items-center flex-wrap gap-[20px]">
                <div className="p-[10px] box-border w-[55%] min-h-[300px] text-wrap flex justify-center items-start flex-col gap-[20px]">
                    <h1 className="text-[40px] font-medium bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Looking for Blood</h1>
                    <h2 className="text-white text-[30px] font-medium">Every drop counts—connect with nearby donors and save a life today</h2>
                    <button className="font-medium text-white border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/register/recipient">Recipient Register</Link></button>
                </div>

                <div className="w-[400px] h-[300px]">
                  <Image
                    src={Image6}
                    alt="Image6"
                    className="w-[400px] h-[300px] rounded-[10px]"
                  />
                </div>
             </div>

             <div className="w-[100%] p-[30px] box-border flex justify-around items-center flex-wrap gap-[20px]">

                <div className="w-[400px] h-[300px]">
                  <Image
                    src={Image8}
                    alt="Image8"
                    className="w-[400px] h-[300px] rounded-[10px]"
                  />
                </div>

                <div className="p-[10px] box-border w-[55%] min-h-[300px] text-wrap flex justify-center items-start flex-col gap-[20px]">
                    <h1 className="text-[40px] font-medium bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Connect Hospital</h1>
                    <h2 className="text-white text-[30px] font-medium">Request blood units for your hospital and manage emergencies faster with BloodNet.</h2>
                    <button className="font-medium text-white border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/register/hospital">Hospital Register</Link></button>
                </div>
             </div>

            </div>
        </div>
    )
}

export default Explore;