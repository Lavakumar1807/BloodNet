"use client"

import { useEffect, useState } from "react";
import { FaHospital } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

function HospitalProfile() {
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [bloodBankId, setBloodBankId] = useState("");
  const [role, setRole] = useState("");
  const [bloodbankname,setBloodBankName] = useState("");

  const getJWTdetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/me", {
        withCredentials: true,
      });
      setHospitalId(response.data.user.id);
      setHospitalName(response.data.user.name);
      setRole(response.data.user.role);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Hospital JWT info");
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/details/hospital/${hospitalId}`,
        {
          withCredentials: true,
        }
      );
      const data = response.data.hospital[0];
      setContactNumber(data.contactnumber);
      setBloodBankId(data.bloodbank_id);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Hospital Details");
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
    if (hospitalId) {
      getDetails();
    }
  }, [hospitalId]);

  useEffect(()=>{
     if(bloodBankId){
        getBloodBankName();
     }
  },[bloodBankId]);


  const transactions = [
    {
      bank: "Red Cross",
      date: "2025-03-20",
      bloodGroup: "B+",
      units: 3,
    },
    {
      bank: "LifeLine Blood Bank",
      date: "2024-12-15",
      bloodGroup: "O-",
      units: 1,
    },
  ];

  return (
    <div className="pt-[150px]  min-h-screen w-full  flex justify-center items-center bg-black overflow-hidden">
      <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
        <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
          <Link href="/explore">Home</Link>
        </button>
      </div>

      <div className="w-[80%] h-[85vh] flex flex-col gap-[10px] overflow-hidden">
        <div className="flex w-full h-[45%] gap-[10px]">
          <div className="w-[30%] bg-[#292929] rounded-[7px] p-5 flex flex-col items-center justify-center gap-4 text-white shadow-md">
            <div className="bg-[#1c1c1c] rounded-full p-4">
              <FaHospital className="text-white text-[80px] transition-transform duration-300 hover:scale-110" />
            </div>
            <h1 className="text-center font-mono font-semibold tracking-wide text-[24px] leading-tight break-words">
              {hospitalName}
            </h1>
            <h2 className="text-[#808080] text-center font-mono font-medium tracking-wide text-[18px]">
              {role}
            </h2>
          </div>

          <div className="w-[70%] bg-[#292929] rounded-[7px] shadow-lg p-6 flex flex-col justify-start border border-[#3a3a3a]">
            <h2 className="text-white font-mono font-semibold text-xl mb-4 tracking-wider">
              Hospital Profile
            </h2>

            <div className="bg-[#1c1c1c] rounded-[5px] w-full flex flex-wrap divide-y divide-[#3a3a3a]">
              {[
                { label: "Hospital ID", value: hospitalId },
                { label: "Hospital Name", value: hospitalName },
                { label: "Blood Bank ID", value: bloodBankId },
                { label: "Blood Bank Name", value: bloodbankname },
                { label: "Role", value: role },
                { label: "Contact Number", value: contactNumber }
              ].map((item, index) => (
                <div
                  key={index}
                  className="w-full sm:w-1/2 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-[20px] hover:bg-[#242323] transition duration-200 ease-in-out"
                >
                  <p className="text-white font-mono font-medium tracking-wide text-base sm:text-sm sm:w-1/2 leading-snug">
                    {item.label}
                  </p>
                  <span className="text-[#a0a0a0] font-mono tracking-wide text-xs sm:text-sm break-words sm:w-1/2 text-left sm:text-right leading-tight">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[55%] bg-[#292929] p-4 rounded-[7px] overflow-y-auto flex flex-col">
          <h2 className="text-white font-mono font-semibold text-[18px] mb-4 border-b border-[#3a3a3a] pb-2">
            Transaction History
          </h2>
          <div className="w-full flex text-white font-mono text-sm font-semibold bg-[#222222] rounded-md px-4 py-3">
            <div className="w-[10%]">S.No</div>
            <div className="w-[30%]">Blood Bank</div>
            <div className="w-[20%]">Blood Group</div>
            <div className="w-[15%]">Units</div>
            <div className="w-[25%]">Date</div>
          </div>

          <div className="flex flex-col mt-2 gap-2">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="w-full flex text-[#cfcfcf] font-mono text-sm bg-[#1e1e1e] px-4 py-3 rounded-md hover:bg-[#2c2c2c] transition-all duration-200"
              >
                <div className="w-[10%]">{index + 1}</div>
                <div className="w-[30%] break-words">{tx.bank}</div>
                <div className="w-[20%]">{tx.bloodGroup}</div>
                <div className="w-[15%]">{tx.units}</div>
                <div className="w-[25%] break-words">{tx.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalProfile;
