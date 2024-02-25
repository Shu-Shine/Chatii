import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import Logo from "../assets/logo.png";
import { hostUrl } from "../utils/Router";

function Login() {
  const navigate = useNavigate();
  // const [userId, setUserId] = useState(null)
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const toastStyle = {
    position: "bottom-right",
    autoClose: 8000,
    draggable: true,
    pauseOnHover: true,
  };

  useEffect(() => {
    if (!localStorage.getItem("chatapp-user")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = `${hostUrl}/api/login`;

    if (userValidation()) {
      const { email, password } = user;
      const { data } = await axios.post(url, {
        email,
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastStyle);
      }
      if (data.status === true) {
        localStorage.setItem("chatapp-user", JSON.stringify(data.user)); //? what to send back
        console.log("data.user", data.user);
        navigate("/");
      }
    }
  };
  const userValidation = () => {
    const { email, password } = user;

    if (password.trim() === "") {
      toast.error("Password can't be empty!!", toastStyle);
      return false;
    }
    if (email.trim() === "") {
      toast.error("Email can't be empty!", toastStyle);
      return false;
    }

    return true;
  };

  const handleChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  return (
    <>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <div className="brand">
            <img src={Logo} alt="Logo" />
            <h1>CHATII</h1>
          </div>
          <input
            type="email"
            onChange={handleChange}
            placeholder="Email"
            name="email"
          />
          <input
            type="password"
            onChange={handleChange}
            placeholder="Password"
            name="password"
          />
          <button type="submit">Login</button>
          <span>
            Don't have an account?
            <Link to="/register">Sign up</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  gap: 1rem;
  background-color: teal;

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
    height: 5rem;
  }

  h {
    color: teal;
    text-transform: uppercase;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: white;
    border-radius: 2rem;
    padding: 3rem 5rem;
  }
  input {
    /* background-color: transparent; */
    padding: 0.5rem;
    border: 0.1rem solid rgba(82, 82, 82, 0.886);
    border-radius: 0.3rem;
    color: black;
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #9f8246;
      outline: none;
    }
  }
  button {
    border-radius: 0.2rem;
    background-color: chocolate;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    color: black;
    text-transform: uppercase;
    transition: 0.5s ease-in-out;
    &:hover {
      background-color: #d2281e;
    }
  }
  span {
    color: #222;
    a {
      color: tomato;
      text-decoration: none;
      text-transform: uppercase;
      font-weight: bold;
      padding-left: 0.5rem;
    }
  }
`;

export default Login;
