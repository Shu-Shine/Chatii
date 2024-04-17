import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";  // dynamically generated unique identifier
import { format } from "timeago.js";

export default function CurrentChat(props) {
  // create a ref object to reference a DOM element
  const scrollRef = useRef();

  useEffect(() => {
    // to scroll element into view smoothly
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [props.activeChat]);

  return (
    <StyleContainer>
      <div className="chat-container">
        {props.activeChat.messages.map((message, i) => (
          <div className="chat-item" ref={scrollRef} key={uuidv4()}>
            {message.sender.username === props.currentUser.username ? (
              <div className="sender-container">
                <div className="sender-content">
                  <h4>{message.content}</h4>
                  {props.currentUser && (
                    <img
                      src={`data:image/svg+xml;base64,${props.currentUser.avatarimage}`}
                      alt=""
                    />
                  )}
                </div>
                <div className="sender-time">
                  {format(message.timestamp)}
                </div>
              </div>
            ) : (
              <div className="recipient-avatar">
                <div className="recipient-content">
                  {message.sender && (
                    <img
                      src={`data:image/svg+xml;base64,${message.sender.avatarimage}`}
                      alt=""
                    />
                  )}
                  <h4>{message.content}</h4>
                </div>
                <div className="recipient-time">
                  {format(message.timestamp)}
                </div>
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
    height: 3.0rem;
    position: relative;
    margin: 0.5rem;

    .sender-container{
      display: flex;
      flex-direction: column;
      position: absolute;
      right: 0%;
      align-items: left;
      justify-content: center;

      .sender-content{
        display: flex;
        h4{
          background-color: #8AE68A;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
        }  
      }

      .sender-time{
        font-size: 0.875rem;
        color: #4a5568;
        margin-left: auto;
      }
    }
    
    .recipient-avatar{
      display: flex;
      flex-direction: column;
      align-items: left;
      justify-content: center;
      position: absolute;
      left: 0%;

      .recipient-content{
        display: flex;
        h4{
          background-color: white;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
        }
      }

      .recipient-time{
        font-size: 0.875rem;
        color: #4a5568;
        margin-right: auto;
      }

    }
    

  }
  img{
    height: 2rem;
  }

}


`;
