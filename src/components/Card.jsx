import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

function Card({image}) {
      const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  return (
    <div className={`w-20 h-32 sm:w-24 sm:h-40 md:w-32 md:h-48 lg:w-36 lg:h-56 xl:w-[150px] xl:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer transition-all hover:scale-105 hover:border-4 hover:border-white ${selectedImage==image?"border-4 border-white shadow-2xl shadow-blue-950 scale-105":null}`} onClick={()=>{
        setSelectedImage(image)
        setBackendImage(null)
        setFrontendImage(null)
        }}>
      <img src={image} className='h-full object-cover'  />
    </div>
  )
}

export default Card
