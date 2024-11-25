import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Avatar from "./Avatar";
import upLoadFile from "../helpers/upLoadFile";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { checkGrammar } from "../helpers/grammarUtils";
// Another component
import Loading from './Loading';
// icon
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { SiGrammarly } from "react-icons/si";

// sub functions
import moment from 'moment'

// background
import wallpaper from "../assets/wallpaper.jpg";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  
  const {
    transcript,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })

  useEffect(() => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      text: transcript,
    }));
  }, [transcript]);

  const handleMicrophoneClick = () => {
    if (listening) {
      SpeechRecognition.stopListening(); 
    } else {
      SpeechRecognition.startListening({ continuous: true }); 
    }
  };

  const [openImage, setopenImage] = useState(false);
  const [allMessage, setAllMessage] = useState([])
  const currentMessage = useRef(null)

  useEffect(()=>{
    if(currentMessage.current){
      currentMessage.current.scrollIntoView({behavior : 'smooth', block : 'end'})
    }
  },[allMessage])


  const hanldeUploadPhotoImage = ()=>{
    setopenImage(preve => !preve)
  }
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);

      socketConnection.emit('seen', params.userId)

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      socketConnection.on('message',(data)=>{
        console.log('message data', data)
        setAllMessage(data)
      })
    }
  }, [socketConnection, params?.userId, user]);

  const [loading, setLoading] = useState(false);
  const handleOnChange = (e)=>{
      const {name, value} = e.target

      setMessage(preve =>{
        return{
          ...preve,
          text: value
        }
      })
  }

  // const upload image
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await upLoadFile(file);
    setLoading(false);
    setopenImage(false);
    
    // Kiểm tra URL của ảnh sau khi tải lên
    console.log("Uploaded Image URL:", uploadPhoto.url);
  
    setMessage((preve) => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url,
      };
    });
  };
  

  const handleSendMessage = (e) =>{
    e.preventDefault()

    if(message.text || message.imageUrl || message.videoUrl){
      if(socketConnection){
        socketConnection.emit('new message',{
          sender : user?._id,
          receiver : params.userId,
          text : message.text,
          imageUrl : message.imageUrl,
          videoUrl : message.videoUrl,
          msgByUserId : user?._id
        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        })
      }
    }
  }

  const handleUploadVideo = async(e) =>{
    const file = e.target.files[0];

    const uploadPhoto = await upLoadFile(file);

    setMessage(preve =>{
    return{
      ...preve,
      videoUrl : uploadPhoto.url
    }
    })
  }

  const handleClearUploadImage = () =>{
    setMessage(preve =>{
      return{
        ...preve,
        imageUrl : ""
      }
      })
  }

  const handleClearUploadVideo = () =>{
    setMessage(preve =>{
      return{
        ...preve,
        videoUrl : ""
      }
      })
  }

  return (
    <div style={{backgroundImage:`url(${wallpaper})`}} className="bg-no-repeat bg-cover">
      {/* Header Section */}
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4 shadow-md">
        <div className="flex items-center gap-2">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="-mt-2">
              {dataUser.online ? (
                <span className="text-green-500">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <div className="cursor-pointer hover:text-blue-300">
          <HiDotsVertical />
        </div>
      </header>

      {/* Messages Section */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>
       
      

        {/* all message */}
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {
            allMessage.map((msg,index)=>{
              return(
             <div className={`bg-white p-1 py-1 my-2 rounded w-fit max-w-[230px] md:max-w-sm lg:max-w-md ${user._id === msg.msgByUserId ? "ml-auto bg-teal-300" : ""}`}>
                  <div className="w-full">
                  {
                    msg?.imageUrl && (
                      <img src={msg?.imageUrl} className="w-full h-full object-scale-down"></img>
                    )
                  }
                  </div>
                  <div className="w-full">
                  {
                    msg?.videoUrl && (
                      <video src={msg?.videoUrl} className="w-full h-full object-scale-down" controls></video>
                    )
                  }
                  </div>
                  <p className="px-2">{msg.text}</p>
                  <p className="text-xs ml-auto w-fit">{moment(msg.createAt).format('hh:mm')}</p>
                </div>
              )
            })
          }
        </div>

        {message.imageUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className="w-fit p-2 absolute top-0 right-0 hover:text-red-500" onClick={handleClearUploadImage}>
            <IoClose size={25}/>
            </div>
            <div>
            <img
              src={message.imageUrl}
              alt="uploadedImage"
              className="aspect-video w-full h-full max-w-sm m-2"
            />
            </div>
          </div>
        )}

      {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className="w-fit p-2 absolute top-0 right-0 hover:text-red-500" onClick={handleClearUploadVideo}>
            <IoClose size={25}/>
            </div>
            <div>
            <video
              src={message.videoUrl}
              className="aspect-video w-full h-full max-w-sm m-2"
              controls
              muted
              autoPlay
            />
            </div>
          </div>
        )}

        {
          loading && (
            <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading/>
            </div>
          )
        }

      </section>

      {/* Footer Section */}
      <footer className="h-16 bg-white flex items-center px-4 shadow-md">
          <div className="relative ">
            <button onClick={hanldeUploadPhotoImage} className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-blue-300 hover:text-white">
              <FaPlus size={18} />
            </button>
            {
              openImage && (
                <div className="bg-white shadow rounded absolute bottom-16 w-36 p-2">
                <ul>
                  <form>
                    <label htmlFor="uploadImage" className="flex items-center p-2 gap-3 hover:bg-slate-200">
                      <div className="text-blue-500">
                          <FaRegImage size={18}/>
                      </div>
                      <p>Image</p>
                    </label>
                    <label htmlFor="uploadVideo" className="flex items-center p-2 gap-3 hover:bg-slate-200">
                    <div className="text-purple-400">
                        <FaVideo size={18}/>
                    </div>
                      <p>Video</p>
                    </label>

                    {/* button  */}
                    <input type='file' id='uploadImage' onChange={handleUploadImage} className="hidden"/>
                    <input type='file' id='uploadVideo' onChange={handleUploadVideo} className="hidden"/>

                  </form>
                </ul>
            </div>
              )
            }
          </div>

          {/* input */}
          <form className="h-full w-full py-4" onSubmit={handleSendMessage}>
            <input type='text' placeholder="Type Message here..." className="py-1 px-4 outline-none w-full" value={message.text} onChange={handleOnChange}></input>
          </form>
          <button className="hover:text-blue-400">
          <IoSend size={25} onClick={handleSendMessage}/>
          </button>
          {/* speech recognition */}
          <button
          className={`hover:text-blue-400 ml-3 ${
            listening ? "text-red-500" : ""
          }`}
          onClick={handleMicrophoneClick}
        >
          <FaMicrophone size={25} />
        </button>
        {/* check grammar */}
        <button
  className="hover:text-blue-400 ml-3"
  onClick={async () => {
    try {
      const correctedText = await checkGrammar(message.text); 
      setMessage((prev) => ({
        ...prev,
        text: correctedText, 
      }));
    } catch (error) {
      alert(error.message); 
    }
  }}
>
  <SiGrammarly size={25} />
</button>
      </footer>
    </div>
  );
};

export default MessagePage;
