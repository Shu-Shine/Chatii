import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
// import axios from "axios";
// import { hostUrl } from "../utils/Router";

export default function ChatEntry(props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatArrive, setChatArrive] = useState(undefined);
  const [msg, setMsg] = useState("");
  const emojiPickerRef = useRef(null);
  const isMounted = useRef(true); // Ref to track component mount status
  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false; // Set to false when component unmounts
    };
  }, []);

  const handleClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Handle clicks outside the emoji picker
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // If the click is outside the emoji picker and the emoji icon
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.classList.contains("emoji-icon")
      ) {
        setShowEmojiPicker(false);
      }
    };

    // Add event listener when emoji picker is shown
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  const handleSendMsg = async (content) => {
    if (
      !props.currentUser?._id ||
      !props.activeChat?.users?._id ||
      !props.socket?.current
    ) {
      console.error("Cannot send message: Missing user, recipient, or socket.");
      return;
    }

    if (!content.trim()) {
      console.log("Cannot send empty message.");
      return;
    }
    // console.log("props.currentUser:", props.currentUser, );

    // socket到server, 传递全部信息
    const messageData = {
      from: props.currentUser,
      to: props.activeChat.users,
      content: content.trim(),
    };

    console.log("Emitting sendMessage with data:", messageData);
    props.socket.current.emit("sendMessage", messageData);

    // props.socket.current.emit("sendMessage", {
    //   users: props.activeChat.users,
    //   content: content,
    //   sender: props.currentUser,
    //   createdAt: now.toISOString(),
    // });

    // API endpoint
    // const urlNewMessage = `${`${hostUrl}/api/message`}`;
    // const res = await axios.post(urlNewMessage, {
    //   users: props.activeChat.users._id,
    //   content: content,
    //   currentUser: props.currentUser._id,
    //   createdAt: now.toISOString(),
    // });

    // const newChat = {
    //   // content: props.content,
    //   content: msg,
    //   users: props.activeChat.users,
    //   sender: props.currentUser,
    //   createdAt: now.toISOString(),
    // };
    // const msgs = [...props.activeChat.messages, newChat];
    // props.setActiveChat({
    //   users: props.activeChat.users,
    //   messages: msgs,
    // });

    //     props.setContent("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSendMsg(msg);
    setMsg("");
    // setShowEmojiPicker(false); // Close emoji picker on send
  };

  useEffect(() => {
    if (props.socket?.current) {
      // props.socket.current.on("getMessage", (chat) => {
      //   setChatArrive(chat);
      // });

      // 接受socket消息，包含全部信息
      const messageListener = (newMessage) => {
        // Check if component is still mounted before updating state
        if (!isMounted.current) {
          console.log(
            "Component unmounted, skipping state update for message:",
            newMessage
          );
          return;
        }

        console.log("getMessage listener received:", newMessage);
        if (
          !newMessage?._id ||
          !newMessage?.sender?._id ||
          !newMessage?.content
        ) {
          console.warn("Listener: Received incomplete message structure.");
          return;
        }

        // Important: Compare IDs, not objects directly
        if (
          newMessage?.sender._id &&
          props.activeChat?.users?._id &&
          ((newMessage.sender._id === props.currentUser._id &&
            newMessage.users._id === props.activeChat.users._id) ||
            (newMessage.sender._id === props.activeChat.users._id &&
              newMessage.users._id === props.currentUser._id) ||
            (newMessage.isBotMessage === true &&
              newMessage.users._id === props.currentUser._id))
        ) {
          console.log(
            `Message ${newMessage._id} is relevant to active chat. Updating state.`
          );

          props.setActiveChat((prevChat) => {
            // Prevent adding duplicate messages if already present
            if (prevChat.messages.some((m) => m._id === newMessage._id)) {
              console.warn(
                `Duplicate message ${newMessage._id} detected. Skipping add.`
              );
              return prevChat;
            }
            return {
              users: prevChat.users,
              messages: [...prevChat.messages, newMessage], // Add the new message from socket
            };
          });
        } else {
          console.log(
            "Received message is not for the currently active chat or sender/recipient info missing."
          );
        }
      };
      console.log("Setting up getMessage listener");
      props.socket.current.on("getMessage", messageListener);

      // Cleanup function to remove the listener
      return () => {
        if (props.socket?.current) {
          console.log("Removing getMessage listener");
          props.socket.current.off("getMessage", messageListener);
        }
      };
    }
  }, [
    props.socket,
    props.setActiveChat,
    props.activeChat?.users?._id,
    props.currentUser?._id,
  ]);
  // }, []);

  // useEffect(() => {
  //   console.log("chatArrive", chatArrive);
  //   if (chatArrive) {
  //     // console.log("chatArrive", chatArrive)
  //     props.setActiveChat((prevChat) => ({
  //       users: props.activeChat.users,
  //       messages: [...prevChat.messages, chatArrive],
  //     }));
  //   }
  // }, [chatArrive]);

  return (
    <StyleContainer>
      <div className="emoji-container">
        <div className="emoji">
          <i
            className="emoji-icon fa-regular fa-face-grin-wide"
            onClick={handleClick}
          ></i>

          {showEmojiPicker && (
            <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
              <Picker
                onEmojiClick={(emojiObject) =>
                  setMsg((prevMsg) => prevMsg + emojiObject.emoji)
                }
                pickerStyle={{
                  zIndex: "999", // Make sure it appears above other elements
                }}
              />
            </div>
          )}
        </div>
      </div>

      <form className="entry-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={msg}
          onChange={(event) => setMsg(event.target.value)}
          // value={props.content}
          // onChange={(event) => props.setContent(event.target.value)}
        />
        <button type="submit">
          <i className="button-icon fa-regular fa-paper-plane"></i>
        </button>
      </form>
    </StyleContainer>
  );
}

const StyleContainer = styled.div`
  // display: grid;
  // grid-template-columns: 5% 95%;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0 1rem;
  position: relative;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }

  .emoji-container {
    display: flex;
    align-items: center;
    color: #222;
    gap: 1rem;

    .emoji {
      position: relative;

      .emoji-icon {
        font-size: 1.5rem;
        cursor: pointer;
        padding-right: 1rem;
      }
    }
  }
  .emoji-picker-wrapper {
    position: absolute;
    bottom: 100%; // Position above the input area
    // right: 0;
  }

  .entry-container {
    display: flex;
    align-items: center;

    width: 100%;
    border-radius: 2rem;
    // background-color: #f0b1a6;
    background-color: #daecec;
    padding: 0.5rem 1rem;

    input {
      width: 90%;
      height: 60%;
      font-size: 1.2rem;
      background-color: transparent;
      overflow: auto;
      border: none;
      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }

    button {
      padding: 0rem 1.5rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border: none;
      background-color: transparent;

      .button-icon {
        font-size: 20px;
      }
    }
  }
`;
