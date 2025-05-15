"use client"

import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function RequestBlood() {
    const [password, setPassword] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [bloodQuantity, setBloodQuantity] = useState("");
    const [bloodbankId, setBloodBankId] = useState("");
    const [bloodbankPassword, setBloodBankPassword] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const router = useRouter();

    const checkingLogin = async () => {
        try {
            const response = await axios.get("http://localhost:5000/me", {
                withCredentials: true
            });
            setRecipientId(response.data.user.id);
        } catch (error) {
            console.log(error);
            return;
        }
    };

    useEffect(() => {
        checkingLogin();
    }, []);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/requestblood", {
                recipientId,
                password,
                bloodGroup,
                bloodQuantity,
                bloodbankId,
                bloodbankPassword
            }, {
                withCredentials: true
            });
            alert("Request submitted successfully.");
            router.push("/explore");
            
        } catch (error) {
            alert("Error submitting request. Please check your credentials.");
        }
    };

    return (
        <div className="pt-[150px] min-h-screen bg-black text-white flex flex-col items-center px-4">
            <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
                <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
                    <Link href="/explore">Go Back</Link>
                </button>
            </div>
            <div className="w-[100%] flex justify-center items-center flex-col">
                <h1 className="text-[40px] font-bold font-mono bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Request Blood</h1>
                <p className="text-lg text-center max-w-[600px] mb-8 font-mono text-[20px]">
                    Request life-saving blood units from the nearest blood bank. Fill in the details below.
                </p>

                <form onSubmit={handleRequest} className="bg-gray-900 p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Recipient Password ..."
                        required
                        className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                      <select required onChange={(e)=>setBloodGroup(e.target.value)} className="w-[100%] border-1 border-gray-700 p-3 rounded-[10px]">
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
                    <input
                        type="number"
                        placeholder="Blood Quantity (units) ..."
                        required
                        onChange={(e) => setBloodQuantity(e.target.value)}
                        className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                    />
                    <div className="w-[100%] flex justify-between items-center flex-wrap">
                        <input
                            type="number"
                            placeholder="Blood Bank ID ..."
                            required
                            onChange={(e) => setBloodBankId(e.target.value)}
                            className="w-[45%] p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        />
                        <input
                            type="password"
                            placeholder="Blood Bank Password ..."
                            required
                            onChange={(e) => setBloodBankPassword(e.target.value)}
                            className="w-[45%] p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 text-black font-mono text-[20px] py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:cursor-pointer hover:from-red-800 hover:to-red-600 transition duration-300"
                    >
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RequestBlood;
