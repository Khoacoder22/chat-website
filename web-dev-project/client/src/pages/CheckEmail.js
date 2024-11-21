import React, { useState, useRef } from 'react';
import './page.css';
import { Link, useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PiUserCircleDuotone } from "react-icons/pi";

const CheckEmail = () => {
  const [data, setData] = useState({
    email: "",
     name: "",
  });
  const location = useLocation();
  const form = useRef(); // UseRef for the form element
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Sending email through backend using axios
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`;
    try {
      const response = await axios.post(URL, data);

      toast.success(response.data.message || 'Email sent successfully!');
      if (response.data.success) {
        setData({ email: '' });
        navigate('/password',{
          state : response?.data?.data
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send email.');
    }

    const serviceid = 'service_dh8ug5c';
    const templateid = 'template_rliqklh';
    const publickey = 'LXT1hW9uO_0s0BvQs';

    // Ensure that the email and message values are correctly referenced
    const email = data.email;
    const message = 'Hody neighboor welcome to chat-app p/s if this not you please contact via mail'; // Replace with actual message or variable

    const emailData = {
      service_id: serviceid,
      template_id: templateid,
      user_id: publickey,
      template_params: {
        from_email: "chatapp_admin@gmail.com",
        to_email: email, // This should be valid
        to_name: location?.state?.name || "User",  // Customize this as needed
        message: message,  // Ensure this is a valid message or dynamic variable
      }
    };

    // Sending email via emailjs API
    try {
      const res = await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
      console.log('EmailJS response:', res.data);  // Check if the response is successful
      setData({ email: '' });
    } catch (error) {
      console.error('EmailJS error:', error);  // Log any errors that occur
      toast.error('Failed to send email via EmailJS.');
    }
    
  };

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-sm mx-auto rounded overflow-hidden p-4'>
        <div className='w-fit mx-auto'>
          <PiUserCircleDuotone size={70} />
        </div>
        <h3 style={{ color: '#00adb5', fontWeight: 'bold' }}>
          Welcome to Chat-app
        </h3>

        <form ref={form} onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='email' className='block text-gray-700'>
              Email
            </label>
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
          <button type='submit' className='button-submit'>
            Let's Go
          </button>
          <p>
            New?{' '}
            <Link
              to={'/Register'}
              className='hover:underline font-semibold'
              style={{ color: '#00cec9', textAlign: 'center', marginTop: '12px' }}
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckEmail;
