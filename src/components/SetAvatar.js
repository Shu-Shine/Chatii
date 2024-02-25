import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import {Form, Link, useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Buffer } from 'buffer';

import loader from "../assets/Loading.gif"
import {hostUrl} from "../utils/Router"
const api = "https://api.multiavatar.com/98734153"


function SetAvatar() {
  const navigate = useNavigate()
  
  const [avatars, setAvatars] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState(undefined)  //?
  
  const toastStyle = {
    position: "bottom-right",
    autoClose: 8000,
    draggable: true,
    pauseOnHover: true,
  }

  useEffect(()=>{
    if(!localStorage.getItem("chatapp-user")){
      navigate("/login")  
    }
  }, [navigate]) 

  const handleClick = async ()=> {
    if(!selectedAvatar){
      toast.error("Please choose an avatar", toastStyle)
      return false
    }
    const user = JSON.parse(localStorage.getItem(("chatapp-user")))
    const url = `${hostUrl}/api/setavatar/${user._id}`
    const { data } = await axios.post(url, {  //?
      _id: user._id, 
      avatarimage: avatars[selectedAvatar],
    })

    if(data.status === true){
      user.avatarimage = data.avatarimage
      localStorage.setItem("chatapp-user", JSON.stringify(user))

      navigate("/")
    }else{
      toast.error("Error setting avatar. Plaese try again!", toastStyle)
    }
  }

  useEffect(()=>{  
    const getimg = async () =>{
      const avatarArray = []
      const maxChoice = 1000

      for(let i=0; i<4; i++){
        try {const res = await axios.get(
          `${api}${Math.round(Math.random() * maxChoice)}`
          )
          const buffer = Buffer.from(res.data)
          avatarArray.push(buffer.toString("base64"))
        }catch (error) {
          toast.error("Error fetching image. Please try later!", toastStyle)

          navigate("/")
        }
      }
      setAvatars(avatarArray)
    }
    getimg()

  }, [])



  return (
    <>
      <StyleContainer>
        {!avatars? <img src={loader} alt='loader' className='loader' />:
          <>
            <div className='title-container'>
              <h1>Pick an avatar</h1>
            </div>
            <div className='avatar-container'>
              {avatars.map((avatar, i) => {
                return(
                  <div key={i} className={`avatar ${
                    selectedAvatar === i ? "selected" : ""
                  }`}>
                    <img
                      src={`data:image/svg+xml;base64,${avatar}`}
                      alt="avatar"
                      key={avatar}
                      onClick={() => setSelectedAvatar(i)}
                    />
                  </div>
                )
              })}
            </div>
            <button className='btn' onClick={handleClick}>Set as Profile Picture</button>
            {/* <Link to="/">
              <button className='btn-leave'>Set it later</button>
            </Link> */}
          </>}
          <ToastContainer/>
        </StyleContainer>
    </>    
  )
}

const StyleContainer = styled.div`
  display: flex;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: teal;

  .loader{
    height: 60vh;
    
  }

  .avatar-container{
    display: flex;
    gap: 2rem;
    
  
    .avatar{
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      img{
        height: 6rem;
        transition: ease-in-out;
      }
    }
    .selected{
      border: 0.4rem solid #D2281E;
    }   
  }
  .btn{
    padding: 1rem 2rem;
    background-color: darkgoldenrod;
    border-radius: 0.4rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    &:hover{
      background-color: #D2281E;
    }
  }

  .btn-leave{
    padding: 1rem 4rem;
    background-color: #D3D44A;
    border-radius: 0.4rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    &:hover{
      background-color: #D2281E;
    }
  }
  




`

export default SetAvatar