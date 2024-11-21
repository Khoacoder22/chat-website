import React from 'react';
import {PiUserCircleDuotone} from "react-icons/pi";
import { useSelector } from 'react-redux';

const Avatar = ({ UserId, email, imageUrl, height, name, width }) => {
  let avarName = ""
  const onlineUser = useSelector(state => state?.user?.onlineUser)

  if(name){
    const splitname = name?.split(" ")

    if(splitname.length > 1){
        avarName = splitname[0][0] + splitname[1][0]
    }
    else{
        avarName = splitname[0][0]
    }
  }
  const bgColor = [
    'bg-slate-200',
    'bg-teal-200',
    'bg-red-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-gray-200',
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200"
  ]

  const randomNumber = Math.floor(Math.random() * 9)
  // IF USER ONLINE RETURN TRUE OR ELSE IS FALSE 
  const isOnline = onlineUser.includes(UserId)
  return (
    <div className={`text-slate-800  rounded-full font-bold relative ${bgColor[randomNumber]}`}  style={{width : width+"px", height : height+"px"}}>
      {imageUrl ? (
         <img
         src={imageUrl}
         width={width}
         height={height}
         alt={name}
         className="overflow-hidden rounded-full"
         style={{
           objectFit: 'cover', // Ensures the image covers the area
           objectPosition: 'center bottom', // Moves the focal point down
           transform: 'translateY(5%)', // Moves the image slightly down
           border: '2px solid black'
         }}
       />
      ) : (
        name ? (
          <div className='overflow-hidden rounded-full flex justify-center items-center' style={{width : width+"px", height : height+"px"}} >
            {avarName}
          </div>
        ) : (
            <PiUserCircleDuotone size={width} />
        )
      )}
      {
        isOnline && (
          <div className='bg-green-500 w-3 h-3 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
        )
      }
    </div>
  );
}

export default Avatar;
