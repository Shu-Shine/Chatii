import React, { useState, useEffect} from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import axios from "axios";
import { hostUrl } from "../utils/Router";

export default function ChatEntry(props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatArrive, setChatArrive] = useState(undefined);
  const [msg, setMsg] = useState("");

  const handleClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSendMsg = async (content) => {
    if (props.currentUser && props.activeChat.recipient) {
      props.socket.current.emit("sendMessage", {
        recipient: props.activeChat.recipient,
        content: content,
        sender: props.currentUser,
      });

      // API endpoint
      const urlNewMessage = `${`${hostUrl}/api/message`}`;
      const res = await axios.post(urlNewMessage, {
        recipient: props.activeChat.recipient,
        content: content,
        currentUser: props.currentUser,
      });

      const newChat = {
        // content: props.content,
        content: msg,
        recipient: props.activeChat.recipient,
        sender: props.currentUser,
      };
      const msgs = [...props.activeChat.messages, newChat];
      props.setActiveChat({
        recipient: props.activeChat.recipient,
        messages: msgs,
      });

      // props.setContent("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // if (props.content.length > 0) {
    //   handleSendMsg(props.content);
    // }
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  useEffect(() => {
    if (props.socket.current) {
      props.socket.current.on("getMessage", (chat) => {
        setChatArrive(chat);
      });
    }
  }, []);

  useEffect(() => {
    console.log("chatArrive", chatArrive);
    if (chatArrive) {
      // console.log("chatArrive", chatArrive)
      props.setActiveChat((prevChat) => ({
        recipient: props.activeChat.recipient,
        messages: [...prevChat.messages, chatArrive],
      }));
    }
  }, [chatArrive]);

  return (
    <StyleContainer>
      <div className="emoji-container">
        <div className="emoji">
          <i
            className="emoji-icon fa-regular fa-face-grin-wide"
            onClick={handleClick}
          ></i>
          {showEmojiPicker && (
            <Picker
              onEmojiClick={(emojiObject) =>
                setMsg((prevMsg) => prevMsg + emojiObject.emoji)
              }
            />
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

      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
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
