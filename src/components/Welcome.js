import React from "react";
import WelcomeLogo from "../assets/hi-hello.gif";
import styled from "styled-components";
import Logout from "./Logout";
import SearchBar from "./SearchBar";
import { use } from "react";

export default function Welcome(props) {
  const botUserEmail = process.env.REACT_APP_BOT_USER_EMAIL;
  // console.log("Welcome props", props.contacts)
  const botUser = props.contacts.find((contact) => contact.email === botUserEmail);  
  return (
    <StyleContainer>
      <div className="title">
        <SearchBar
          setIsSearching={props.setIsSearching}
          searchTerm={props.searchTerm}
          setSearchTerm={props.setSearchTerm}
        />
        <Logout currentUser={props.currentUser} />
      </div>
      <img src={WelcomeLogo} alt="" onClick={() => props.setActiveUser(botUser)} />
      <div className="words">
        {props.currentUser && (
          <h1>
            Welcome <span>{props.currentUser.username} ! </span>
          </h1>
        )}

        <h2>Enjoy your chatting </h2>
      </div>
    </StyleContainer>
  );
}

const StyleContainer = styled.div`
  display: grid;
  grid-template-rows: 15% 85%;
  overflow: hidden;
  background-color: white;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .title {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 20px;

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
      // position: absolute;
      // right: 8%;
      // top: 5%;
      width: 100%;
      padding: 0.5rem;
      border-radius: 0.5rem;
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

  .words {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 45%;
    right: 30%;
    color: teal;
    h1 {
      font-size: 50px;
    }
    h2 {
      padding: 1rem;
    }
    span {
      color: tomato;
    }
  }

  img {
    height: 15rem;
    position: absolute;
    bottom: 15%;
    right: 15%;
    cursor: pointer;

  }

`;
