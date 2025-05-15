"use client"

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

function RecipientProfile() {
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [transactions, setTransactions] = useState([]);

  const getJWTdetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/me", {
        withCredentials: true,
      });
      setRecipientId(response.data.user.id);
      setRecipientName(response.data.user.name);
      setRole(response.data.user.role);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Recipient JWT info");
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/details/recipient/${recipientId}`,
        {
          withCredentials: true,
        }
      );
      const data = response.data.recipient[0];
      setAge(data.age);
      setDob(new Date(data.dateofbirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }));
      setBloodGroup(data.bloodgroup);
      setGender(data.gender);
      setPhoneNumber(data.phonenumber);
      setStaffId(data.staff_id);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Recipient Details");
    }
  };

  const getStaffName = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/details/staff/${staffId}`,
        {
          withCredentials: true,
        }
      );
      setStaffName(response.data.staff[0].staffname);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Staff Name");
    }
  };

  const getTransactions = async () => {
    try{
       const response = await axios.get(`http://localhost:5000/recipient/requestblood/${recipientId}`,{
        withCredentials: true,
       })
       setTransactions(response.data.transactions);
    }catch(error){
      alert("Error in fetching Transactions");
    }
  }

  useEffect(() => {
    getJWTdetails();
  }, []);

  useEffect(() => {
    if (recipientId) {
      getDetails();
    }
  }, [recipientId]);

  useEffect(() => {
    if (recipientId) {
      getTransactions();
    }
  }, [recipientId]);

  useEffect(() => {
    if (staffId) {
      getStaffName();
    }
  }, [staffId]);

  return (
    <div className="pt-[150px] w-full  min-h-screen flex justify-center items-center bg-black overflow-hidden">
      <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
        <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
          <Link href="/explore">Go Back</Link>
        </button>
      </div>

      <div className="w-[80%] h-[85vh] flex flex-col gap-[10px] overflow-hidden">
        <div className="flex w-full h-[45%] gap-[10px]">
          <div className="w-[30%] bg-[#292929] rounded-[7px] p-5 flex flex-col items-center justify-center gap-4 text-white shadow-md">
            <div className="bg-[#1c1c1c] rounded-full p-4">
              <FaUserCircle className="text-white text-[80px] transition-transform duration-300 hover:scale-110" />
            </div>
            <h1 className="text-center font-mono font-semibold tracking-wide text-[24px] leading-tight break-words">
              {recipientName}
            </h1>
            <h2 className="text-[#808080] text-center font-mono font-medium tracking-wide text-[18px]">
              {role}
            </h2>
          </div>

          <div className="w-[70%] bg-[#292929] rounded-[7px] shadow-lg p-6 flex flex-col justify-start border border-[#3a3a3a]">
            <h2 className="text-white font-mono font-semibold text-xl mb-4 tracking-wider">
              Recipient Profile
            </h2>

            <div className="bg-[#1c1c1c] rounded-[5px] w-full flex flex-wrap divide-y divide-[#3a3a3a]">
              {[
                { label: "Recipient ID", value: recipientId },
                { label: "Recipient Name", value: recipientName },
                { label: "Age", value: age },
                { label: "Date of Birth", value: dob },
                { label: "Blood Group", value: bloodGroup },
                { label: "Gender", value: gender },
                { label: "Role", value: role },
                { label: "Phone Number", value: phonenumber },
                { label: "Staff ID", value: staffId },
                { label: "Staff Name", value: staffName }
              ].map((item, index) => (
                <div
                  key={index}
                  className="w-full sm:w-1/2 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-[8px] hover:bg-[#242323] transition duration-200 ease-in-out"
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
            <div className="w-[30%]">Blood Bank Id</div>
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
                <div className="w-[30%] break-words">{(tx as any).bloodbank_id}</div>
                <div className="w-[20%]">{(tx as any).blood_group}</div>
                <div className="w-[15%]">{(tx as any).quantity}</div>
                 <div className="w-[25%]">{new Date((tx as any).requested_at).toLocaleDateString("en-US", {
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
  );
}

export default RecipientProfile;
