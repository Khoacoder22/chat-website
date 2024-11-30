import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice'; // Import setUser
import Sidebar from '../components/sidebar';
import logo from '../assets/logo.png';
import io from 'socket.io-client';


const Home = () => {
  const user = useSelector(state => state.user);
  console.log("redux user", user);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation()

  console.log('user', user);
  const fetchUserDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("token",token)
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user_detail`;
      const response = await axios({
        url: URL,
        withCredentials: true
      });
      
      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        // If the response doesn't indicate a valid session, log out
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      console.log("Error fetching user details:", error);
      // Optionally handle error cases by logging out or navigating to login
      dispatch(logout());
      navigate("/email");
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);
  
//  socket connection
  useEffect(()=>{
    const socketConnection = io(process.env.REACT_APP_BACKEND_URL,{
      auth: {
        token: localStorage.getItem('token')
      }
    })
    
    socketConnection.on('onlineUser',(data)=>{
      console.log(data)
      dispatch(setOnlineUser(data))
    })

    dispatch(setSocketConnection(socketConnection))

    return ()=>{
      socketConnection.disconnect()
    }
  },[])
  
  const basePath = location.pathname === "/"
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen overflow-y-hidden'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
      <Sidebar/>
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className= {`items-center justify-center h-screen hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div className="flex flex-col items-center gap-2">
          <img src={logo} width={100} alt="Application Logo" />
          <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
