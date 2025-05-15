"use client"

import Link from "next/link";
import {useState,useEffect, use} from "react";
import axios from "axios";

function BloodInverntory(){
    const [bloodbankId,setBloodBankId] = useState("");
    const [bloodspecimen,setBloodSpecimen] = useState([]);

    const getJWTdetails = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/me",{
                withCredentials : true
            })
            setBloodBankId(response.data.user.id);
        }catch(error){
            console.log(error);
            alert("Error in fetching Blood Bank JWT info");
        }
    }

    const getBloodInfo = async()=>{
        try{
            const response = await axios.get(`http://localhost:5000/bloodbank/bloodinventory/${bloodbankId}`)
            setBloodSpecimen(response.data.bloodspecimen);
        }catch(error){
            alert("Error in retrieving Blood Inventory Info!!")
        }
    } 

    useEffect(()=>{
        getJWTdetails();
    },[]);

    useEffect(()=>{
        if(bloodbankId){
            getBloodInfo();
        }  
    },[bloodbankId]);

    return (
        <div className="pt-[150px]  min-h-screen w-full  flex justify-center items-center bg-black overflow-hidden">
            <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
              <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
               <Link href="/explore">Go Back</Link>
              </button>
           </div>

           <div className="w-[100%] h-[85vh] flex flex-col justify-start items-center">
              <div>
                 <h1  className="text-[40px] font-medium bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent font-mono">Blood Inventory</h1>
              </div>

              <div className="w-[95%]">
              <div className="w-[100%] mt-8 overflow-x-auto shadow-lg rounded-lg">
                <table className="w-full text-sm text-left text-black font-mono border-collapse">
                <thead className="text-base bg-gradient-to-r from-red-800 to-red-600  text-black font-mono">
                    <tr>
                    <th className="px-6 py-3 border-b border-red-600 w-[5%]">S.No</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[5%]">ID</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[5%]">Group</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">Quantity</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">Donor ID</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">Donor Name</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">Phonenumber</th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">collected_date </th>
                    <th className="px-6 py-3 border-b border-red-600 w-[10%]">expiry_date </th>
                    <th className="px-6 py-3 border-b border-red-600 w-[5%]">status</th>
                    </tr>
                </thead>
                <tbody className="text-[15px] text-white font-mono">
                    {bloodspecimen.map((blood: any, index: number) => (
                    <tr
                        key={index}
                        className="even:bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-200"
                    >
                        <td className="px-5 py-3 border-b border-gray-700 w-[5%]">{index + 1}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[5%]">{blood.id}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[5%]">{blood.blood_group}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[10%]">{blood.quantity}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[10%]">{blood.donor_id}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[10%]">{blood.donorname}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[10%]">{blood.phonenumber}</td>
                        <td className="w-[10%] break-words px-5 py-3 border-b border-gray-700">{new Date((blood as any).collected_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}</td>
                        <td className="w-[10%] break-words px-5 py-3 border-b border-gray-700">{new Date((blood as any).expiry_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}</td>
                        <td className="px-5 py-3 border-b border-gray-700 w-[5%]">{blood.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
              </div>
           </div>
        </div>

    )
}

export default BloodInverntory;