import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
function Customize2() {
    const {userData,backendImage,selectedImage,serverUrl,setUserData}=useContext(userDataContext)
    const [assistantName,setAssistantName]=useState(userData?.assistantName || "")
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState("")
    const navigate=useNavigate()

    const handleUpdateAssistant=async ()=>{
        setLoading(true)
        setError("")
        try {
            if(!assistantName.trim()){
                setError("Please enter an assistant name")
                setLoading(false)
                return
            }

            if(!backendImage && !selectedImage){
                setError("Please select an assistant image")
                setLoading(false)
                return
            }

            let formData=new FormData()
            formData.append("assistantName",assistantName.trim())
            if(backendImage){
                 formData.append("assistantImage",backendImage)
            }else{
                formData.append("imageUrl",selectedImage)
            }
            
            console.log("Sending data:", {
                assistantName: assistantName.trim(),
                hasBackendImage: !!backendImage,
                selectedImage: selectedImage
            })

            const result=await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true})
            setLoading(false)
            console.log("Update successful:", result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
            setLoading(false)
            console.error("Update error:", error.response?.data || error.message)
            setError(error.response?.data?.message || "Failed to create assistant. Please try again.")
        }
    }

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-4 sm:p-6 md:p-8 relative '>
        <MdKeyboardBackspace className='absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 text-white cursor-pointer w-6 h-6 sm:w-7 sm:h-7 hover:scale-110 transition-transform' onClick={()=>navigate("/customize")}/>
      <h1 className='text-white mb-6 sm:mb-8 md:mb-10 text-2xl sm:text-3xl md:text-4xl text-center font-bold px-4'>Enter Your <span className='text-blue-400 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>Assistant Name</span> </h1>
      
      {error && (
        <div className='w-full max-w-[600px] bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-4'>
          <p className='text-red-400 text-sm text-center'>⚠️ {error}</p>
        </div>
      )}

      <input type="text" placeholder='e.g. Shifra, Jarvis, Friday...' className='w-full max-w-[600px] h-14 sm:h-16 outline-none border-2 border-white bg-transparent hover:bg-[#ffffff08] focus:bg-[#ffffff12] text-white placeholder-gray-400 px-5 sm:px-6 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all focus:border-blue-400' required onChange={(e)=>setAssistantName(e.target.value)} value={assistantName}/>
      {assistantName &&  <button className='w-full sm:w-auto min-w-[250px] sm:min-w-[350px] h-14 sm:h-16 mt-6 sm:mt-8 md:mt-10 px-8 text-white font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full text-base sm:text-lg transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed' disabled={loading} onClick={()=>{
        handleUpdateAssistant()
    }
        } >{!loading?"Create Your Assistant ✨":(<div className='flex items-center justify-center gap-2'><svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg><span>Creating...</span></div>)}</button>}
     
    </div>
  )
}

export default Customize2