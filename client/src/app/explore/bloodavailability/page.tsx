"use client";

import Link from "next/link";
import { useState,useEffect } from "react";
import axios from "axios";

function BloodBankDirectory(){
    const [locations,setLocations] = useState([]);
    const [selectedLocation,setSelectedLocation] = useState("");
    const [bloodavailability,setBloodAvailability] = useState([]);
    const [bloodGroup,setBloodGroup] = useState("");
    const bloodgroups = ["A+","A-","B+","B-","AB+","O+","O-","AB+","AB-"];

    const getLocations = async()=>{
        try{
            const response = await axios.get("http://localhost:5000/bloodbanklocations");
            setLocations(response.data.locations);
        }catch(error){
            alert("Error in fetching Locations");
        }
    }

    const getBloodAvailabilityInfo = async () => {
        try{
           const response = await axios.get(`http://localhost:5000/bloodavailability/${selectedLocation}/${bloodGroup}`);
           setBloodAvailability(response.data.bloodavailability);
        }catch(error){
          alert("Error in fetching Blood Availability Info");
        }
    }

    useEffect(()=>{
      getLocations();
      console.log(bloodavailability);
    },[]);


    return(
       <div className="pt-[150px] w-[full] text-white bg-black flex justify-center items-center flex-col gap-[20px]">
        <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
          <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
            <Link href="/explore">Go Back</Link>
          </button>
        </div>
          <div>
             <h1 className="text-[40px] font-bold font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Blood Availability</h1>
          </div>
          <div className="w-[70%] p-[10px]  flex justify-around items-center flex-wrap ">
             <select onChange={(e)=>setSelectedLocation(e.target.value)} className="w-[35%] p-2 rounded-md text-white bg-[#1c1c1c] border border-gray-700 focus:outline-none ">
                <option  value="">Select Location</option>
                {
                    locations.map((location : any,index)=>(
                       <option key={index} value={location.location}>{location.location}</option>
                    ))
                }
             </select>

             <select onChange={(e)=>setBloodGroup(e.target.value)} className="w-[35%] p-2 rounded-md text-white bg-[#1c1c1c] border border-gray-700 focus:outline-none ">
                <option  value="">Select Blood Group</option>
                {
                    bloodgroups.map((bloodgroup : any,index)=>(
                       <option key={index} value={bloodgroup}>{bloodgroup}</option>
                    ))
                }
             </select>

             <button  onClick={getBloodAvailabilityInfo} 
               className="w-[120px] text-black font-medium text-[17px] rounded-[5px] p-2 px-6 bg-red-500 hover:bg-red-600 hover:cursor-pointer">
                Search
             </button>
          </div>

          {bloodavailability.length >= 0 ? (
            <div className="w-[90%] mt-8 overflow-x-auto shadow-lg rounded-lg">
                <table className="w-full text-sm text-left text-black font-mono border-collapse">
                <thead className="text-base bg-gradient-to-r from-red-800 to-red-600 text-black">
                    <tr>
                    <th className="px-6 py-3 border-b border-red-600">S.No</th>
                    <th className="px-6 py-3 border-b border-red-600">Blood Bank ID</th>
                    <th className="px-6 py-3 border-b border-red-600">Blood Bank Name</th>
                    <th className="px-6 py-3 border-b border-red-600">Contact </th>
                    <th className="px-6 py-3 border-b border-red-600">Quantity</th>
                    <th className="px-6 py-3 border-b border-red-600">Collected Date</th>
                    <th className="px-6 py-3 border-b border-red-600">Expiry Date</th>
                    </tr>
                </thead>
                <tbody className="text-[15px] text-white">
                    {bloodavailability.map((blood: any, index: number) => (
                    <tr
                        key={index}
                        className="even:bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-200"
                    >
                        <td className="px-6 py-3 border-b border-gray-700">{index + 1}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{blood.bloodbank_id}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{blood.bloodbankname}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{blood.contactnumber}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{blood.quantity}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{new Date(blood.collected_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}</td>
                        <td className="px-6 py-3 border-b border-gray-700">{new Date(blood.expiry_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        ) : <></>}
       </div>
    )
}

export default BloodBankDirectory;