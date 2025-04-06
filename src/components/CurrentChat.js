import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid"; // dynamically generated unique identifier
import { format } from "timeago.js";
import { convertImageUrlToDataUrl } from "../utils/ConvertImageUrl";
import botAvatar from "../assets/chatbot.jpeg";
import { hostUrl } from "../utils/Router";
import axios from "axios";

const defaultUserAvatar = " ";

export default function CurrentChat(props) {
  const [botAvatarUrl, setBotAvatarUrl] = useState(null);

  useEffect(() => {
    const loadBotAvatar = async () => {
      try {
        const url = await convertImageUrlToDataUrl(botAvatar);
        // console.log("Bot Avatar Data URL:", url);
        setBotAvatarUrl(url);
      } catch (error) {
        console.error("Failed to load bot avatar:", error);
      }
    };

    loadBotAvatar();
  }, []); // 只运行一次

  const updateBotAvatar = async (senderId) => {
    if (!botAvatarUrl) {
      console.warn("Bot Avatar URL is not ready yet. Skipping API call.");
      return;
    }

    try {
      const avatarUrl = `${hostUrl}/api/utils/setavatar/${senderId}`;
      await axios.post(avatarUrl, {
        _id: senderId,
        avatarimage: botAvatarUrl,
      });

      console.log("Bot avatar updated successfully");
    } catch (error) {
      console.error("Failed to update bot avatar:", error);
    }
  };

  const messagesEndRef = useRef(null); // Ref for the end of messages container

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.activeChat.messages]); // Scroll whenever messages change

  return (
    <StyleContainer>
      <div className="chat-messages-container">
        {props.activeChat?.messages?.map((message) => {
          // activeChat.messages包含所有的消息
          // console.log("message.sender:", message.sender);

          const isSender = message.sender?._id === props.currentUser?._id;
          // console.log("isSender:", isSender);
          const isBot = message.isBotMessage === true;
          const messageClass = isSender ? "sent" : isBot ? "bot" : "received";
          // console.log('messageClass', messageClass);

          if (
            isBot &&
            message.sender.username === "ChatBot" &&
            message.sender.avatarimage !== botAvatarUrl &&
            message.sender._id
          ) {
            updateBotAvatar(message.sender._id);
          }

          let avatarSrc = defaultUserAvatar;
          if (isSender && props.currentUser?.avatarimage) {
            avatarSrc = props.currentUser.avatarimage;
          } else if (isBot) {
            avatarSrc = botAvatarUrl;
          } else if (message.sender?.avatarimage) {
            avatarSrc = message.sender.avatarimage;
          }

          // Determine sender name
          let senderName = "User"; // Default if sender is missing somehow
          if (!isSender) {
            senderName = isBot ? "ChatBot" : message.sender?.username || "User";
          }

          return (
            <div
              className={`message-wrapper ${messageClass}`}
              key={message._id || message.createdAt}
            >
              {" "}
              {/* Use DB ID if available */}
              {!isSender && (
                <div className="avatar">
                  <img src={avatarSrc} alt={`${senderName} avatar`} />
                </div>
              )}
              {/* --- Message Content --- */}
              <div className="message-content">
                {!isSender && <span className="sender-name">{senderName}</span>}
                <div className="text-content">
                  <p>{message.content || ""}</p>{" "}
                  <span className="timestamp">
                    {/* standard time format or timeago */}
                    {/* {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} */}
                    {format(message.createdAt || message.timestamp)}
                  </span>
                </div>
              </div>
              {/* --- Sender Avatar (Show for sent messages) --- */}
              {isSender && (
                <div className="avatar self-avatar">
                  <img
                    src={avatarSrc}
                    alt={`${props.currentUser?.username || "You"} avatar`}
                  />
                </div>
              )}
            </div>
          );
        })}
        {/* Empty div at the end to help with scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </StyleContainer>
  );
}

// --- Styled Components ---
const StyleContainer = styled.div`
  background-color: #f4f9f9;
  height: 100%;
  overflow: hidden; // Hide main container scrollbar
  display: flex; // Needed for the inner scrollable div
  flex-direction: column;

  .chat-messages-container {
    flex-grow: 1; // Allows this container to take available space
    overflow-y: auto; // Make THIS container scrollable
    overflow-x: hidden;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem; // Space between messages

    // Scrollbar styling
    &::-webkit-scrollbar {
      width: 0.5rem;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 1rem;
    }
  }

  .message-wrapper {
    display: flex;
    align-items: flex-end; // Align avatar and text block bottom
    max-width: 75%; // Limit message width overall

    .avatar {
      img {
        height: 2.5rem; // Slightly larger avatar
        width: 2.5rem;
        border-radius: 50%;
        object-fit: cover;
        margin: 0 0.5rem; // Add some margin around avatar
      }
    }

    .self-avatar {
      // margin-left: 0.5rem;
    }

    .message-content {
      display: flex;
      flex-direction: column; // Stack sender name and text block

      .sender-name {
        font-size: 0.75rem;
        color: #555;
        margin-bottom: 0.2rem;
        font-weight: 500; // Slightly bolder name
        margin-left: 0.5rem; // Indent name slightly
      }

      .text-content {
        overflow-wrap: break-word;
        padding: 0.6rem 0.9rem;
        font-size: 0.9rem;
        border-radius: 12px; // Slightly larger radius
        position: relative; // For timestamp positioning
        min-width: 60px; // Ensure timestamp doesn't get squeezed too much

        p {
          margin: 0;
          padding-bottom: 1.1rem; // Make space for timestamp below
          color: #303030;
        }

        .timestamp {
          position: absolute;
          bottom: 0.3rem;
          right: 0.7rem;
          font-size: 0.65rem;
          color: #999;
          white-space: nowrap; // Prevent timestamp wrapping
        }
      }
    }

    // --- Alignment and Styling based on Class ---
    &.sent {
      align-self: flex-end; // Align whole message block to the right
      // flex-direction: row-reverse; // Put avatar on the right

      .message-content {
        align-items: flex-end; // Align sender name (if shown) to right
        .sender-name {
          text-align: right;
          margin-right: 0.5rem;
        } // Adjust name position
      }

      .text-content {
        background-color: #dcf8c6; // Light green for sent
        border-bottom-right-radius: 4px; // Tail effect on bottom right
        .timestamp {
          color: #8aae7a;
        } // Adjusted timestamp color
      }
    }

    &.received {
      align-self: flex-start; // Align whole message block to the left
      flex-direction: row; // Avatar on left

      .message-content {
        align-items: flex-start; // Align sender name to left
        .sender-name {
          color: #007bff;
        } // Example color for other users' names
      }

      .text-content {
        background-color: #ffffff; // White for received
        border-bottom-left-radius: 4px; // Tail effect on bottom left
      }
    }

    &.bot {
      align-self: flex-start; // Align whole message block to the left
      flex-direction: row; // Avatar on left

      .message-content {
        align-items: flex-start;
        .sender-name {
          color: #0277bd;
          font-style: italic;
        } // Distinct bot name
      }

      .text-content {
        background-color: #e1f5fe; // Use variable
        /* border: 1px solid #b3e5fc; */ // Optional border
        border-bottom-left-radius: 4px; // Tail effect
        .timestamp {
          color: #8aa4b0;
        } // Adjusted timestamp color
      }
    }
  }
