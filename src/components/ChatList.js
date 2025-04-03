import React from 'react'
import { Link } from 'react-router-dom'

import Logo from "../assets/logo.png"
import styled from 'styled-components'

export default function ChatList(props) {

  return (
    <StyleContainer>
      <div className='logo'>
        <img src={Logo} alt="Logo" />
        <h3>CHATII</h3>
      </div>
      
      <div className='contacts'>
        {props.contacts.map((contact, i) => (

          <div className = {`contact ${props.active===contact? "contact-active": ""}`}
          onClick={()=>props.setActiveUser(contact)} key={i}
          >
            <div className='img-contact'>
              {/* <img src={`data:image/svg+xml;base64,${contact.avatarimage}`} alt=""/> */}
              <img src={contact.avatarimage} alt=""/>
            </div>

            <div className='name-contact'>
              <h4>{contact.username}</h4>
            </div>
          </div>

        ))}
      </div>

      {props.currentUser && props.currentUser.avatarimage && (
        <div className='currentUser'>
          < Link to="/profile" style={{ textDecoration: 'none' }}>
            {/* <img src={`data:image/svg+xml;base64,${props.currentUser.avatarimage}`} alt=''/> */}
            <img src={props.currentUser.avatarimage} alt=''/>

          </Link>
          <h3>{props.currentUser.username}</h3>
        </div>
      )}
      
    </StyleContainer>
  
  )
}

const StyleContainer = styled.div`
display: grid;
grid-template-rows: 15% 70% 15%;
overflow: hidden;
background-color: white;

.logo{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;

  img{
    height: 4rem;
  }

  h3{
    color: #444;
    text-transform: uppercase;

  }
}
.contacts{
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  gap: 0.5rem;

  &::-webkit-scrollbar{
    width: 0.8rem;
    
  }
    
  &::-webkit-scrollbar-thumb {
    background-color: #6DB6B6;
    border-radius: 1rem;
  }

  .contact{
    display: flex;
    align-items: center;
    background-color: #DAECEC;
    min-height: 4rem;
    width: 90%;
    cursor: pointer;
    border-radius: 0.3rem;
    padding: 0.4rem;
    gap: 1rem;
    &:hover{
      background-color: #8AE68A;
    }

    img{
      height: 3rem;
    }

    h4{
      color: #222;
      font-family: 'Varela Round', sans-serif;
      
    }
  }
  
  .contact-active{
    background-color: #D3D44A;
  }
}  

.currentUser{
  display: flex;
  align-items: center;
  background-color: white;
  
  border-radius: 0.3rem;
  gap: 1rem;
  padding: 1rem;
  justify-content: center;
  
  img{
    height: 3rem;
    max-inline-size: 100%;
    cursor: pointer;
  }

  h3{
    color: black;
  }
}

`