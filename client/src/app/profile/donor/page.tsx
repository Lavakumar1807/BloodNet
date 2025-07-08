"use client"

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

function DonorProfile() {
  const [donorId, setDonorId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffName,setStaffName] = useState("");
  const [transactions,setTransactions] = useState([]);

  const getJWTdetails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/me", {
        withCredentials: true,
      });
      setDonorId(response.data.user.id);
      setDonorName(response.data.user.name);
      setRole(response.data.user.role);
    } catch (error) {
      console.log(error);
      alert("Error in fetching Donor JWT info");
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/details/donor/${donorId}`,
        {
          withCredentials: true,
        }
      );
      const data = response.data.donor[0];
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
      alert("Error in fetching Donor Details");
    }
  };

  const getStaffName = async()=>{
    try{
        const response = await axios.get(
            `http://localhost:5000/details/staff/${staffId}`,
            {
              withCredentials: true,
            }
          )
          setStaffName(response.data.staff[0].staffname);
    }catch(error){
        console.log(error);
        alert("Error in fetching Staff Name");
    }
  }

  const getTransactions = async()=>{
        try{
            const response = await axios.get(`http://localhost:5000/donor/transactions/${donorId}`)
            setTransactions(response.data.transactions);
        }catch(error){
           alert("Error in retreiving Transaction History");
        }
  }

  useEffect(() => {
    getJWTdetails();
  }, []);

  useEffect(() => {
    if (donorId) {
      getDetails();
      getTransactions();
    }
  }, [donorId]);

  useEffect(() => {
    if (staffId) {
      getStaffName();
    }
  }, [staffId]);

  

  return (
    <div className="pt-[150px]  min-h-screen  w-full flex justify-center items-center bg-black overflow-hidden">
      <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
        <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
          <Link href="/explore">Home</Link>
        </button>
      </div>

      <div className="w-[80%] h-[85vh] flex flex-col gap-[10px] overflow-hidden">
        <div className="flex w-full h-[45%] gap-[10px]">
          <div className="w-[30%] bg-[#292929] rounded-[7px] p-5 flex flex-col items-center justify-center gap-4 text-white shadow-md">
            <div className="bg-[#1c1c1c] rounded-full p-4">
              <FaUserCircle className="text-white text-[80px] transition-transform duration-300 hover:scale-110" />
            </div>
            <h1 className="text-center font-mono font-semibold tracking-wide text-[24px] leading-tight break-words">
              {donorName}
            </h1>
            <h2 className="text-[#808080] text-center font-mono font-medium tracking-wide text-[18px]">
              {role}
            </h2>
          </div>

          <div className="w-[70%] bg-[#292929] rounded-[7px] shadow-lg p-6 flex flex-col justify-start border border-[#3a3a3a]">
                <h2 className="text-white font-mono font-semibold text-xl mb-4 tracking-wider">
                    Donor Profile
                </h2>

                <div className="bg-[#1c1c1c] rounded-[5px] w-full flex flex-wrap divide-y divide-[#3a3a3a]">
                    {[
                    { label: "Donor ID", value: donorId },
                    { label: "Donor Name", value: donorName },
                    { label: "Age", value: age },
                    { label: "Date of Birth", value: dob },
                    { label: "Blood Group", value: bloodGroup },
                    { label: "Gender", value: gender },
                    { label: "Role", value: role },
                    { label: "Phone Number", value: phonenumber },
                    { label: "Staff ID", value: staffId },
                    { label: "Staff Name", value: staffName}
                    ].map((item, index) => (
                    <div
                        key={index}
                        className="w-full sm:w-1/2 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-2 hover:bg-[#242323] transition duration-200 ease-in-out"
                    >
                        <p className="text-white font-mono font-medium tracking-wide text-xs sm:text-sm sm:w-1/2 leading-tight">
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

            <div className="w-full h-[50%] mb-[20px] bg-[#292929] p-4 rounded-[7px]  flex flex-col">
                <h2 className="text-white font-mono font-semibold text-[18px] mb-4 border-b border-[#3a3a3a] pb-2">
                    Donation History
                </h2>
                <div className="w-full flex text-white font-mono text-sm font-semibold bg-[#222222] rounded-md px-4 py-3">
                    <div className="w-[10%]">S.No</div>
                    <div className="w-[30%]">Blood Bank Id</div>
                    <div className="w-[30%]">Blood Bank Name</div>
                    <div className="w-[15%]">Units</div>
                    <div className="w-[25%]">Collected Date</div>
                </div>

                <div className="flex flex-col mt-2 gap-2 overflow-y-auto">
                    {transactions.map((tx, index) => (
                    <div
                        key={index}
                        className="w-full flex text-[#cfcfcf] font-mono text-sm bg-[#1e1e1e] px-4 py-3 rounded-md hover:bg-[#2c2c2c] transition-all duration-200"
                    >
                        <div className="w-[10%]">{index + 1}</div>
                        <div className="w-[30%] break-words">{(tx as any).bloodbank_id}</div>
                        <div className="w-[30%] break-words">{(tx as any).bloodbankname}</div>
                        <div className="w-[15%]">{(tx as any).quantity}</div>
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
  );
}

export default DonorProfile;
