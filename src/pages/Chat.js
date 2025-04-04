import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { io } from "socket.io-client";

import ChatList from "../components/ChatList";
import Welcome from "../components/Welcome";
import ChatBox from "../components/ChatBox";
import { hostUrl } from "../utils/Router";

const ALL_CHAT = {
  _id: "ALL_CHAT",
  username: "ALL CHAT",
  email: " ",
  avatarimage: " ",
};

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();

  const [currentUser, setCurrentUser] = useState(undefined); //?
  const [contacts, setContacts] = useState([]); //ALL_CHAT?
  const [activeChat, setActiveChat] = useState({
    users: undefined,
    messages: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("chatapp-user"); // use localStorage not from backend
    if (!user) {
      navigate("/login");
    } else {
      // setCurrentUser( JSON.parse(user) )
      try {
        const parsedUser = JSON.parse(user);
        // Basic validation of user object
        if (!parsedUser || !parsedUser._id) {
          console.error("Invalid user data in localStorage.");
          localStorage.removeItem("chatapp-user"); // Clear invalid data
          navigate("/login");
          return;
        }
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("chatapp-user"); // Clear invalid data
        navigate("/login");
      }
    }
    setLoading(false);

    // loadUser();
  }, [navigate]);
  // }, [])

  useEffect(() => {
    if (currentUser?._id) {
      console.log(`Attempting to connect socket for user: ${currentUser._id}`);
      // socket.current = io(hostUrl);
      // socket.current.emit("addUser", currentUser._id);
      if (!socket.current || !socket.current.connected) {
        socket.current = io(hostUrl);
        socket.current.on("connect", () => {
          console.log(
            `Socket connected: ${socket.current.id}. Emitting addUser.`
          );
          socket.current.emit("addUser", currentUser._id);
        });

        socket.current.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
          // Handle connection error (e.g., show toast)
        });

        socket.current.on("disconnect", (reason) => {
          console.log(`Socket disconnected: ${reason}`);
          // Handle disconnection (optional: try to reconnect?)
        });
        // Cleanup on component unmount or currentUser change
        return () => {
          console.log("Cleaning up socket connection.");
          socket.current.disconnect();
          socket.current = null; // Clear the ref
        };
      }
    }
  }, [currentUser?._id]);

  // --- Fetch Chat History ---
  const getHistoryChat = async (users) => {
    // Clear messages immediately when recipient changes
    setActiveChat((prev) => ({ ...prev, messages: [] }));

    if (currentUser?._id && users?._id) {
      // Don't fetch history for the pseudo "ALL_CHAT" contact
      if (users._id === ALL_CHAT._id) {
        console.log("Skipping history fetch for ALL_CHAT");
        setActiveChat({ users: users, messages: [] }); // Ensure messages are empty
        return;
      }

      const urlHistoryChat = `${hostUrl}/api/chat`;
      console.log(`Fetching history for recipient: ${users._id}`);

      try {
        // 返回的data已经pull populate了sender和users
        const { data } = await axios.post(urlHistoryChat, {
          recipientId: users._id,
          currentUserId: currentUser._id,
        });

        // if(currentUser && recipient){
        //   const res = await axios.post(urlHistoryChat, { recipientId: recipient._id, currentUserId: currentUser._id })
        // console.log('data',res.data.messages)

        if (data && data.messages) {
          // Ensure messages are sorted chronologically if backend doesn't guarantee it
          const sortedMessages = data.messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          // activeChat.messages包含了所有的消息
          setActiveChat({ users: users, messages: sortedMessages });
          console.log(
            `History fetched for ${users._id}, ${sortedMessages.length} messages.`
          );
        } else {
          console.warn("No messages found in history response.");
          setActiveChat({ users: users, messages: [] });
          // setActiveChat({ recipient:recipient, messages: res.data.messages })
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        toast.error("Failed to load chat history.");
        setActiveChat({ users: users, messages: [] }); // Reset messages on error
      }
    } else {
      console.log("Skipping history fetch: currentUser or recipient missing.");
      // If recipient is undefined, clear active chat completely
      if (!users) {
        setActiveChat({ users: undefined, messages: [] });
      }
    }
  };

  useEffect(() => {
    // getHistoryChat(activeChat.recipient)
    if (activeChat.users) {
      getHistoryChat(activeChat.users);
    } else {
      // Clear messages if no recipient is active
      setActiveChat((prev) => ({ ...prev, messages: [] }));
    }
  }, [activeChat.users?._id]);

  // useEffect(() => {  //? to be done

  //   const urlContacts = `${hostUrl}/api/contacts`
  //   const getContacts = async () => {
  //     const { data } = await axios.post( urlContacts, {user})
  //     setContacts([ALL_CHAT].concat(data.contacts))
  //   }
  //   getContacts()
  // },[])

  // --- Fetch Contacts ---
  useEffect(() => {
    const getUsers = async () => {
      if (currentUser?._id) {
        // Ensure currentUser and its _id exist
        if (!currentUser.avatarimage) {
          // Or !currentUser.isAvatarImageSet if using that flag
          console.log("User avatar not set, navigating to profile.");
          navigate("/profile");
          return;
        }
        try {
          const urlAllUsers = `${hostUrl}/api/allusers/${currentUser._id}`;
          console.log("Fetching contacts from:", urlAllUsers);
          const { data } = await axios.get(urlAllUsers);
          // Add ALL_CHAT to the beginning if you want it
          setContacts([/* ALL_CHAT, */ ...data]); // Add ALL_CHAT conditionally if needed
          console.log("Contacts loaded:", data);
        } catch (error) {
          console.error("Error fetching contacts:", error);
          toast.error("Failed to load contacts.");
        }
      } else {
        console.log("Cannot fetch contacts, currentUser is not defined yet.");
      }
    };
    // Fetch users only once when currentUser is available
    if (currentUser?._id && contacts.length === 0) {
      getUsers();
    }
  }, [currentUser?._id, navigate]); 

  // const getUsers = async () => {
  //   if (currentUser) {
  //     if (currentUser.avatarimage) {
  //         const urlAllUsers = `${`${hostUrl}/api/allusers`}/${currentUser._id}`
  //         console.log("urlAllUsers:", urlAllUsers)
  //         const data = await axios.get(urlAllUsers);
  //         setContacts([ALL_CHAT].concat(data.data));
  //         console.log("contacts:", data.data);
  //     } else {
  //       navigate("/profile");  //?  updated if using a initial avatar?
  //     }
  //   }}

  // const getUsersRef = useRef(false); // 使用 useRef 控制 getUsers 函数的执行次数

  // useEffect(() => {
  //   // console.log("useEffect 被触发");
  //   // getUsers()
  //   if (currentUser && !getUsersRef.current) {
  //     // 只有当 currentUser 存在且 getUsers 函数没有执行过时才执行
  //     getUsers();
  //     getUsersRef.current = true; // 标记 getUsers 函数已经执行过
  //   }
  // }, [currentUser])  // exclude contacts

  // console.log(contacts)

  const setActiveUser = (contact) => {
    if (contact._id !== activeChat.users) {
      setActiveChat({
        users: contact,
        messages: [],
      });
    }
  };

  // Render Logic
  if (loading) {
    return (
      <StyleContainer>
        <div>Loading user data...</div>
      </StyleContainer>
    ); // Or a proper loader
  }

  return (
    <>
      <StyleContainer>
        <div className="container">
          <ChatList
            setActiveUser={setActiveUser}
            active={activeChat.users?._id}
            contacts={contacts}
            currentUser={currentUser}
          />

          {!activeChat.users ? (
            <Welcome currentUser={currentUser} />
          ) : (
            <ChatBox
              currentUser={currentUser}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              socket={socket}
            />
          )}
        </div>
        <ToastContainer />
      </StyleContainer>
    </>
  );
}

const StyleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  gap: 1rem;
  background-color: teal;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: white;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
