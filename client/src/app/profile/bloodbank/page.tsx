"use client"

import { useEffect, useState } from "react";
import { PiBankFill } from "react-icons/pi";
import Link from "next/link";
import axios from "axios";

function BloodBankProfile(){
    const [bloodBankId,setBloodBankId] = useState(""); 
    const [bloodBankName,setBloodBankName] = useState("");
    const [role,setRole] = useState("");
    const [location,setLocation] = useState("");
    const [contactnumber,setContactNumber] = useState("");
    const [transactions,setTransactions] = useState([]); 



    const getJWTdetails = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/me",{
                withCredentials : true
            })
            setBloodBankId(response.data.user.id);
            setBloodBankName(response.data.user.name);
            setRole(response.data.user.role);
        }catch(error){
            console.log(error);
            alert("Error in fetching Blood Bank JWT info");
        }
    }

    const getDetails = async()=>{
        try{
              const response = await axios.get(`http://localhost:5000/details/bloodbank/${bloodBankId}`,{
                withCredentials : true
              });
              setLocation(response.data.bloodbank[0].location);
              setContactNumber(response.data.bloodbank[0].contactnumber);
        }catch(error){
            console.log(error);
            alert("Error in fetching Blood Bank Details");
        }
    }

     const getTransactions = async()=>{
            try{
                const response = await axios.get(`http://localhost:5000/bloodbank/transactions/${bloodBankId}`)
                setTransactions(response.data.transactions);
            }catch(error){
               alert("Error in retreiving Transaction History");
            }
      }

     useEffect(()=>{
        getJWTdetails();
     },[]);

     useEffect(()=>{
        if(bloodBankId){
            getDetails();
            getTransactions();
        }
     },[bloodBankId]);      

    return(
        <div className="pt-[150px]  min-h-screen w-full  flex justify-center items-center bg-black overflow-hidden">
        <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
          <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
            <Link href="/explore">Go Back</Link>
          </button>
        </div>
      
        <div className="w-[80%] h-[85vh] flex flex-col gap-[10px] overflow-hidden">
          <div className="flex w-full h-[45%] gap-[10px]">
            <div className="w-[30%] bg-[#292929] rounded-[7px] p-5 flex flex-col items-center justify-center gap-4 text-white shadow-md">
              <div className="bg-[#1c1c1c] rounded-full p-4"><PiBankFill className="text-white text-[80px] transition-transform duration-300 hover:scale-110" /></div>
              <h1 className="text-center font-mono font-semibold tracking-wide text-[24px] leading-tight break-words">{bloodBankName}</h1>
              <h2 className="text-[#808080] text-center font-mono font-medium tracking-wide text-[18px]">{role}</h2>
            </div>
      
            <div className="w-[70%] bg-[#292929] rounded-[7px] shadow-lg p-6 flex flex-col justify-start border border-[#3a3a3a]">
                <h2 className="text-white font-mono font-semibold text-xl mb-3 tracking-wider"> Blood Bank Profile</h2>

                <div className="bg-[#1c1c1c] rounded-[5px] w-full divide-y divide-[#3a3a3a]">
                    {[
                    { label: "Blood Bank Id", value: bloodBankId },
                    { label: "Blood Bank Name", value: bloodBankName },
                    { label: "Role", value: role },
                    { label: "Contact Number", value: contactnumber },
                    { label: "Location", value: location },
                    ].map((item, index) => (
                    <div
                        key={index}
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 gap-1 sm:gap-0 hover:bg-[#242323] transition duration-200 ease-in-out"
                    >
                        <p className="text-white font-mono font-medium tracking-wide text-xs sm:text-sm sm:w-1/2">
                        {item.label}
                        </p>
                        <span className="text-[#a0a0a0] font-mono tracking-wide text-xs sm:text-sm break-words sm:w-1/2 text-left sm:text-right">
                        {item.value}
                        </span>
                    </div>
                    ))}
                </div>
            </div>
          </div>
      
          <div className="w-full h-[50%] bg-[#292929] p-4 rounded-[7px] flex flex-col">
            <h2 className="text-white font-mono font-semibold text-[18px] mb-3">
              Transaction History
            </h2>
            <div className="w-full flex  text-white font-mono text-sm font-semibold bg-[#222222] rounded-md p-4">
              <div className="w-[5%]">S.No</div>
              <div className="w-[10%]">Role</div>
              <div className="w-[15%]">Person Id</div>
              <div className="w-[20%]">Person Name</div>
              <div className="w-[15%]">Phone Number</div>
              <div className="w-[15%]">Blood Group</div>
              <div className="w-[10%]">Units</div>
              <div className="w-[25%]">Date</div>
            </div>
      
            <div className="flex flex-col mt-2 gap-2 overflow-y-auto">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="w-full flex text-[#cfcfcf] font-mono text-sm bg-[#1e1e1e] p-4 rounded-md hover:bg-[#2c2c2c] transition"
                >
                  <div className="w-[5%]">{index + 1}</div>
                  <div className="w-[10%]">{(tx as any).role}</div>
                  <div className="w-[15%] break-words">{(tx as any).donor_id}</div>
                  <div className="w-[20%] break-words">{(tx as any).donorname}</div>
                  <div className="w-[15%]">{(tx as any).phonenumber}</div>
                  <div className="w-[15%]">{(tx as any).bloodgroup}</div>
                  <div className="w-[10%] break-words">{(tx as any).quantity}</div>
                  <div className="w-[25%] break-words">{new Date((tx as any).collected_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    )
}

export default BloodBankProfile;