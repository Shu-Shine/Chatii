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
  const [contacts, setContacts] = useState([]); // List of contacts
  const [activeChat, setActiveChat] = useState({
    // Active chat data
    users: undefined, // recipient user data
    messages: [],
  });
  const [history, setHistory] = useState([]); // Chat history data
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

    // if (users.email === process.env.REACT_APP_ALL_CHAT_EMAIL) {
    //   const ALL_CHAT = users;
    //   console.log("Skipping history fetch for ALL_CHAT");
    //   setActiveChat({ users: users, messages: [] });
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
  useEffect(() => {
    if (!currentUser || !isSearching) return;

    const getHistoryChat = async () => {
      setIsLoadingHistory(true); // Set loading true before fetch
      const urlHistoryChat = `${hostUrl}/api/allhistory/${currentUser._id}`;
      console.log(`Fetching all history for currentUser`);

      try {
        const { data } = await axios.get(urlHistoryChat);
        console.log("All history fetched:", data);
        if (data?.allMessages) {
          // console.log("All history data is:", data.allMessages);
          setHistory(data.allMessages);
        } else {
          console.warn("No history found in response.");
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching all chat history:", error);
        toast.error("Failed to load all chat history.");
        setHistory([]); // Reset messages on error
      } finally {
        setIsLoadingHistory(false); // Set loading false after fetch completes or fails
      }
    };
    getHistoryChat();
  }, [currentUser, isSearching]); //

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
          setContacts([...data]);
          // console.log("Contacts loaded:", data);
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

  const handleChatChange = useCallback((contact) => {
    console.log("Setting active chat:", contact);
    // setActiveChat({ users: contact });
    setActiveUser(contact); // Assumes this sets the user object directly
    setIsSearching(false);
    setSearchTerm("");
    // setHighlightedMessageId(null); // Reset highlight when chat changes manually
  }, []); // No dependencies needed if only using setters

  const handleSelectMessageResult = useCallback(
    // (content, users, sender) => {
    (message) => {
      // console.log("Selected message:", message.users.username, message.content);
      // console.log("CurrentUser inside Chat:", currentUser);

      if (!currentUser || !message?.users?.username) {
        console.warn("Missing currentUser or message.users.username");
        return;
      }

      const targetUser =
        message.users.username === currentUser.username
          ? message.sender
          : message.users;

      if (!targetUser) {
        console.warn("No target user found in message:", message);
        return;
      }
      // console.log(`Switching to chat with ${targetUser.username});
      handleChatChange(targetUser);

      setTimeout(() => {
        // setHighlightedMessageId(message._id);
      }, 100); // Small delay, adjust if needed
    },
    [handleChatChange, currentUser]
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
              onContactResultClick={handleChatChange}
              onMessageResultClick={handleSelectMessageResult}
              setIsSearching={setIsSearching}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoadingHistory={isLoadingHistory}
            />
          ) : !activeChat.users ? ( //  No active chat selected
            <Welcome
              currentUser={currentUser}
              contacts={contacts}
              setActiveUser={setActiveUser}
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
