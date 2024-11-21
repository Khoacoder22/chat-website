import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';
import upLoadFile from '../helpers/upLoadFile';
import Divider from './Divider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import {setUser} from '../redux/userSlice';


const EditUserDetail = ({ onClose, user }) => {
  const [data, setData] = useState({

    name: user?.name,
    profile_pic: user?.profile_pic 
  });

  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  // Update data when the user object changes
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...user
    }));
  }, [user]);

  

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenUpLoadPhoto = (e) => {
    e.preventDefault();  
    e.stopPropagation();
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadPhoto = await upLoadFile(file);
      console.log('Uploaded Photo URL:', uploadPhoto?.url); 
      setData((prev) => ({
        ...prev,
        profile_pic: uploadPhoto?.url
      })); 
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    try {
      // Lọc dữ liệu cần thiết
      const cleanData = {
        name: data.name,
        profile_pic: data.profile_pic,
      };
  
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/updateuser`;
      const response = await axios({
        method: 'post',
        url: URL,
        data: cleanData, 
        withCredentials: true,
      });
  
      toast.success(response?.data?.message);
  
      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-45 flex justify-center items-center z-10'>
      <div className='bg-white p-5 m-1 rounded w-full max-w-sm'>
        <h2 className='font-semibold'>Profile Details</h2>
        <p className='text-sm'>User Details</p>
        <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>Name:</label>
            <input
              type='text'
              name='name'
              id='name'
              value={data.name}
              onChange={handleOnchange}
              className='w-full py-1 px-2 focus:outline-blue-400 border'
            />
          </div>
          
          <div>
       
            <div>Photo:</div>
            <div className='my-1 flex items-center gap-4'>
              <Avatar
                width={45}
                height={45}
                imageUrl={data?.profile_pic}
                name={data?.name}
              />
              <label htmlFor='profile_pic'>
              <button
                type='button'
                className='font-semibold'
                onClick={handleOpenUpLoadPhoto}
              >
                Change Photo
              </button>
              <input
                type='file'
                id='profile_pic'
                className='hidden'
                onChange={handleUploadPhoto}
                ref={uploadPhotoRef}
              />
              </label>
            </div>
          </div>

          <Divider />

          <div className='flex gap-2 w-fit ml-auto'>
            <button
              onSubmit={handleSubmit}
              type='submit'
              className='border-blue-400 bg-blue-300 text-white border px-4 py-1 rounded hover:bg-blue-500 hover:text-white'
            >
              Save
            </button>
            <button
              type='button'
              onClick={onClose}
              className='border-blue-400 border text-blue-300 px-4 py-1 rounded hover:bg-blue-500'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetail);
