import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext=createContext()
function UserContext({children}) {
    const serverUrl="https://virtualassistance-backend-bure.onrender.com"
    const [userData,setUserData]=useState(null)
    const [frontendImage,setFrontendImage]=useState(null)
     const [backendImage,setBackendImage]=useState(null)
     const [selectedImage,setSelectedImage]=useState(null)
    const handleCurrentUser=async ()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
            setUserData(result.data)
            console.log("User data updated:", result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGeminiResponse=async (command)=>{
try {
  const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
  console.log("Command sent, refreshing user data...")
  // Refresh user data to update history
  try {
    const updatedUser = await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
    setUserData(updatedUser.data)
    console.log("History updated:", updatedUser.data.history)
  } catch (err) {
    console.log("Error refreshing user data:", err)
  }
  return result.data
} catch (error) {
  console.log(error)
}
    }

    useEffect(()=>{
handleCurrentUser()
    },[])
    const value={
serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse,handleCurrentUser
    }
  return (
    <div>
    <userDataContext.Provider value={value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
