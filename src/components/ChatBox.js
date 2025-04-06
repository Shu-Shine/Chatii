import styled from "styled-components";

import CurrentChat from "./CurrentChat";
import Logout from "./Logout";
import ChatEntry from "./ChatEntry";
import SearchBar from "./SearchBar";

// main interface
export default function ChatBox(props) {
  return (
    <StyleContainer>
      <div className="title">
        {props.activeChat.users && (
          <h3>
            Chatting with <span>{props.activeChat.users.username}</span>
          </h3>
        )}
        <SearchBar
          setIsSearching={props.setIsSearching}
          searchTerm={props.searchTerm}
          setSearchTerm={props.setSearchTerm}
        />
        <Logout currentUser={props.currentUser} />
      </div>

      <CurrentChat
        currentUser={props.currentUser}
        activeChat={props.activeChat}
      />

      <ChatEntry
        activeChat={props.activeChat}
        setActiveChat={props.setActiveChat}
        history={props.history}
        setHistory={props.setHistory}
        currentUser={props.currentUser}
        socket={props.socket}
      />
    </StyleContainer>
  );
}

const StyleContainer = styled.div`
  display: grid;
  grid-template-rows: 15% 75% 10%;
  overflow: hidden;
  background-color: white;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .title {
    display: flex;
    align-items: center; 
    justify-content: center;  
    position: relative;
    font-size: 20px;

    h3 {
      color: teal;
      padding-right: 5rem;
      // flex-grow: 1;
      span {
        color: tomato;
      }
    }
    form {
      position: absolute;
      right: 6%;
      // top: 40%;
      width: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border-radius: 1rem;
      border: none;
      background-color: #f0f0f0;
      color: black;
      font-size: 1rem;

      :focus {
        outline: none;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        background-color: white;
        color: black;
      }
    }
  }

  .logout {
    position: absolute;
    right: 1%;
    top: 40%;
    cursor: pointer;
    padding: 0 1rem;

    :hover::after {
      content: " Log out";
      color: white;
      font-size: 10px;
      background-color: white;
      background-color: red; //rgba(27, 26, 26, 0.2);
      border-radius: 1rem;
      padding: 0.5rem;
    }
  }

  .chatHistory {
    .recipient-container {
      img {
        height: 2rem;
      }
    }
  }

  .entry-container {
    width: 100%;
  }
`;
