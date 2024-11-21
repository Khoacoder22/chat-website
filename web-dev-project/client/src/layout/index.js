import React from 'react';
import logo from '../assets/logo.png';

const AuthLayouts = ({ children }) => {
  return (
    <>
      <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
        <div className='flex items-center space-x-3'>
        <h1 className='text-2xl font-bold text-gray-700'>Fizz</h1>
          <img src={logo} alt='logo' width={50} height={60} /> 
        </div>
      </header>

      {children} 
    </>
  );
}

export default AuthLayouts;
