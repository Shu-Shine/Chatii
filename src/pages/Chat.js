import React, { useState, useRef } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { useEffect } from 'react'
import styled from 'styled-components'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { io } from 'socket.io-client';


import ChatList from '../components/ChatList';
import Welcome from '../components/Welcome';
import ChatBox from '../components/ChatBox';
import {hostUrl} from "../utils/Router"

const ALL_CHAT = {   
  _id: "ALL_CHAT",
  username: "ALL CHAT",
  email:" ",
  avatarimage: " ",
};


export default function Chat() {
  const navigate = useNavigate()
  const socket = useRef()

  const [currentUser, setCurrentUser] = useState(undefined) //?
  const [contacts, setContacts] = useState([ALL_CHAT])  //? 
  const [activeChat, setActiveChat] = useState({
    recipient: undefined,
    messages: []
  })


  useEffect( () => { 
    const user= localStorage.getItem("chatapp-user")  // use localStorage not from backend check
    if(!user){
      navigate("/login")   
    }else{
      setCurrentUser( JSON.parse(user) )
      
    }
  }, []) 


  useEffect(() => {
    if (currentUser) {
      socket.current = io(hostUrl);
      socket.current.emit("addUser", currentUser._id);
    }
  }, [currentUser]);


  const getHistoryChat = async (recipient) => {

    const urlHistoryChat = `${hostUrl}/api/chat`
    if(currentUser && recipient){
      const res = await axios.post(urlHistoryChat, { recipientId: recipient._id, currentUserId: currentUser._id })
      // console.log('data',res.data.messages)
    
      setActiveChat({ recipient:recipient, messages: res.data.messages })
    }

  }

  useEffect(() => {
    getHistoryChat(activeChat.recipient)
  },[activeChat.recipient])

  // useEffect(() => {  //? to be done
   
  //   const urlContacts = `${hostUrl}/api/contacts`
  //   const getContacts = async () => {
  //     const { data } = await axios.post( urlContacts, {user})
  //     setContacts([ALL_CHAT].concat(data.contacts))
  //   }
  //   getContacts()
  // },[])

  const getUsers = async () => {
    if (currentUser) {
      if (currentUser.avatarimage) {    
        const urlAllUsers = `${`${hostUrl}/api/allusers`}/${currentUser._id}`
        const data = await axios.get(urlAllUsers);
        setContacts([ALL_CHAT].concat(data.data));

      } else {
        navigate("/profile");  //?  updated if using a initial avatar?
      }
    }}

  useEffect(() => { 
    getUsers()
  }, [currentUser])  // exclude contacts 

  console.log(contacts)  

  const setActiveUser = (contact) => {
    if (contact._id !== activeChat.recipient ){
      setActiveChat({
        recipient: contact,
        messages: [],
      })
    }
  }



  return (
    <>
      <StyleContainer>
        <div className='container'>

          <ChatList 
            setActiveUser={setActiveUser}
            active={activeChat.recipient}
            contacts={contacts}
            currentUser={currentUser}
          />
          
          {!activeChat.recipient? 
            (<Welcome currentUser={currentUser} />):

            (<ChatBox 
              currentUser={currentUser} 
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              socket={socket}

            />)
          }

        </div>
        <ToastContainer/>
      </StyleContainer>
    </>    

  )
}

const StyleContainer = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 100vh;
width: 100vw;
gap: 1rem;
background-color: teal;

.container{
  height: 85vh;
  width: 85vw;
  background-color: white;
  display: grid;
  grid-template-columns: 25% 75%;
  @media screen and (min-width: 720px) and (max-width: 1080px){
    grid-template-columns: 35% 65%;
  }
  
}

`