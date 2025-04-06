import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import SearchResults from "../components/SearchResults";


export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef(); // useRef to store socket instance

  const [currentUser, setCurrentUser] = useState(undefined); // Current user data
  const [contacts, setContacts] = useState([]);   // List of contacts
  const [activeChat, setActiveChat] = useState({
    // Active chat data
    users: undefined, // recipient user data
    messages: [],
  });
  const [history, setHistory] = useState([]); // Chat history data

  const [loading, setLoading] = useState(true); // Loading state for user data

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Effect to set currentUser
  useEffect(() => {
    const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY); // use data from localStorage not backend

    if (!user) {
      navigate("/login");
    } else {
      try {
        const parsedUser = JSON.parse(user);
        // Basic validation of user object
        if (!parsedUser || !parsedUser._id) {
          console.error("Invalid user data in localStorage.");
          localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY); // Clear invalid data
          navigate("/login");
          return;
        }
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY); // Clear invalid data
        navigate("/login");
      }
    }
    setLoading(false);
  }, [navigate]);

  // connect socket for currentUser
  useEffect(() => {
    if (currentUser?._id) {
      // console.log(`Attempting to connect socket for user: ${currentUser._id}`);

      if (!socket.current || !socket.current.connected) {
        socket.current = io(hostUrl);
        // listen for socket connection, then emit
        socket.current.on("connect", () => {
          console.log(
            `Socket connected: ${socket.current.id}. Emitting addUser.`
          );
          socket.current.emit("addUser", currentUser._id);
        });

        socket.current.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });

        socket.current.on("disconnect", (reason) => {
          console.log(`Socket disconnected: ${reason}`);
        });
        // Cleanup on component unmount or currentUser change?
        return () => {
          console.log("Cleaning up socket connection.");
          socket.current.disconnect();
          socket.current = null; // Clear the ref
        };
      }
    }
  }, [currentUser?._id]);

  // --- Fetch Active Chat History ---
  const getActiveChat = async (users) => {
    // Clear messages immediately when recipient changes
    // setActiveChat((prev) => ({ ...prev, messages: [] }));
    if (!currentUser?._id || !users?._id) {
      // cleanup if invalid
      setActiveChat({ users: undefined, messages: [] });
      return;
    }

    // // Don't fetch history for the pseudo "ALL_CHAT" contact
    // if (users.email === process.env.REACT_APP_ALL_CHAT_EMAIL) {
    //   const ALL_CHAT = users; // ?
    //   console.log("ALL_CHAT is:", ALL_CHAT);
    //   console.log("Skipping history fetch for ALL_CHAT");
    //   setActiveChat({ users: users, messages: [] }); // Ensure messages are empty
    //   return;
    // }

    const urlActiveChat = `${hostUrl}/api/chat`;
    console.log(`Fetching history for recipient: ${users._id}`);

    try {
      // 返回的data已经pull populate了sender和users
      const { data } = await axios.post(urlActiveChat, {
        // res.data.messages
        recipientId: users._id,
        currentUserId: currentUser._id,
      });

      if (data && data.messages) {
        // Ensure messages are sorted chronologically if backend doesn't guarantee it
        const sortedMessages = data.messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        // activeChat.messages包含了所有的消息
        setActiveChat({ users: users, messages: sortedMessages }); // users or users._id? or messages[0].sender?
        console.log(
          `History fetched for ${users.username}, ${sortedMessages.length} messages.`
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
  };

  useEffect(() => {
    if (activeChat.users) {
      getActiveChat(activeChat.users);
    } else {
      // Clear messages if no recipient is active
      setActiveChat((prev) => ({ ...prev, messages: [] }));
    }
  }, [activeChat.users?._id]);

  // --- Fetch All Chat History ---
  const getHistoryChat = async () => {
    if (!currentUser?._id) {
      // cleanup if invalid
      setHistory([]);
      return;
    }

    const urlHistoryChat = `${hostUrl}/api/allhistory/${currentUser._id}`;
    console.log(`Fetching all history for currentUser`);

    try {
      const { data } = await axios.get(urlHistoryChat);
      console.log("All history fetched:", data);
      if (data) {
        console.log("All history data is:", data.allMessages);
        setHistory(data.allMessages);
      } else {
        console.warn("No history found in response.");
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching all chat history:", error);
      toast.error("Failed to load all chat history.");
      setHistory([]); // Reset messages on error
    }
  };

  useEffect(() => {
    if (isSearching) {
      getHistoryChat();
    } else {
      // Clear messages if not searching
      setHistory([]);
    }
  }, [activeChat.users?._id, isSearching]); // 

  // useEffect(() => {  // contacts with chat history?
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
        // lead to avatarimage set
        if (!currentUser.avatarimage) {
          console.log("User avatar not set, navigating to profile.");
          navigate("/profile");
          return;
        }
        try {
          const urlAllUsers = `${hostUrl}/api/allusers/${currentUser._id}`;
          console.log("Fetching contacts");
          const { data } = await axios.get(urlAllUsers);
          setContacts([/* ALL_CHAT ,*/ ...data]); // Add ALL_CHAT conditionally if needed
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

  const setActiveUser = (contact) => {
    if (contact._id !== activeChat.users) {
      setActiveChat({
        users: contact,
        messages: [],
      });
    }
  };

  // --- Function to handle selecting a search result ---??
  const handleSelectContactResult = (contact) => {
    setActiveUser(contact); // Reuse your existing logic to set the chat
    setIsSearching(false); // Exit search mode
    setSearchTerm(""); // Clear the search term
  };

  const handleChatChange = useCallback((contact) => {
    console.log("Setting active chat:", contact);
    setActiveChat({ users: contact }); // Assumes this sets the user object directly
    setIsSearching(false);
    setSearchTerm("");
    // setHighlightedMessageId(null); // Reset highlight when chat changes manually
  }, []); // No dependencies needed if only using setters

  // --- Modified Handler for Selecting a MESSAGE result ---
  const handleSelectMessageResult = useCallback(
    (content, users, sender) => {
      
      // console.log(
      //   `Switching to chat with ${sender.username} and highlighting message ${content._id}`
      // );

      users.username === currentUser.username? handleChatChange(sender): handleChatChange(users); 

      setTimeout(() => {
        // setHighlightedMessageId(message._id);
      }, 100); // Small delay, adjust if needed
    },
    [handleChatChange]
  ); 

  // Render Logic
  if (loading) {
    return (
      <StyleContainer>
        <div>Loading user data...</div>
      </StyleContainer>
    ); 
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

          {isSearching ? (
            <SearchResults
              contacts={contacts}
              history={history}
              currentUser={currentUser}
              onContactResultClick={handleSelectContactResult}
              onMessageResultClick={handleSelectMessageResult}
              setIsSearching={setIsSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          ) : !activeChat.users ? (
            <Welcome
              currentUser={currentUser}
              setIsSearching={setIsSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          ) : (
            <ChatBox
              currentUser={currentUser}
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              history={history}
              socket={socket}
              setIsSearching={setIsSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
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
