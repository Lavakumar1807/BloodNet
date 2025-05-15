"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import axios from "axios";

import { RxCross2 } from "react-icons/rx";
import { FaUserCircle } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { FaUserAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";


function Navbar(){
    const [loginCheck,setLoginCheck] = useState(false);
    const [userName,setUserName] = useState("");
    const [role,setRole] = useState("");
    const [userIconClick,setUserIconClick] = useState(false);
    const [checkDonor,setCheckDonor] = useState(false);
    const [checkBloodBank,setBloodBank] = useState(false);
    const [checkRecipient,setRecipient] = useState(false); 

    const router = useRouter();
    const pathname = usePathname();

    const checkingLogin = async ()=>{
        try{
            const response = await axios.get("http://localhost:5000/me",
              { withCredentials: true}
            );
            if(response.data.user.role == 'donor'){
               setCheckDonor(true);
            }
            if(response.data.user.role == "bloodbank"){
                setBloodBank(true);
            }
            if(response.data.user.role == "recipient"){
                setRecipient(true);
            }
            setUserName(response.data.user.name);
            setRole(response.data.user.role)
            setLoginCheck(response.data.check);
        }catch(error){
          console.log(error);
          return;
        }
      }

    const getActiveClass = (path: string) =>{
      return pathname === path
          ? "font-mono font-medium tracking-tighter text-[18px] bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"
          : "font-mono font-medium tracking-tighter text-[18px] hover:bg-gradient-to-r from-red-600 to-red-500 bg-clip-text hover:text-transparent ";
    }
  
    useEffect(()=>{
        checkingLogin();
    },[]);

    const handleLogout = async()=>{
        try{
            await axios.get("http://localhost:5000/logout",
              { withCredentials: true}
            );
  
            setLoginCheck(false);
            setUserIconClick(false);
            router.push("/");
        }catch(error){
           alert("Server ERROR!!");
        }
    }
  
    return(
       <div className="fixed w-[100%] p-[25px] z-50 flex items-end justify-between bg-black shadow-md shadow-red-600/40">
                <div className="text-white">
                    <h1 className=" text-white text-5xl font-bold flex justify-baseline items-start  flex-wrap"><span className="bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Blood</span>Net</h1>
                </div>
       
                <div className="relative inline-flex ">
                    {
                    loginCheck ?
                    <div className="text-white px-[20px] flex justify-around items-center gap-[30px]">
                      { checkDonor ? <Link href="/explore/donate"><h1 className={`${getActiveClass("/explore/donate")}`}>Donate</h1></Link> : <></> }
                      { checkRecipient ? <Link href="/explore/request"><h1 className={`${getActiveClass("/explore/request")}`}>Request Blood</h1></Link> : <></> }
                      { (checkDonor || checkRecipient) ? <Link href="/explore/notifications"><h1 className={`${getActiveClass("/explore/notifications")}`}>Notifications</h1></Link> : <></> }
                      { checkBloodBank ? <Link href="/explore/bloodinventory"><h1 className={`${getActiveClass("/explore/bloodinventory")}`}>Check Blood  Inventory</h1></Link> : <></> }
                      { checkBloodBank ? <Link href="/explore/notifications"><h1 className={`${getActiveClass("/explore/notifications")}`}>Broadcast</h1></Link> : <></> }
                      <Link href="/explore/bloodbankdirectory"><h1 className={`${getActiveClass("/explore/bloodbankdirectory")}`}>Blood Bank Directory</h1></Link>
                      <Link href="/explore/bloodavailability"><h1 className={`${getActiveClass("/explore/bloodavailability")}`}>Blood Availability</h1></Link>
                      <FaUserCircle onClick={()=> setUserIconClick(userIconClick ? false : true)} className="text-white text-[55px] cursor-pointer"/>
                    </div>
                    :<div className=" text-white text-[17px] font-medium">
                      <button className="pr-[15px] pl-[15px] border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black"><Link href="/">Login</Link></button>
                    </div>
                    }
       
                    {
                    userIconClick   
                    ? <div className="bg-[#222222] p-[10px] box-border rounded-[10px] origin-top-right z-10 absolute mt-[10px] top-full right-[6px] w-[250px] h-[250px] flex justify-center items-center flex-col">
                       <div className="w-[100%] flex justify-end items-center ">
                        <RxCross2 onClick={()=> setUserIconClick(false)} className="text-white text-[25px] cursor-pointer"/>
                       </div>
                    <div className="p-[5px] flex justify-center items-center flex-col gap-[5px]">
                       <FaUserCircle className="text-white text-[55px]"/>
                       <h2 className="text-white font-bold font-mono tracking-wide text-[18px]">Hi,{userName}</h2>
                       <h3 className="text-[#8b8989f5] font-bold font-mono tracking-wide text-[17px]">{role}</h3>
                    </div> 
       
                    <Link href={`/profile/${role}`} className="w-[100%]">
                      <div className="w-[100%] text-[#b5b5b5] font-medium tracking-wide flex justify-start items-center gap-[20px] cursor-pointer hover:bg-[#313131f5] p-[8px] rounded-[5px]">
                       <FaUserAlt className="text-[#b5b5b5] text-[18px]"/>
                       <h1>Profile</h1>
                      </div>
                    </Link>
       
                            
                    <div onClick={handleLogout} className=" w-[100%] text-[#b5b5b5] font-medium tracking-wide flex justify-start items-center gap-[20px] cursor-pointer hover:bg-[#313131f5] p-[8px] rounded-[5px]">
                    <TbLogout className="text-[#b5b5b5] text-[18px]"/>
                    <h1>Logout</h1>
                    </div>
                            
                    </div>
                    : <></>
                    }
       
                </div>
        </div>
    )
}

export default Navbar;