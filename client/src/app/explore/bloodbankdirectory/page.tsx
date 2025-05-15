"use client";

import Link from "next/link";
import { useState,useEffect } from "react";
import axios from "axios";

function BloodBankDirectory(){
    const [locations,setLocations] = useState([]);
    const [selectedLocation,setSelectedLocation] = useState("");
    const [bloodBanks, setBloodBanks] = useState([]);
    
    const getLocations = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/bloodbanklocations");
            setLocations(response.data.locations);
        }catch(error){
            console.log(error);
            alert("Error in fetching Locations");
        }
    }
    const getBloodBanksByLocation = async () => {
        try {
          if(selectedLocation){
            const response = await axios.get(`http://localhost:5000/bloodbanks/${selectedLocation}`);
            setBloodBanks(response.data.bloodbanks);
          }
          else{
            const response = await axios.get(`http://localhost:5000/bloodbanks`);
            setBloodBanks(response.data.bloodbanks);
          }
        } catch (error) {
          console.log(error);
          alert("Error fetching blood banks");
        }
    };

    useEffect(()=>{
        getLocations();
    },[]);

    return(
       <div className="pt-[150px] w-[full] text-white bg-black flex justify-center items-center flex-col gap-[20px]">
        <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
          <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
            <Link href="/explore">Go Back</Link>
          </button>
        </div>
          <div>
             <h1 className="text-[40px] font-bold font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Blood Bank Directory</h1>
          </div>
          <div className="w-[70%] p-[10px]  flex justify-around items-center flex-wrap ">
             <select onChange={(e)=>setSelectedLocation(e.target.value)} className="w-[75%] p-2 rounded-md text-white bg-[#1c1c1c] border border-gray-700 focus:outline-none ">
                <option  value="">Select Location</option>
                {
                    locations.map((location : any,index)=>(
                       <option key={index} value={location.location}>{location.location}</option>
                    ))
                }
             </select>
             <button  onClick={getBloodBanksByLocation} 
               className="w-[120px] text-black font-medium text-[17px] rounded-[5px] p-2 px-6 bg-red-500 hover:bg-red-600 hover:cursor-pointer">
                Search
             </button>
          </div>

          {bloodBanks.length > 0 && (
            <div className="w-[90%] mt-8 overflow-x-auto shadow-lg rounded-lg">
                <table className="w-full text-sm text-left text-black font-mono border-collapse">
                <thead className="text-base bg-gradient-to-r from-red-800 to-red-600 text-black">
                    <tr>
                    <th className="px-6 py-3 border-b border-red-600">S.No</th>
                    <th className="px-6 py-3 border-b border-red-600">ID</th>
                    <th className="px-6 py-3 border-b border-red-600">Blood Bank Name</th>
                    <th className="px-6 py-3 border-b border-red-600">Location</th>
                    <th className="px-6 py-3 border-b border-red-600">Contact </th>
                    </tr>
                </thead>
                <tbody className="text-[15px] text-white">
                    {bloodBanks.map((bank: any, index: number) => (
                    <tr
                        key={index}
                        className="even:bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-200"
                    >
                        <td className="px-6 py-3 border-b border-gray-700">{index + 1}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{bank.id}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{bank.bloodbankname}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{bank.location}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{bank.contactnumber}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
       </div>
    )
}

export default BloodBankDirectory;