`;

// export default function CurrentChat(props) {
//   // create a ref object to reference a DOM element
//   const scrollRef = useRef();

//   useEffect(() => {
//     // to scroll element into view smoothly
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [props.activeChat]);

//   return (
//     <StyleContainer>
//       <div className="chat-container">
//         {props.activeChat.messages.map((message, i) => (
//           <div className="chat-item" ref={scrollRef} key={uuidv4()}>
//             {message.sender.username === props.currentUser.username ? (
//               <div className="sender-container">
//                 <div className="sender-content">
//                   <h4>{message.content}</h4>
//                   {props.currentUser && (
//                     <img
//                       // src={`data:image/svg+xml;base64,${props.currentUser.avatarimage}`}
//                       src={props.currentUser.avatarimage}
//                       alt=""
//                     />
//                   )}
//                 </div>
//                 <div className="sender-time">{format(message.timestamp)}</div>
//               </div>
//             ) : (
//               <div className="recipient-avatar">
//                 <div className="recipient-content">
//                   {message.sender && (
//                     <img
//                       // src={`data:image/svg+xml;base64,${message.sender.avatarimage}`}
//                       src={message.sender.avatarimage}
//                       alt=""
//                     />
//                   )}
//                   <h4>{message.content}</h4>
//                 </div>
//                 <div className="recipient-time">
//                   {format(message.timestamp)}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </StyleContainer>
//   );
// }

// const StyleContainer = styled.div`

// background-color: #F4F9F9;
// height: 100%
// overflow-y: auto;
// overflow-x: hidden;

// &::-webkit-scrollbar{
//   width: 0.8rem;
// }

// &::-webkit-scrollbar-thumb {
//   background-color: #6DB6B6;
//   border-radius: 1rem;
// }

// .chat-container{
//   .chat-item{
//     display: flex;
//     flex-direction: column;
//     height: 3.0rem;
//     position: relative;
//     margin: 0.5rem;

//     .sender-container{
//       display: flex;
//       flex-direction: column;
//       position: absolute;
//       right: 0%;
//       align-items: left;
//       justify-content: center;

//       .sender-content{
//         display: flex;
//         h4{
//           background-color: #8AE68A;
//           border-radius: 0.5rem;
//           padding: 0.5rem 1rem;
//         }
//       }

//       .sender-time{
//         font-size: 0.875rem;
//         color: #75ADAD;
//         margin-left: auto;
//       }
//     }

//     .recipient-avatar{
//       display: flex;
//       flex-direction: column;
//       align-items: left;
//       justify-content: center;
//       position: absolute;
//       left: 0%;

//       .recipient-content{
//         display: flex;
//         h4{
//           background-color: white;
//           border-radius: 0.5rem;
//           padding: 0.5rem 1rem;
//         }
//       }

//       .recipient-time{
//         font-size: 0.875rem;
//         color: #75ADAD;
//         margin-right: auto;
//       }

//     }

//   }
//   img{
//     height: 2rem;
//   }

// }

// `;
