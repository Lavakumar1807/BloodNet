"use client"

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

function StaffProfile() {
  const [staffId, setStaffId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("");
  const [bloodBankId, setBloodBankId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodBankName,setBloodBankName] = useState("");

  const getJWTdetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/me", {
        withCredentials: true
      });
      setStaffId(response.data.user.id);
      setStaffName(response.data.user.name);
      setRole(response.data.user.role);
    } catch (error) {
      console.log(error);
      alert("Error fetching JWT info");
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/details/staff/${staffId}`, {
        withCredentials: true
      });
      setBloodBankId(response.data.staff[0].bloodbank_id);
      setPhoneNumber(response.data.staff[0].phonenumber);
    } catch (error) {
      console.log(error);
      alert("Error fetching staff details");
    }
  };

  const getBloodBankName = async()=>{
    try{
        const response = await axios.get(`http://localhost:5000/details/bloodbank/${bloodBankId}`, {
            withCredentials: true
        });
        setBloodBankName(response.data.bloodbank[0].bloodbankname);
    }catch(error){
        console.log(error);
        alert("Error fetching Blood Bank Name details");
    }
  }

  useEffect(() => {
    getJWTdetails();
  }, []);

  useEffect(() => {
    if (staffId) {
      getDetails();
    }
  }, [staffId]);

  useEffect(() => {
    if (bloodBankId) {
      getBloodBankName();
    }
  }, [bloodBankId]);

  return (
    <div className="pt-[150px]  min-h-screen w-full  flex justify-center items-center bg-black overflow-hidden">
      <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
        <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
          <Link href="/explore">Go Back</Link>
        </button>
      </div>

      <div className="w-[80%] h-[60vh] flex gap-[10px]">
        <div className="w-[30%] bg-[#292929] rounded-[7px] p-5 flex flex-col items-center justify-center gap-4 text-white shadow-md">
          <div className="bg-[#1c1c1c] rounded-full p-4">
            <FaUserCircle className="text-white text-[80px] transition-transform duration-300 hover:scale-110" />
          </div>
          <h1 className="text-center font-mono font-semibold tracking-wide text-[24px] leading-tight break-words">{staffName}</h1>
          <h2 className="text-[#808080] text-center font-mono font-medium tracking-wide text-[18px]">{role}</h2>
        </div>

        <div className="w-[70%] bg-[#292929] rounded-[7px] shadow-lg p-6 flex flex-col justify-start border border-[#3a3a3a]">
            <h2 className="text-white font-mono font-semibold text-2xl mb-4 tracking-wider">Staff Profile</h2>
            <div className="bg-[#1c1c1c] rounded-[5px] w-full divide-y divide-[#3a3a3a]">
                {[
                { label: "Staff ID", value: staffId },
                { label: "Staff Name", value: staffName },
                { label: "Role", value: role },
                { label: "Blood Bank ID", value: bloodBankId },
                { label: "Blood Bank Name", value: bloodBankName },
                { label: "Phone Number", value: phoneNumber },
                ].map((item, index) => (
                <div
                    key={index}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-2 sm:gap-0 hover:bg-[#242323] transition duration-200 ease-in-out"
                >
                    <p className="text-white font-mono font-medium tracking-wide text-base sm:text-lg sm:w-1/2 leading-snug">
                    {item.label}
                    </p>
                    <span className="text-[#a0a0a0] font-mono tracking-wide text-base sm:text-lg break-words sm:w-1/2 text-left sm:text-right leading-snug">
                    {item.value}
                    </span>
                </div>
                ))}
            </div>
       </div>
      </div>
    </div>
  );
}

export default StaffProfile;
