import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse,handleCurrentUser}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const isRecognizingRef=useRef(false)
  const [errorMessage,setErrorMessage]=useState("")
  const retryCountRef=useRef(0)
  const maxRetries=3
  const isFailedRef=useRef(false)
  const synth=window.speechSynthesis
  const [textInput,setTextInput]=useState("")
  const [isSending,setIsSending]=useState(false)
  const [showResponseCard,setShowResponseCard]=useState(false)
  const [showAbout,setShowAbout]=useState(false)
  const [historyKey,setHistoryKey]=useState(0)


  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const handleRetry = () => {
    // Reset all error states
    retryCountRef.current = 0;
    isFailedRef.current = false;
    setErrorMessage("");
    setListening(false);
    
    // Try to restart recognition
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        console.log("Manual retry initiated");
      }
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Retry error:", error);
      }
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!textInput.trim() || isSending) return;
    
    const message = textInput.trim();
    setTextInput("");
    setUserText(message);
    setIsSending(true);
    
    // Stop speech recognition while processing text input
    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
    
    try {
      const data = await getGeminiResponse(message);
      if (data) {
        handleCommand(data);
        setAiText(data.response || "Processing...");
        // Force history refresh
        setHistoryKey(prev => prev + 1);
      } else {
        const errorMsg = "Sorry, I didn't get that. Please try again.";
        setAiText(errorMsg);
        speak(errorMsg);
      }
    } catch (error) {
      console.error("Error processing text message:", error);
      const errorMsg = "Sorry, I encountered an error processing your message.";
      setAiText(errorMsg);
      speak(errorMsg);
    } finally {
      setUserText("");
      setIsSending(false);
      // Restart recognition after processing
      setTimeout(() => {
        if (!isRecognizingRef.current && !isSpeakingRef.current) {
          startRecognition();
        }
      }, 1000);
    }
  }

  const startRecognition = () => {
    
   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN';
    const voices =window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }

    isSpeakingRef.current=true
    setShowResponseCard(true); // Show popup when AI starts speaking
    
    utterence.onend=()=>{
      setAiText("");
      isSpeakingRef.current = false;
      setShowResponseCard(false); // Close popup when AI finishes speaking
      console.log("AI finished speaking, restarting recognition...");
      // Restart recognition after AI finishes speaking
      setTimeout(() => {
        if (!isRecognizingRef.current) {
          startRecognition();
        }
      }, 500);
    }
    
    synth.cancel(); // Stop any previous speech
    synth.speak(utterence);
  }

  const handleCommand=(data)=>{
    if (!data || !data.type) {
      console.error("Invalid command data:", data);
      speak("Sorry, I encountered an error processing your request.");
      return;
    }
    
    const {type,userInput,response,appName}=data
    speak(response);
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
     if (type === 'calculator-open') {
  
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
     if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type ==="facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
     if (type ==="weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

    if (type === 'app-open') {
      console.log("app-open detected, appName:", appName, "data:", data);
      
      if (!appName) {
        console.error("app-open command but no appName provided. Full data:", JSON.stringify(data));
        return;
      }
      
      console.log("Opening app:", appName);
      
      // Map of popular apps/websites to their URLs
      const appUrls = {
        'youtube': 'https://youtube.com',
        'google': 'https://google.com',
        'twitter': 'https://twitter.com',
        'x': 'https://twitter.com',
        'github': 'https://github.com',
        'linkedin': 'https://linkedin.com',
        'netflix': 'https://netflix.com',
        'amazon': 'https://amazon.com',
        'whatsapp': 'https://web.whatsapp.com',
        'gmail': 'https://gmail.com',
        'reddit': 'https://reddit.com',
        'pinterest': 'https://pinterest.com',
        'spotify': 'https://open.spotify.com',
        'tiktok': 'https://tiktok.com',
        'snapchat': 'https://snapchat.com',
        'discord': 'https://discord.com',
        'twitch': 'https://twitch.tv',
        'quora': 'https://quora.com',
        'medium': 'https://medium.com',
        'stackoverflow': 'https://stackoverflow.com',
        'stack overflow': 'https://stackoverflow.com',
        'wikipedia': 'https://wikipedia.org',
        'flipkart': 'https://flipkart.com',
        'myntra': 'https://myntra.com',
        'zomato': 'https://zomato.com',
        'swiggy': 'https://swiggy.com',
        'paytm': 'https://paytm.com',
        'hotstar': 'https://hotstar.com',
        'prime': 'https://primevideo.com',
        'primevideo': 'https://primevideo.com',
        'amazon prime': 'https://primevideo.com',
        'maps': 'https://maps.google.com',
        'google maps': 'https://maps.google.com',
        'drive': 'https://drive.google.com',
        'google drive': 'https://drive.google.com',
        'docs': 'https://docs.google.com',
        'google docs': 'https://docs.google.com',
        'sheets': 'https://sheets.google.com',
        'google sheets': 'https://sheets.google.com',
        'slides': 'https://slides.google.com',
        'google slides': 'https://slides.google.com',
        'meet': 'https://meet.google.com',
        'google meet': 'https://meet.google.com',
        'zoom': 'https://zoom.us',
        'teams': 'https://teams.microsoft.com',
        'microsoft teams': 'https://teams.microsoft.com',
        'slack': 'https://slack.com',
        'notion': 'https://notion.so',
        'trello': 'https://trello.com',
        'canva': 'https://canva.com',
        'figma': 'https://figma.com',
        'codepen': 'https://codepen.io',
        'replit': 'https://replit.com',
        'chatgpt': 'https://chat.openai.com',
        'openai': 'https://chat.openai.com',
        'claude': 'https://claude.ai',
        'gemini': 'https://gemini.google.com',
        'bard': 'https://gemini.google.com'
      };
      
      const appNameLower = appName.toLowerCase().trim();
      const url = appUrls[appNameLower];
      
      if (url) {
        window.open(url, '_blank');
      } else {
        // If not in the list, try to open with .com domain
        window.open(`https://${appNameLower}.com`, '_blank');
      }
    }

  }

useEffect(() => {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    setErrorMessage("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    isFailedRef.current = true;
    return;
  }

  // Check if running on secure context (HTTPS or localhost)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn("Speech recognition may not work properly without HTTPS");
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false; // Disable interim for faster processing
  recognition.maxAlternatives = 1;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Request microphone permission and start recognition
  const startTimeout = setTimeout(async () => {
    if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        // Check microphone permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted");
          } catch (micError) {
            console.error("Microphone permission denied:", micError);
            setErrorMessage("Microphone access denied. Please allow microphone access in your browser settings.");
            isFailedRef.current = true;
            return;
          }
        }
        
        recognition.start();
        console.log("Recognition started. Ready to listen...");
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.error(e);
        }
      }
    }
  }, 1000);

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
    console.log("Recognition started successfully");
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    console.log("Recognition ended");
    
    // Always auto-restart unless component is unmounted or failed
    if (isMounted && !isFailedRef.current) {
      setTimeout(() => {
        if (isMounted && !isFailedRef.current && !isRecognizingRef.current) {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (e) {
            if (e.name !== "InvalidStateError") {
              console.error("Restart error:", e);
            }
          }
        }
      }, 500); // Reduced delay for faster restart
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);

    // Handle "no-speech" errors (just timeout, not critical)
    if (event.error === "no-speech") {
      console.log("No speech detected, restarting immediately...");
      // Restart quickly after no-speech error
      setTimeout(() => {
        if (isMounted && !isFailedRef.current && !isRecognizingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 300);
      return;
    }

    // Handle network errors differently
    if (event.error === "network") {
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        isFailedRef.current = true;
        setErrorMessage("Speech recognition is unavailable. Please check your internet connection and click 'Retry' below.");
        console.error("Max retries reached. Speech recognition stopped.");
        return; // Stop retrying
      }
      
      // Retry with exponential backoff
      const retryDelay = 2000 * retryCountRef.current;
      console.log(`Network error. Retrying in ${retryDelay}ms (Attempt ${retryCountRef.current}/${maxRetries})`);
      
      setTimeout(() => {
        if (isMounted && !isSpeakingRef.current && !isFailedRef.current) {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, retryDelay);
      return;
    }

    // Handle other errors with normal retry
    if (event.error !== "aborted" && isMounted && !isFailedRef.current) {
      setTimeout(() => {
        if (isMounted && !isFailedRef.current && !isRecognizingRef.current) {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 500);
    }
  };

  recognition.onresult = async (e) => {
    const result = e.results[e.results.length - 1];
    const transcript = result[0].transcript.trim();
    const isFinal = result.isFinal;
    
    // Reset retry counter on successful recognition
    retryCountRef.current = 0;
    setErrorMessage("");
    isFailedRef.current = false;
    
    // Process immediately when final
    if (!isFinal) {
      return;
    }
    
    // Process command immediately
    console.log("Processing command:", transcript);
    setUserText(transcript);
    recognition.stop();
    isRecognizingRef.current = false;
    setListening(false);
    
    // Process asynchronously for faster perceived response
    try {
      const data = await getGeminiResponse(transcript);
      if (data) {
        setAiText(data.response || "Processing...");
        handleCommand(data);
        // Force history refresh
        setHistoryKey(prev => prev + 1);
      } else {
        console.error("No response from assistant");
        const errorMsg = "Sorry, I didn't get that. Please try again.";
        setAiText(errorMsg);
        speak(errorMsg);
      }
    } catch (error) {
      console.error("Error processing command:", error);
      const errorMsg = "Sorry, I encountered an error processing your request.";
      setAiText(errorMsg);
      speak(errorMsg);
    } finally {
      setUserText("");
    }
  };

  // Play greeting on load
  const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, I am ${userData.assistantName}. How can I help you?`);
  greeting.lang = 'hi-IN';
  window.speechSynthesis.speak(greeting);
 

  return () => {
    isMounted = false;
    clearTimeout(startTimeout);
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-3 sm:gap-4 md:gap-[15px] overflow-hidden relative'>
      {/* About Icon - Mobile Only */}
      <button 
        className='xl:hidden text-white absolute top-4 left-4 sm:top-5 sm:left-5 w-10 h-10 z-50 cursor-pointer hover:scale-110 transition-transform bg-[#ffffff15] backdrop-blur-md rounded-full flex items-center justify-center border border-[#ffffff20]'
        onClick={()=>setShowAbout(true)}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      </button>
      
      <CgMenuRight className='lg:hidden text-white absolute top-4 right-4 sm:top-5 sm:right-5 w-7 h-7 z-50 cursor-pointer hover:scale-110 transition-transform' onClick={()=>setHam(true)}/>
      <div className={`fixed lg:hidden top-0 right-0 w-full sm:w-[400px] h-full bg-[#00000095] backdrop-blur-2xl p-5 sm:p-6 flex flex-col gap-4 items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform duration-300 z-50 shadow-2xl border-l border-[#ffffff15]`}>
 <button className='absolute top-5 right-5 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-all shadow-lg' onClick={()=>setHam(false)}>
   Close
 </button>
 <button className='w-full h-12 sm:h-14 text-black font-semibold bg-white hover:bg-gray-100 rounded-full cursor-pointer text-base sm:text-lg transition-all hover:scale-105 shadow-lg' onClick={handleLogOut}>Log Out</button>
      <button className='w-full h-12 sm:h-14 text-black font-semibold bg-white hover:bg-gray-100 rounded-full cursor-pointer text-base sm:text-lg px-4 py-2 transition-all hover:scale-105 shadow-lg' onClick={()=>navigate("/customize")}>Customize Assistant</button>

<div className='w-full h-[1px] bg-gray-600 my-2'></div>
<div className='flex items-center justify-between mb-2'>
  <h1 className='text-white font-bold text-lg sm:text-xl'>History</h1>
  <button 
    onClick={() => {
      handleCurrentUser();
      setHistoryKey(prev => prev + 1);
    }}
    className='p-2 hover:bg-[#ffffff15] rounded-lg transition-all'
    title='Refresh history'
  >
    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white hover:text-blue-400 transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
    </svg>
  </button>
</div>

<div className='w-full flex-1 overflow-y-auto flex flex-col gap-2' key={`mobile-history-${historyKey}`}>
  {userData?.history?.slice().reverse().map((his, index) => (
    <div 
      key={`mobile-${userData.history.length}-${index}-${his.substring(0,10)}`}
      className='text-gray-200 text-base w-full min-h-[40px] p-2 hover:bg-[#ffffff10] rounded-lg cursor-pointer transition-all'
      onClick={async () => {
        setHam(false);
        setUserText(his);
        setTextInput(his);
        try {
          const data = await getGeminiResponse(his);
          if (data) {
            setAiText(data.response || "Processing...");
            handleCommand(data);
          } else {
            const errorMsg = "Sorry, I didn't get that. Please try again.";
            setAiText(errorMsg);
            speak(errorMsg);
          }
        } catch (error) {
          console.error("Error processing history command:", error);
          const errorMsg = "Sorry, I encountered an error.";
          setAiText(errorMsg);
          speak(errorMsg);
        } finally {
          setUserText("");
          setTextInput("");
        }
      }}
    >
      {his}
    </div>
  ))}
</div>

      </div>
      {/* Desktop History Sidebar */}
      <div className='hidden xl:flex absolute left-4 top-4 bottom-4 w-80 bg-[#ffffff08] backdrop-blur-xl border border-[#ffffff15] rounded-3xl flex-col p-6 shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-white text-xl font-bold'>History</h2>
          <div className='flex items-center gap-2'>
            <button 
              onClick={() => {
                handleCurrentUser();
                setHistoryKey(prev => prev + 1);
              }}
              className='p-2 hover:bg-[#ffffff15] rounded-lg transition-all'
              title='Refresh history'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white hover:text-blue-400 transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
            </button>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
        </div>
        
        <div className='flex-1 overflow-y-auto space-y-3 scrollbar-hidden' key={`desktop-history-${historyKey}`}>
          {userData?.history && userData.history.length > 0 ? (
            userData.history.slice().reverse().map((his, index) => (
              <div 
                key={`desktop-${userData.history.length}-${index}-${his.substring(0,10)}`}
                className='bg-[#ffffff05] hover:bg-[#ffffff10] border border-[#ffffff10] rounded-xl p-3 transition-all cursor-pointer group'
                onClick={async () => {
                  setUserText(his);
                  setTextInput(his);
                  try {
                    const data = await getGeminiResponse(his);
                    if (data) {
                      setAiText(data.response || "Processing...");
                      handleCommand(data);
                    } else {
                      const errorMsg = "Sorry, I didn't get that. Please try again.";
                      setAiText(errorMsg);
                      speak(errorMsg);
                    }
                  } catch (error) {
                    console.error("Error processing history command:", error);
                    const errorMsg = "Sorry, I encountered an error.";
                    setAiText(errorMsg);
                    speak(errorMsg);
                  } finally {
                    setUserText("");
                    setTextInput("");
                  }
                }}
              >
                <p className='text-gray-300 text-sm line-clamp-2 group-hover:text-white transition-colors'>{his}</p>
                <p className='text-gray-500 text-xs mt-1'>{new Date().toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-gray-500'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-12 w-12 mb-3 opacity-50' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
              </svg>
              <p className='text-sm'>No history yet</p>
            </div>
          )}
        </div>
      </div>
      
      <button className='min-w-[120px] sm:min-w-[150px] h-12 sm:h-14 md:h-[60px] text-black font-semibold absolute hidden lg:block top-4 sm:top-5 md:top-[20px] right-4 sm:right-5 md:right-[20px] bg-white hover:bg-gray-100 rounded-full cursor-pointer text-base sm:text-lg transition-all hover:scale-105 shadow-lg z-10' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[120px] sm:min-w-[180px] h-12 sm:h-14 md:h-[60px] text-black font-semibold bg-white hover:bg-gray-100 absolute top-16 sm:top-20 md:top-[100px] right-4 sm:right-5 md:right-[20px] rounded-full cursor-pointer text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-[20px] py-2 sm:py-2.5 md:py-[10px] hidden lg:block transition-all hover:scale-105 shadow-lg z-10' onClick={()=>navigate("/customize")}>Customize Assistant</button>
      <div className='w-[200px] h-[280px] xs:w-[220px] xs:h-[300px] sm:w-[260px] sm:h-[350px] md:w-[300px] md:h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-2xl ring-2 ring-blue-500/20 mt-2 sm:mt-0'>
<img src={userData?.assistantImage} alt="" className='h-full w-full object-cover'/>
      </div>
      <h1 className='text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-2 sm:mt-3 md:mt-4 px-4 text-center'>I'm {userData?.assistantName}</h1>
      
      {!aiText && <img src={userImg} alt="" className='w-[100px] xs:w-[110px] sm:w-[140px] md:w-[180px] lg:w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[100px] xs:w-[110px] sm:w-[140px] md:w-[180px] lg:w-[200px]'/>}
    
    {errorMessage && (
      <div className='flex flex-col items-center gap-3'>
        <div className='bg-red-500 text-white px-4 py-2 rounded-lg text-center max-w-md'>
          {errorMessage}
        </div>
        <button 
          onClick={handleRetry}
          className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-colors'
        >
          Retry Connection
        </button>
      </div>
    )}
    {/* Response Popup Card */}
    {showResponseCard && (userText || aiText) && (
      <div className='fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4'>
        <div 
          className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
          onClick={() => setShowResponseCard(false)}
        ></div>
        <div className='relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#ffffff22] rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] sm:max-h-[70vh] overflow-y-auto p-4 sm:p-6 animate-fadeIn'>
          <button
            onClick={() => setShowResponseCard(false)}
            className='absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg'
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 sm:h-6 sm:w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
          
          <div className='flex flex-col gap-3 sm:gap-4 mt-2 sm:mt-0'>
            {userText && (
              <div className='flex justify-end'>
                <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[80%] shadow-lg'>
                  <p className='text-xs sm:text-sm font-semibold mb-1 opacity-70'>You</p>
                  <p className='text-sm sm:text-base break-words'>{userText}</p>
                </div>
              </div>
            )}
            
            {aiText && (
              <div className='flex justify-start'>
                <div className='bg-[#ffffff15] backdrop-blur-md border border-[#ffffff22] text-white px-3 py-2 sm:px-5 sm:py-3 rounded-2xl rounded-tl-sm max-w-[85%] sm:max-w-[80%] shadow-lg'>
                  <p className='text-xs sm:text-sm font-semibold mb-1 text-blue-400'>{userData?.assistantName}</p>
                  <p className='text-sm sm:text-base leading-relaxed break-words'>{aiText}</p>
                  
                  {isSpeakingRef.current && (
                    <div className='flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400'>
                      <div className='flex gap-1'>
                        <div className='w-1 h-3 sm:h-4 bg-blue-400 rounded-full animate-pulse'></div>
                        <div className='w-1 h-3 sm:h-4 bg-purple-400 rounded-full animate-pulse' style={{animationDelay: '0.2s'}}></div>
                        <div className='w-1 h-3 sm:h-4 bg-pink-400 rounded-full animate-pulse' style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
      
      {/* About Popup - Mobile */}
      {showAbout && (
        <div className='fixed inset-0 flex items-center justify-center z-50 p-4 xl:hidden'>
          <div 
            className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
            onClick={() => setShowAbout(false)}
          ></div>
          <div className='relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#ffffff22] rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn'>
            <button
              onClick={() => setShowAbout(false)}
              className='absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            
            <div className='flex items-center gap-2 mb-4'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <h3 className='text-white font-bold text-lg'>About</h3>
            </div>
            
            <div className='space-y-3 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>Version:</span>
                <span className='text-white font-semibold'>1.0.0</span>
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>Developer:</span>
                <span className='text-white font-semibold'>Goutam</span>
              </div>
              
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>Supported by:</span>
                <span className='text-white font-semibold'>Gemini</span>
              </div>
              
              <div className='flex items-start gap-2'>
                <span className='text-gray-400 whitespace-nowrap'>Contact:</span>
                <a href='mailto:goutamdeep9@gmail.com' className='text-blue-400 hover:text-blue-300 transition-colors break-all'>
                  goutamdeep9@gmail.com
                </a>
              </div>
              
              <div className='pt-3 border-t border-[#ffffff20]'>
                <a 
                  href='https://manishinc.com' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='flex items-center justify-between text-gray-300 hover:text-white transition-colors group'
                >
                  <span>Powered by manishinc</span>
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 transform group-hover:translate-x-1 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* About Card - Bottom Right Desktop */}
      <div className='hidden xl:block fixed right-4 bottom-4 w-72 bg-[#ffffff08] backdrop-blur-xl border border-[#ffffff15] rounded-2xl p-4 shadow-2xl z-10'>
        <div className='flex items-center gap-2 mb-3'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <h3 className='text-white font-bold text-sm'>About</h3>
        </div>
        
        <div className='space-y-2 text-xs'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-400'>Version:</span>
            <span className='text-white font-semibold'>1.0.0</span>
          </div>
          
          <div className='flex items-center gap-2'>
            <span className='text-gray-400'>Developer:</span>
            <span className='text-white font-semibold'>Goutam</span>
          </div>
          
          <div className='flex items-center gap-2'>
            <span className='text-gray-400'>Supported by:</span>
            <span className='text-white font-semibold'>Gemini</span>
          </div>
          
          <div className='flex items-start gap-2'>
            <span className='text-gray-400 whitespace-nowrap'>Contact:</span>
            <a href='mailto:goutamdeep9@gmail.com' className='text-blue-400 hover:text-blue-300 transition-colors break-all'>
              goutamdeep9@gmail.com
            </a>
          </div>
          
          <div className='pt-2 border-t border-[#ffffff10]'>
            <a 
              href='https://manishinc.com' 
              target='_blank' 
              rel='noopener noreferrer'
              className='flex items-center justify-between text-gray-400 hover:text-white transition-colors group'
            >
              <span>Powered by manishinc</span>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 transform group-hover:translate-x-1 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Text Input Form */}
      <form onSubmit={handleTextSubmit} className='fixed left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 md:bottom-6 w-[96%] sm:w-[92%] md:w-[90%] max-w-[720px] flex flex-col sm:flex-row gap-2 sm:gap-3 z-40 pb-[env(safe-area-inset-bottom,0.5rem)]'>
        <input
          type='text'
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='Type a message...'
          disabled={isSending}
          className='w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-full bg-[#ffffff1a] backdrop-blur-md border border-[#ffffff33] text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-[#ffffff26] transition-all disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={!textInput.trim() || isSending}
          className='w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg whitespace-nowrap'
        >
          {isSending ? (
            <>
              <svg className='animate-spin h-4 w-4 sm:h-5 sm:w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            </>
          ) : (
            <>
              <span>Send</span>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 sm:h-5 sm:w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default Home
