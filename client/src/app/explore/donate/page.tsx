"use client"

import axios from "axios";
import Link from "next/link";
import { useState,useEffect } from "react";

function Donate() {
    const [password,setPassword]= useState("");
    const [bloodQuantity,setBloodQuantity] = useState("");
    const [expDate,setExpDate] = useState("");
    const [bloodbankId,setBloodBankId] = useState("");
    const [bloodbankpassword,setBloodBankPassword] = useState("");
    const [donorId,setDonorId ] = useState({});

    const checkingLogin = async ()=>{
        try{
            const response = await axios.get("http://localhost:5000/me",
              { withCredentials: true}
            );
            setDonorId(response.data.user.id);
        }catch(error){
          console.log(error);
          return;
        }
    }
  
    useEffect(()=>{
        checkingLogin();
    },[])

    const handleDonate = async ()=>{
        try{
            const response = await axios.post("http://localhost:5000/donate",{
               donorId : donorId,
               password : password,
               bloodQuantity : bloodQuantity,
               expDate : expDate,
               bloodbankId : bloodbankId,
               bloodbankpassword : bloodbankpassword
            },{
                withCredentials : true
            })
            alert("Donated Successfully , Thank You:)")
        }catch(error){
            alert("Error in Donating Blood or Enter valid Credentials")
        }
    }
  return (
    <div className="pt-[150px] min-h-screen bg-black text-white flex flex-col items-center px-4">
        <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
          <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
            <Link href="/explore">Go Back</Link>
          </button>
        </div>
            <div className="w-[100%] flex justify-center items-center flex-col">
               <h1 className="text-[40px] font-bold font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Donate Blood, Save Lives</h1>
                <p className="text-lg text-center max-w-[600px] mb-8 font-mono text-[20px]">
                    Your donation can make a difference. Fill out the form below to become a donor and help those in need.
                </p>

                <form onSubmit={handleDonate} className="bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Donor Password ..."
                        required
                        className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        onChange = {(e)=>setPassword(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Blood Quantity (units) ..."
                        required
                        onChange = {(e)=>setBloodQuantity(e.target.value)}
                        className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    />
                    <div className="w-[100%] flex justify-between items-center flex-wrap">
                    <label className="w-[30%] text-lg font-mono text-[17px]"> Expiry Date :</label>
                    <input
                        type="date"
                        placeholder="Expiry Date..."
                        onChange = {(e)=>setExpDate(e.target.value)}
                        required
                        className="w-[70%] p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    />
                    </div>
                    
                    <div className="w-[100%] flex justify-between items-center flex-wrap">
                    <input
                        type="number"
                        placeholder="Blood Bank ID ..."
                        required
                        onChange = {(e)=>setBloodBankId(e.target.value)}
                        className="w-[45%] p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    />
                    <input
                        type="password"
                        placeholder="Blood Bank Password ..."
                        required
                        onChange = {(e)=>setBloodBankPassword(e.target.value)}
                        className="w-[45%] p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    />
                    </div>
                    
                    <button
                    type="submit"
                    className="mt-4 text-black  font-mono text-[20px] py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:cursor-pointer hover:from-red-800 hover:to-red-600 transition duration-300"
                    >
                    Submit
                    </button>
                </form>
        </div>
    </div>
  );
}

export default Donate;
