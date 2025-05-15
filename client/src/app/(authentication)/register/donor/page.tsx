"use client"

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Image3 from "@/Images/Image3.jpg"
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

function DonorRegister(){
    const [donorname,setDonorName] = useState("");
    const [dob,setDOB] = useState("");
    const [age,setAge] = useState("");
    const [phonenumber,setPhonenumber] = useState("");
    const [gender,setGender] = useState("");
    const [bloodgroup,setBloodGroup] = useState("");
    const [password,setPassword] = useState("");
    const [staffId,setStaffId] = useState("");
    const [staffpassword,setStaffPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e : React.FormEvent)=>{
      e.preventDefault();

      try{

        const response = await axios.post("http://localhost:5000/register/donor",{
                  donorname,
                  dob,
                  age,
                  phonenumber,
                  gender,
                  bloodgroup,
                  password,
                  staffId,
                  staffpassword
                })
        
                setDonorName("");
                setDOB("");
                setAge("");
                setPhonenumber("");
                setGender("");
                setBloodGroup("");
                setPassword("");
                setStaffId("");
                setStaffPassword("");

                alert("Donor Registered Successfully :)");
                router.push("/");
      }catch(error){
        alert("Error in registering Donor")
      }
    }

    return(
       <div className="relative w-full h-screen bg-black text-white flex justify-center items-center p-10 flex-col gap-[30px]">
            <Image
                src={Image3}
                alt="Image3"
                fill
                className="object-cover"
              />
            <div className="z-10 mt-[20px]">
                <h1 className="text-[40px] font-medium font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Donor Registration</h1>
            </div>

            <div className="absolute top-10 right-10  text-white text-[17px] font-medium">
              <button className="border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black"><Link href="/explore">Explore</Link></button>
            </div>

            <div className="z-10 w-[70vmin] h-auto border-2 border-gray-600 rounded-2xl flex justify-center item-center flex-col p-5 font-mono gap-3 shadow-lg shadow-gray-400">
                    <FaUserCircle className="text-[90px] text-center w-[100%]"/>
                    <form onSubmit={handleSubmit} className=" flex justify-center item-center flex-col text-white font-medium gap-5 p-[10px] box-border">
                        <div className="flex w-[100%] gap-[10px]">
                            <input 
                              type="text" 
                              name="donorname" 
                              placeholder="Donor Name..." 
                              required 
                              className="border-1 border-gray-600 p-3 rounded-[10px] w-[50%] "
                              onChange={(e)=>setDonorName(e.target.value)}
                             />
                        
                            <div className="w-[100%] flex justify-between items-center gap-[10px]">
                              <input 
                               type="date" 
                               name="dob" 
                               required 
                               className="border border-gray-600 p-3 rounded-[10px] w-[50%] text-white bg-black"
                               style={{ colorScheme: "dark" }}
                               onChange={(e)=>setDOB(e.target.value)}
                              />
                              <input 
                               type="number" 
                               name="age" 
                               placeholder="Age" 
                               required 
                               className="border-1 border-gray-600 p-3 rounded-[10px]  w-[50%]"
                               onChange={(e)=>setAge(e.target.value)}
                               />
                            </div>

                        </div>
                            
                            <input 
                              type="tel" 
                              name="phonenumber" 
                              placeholder="Phone Number..." 
                              required 
                              className="border-1 border-gray-600 p-3 rounded-[10px] "
                              onChange={(e)=>setPhonenumber(e.target.value)}
                            />

                            <div className="w-[100%] flex justify-between items-center gap-[10px]">
                              <input 
                               type="text" 
                               name="gender" 
                               placeholder="Gender..." 
                               required 
                               className="border-1 border-gray-600 p-3 rounded-[10px] w-[50%] "
                               onChange={(e)=>setGender(e.target.value)}
                              />
                              <select required onChange={(e)=>setBloodGroup(e.target.value)} className="border-1 border-gray-600 p-3 rounded-[10px] w-[50%]">
                                 <option value="" className="bg-black">Select Blood Group</option>
                                 <option className="bg-black" value="A+">A+</option>
                                 <option className="bg-black" value="A-">A-</option>
                                 <option className="bg-black" value="B+">B+</option>
                                 <option className="bg-black" value="B-">B-</option>
                                 <option className="bg-black" value="AB+">AB+</option>
                                 <option className="bg-black" value="AB-">AB-</option>
                                 <option className="bg-black" value="O+">O+</option>
                                 <option className="bg-black" value="O-">O-</option>
                              </select>
                               
                            </div>

                            <input 
                             type="password" 
                             name="password" 
                             placeholder="Password..." 
                             required 
                             className="border-1 border-gray-600 p-3 rounded-[10px]"
                             onChange={(e)=>setPassword(e.target.value)}
                            />

                            <div className="w-[100%] flex justify-between items-center gap-[10px]">
                              <input 
                               type="number" 
                               name="staffId" 
                               placeholder="Staff Id..." 
                               required 
                               className="border-1 border-gray-600 p-3 rounded-[10px]  w-[50%]"
                               onChange={(e)=>setStaffId(e.target.value)}
                              />
                              <input 
                               type="password" 
                               name="staffpassword" 
                               placeholder="Staff Password.." 
                               required 
                               className="border-1 border-gray-600 p-3 rounded-[10px]  w-[50%]"
                               onChange={(e)=>setStaffPassword(e.target.value)}
                               />
                            </div>
                            <button type="submit" className="p-2  rounded-[10px] bg-gradient-to-r from-red-800 to-red-500 shadow-lg hover:cursor-pointer text-black text-[20px] hover:shadow-[0_0_5px_5px_rgb(180,20,20,0.7)]">Register</button>
                    </form>
                          
            </div>
       </div>
    )
}

export default DonorRegister;