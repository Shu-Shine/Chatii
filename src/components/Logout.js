import { useNavigate } from 'react-router-dom'
import React from 'react'
import { hostUrl } from "../utils/Router";
import axios from 'axios';

export default function Logout(props) {
  const navigate = useNavigate()

  const handleClick = async (event) => {
    const url = `${hostUrl}/api/logout`;
    const _id = props.currentUser._id
    const res = await axios.post(url, {
      _id,
    });

    localStorage.setItem("chatapp-user", null)
    navigate("/login")
  }

  return (
    <div className='logout'>
      <i className="logout-icon fa-solid fa-right-from-bracket" onClick={handleClick}></i>
      
    </div>
  )
}
