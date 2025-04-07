import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function SearchResults(props) {
  // const location = useLocation();
  const navigate = useNavigate();
  // const queryParams = new URLSearchParams(location.search);
  // const searchTerm = queryParams.get("query") || "";

  const filteredContacts = useMemo(() => {
    if (!props.searchTerm) return [];
    return props.contacts.filter((contact) =>
      contact.username.toLowerCase().includes(props.searchTerm.toLowerCase())
    );
  }, [props.contacts, props.searchTerm]);

  const filteredMessagesResults = useMemo(() => {
    if (!props.searchTerm || !props.history) return [];

    const lowerSearchTerm = props.searchTerm.toLowerCase();
    console.log("clicked props.history :", props.history);

    return props.history.filter(
      (
        message // array of messages
      ) => message.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [props.history, props.searchTerm]);

  // --- Render Component ---
  if (!props.searchTerm) { // if不能在useMemo前使用
    return null; // Parent component's logic handles showing/hiding
  }

  const hasContactResults = filteredContacts.length > 0;
  const hasMessageResults = filteredMessagesResults.length > 0;

  // if (props.isLoadingHistory) {
  return (
    <Container>
      {/* Header Section */}
      <div className="search-header">
        <button
          className="back-button"
          onClick={() => props.setIsSearching(false)}
        >
          ← Back
        </button>
        <h2>
          Results for: <span>"{props.searchTerm}"</span>
        </h2>
      </div>

      {/* Scrollable Content Section */}
      <div className="results-content">
        {/* Contacts Section */}
        {hasContactResults && (
          <div className="results-section">
            <h3>Contacts</h3>
            <div className="results-list">
              {filteredContacts.map((contact) => (
                <div
                  key={`contact-${contact._id}`}
                  className="contact-result-item"
                  onClick={() => props.onContactResultClick(contact)}
                >
                  {/* <div className="avatar">
                    <img src={contact.avatarImage} alt="avatar" />
                    </div> */}
                  <div className="username">
                    <span>{contact.username}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Section */}
        {hasMessageResults && (
          <div className="results-section">
            <h3>Messages</h3>
            <div className="results-list">
              {filteredMessagesResults.map((message) => (
                <div
                  key={`content-${message._id}`} // Use unique content ID
                  className="message-result-item"
                  // Pass both message and the partner contact object to the handler
                  onClick={() =>
                    props.onMessageResultClick(
                      message
                      // message.content,
                      // message.users,
                      // message.sender
                    )
                  }
                >
                  {/* <div className="avatar">
                    <img src={sender.avatarImage} alt="partner avatar" />
                    </div> */}
                  <div className="message-details">
                    <div className="partner-name">
                      <span>
                        {message.sender.username === props.currentUser.username
                          ? "You:"
                          : message.sender.username}
                      </span>
                    </div>
                    <p className="message-snippet">
                      {/* {message.sender.username === props.currentUser.username ? "You: " : ""} */}
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display if no results found at all */}
        {!hasContactResults && !hasMessageResults && (
          <p className="no-results overall-no-results">
            No contacts or messages found for "{props.searchTerm}".
          </p>
        )}
      </div>
    </Container>
  );
}
// }

// --- Styles --- (Adjusted for new message result format)
const Container = styled.div`
  /* ... Keep Container, search-header, results-content styles as before ... */
  padding: 0;
  color: white; //
  height: 100%;
  background-color: rgba(82, 82, 82, 0.886);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .search-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid #ffffff30;
    flex-shrink: 0;

    h2 {
      margin: 0 1rem;
      font-weight: normal;
      font-size: 1.2rem;
      text-align: center;
      flex-grow: 1;
      span {
        font-style: italic;
        color: chocolate;
      }
    }
    .back-button {
      background-color: chocolate;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.3rem;
      cursor: pointer;
      font-size: 0.9rem;
      &:hover {
        background-color: #d2281e;
      }
    }
  }

  .results-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    &::-webkit-scrollbar {
      width: 0.4rem;
      &-thumb {
        background-color: #ffffff39;
        border-radius: 1rem;
      }
    }
  }

  .results-section {
    h3 {
      color: #ffffffb0;
      border-bottom: 1px solid #ffffff30;
      padding-bottom: 0.5rem;
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1rem;
      font-weight: bold;
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  /* Shared item base style */
  .contact-result-item,
  .message-result-item {
    display: flex;
    align-items: center; /* Center vertically */
    gap: 1rem;
    padding: 0.8rem 1rem;
    background-color: #ffffff1a;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    &:hover {
      background-color: #ffffff34;
    }
  }

  /* Contact specific */
  .contact-result-item {
    .avatar img {
      height: 3rem;
      width: 3rem;
      border-radius: 50%;
      object-fit: cover;
    }
    .username span {
      font-size: 1.1rem;
      font-weight: 500;
    }
  }

  /* Message specific - NEW STRUCTURE */
  .message-result-item {
    align-items: flex-start; /* Align avatar and text block top */
    .avatar img {
      height: 2.5rem; /* Slightly smaller avatar for message results */
      width: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
      margin-top: 0.2rem; /* Align avatar better with text */
    }
    .message-details {
      display: flex;
      flex-direction: column;
      overflow: hidden; /* Prevent text overflow issues */
    }
    .partner-name span {
      font-size: 0.9rem;
      font-weight: bold;
      color: #ffffffd0; /* Slightly brighter name */
      margin-bottom: 0.2rem;
      display: block; /* Ensure it takes its own line */
    }
    .message-snippet {
      font-size: 0.95rem;
      color: #d1d1d1;
      white-space: normal;
      word-break: break-word;
      line-height: 1.4;
      /* Limit snippet lines shown */
      display: -webkit-box;
      -webkit-line-clamp: 2; /* Show max 2 lines */
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .no-results {
    text-align: left;
    margin-top: 0.5rem;
    color: #ffffff90;
    font-style: italic;
    font-size: 0.9rem;
  }
  .overall-no-results {
    text-align: center;
    margin-top: 2rem;
    font-style: normal;
    font-size: 1rem;
    color: #ffffffb0;
  }
`;
