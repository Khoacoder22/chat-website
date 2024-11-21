import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import chaticon from '../assets/chaticon.gif';
import chaticon2 from '../assets/chaticon2.png';
import { FaUserAstronaut } from 'react-icons/fa6';
import { RiLogoutBoxLine } from "react-icons/ri";
import Avatar from './Avatar';
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetail from './EditUserDetail';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { logout } from '../redux/userSlice';
import { HiMiniPhoto } from "react-icons/hi2";
import { IoVideocam } from "react-icons/io5";

const Sidebar = () => {
  const [iconSrc, setIconSrc] = useState(chaticon2); 
  const user = useSelector(state => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const dispatch = useDispatch()
  const navigate = useNavigate()


  useEffect(()=>{
    if(socketConnection){
        socketConnection.emit('sidebar',user._id)
        
        socketConnection.on('conversation',(data)=>{
            console.log('conversation',data)
            
            const conversationUserData = data.map((conversationUser,index)=>{
             
              const lastMsg = conversationUser?.lastMsg;
              console.log('Last message:', lastMsg);

                if(conversationUser?.sender?._id === conversationUser?.receiver?._id){
                    return{
                        ...conversationUser,
                        userDetails : conversationUser?.sender
                    }
                }
                else if(conversationUser?.receiver?._id !== user?._id){
                    return{
                        ...conversationUser,
                        userDetails : conversationUser.receiver
                    }
                }else{
                    return{
                        ...conversationUser,
                        userDetails : conversationUser.sender
                    }
                }
            })

            setAllUser(conversationUserData)
        })
    }
},[socketConnection,user])

const handleLogout = ()=>{
  dispatch(logout())
  navigate("/email")
  localStorage.clear()
}

  return (
    <div className="w-full h-screen grid grid-cols-[48px,1fr]">
      {/* Left Sidebar */}
      <div className="bg-slate-100 w-12 h-full py-10 text-slate-600 flex flex-col justify-between rounded-tr-lg rounded-br-lg">
        <div>
          <NavLink
            className={({ isActive }) => 
              `w-12 h-10 flex justify-center items-center cursor-pointer rounded ${isActive ? 'bg-slate-200' : ''}`}
            title="Chat"
            onMouseLeave={() => setIconSrc(chaticon2)}  
            onMouseEnter={() => setIconSrc(chaticon)}
          >
            <img src={iconSrc} alt="Chat Icon" className="w-8 h-8" />
          </NavLink>
          {/* User Icon */}
          <div title='addfriends' onClick={()=>setOpenSearchUser(true)} className="w-12 h-10 flex justify-center items-center cursor-pointer rounded hover:bg-slate-200">
            <FaUserAstronaut size={25} />
          </div>
        </div>

        {/* Bottom Avatar and Logout Button */}
        <div className='flex flex-col items-center'>
          <button className='mx-auto' title={user?.name} style={{ marginBottom: "12px" }} onClick={() => setEditUserOpen(true)}>
            <Avatar width={40} height={40} name={user?.name} imageUrl={user?.profile_pic} UserId={user?._id}></Avatar> 
          </button>
          <button title='logout' className="w-12 h-10 flex justify-center items-center cursor-pointer rounded hover:bg-slate-200">
            <RiLogoutBoxLine size={25} onClick={handleLogout}/>
          </button>
        </div>
      </div> 

      {/* Main Sidebar Section */}
      <div className='w-full'>
        <div className='h-16 flex items-center'>
        <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <Divider></Divider>
        <div className='h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
            {
              allUser.length === 0 && (
                <div className='mt-5'>
                  <div className='flex justify-center items-center my-4 text-slate-400 '>
                  <FiArrowUpLeft size={50}/>
                  </div>
                  <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                </div>
              )
            }
            {
    // Debugging `allUser` data before rendering
    allUser.map((conv, index) => {
      console.log('Profile pic:', conv?.userDetails?.profile_pic);
      console.log('Name:', conv?.userDetails?.name);
      return (
        <div key={conv?._id} className='flex items-center gap-2 mt-2 border border-transparent hover:border-blue-500 rounded-lg p-2 hover:bg-slate-100 cursor-pointer transition duration-150'>
        {/* Avatar */}
        <Avatar
          imageUrl={conv?.userDetails?.profile_pic}
          name={conv?.userDetails?.name}
          width={40}
          height={40}
        />
        
        {/* User Details */}
        <div className='flex flex-1 flex-col'>
          <h3 className='text-ellipsis line-clamp-1 font-semibold text-sm'>{conv?.userDetails?.name}</h3>
          <div className='text-slate-500 text-xs flex items-center gap-1'>
            {conv?.lastMsg?.imageUrl && (
              <div className='flex items-center gap-1'>
                <span><HiMiniPhoto /></span>
                <span>Image</span>
              </div>
            )}
            {conv?.lastMsg?.videoUrl && (
              <div className='flex items-center gap-1'>
                <span><IoVideocam /></span>
                <span>Video</span>
              </div>
            )}
            <p className='text-xs'>{conv?.lastMsg?.text || ''}</p>
          </div>
        </div>
  
        {/* Unseen Messages */}
        <p className='text-xs w-5 h-5 flex justify-center items-center ml-auto p-1 bg-blue-400 text-white font-semibold rounded-full mr-12'>          {conv?.unseenMsg}
        </p>
      </div>
      );
    })
  }
        </div>
      </div>

      {/* Edit User Modal */}
      {editUserOpen && (
        <EditUserDetail onClose={() => setEditUserOpen(false)} user={user} />
      )}

      {/* Search User */}
      {
        openSearchUser && (
          <SearchUser onClose={() => setOpenSearchUser(false)}/>
        )
      }
    </div>
  );
};

export default Sidebar;
