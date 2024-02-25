import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

export default function CurrentChat(props) {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.activeChat]);

  return (
    <StyleContainer>
      <div className="chat-container">
        {props.activeChat.messages.map((message, i) => (
          <div className="chat-item" ref={scrollRef} key={uuidv4()}>
            {message.sender.username === props.currentUser.username ? (
              <div className="sender-container">
                <h4>{message.content}</h4>
                {props.currentUser && (
                  <img
                    src={`data:image/svg+xml;base64,${props.currentUser.avatarimage}`}
                    alt=""
                  />
                )}
              </div>
            ) : (
              <div className="recipient-avatar">
                {message.sender && (
                  <img
                    src={`data:image/svg+xml;base64,${message.sender.avatarimage}`}
                    alt=""
                  />
                )}
                <h4>{message.content}</h4>
              </div>
            )}
          </div>
        ))}
      </div>
    </StyleContainer>
  );
}

const StyleContainer = styled.div`

background-color: #F4F9F9;
height: 100%
overflow-y: auto;
overflow-x: hidden;

&::-webkit-scrollbar{
  width: 0.8rem;
}
  
&::-webkit-scrollbar-thumb {
  background-color: #6DB6B6;
  border-radius: 1rem;
}

.chat-container{
  .chat-item{
    display: flex;
    flex-direction: column;
    height: 2rem;
    position: relative;
    margin: 0.5rem;

    .sender-container{
      display: flex;
      position: absolute;
      right: 0%;
      align-items: center;
      justify-content: center;

      h4{
        background-color: #8AE68A;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
      }
    }
    
    .recipient-avatar{
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 0%;

      h4{
        background-color: white;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
      }

    }
    

  }
  img{
    height: 2rem;
  }

}


`;
