import React, { useState } from 'react';
import './page.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import {PiUserCircle} from "react-icons/pi";
// import uploadFile from '../helpers/upLoadFile';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/userSlice';
import { PiDropSimple } from 'react-icons/pi';

const CheckPassword = () => {
  const [data, setData] = useState({
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  console.log("Location", location.state);
  
  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
    try {
      const response = await axios({
        method :'post',
        url : URL,
        data : {
          userId : location?.state?._id,
          password : data.password
        },
        withCredentials : true
      })

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response?.data?.token))
        localStorage.setItem('token',response?.data?.token)
        setData({ password: "" });
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-sm mx-auto rounded overflow-hidden p-4'>
        <div className='w-fit mx-auto'>
        <Avatar width={70} height={70} name={location?.state?.name} imageUrl={location?.state?.profile_pic} />
        <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
        </div>
        <h3 style={{color: '#00adb5', fontWeight: 'bold'}}>Welcome to Chat-app</h3>

        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'> 
            <label htmlFor='password' className='block text-gray-700'>Password</label> 
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter Your password'
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary' 
              value={data.password} 
              onChange={handleOnChange} 
              required
            /> 
          </div>
          <button type="submit" className="button-submit">
           Login
          </button>
          <p><Link to={"/forgot-password"} className="hover:underline font-semibold" style={{color:'#00cec9', textAlign:'center', marginTop:'12px'}}>Forgot password</Link></p>
        </form>
      </div>
    </div>
  );
};

export default CheckPassword;
