import Image from "next/image";
import LoadingImage from "@/Images/Loading.jpg"

function Loading(){
    return(
       <div className="relative w-screen h-screen flex justify-center items-center">
           <Image
             src={LoadingImage}
             alt="Loading"
             fill
             className="object-cover"
             quality={100}
             priority
           />
           <div className="absolute top-[44%]">
              <h1 className="text-[50px] bg-gradient-to-r from-amber-800 to-amber-400 text-transparent bg-clip-text font-mono">Loading...</h1>
           </div>
       </div>
    );
}

export default Loading;