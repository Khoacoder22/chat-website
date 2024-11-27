import React, { useState } from 'react';
import './page.css';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import  upLoadFile from '../helpers/upLoadFile';
import axios from 'axios';
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: "", 
  });

  const [error, setError] = useState("");
  const [preview, setPreview] = useState(""); 
  const [uploadPhoto, setUploadPhoto] = useState(""); 
  const navigate = useNavigate()
  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value 
    }));
  };
   
  // Handle upload photo
  const handleUploadPhoto = async(e) => {
    const file = e.target.files[0];
    const uploadPhoto = await upLoadFile(file);
    setUploadPhoto(file);
    // REVIEW photo
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    setData((preve)=>{
      return{
        ...preve,
        profile_pic: uploadPhoto?.url
      }
    })
  };
  const handleClearUploadPhoto = (e) => {
      setUploadPhoto(null);
      e.preventDefault();
      setPreview("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;
    
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!"); 
      return; 
    } else {
      setError("");
    }
  
    try {
      const response = await axios.post(URL, data);
      console.log('response', response);
  
      toast.success(response.data.message || "Registration successful!");
      if(response.data.success){
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          profilePic: "", 
        })
        navigate('/Email')
      }
    } catch (error) {
     toast.error(error?.response?.data?.message)
    }
    console.log("Form Submitted", data); 
  };
  

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-sm mx-auto rounded overflow-hidden p-4'>
        <h3 style={{color: '#00adb5', fontWeight: 'bold'}}>Welcome to Chat-app</h3>

        <form onSubmit={handleSubmit}>
          <div className='mb-4' style={{marginTop: '12px'}}> 
            <label htmlFor='name' className='block text-gray-700'>Name</label> 
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter Your Name'
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary' 
              value={data.name} 
              onChange={handleOnChange} 
              required
            /> 
          </div>

          <div className='flex flex-col gap-1'> 
            <label htmlFor='email' className='block text-gray-700'>Email</label> 
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter Your Email'
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary' 
              value={data.email} 
              onChange={handleOnChange} 
              required
            /> 
          </div>

          <div className='flex flex-col gap-1' style={{marginTop: '12px'}}> 
            <label htmlFor='password' className='block text-gray-700'>Password</label> 
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter Your Password'
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary' 
              value={data.password} 
              onChange={handleOnChange} 
              required
            /> 
          </div>
          
          <div className='flex flex-col gap-2' style={{ marginTop: '12px' }}> 
            <label htmlFor='confirmPassword' className='block text-gray-700'>Confirm Password</label> 
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              placeholder='Confirm Your Password'
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary'
              value={data.confirmPassword} 
              onChange={handleOnChange}
              required
            /> 
          </div>

          {/* Photo section */}
          <div className='flex flex-col gap-2' style={{ marginTop: '12px' }}> 
            <label htmlFor='profile_pic' className='label_pic'>
              {uploadPhoto?.name ? uploadPhoto?.name : "Upload Profile Photo"}
              {
                uploadPhoto?.name && (
                  <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                  <IoClose/>
                </button>
                )
              }
            </label> 

            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              accept='image/*'
              onChange={handleUploadPhoto}
              style={{display: 'none'}}
              className='bg-slate-100 px-2 py-1 mt-1 w-full rounded focus:outline-none focus:ring focus:ring-primary'
            />
            {preview && (
              <div className='mt-4'>
                <p className='text-gray-700'>Profile Picture Preview:</p>
                <img src={preview} alt='Profile Preview' className='h-24 w-24 object-cover rounded-full mt-2' />
              </div>
            )}
          </div>

          {error && <p className='text-red-500 mt-2' style={{fontWeight:'bold'}}>{error}</p>} 

          <button type="submit" className="button-submit">
        Register
      </button>
      <p>Already have account ? <Link to={"/email"} className="hover:underline font-semibold" style={{color:'#00cec9', textAlign:'center', marginTop:'12px'
      }}>Login</Link></p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
