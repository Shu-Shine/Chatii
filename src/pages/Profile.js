import React from 'react'
import SetAvatar from "../components/SetAvatar"
import { useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  useEffect(()=>{
    if(!localStorage.getItem("chatapp-user")){
      navigate("/login")   
    }
  }, [navigate]) 
  return (
    <div>
      <SetAvatar />
    </div>
  )
}
