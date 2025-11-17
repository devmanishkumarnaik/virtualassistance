import React, { useContext, useRef, useState } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";
function Customize() {
  const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  const navigate=useNavigate()
     const inputImage=useRef()

     const handleImage=(e)=>{
const file=e.target.files[0]
setBackendImage(file)
setFrontendImage(URL.createObjectURL(file))
     }
  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-4 sm:p-6 md:p-8 py-20 sm:py-24'>
        <MdKeyboardBackspace className='absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 text-white cursor-pointer w-6 h-6 sm:w-7 sm:h-7 hover:scale-110 transition-transform' onClick={()=>navigate("/")}/>
        <h1 className='text-white mb-6 sm:mb-8 md:mb-10 text-2xl sm:text-3xl md:text-4xl text-center font-bold px-4'>Select your <span className='text-blue-400 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>Assistant Image</span></h1>
        <div className='w-full max-w-[1000px] flex justify-center items-center flex-wrap gap-3 sm:gap-4 md:gap-5'>
      <Card image={image1}/>
       <Card image={image2}/>
        <Card image={image3}/>
         <Card image={image4}/>
          <Card image={image5}/>
           <Card image={image6}/>
            <Card image={image7}/>
     <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${selectedImage=="input"?"border-4 border-white shadow-2xl shadow-blue-950 ":null}` } onClick={()=>{
        inputImage.current.click()
        setSelectedImage("input")
     }}>
        {!frontendImage &&  <RiImageAddLine className='text-white w-[25px] h-[25px]'/>}
        {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
    
    </div>
    <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      </div>
{selectedImage && <button className='w-full sm:w-auto min-w-[200px] px-8 h-14 sm:h-16 mt-6 sm:mt-8 md:mt-10 text-white font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full text-lg sm:text-xl transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50' onClick={()=>navigate("/customize2")}>Next →</button>}
      
    </div>
  )
}

export default Customize
