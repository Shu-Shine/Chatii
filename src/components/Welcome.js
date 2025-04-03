import React from "react";
import WelcomeLogo from "../assets/hi-hello.gif";
import styled from "styled-components";
import Logout from "./Logout";

export default function Welcome(props) {
  return (
    <StyleContainer>
      <div className="title">
        <Logout currentUser={props.currentUser} />
      </div>
      <img src={WelcomeLogo} alt="" />
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
  display: flex;
  padding: 2rem;
  position: relative;
  width: 100%;
  overflow: hidden;

  .title {
    .logout {
      position: absolute;
      right: 6%;
      cursor: pointer;

      :hover::after {
        content: " Log out";
        color: red;
      }
    }
  }

  .words {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 45%;
    right: 50%;
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
