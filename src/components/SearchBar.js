import React from "react";
import styled from "styled-components"; // Import styled-components
import { BiSearch } from "react-icons/bi";

// Destructure props: only need searchTerm, setSearchTerm, setIsSearching
export default function SearchBar(props) {
  // Handle input changes - ONLY updates the term and handles clearing
  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    props.setSearchTerm(newSearchTerm);

    // If user clears the input manually, exit search mode immediately
    if (newSearchTerm.trim() === "") {
      props.setIsSearching(false);
    }
  };

  // Handle explicit clearing via the 'X' button
  const clearSearch = () => {
    props.setSearchTerm("");
    props.setIsSearching(false);
  };

  // Handle form submission (Enter key or Search Button click)
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default page reload/navigation
    if (props.searchTerm.trim()) {
      props.setIsSearching(true); // Activate search mode in parent
    } else {
      // Optionally, if submitted empty, ensure we are not searching
      props.setIsSearching(false);
    }
  };

  return (
    // Use the styled form component and its onSubmit handler
    <SearchForm onSubmit={handleFormSubmit}>
      {/* Make the icon a submittable button */}
      <button
        type="submit"
        className="search-button"
        aria-label="Submit search"
      >
        <BiSearch aria-hidden="true" />
      </button>

      <input
        type="text"
        placeholder="Search..." // Simplified placeholder
        value={props.searchTerm}
        onChange={handleInputChange}
        aria-label="Search contacts or messages"
      />

      {/* Show clear button only if there is text */}
      {props.searchTerm && (
        <button
          type="button" // Important: type="button" prevents form submission
          onClick={clearSearch}
          aria-label="Clear search"
          className="clear-button"
        >
          ×
        </button>
      )}
    </SearchForm>
  );
}

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: #f0f0f0; /* Example style */
  border-radius: 0.5rem;
  padding: 0.4rem 0.8rem; /* Adjust padding */
  margin: 0 1rem; /* Add margin */
  flex-grow: 0; /* Don't allow it to grow excessively */
  flex-basis: 300px; /* Give it a base width */
  /* max-width: 400px; */ /* Optional max width */

  input {
    // flex-grow: 1;
    background-color: transparent;
    border: none;
    color: #333; /* Adjust color for visibility on white background */
    font-size: 0.9rem; /* Adjust font size */
    padding: 0 0.5rem;
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: #555; /* Adjust placeholder color */
    }
  }

  button {
    /* Common button styles */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #333; /* Adjust icon/button color */
    font-size: 1.2rem; /* Adjust icon size */

    &:hover {
      color: #000;
    }
  }

  button.search-button {
    order: -1; /* Icon first */
    margin-right: 0.5rem; /* Space between icon and input */
    &:focus {
      /* Add subtle focus outline */
      outline: 1px dotted #333;
      outline-offset: 2px;
    }
  }

  button.clear-button {
    color: #666; /* Dimmer color for clear */
    padding-left: 0.5rem; /* Space between input and clear */
    &:hover {
      color: #000;
    }
  }
`;
