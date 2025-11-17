import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"
function SignUp() {
  const [showPassword,setShowPassword]=useState(false)
  const {serverUrl,userData,setUserData}=useContext(userDataContext)
  const navigate=useNavigate()
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
    const [loading,setLoading]=useState(false)
    const [password,setPassword]=useState("")
const [err,setErr]=useState("")
  const handleSignUp=async (e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
try {
  let result=await axios.post(`${serverUrl}/api/auth/signup`,{
    name,email,password
  },{withCredentials:true} )
 setUserData(result.data)
  setLoading(false)
  navigate("/customize")
} catch (error) {
  console.log(error)
  setUserData(null)
  setLoading(false)
  setErr(error.response.data.message)
}
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] relative flex justify-center items-center overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
        <div className='absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
      </div>

      {/* Grid Pattern */}
      <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]'></div>

      {/* Main Form Container */}
      <form className='relative w-[90%] max-w-[500px] bg-[#0a0a1a]/40 backdrop-blur-2xl border border-[#ffffff15] rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-5 p-8 sm:p-10 z-10' onSubmit={handleSignUp}>
        {/* AI Icon/Logo */}
        <div className='relative mb-4'>
          <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse-slow'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-10 w-10 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
            </svg>
          </div>
          <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30'></div>
        </div>

        <div className='text-center mb-4'>
          <h1 className='text-white text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>Create Account</h1>
          <p className='text-gray-400 text-sm'>Join the AI Revolution</p>
        </div>

        {/* Name Input */}
        <div className='w-full relative'>
          <input
            type="text" 
            placeholder='Full Name' 
            className='relative w-full h-14 px-6 outline-none border border-[#ffffff20] bg-[#ffffff08] hover:border-blue-400 focus:bg-[#ffffff15] text-white placeholder-gray-400 rounded-full text-base transition-all duration-300 focus:border-blue-500'
            required 
            onChange={(e)=>setName(e.target.value)} 
            value={name}
          />
        </div>

        {/* Email Input */}
        <div className='w-full relative'>
          <input
            type="email" 
            placeholder='Email Address' 
            className='relative w-full h-14 px-6 outline-none border border-[#ffffff20] bg-[#ffffff08] hover:border-blue-400 focus:bg-[#ffffff15] text-white placeholder-gray-400 rounded-full text-base transition-all duration-300 focus:border-blue-500'
            required 
            onChange={(e)=>setEmail(e.target.value)} 
            value={email}
          />
        </div>

        {/* Password Input */}
        <div className='w-full relative'>
          <div className='relative w-full h-14 border border-[#ffffff20] bg-[#ffffff08] hover:border-blue-400 focus-within:bg-[#ffffff15] text-white rounded-full transition-all duration-300 focus-within:border-blue-500'>
            <input 
              type={showPassword?"text":"password"} 
              placeholder='Password' 
              className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-400 px-6'
              required 
              onChange={(e)=>setPassword(e.target.value)} 
              value={password}
            />
            {!showPassword && <IoEye className='absolute top-4 right-5 w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors' onClick={()=>setShowPassword(true)}/>}
            {showPassword && <IoEyeOff className='absolute top-4 right-5 w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors' onClick={()=>setShowPassword(false)}/>}
          </div>
        </div>

        {/* Error Message */}
        {err.length>0 && (
          <div className='w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-3'>
            <p className='text-red-400 text-sm text-center'>⚠️ {err}</p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          className='relative w-full h-14 mt-4 text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50' 
          disabled={loading}
        >
          <span className='relative z-10'>{loading ? (
            <div className='flex items-center justify-center gap-2'>
              <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              <span>Creating Account...</span>
            </div>
          ) : "Sign Up"}</span>
          <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
        </button>

        {/* Sign In Link */}
        <p className='text-gray-400 text-base mt-2'>
          Already have an account? 
          <span className='text-blue-400 hover:text-blue-300 cursor-pointer font-semibold ml-1 transition-colors' onClick={()=>navigate("/signin")}>
            Sign In →
          </span>
        </p>
      </form>
    </div>
  )
}

export default SignUp
