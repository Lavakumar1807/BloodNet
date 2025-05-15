import Image from "next/image";
import HomeImage from "@/Images/Home.jpg"; 
import Link from "next/link";

function Home() {
  return (
      <div className="bg-black relative h-screen w-screen flex justify-end items-center p-10">
        <Image
        src={HomeImage}
        alt="Home Background"
        fill
        className="object-cover"
      />
      <div className=" absolute top-10 right-10  text-white text-[17px] font-medium">
         <button className="border-2 border-red-700 p-2  rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 hover:cursor-pointer hover:text-black"><Link href="/explore">Explore</Link></button>
      </div>
      <div className=" absolute  flex justify-center align-middle flex-col w-[80vmin] h-auto gap-10">
        <div >
           <h1 className=" text-white text-7xl font-bold flex justify-baseline items-start  flex-wrap"><span className="bg-gradient-to-r from-red-800 to-red-500 bg-clip-text text-transparent">Blood</span>Net</h1>
        </div>
        <div>
          <h2 className="text-white text-4xl font-serif">" Connecting you to the Life-Saving Power of Blood Donation "</h2>
        </div>
        <div className=" text-white text-[17px] font-medium flex justify-baseline items-center flex-wrap gap-5 p-2">
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/login/donor">Donor Login</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/login/recipient">Recipient Login</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/login/hospital">Hospital Login</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/login/staff">Staff Login</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/register/staff">Staff Registration</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/login/bloodbank">Blood Bank Login</Link></button>
           <button className="border-2 border-red-700 p-2 rounded-[10px] hover:bg-gradient-to-r from-red-800 to-red-600 cursor-pointer hover:text-black "><Link href="/register/bloodbank">Blood Bank Registration</Link></button>
        </div>
      </div>
      </div>
  );
}

export default Home;