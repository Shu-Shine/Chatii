import React, { useState } from 'react'
import styled from 'styled-components'

import CurrentChat from './CurrentChat'
import Logout from './Logout'
import ChatEntry from './ChatEntry'



export default function ChatBox(props) {
  const [content, setContent] = useState(" ")


  return (
    <StyleContainer>
      <div className='title'>
        {props.activeChat.recipient && (<h3>Chatting with <span>{props.activeChat.recipient.username}</span></h3>)}
        <Logout />
      </div>

      <CurrentChat 
        currentUser={props.currentUser} 
        activeChat={props.activeChat}
      /> 

      <ChatEntry 
        content={content} 
        setContent={setContent}
        activeChat={props.activeChat}
        setActiveChat={props.setActiveChat}
        currentUser={props.currentUser}
        socket={props.socket}
      />
      
    </StyleContainer>
  )
}

const StyleContainer = styled.div`
display: grid;
grid-template-rows: 15% 75% 10%;
overflow: hidden;
background-color: white;
@media screen and (min-width: 720px) and (max-width: 1080px) {
  grid-template-rows: 15% 70% 15%;
}

.title{
  display:flex;
  align-items: center;
  justify-content: center;
  position: relative;
 
  h3{
    color: teal;
    span{
      color: tomato;
    }
  }

  .logout{
    position: absolute;
    right: 6%;
    button: 50%;
    cursor: pointer;
    
    :hover::after {
      content: " Log out";
      color: red;
    }
  }
  
}

.chatHistory{
  .recipient-container{
    img{
      height: 2rem;
    }
  }
}

.entry-container{
  width: 100%
}


` 