"use client";

import Link from "next/link";
import { IoIosNotifications } from "react-icons/io";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoNotifications } from "react-icons/io5";

type Notification = {
  id: number;
  title: string;
  message: string;
  created_at: string;
  role: string;
  bloodbankname: string;
};

function Notifications() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("all");
  const [BroadcastHistory, setBroadcastHistory] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);

  const getJWTDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      alert("Please login to continue");
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) return;

    try {
      await axios.post(
        "http://localhost:5000/bloodbank/notifications",
        {
          bloodbankId: user?.id,
          role,
          title,
          message,
        },
        {
          withCredentials: true,
        }
      );
      setTitle("");
      setMessage("");
      setRole("all");
      fetchHistory();
    } catch (err) {
      alert("Error sending notification. Please try again.");
    }
  };

  const fetchBroadcastHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/bloodbank/${user.id}/notifications`, {
        withCredentials: true,
      })
      setBroadcastHistory(res.data.notifications);
    } catch (err) {
      alert("Error fetching notifications. Please try again.");
    }
  };

  const fetchHistory = async () => {
      try{
        const res = await axios.get(`http://localhost:5000/${user.role}/notifications`, {
            withCredentials: true,
          });
          setHistory(res.data.notifications);
      }catch(error){
        alert("Error fetching notifications. Please try again.");
      }
  }

  useEffect(() => {
    getJWTDetails();
    if(user){
        if(user.role == "bloodbank"){
           fetchBroadcastHistory();
        }
        else{
            fetchHistory();
        }
    }
  }, [user,history,BroadcastHistory]);

  return (
    <div className="pt-[150px] min-h-screen bg-[#0f0f0f] text-white px-6">
      <div className="absolute top-[150px] left-[30px] text-white text-[17px] font-medium">
            <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black">
              <Link href="/explore">Go Back</Link>
            </button>
      </div>

      { user?.role == "bloodbank" ? 
      <div className="p-[30px]">
      <div className="max-w-2xl mx-auto mb-12 bg-[#1a1a1a] p-6 rounded-2xl shadow-lg">
        <h1 className="text-[30px] mb-1 font-bold font-mono bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Broadcast Notification</h1>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-4 p-3 rounded-md bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Message"
          className="w-full mb-4 p-3 rounded-md bg-[#121212] text-white resize-none focus:outline-none focus:ring-2 focus:ring-gray-700"
        />

        <div className="font-mono flex items-center gap-4 mb-4">
          <label className="text-sm">Target Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#121212] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
            <option value="all">All</option>
          </select>
        </div>

        <button
          onClick={sendNotification}
          className="text-black bg-gradient-to-r from-red-600 to-red-500 px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all hover:cursor-pointer "
        >
          Send Broadcast
        </button>
      </div>

      <div className="w-[70%] mx-auto bg-[#1a1a1a] p-6 rounded-2xl shadow-lg">
        <h2 className="text-[30px] mb-1 font-bold font-mono bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Broadcast History</h2>
        {BroadcastHistory.length === 0 ? (
          <p className="text-gray-400">No Broadcasts yet...</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
            {BroadcastHistory.map((notif) => (
              <div
                key={notif.id}
                className="bg-[#121212] p-4 rounded-md border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-white">{notif.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1 italic">Target: {notif.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      : <>
        <div className="w-[70%] h-[70vh] mx-auto bg-[#1a1a1a] p-6 rounded-2xl shadow-lg flex items-start jutify-center flex-col gap-[20px]">
            <div className="flex items-center justify-center gap-[10px]" >
                <IoIosNotifications className="text-[40px] text-red-600" />
                <h1 className="text-[30px] mb-1 font-bold font-mono bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Notifications</h1>
            </div>
        {history.length === 0 ? (
            <p className="text-gray-400">No messages yet...</p>
        ) : (
            <div className="w-[100%] space-y-4 h-[90%] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
            {history.map((notif) => (
                <div
                key={notif.id}
                className="bg-[#121212] p-4 rounded-md border border-gray-700"
                >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg text-white">{notif.title}</h3>
                    <span className="text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                    })}
                    </span>
                </div>
                <p className="text-sm text-gray-300">{notif.message}</p>
                <div className="mt-2 text-xs text-gray-400 italic">
                    <p>From: <span className="text-white font-medium">{notif.bloodbankname}</span></p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
      </> }
    </div>
  );
}

export default Notifications;
