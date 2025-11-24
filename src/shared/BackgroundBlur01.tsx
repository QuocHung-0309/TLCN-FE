import React from "react";

const BackgroundBlur01 = () => {
    return (
      // <div className="absolute inset-0 z-0 pointer-events-none w-full">
      //   <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#FFB226] blur-[500px] opacity-100"></div>
      //   <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-[#307AFD] blur-[500px] opacity-100"></div>
      //   <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#307AFD] blur-[500px] opacity-100"></div>
        
      // </div>
      <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full">
        <div className="absolute top-[30%] -left-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#FFB226] blur-[15vw] opacity-70"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[white] blur-[15vw] opacity-70"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#307AFD] blur-[15vw] opacity-70"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#307AFD] blur-[15vw] opacity-70"></div>
  
    </div>
    );
  }


  export default BackgroundBlur01;