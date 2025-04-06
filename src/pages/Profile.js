import React from 'react'
import SetAvatar from "../components/SetAvatar"
import { useEffect } from 'react'
import {useNavigate} from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  useEffect(()=>{
    if(!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)){
      navigate("/login")   
    }
  }, [navigate]) 
  return (
    <div>
      <SetAvatar />
    </div>
  )
}
