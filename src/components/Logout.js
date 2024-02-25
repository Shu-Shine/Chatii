import { useNavigate } from 'react-router-dom'
import React from 'react'

export default function Logout() {
  const navigate = useNavigate()

  const handleClick = (event) => {
    localStorage.setItem("chatapp-user", null)
    navigate("/login")
  }

  return (
    <div className='logout'>
      <i className="logout-icon fa-solid fa-right-from-bracket" onClick={handleClick}></i>
      
    </div>
  )
}
