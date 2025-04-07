import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import {useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Buffer } from 'buffer';

import avatar1 from '../assets/default-avatar-1.svg';
import avatar2 from '../assets/default-avatar-2.svg';
import avatar3 from '../assets/default-avatar-3.svg';
import avatar4 from '../assets/default-avatar-4.svg';

import loader from "../assets/Loading.gif"
import {hostUrl} from "../utils/Router"

import { convertImageUrlToDataUrl } from '../utils/ConvertImageUrl';

const defaultAvatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4
];

function SetAvatar() {
  const navigate = useNavigate();

  // State variables
  const [avatars, setAvatars] = useState([]); // For API avatars (raw base64 strings)
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(undefined); // Index for default or API avatars
  const [isLoading, setIsLoading] = useState(true);
  const [useDefaultAvatars, setUseDefaultAvatars] = useState(true); // Start with default avatars
  const [customAvatarDataUrl, setCustomAvatarDataUrl] = useState(null); // Store uploaded avatar as data URL
  const fileInputRef = useRef(null);

  // Toast configuration
  const toastStyle = {
    position: "bottom-right",
    autoClose: 5000, // Reduced time slightly
    draggable: true,
    pauseOnHover: true,
    theme: "dark", // Added theme for better visibility
  };

  // Effect to check authentication
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
         // If user exists, decide whether to load API or default avatars initially
         if (useDefaultAvatars) {
           setIsLoading(false); // Defaults are already loaded
         } else {
           await fetchApiAvatars(); // Fetch API avatars if that's the default mode
         }
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Removed useDefaultAvatars from dependency array to avoid re-fetching on toggle

  // --- Avatar Selection ---
  const handleAvatarSelect = (index) => {
    setSelectedAvatarIndex(index);
    setCustomAvatarDataUrl(null); // Clear custom avatar if a default/API one is selected
  };

  // --- Custom Avatar Upload ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, GIF, SVG).', toastStyle);
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // Increased limit to 2MB
      toast.error('Image size cannot exceed 2MB.', toastStyle);
      return;
    }

    // Read file as Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomAvatarDataUrl(event.target.result); // Store the data URL
      setSelectedAvatarIndex(undefined); // Clear selection of default/API avatars
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Failed to read the selected file.', toastStyle);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Reset file input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click(); // Optional chaining for safety
  };


  // --- Set Avatar Logic ---
  const handleSetAvatar = async () => {
    // Check if any avatar is selected
    if (selectedAvatarIndex === undefined && !customAvatarDataUrl) {
      toast.error('Please select an avatar or upload your own.', toastStyle);
      return; // Keep return value consistent (void or Promise<void>)
    }

    setIsLoading(true); // Show loader during processing/upload

    let finalAvatarDataUrl = null;

    try {
      // Determine the source and get/convert to Data URL
      if (customAvatarDataUrl) {
        // Custom avatar is already a data URL
        finalAvatarDataUrl = customAvatarDataUrl;
        console.log('Using custom uploaded avatar (already data URL).');

      } else if (selectedAvatarIndex !== undefined) {
        if (useDefaultAvatars) {
          // Default avatar (needs conversion from URL)
          const imageUrl = defaultAvatars[selectedAvatarIndex];
          // console.log('Converting default avatar URL to data URL:', imageUrl);
          finalAvatarDataUrl = await convertImageUrlToDataUrl(imageUrl);
          if (!finalAvatarDataUrl) throw new Error("Conversion returned empty."); // Should be caught by convertImageUrlToDataUrl itself
          console.log('Default avatar converted successfully.');

        } else {
          // API avatar (needs prefixing)
          const rawBase64 = avatars[selectedAvatarIndex];
          if (!rawBase64) {
             throw new Error("Selected API avatar data is missing.");
          }
          // console.log('Using API avatar (raw base64 string), creating data URL.');
          // Ensure it's SVG as expected from Multiavatar or similar APIs
          finalAvatarDataUrl = `data:image/svg+xml;base64,${rawBase64}`;
        }
      }

      // Ensure we have a data URL before proceeding
      if (!finalAvatarDataUrl) {
        throw new Error("Could not determine or prepare avatar data.");
      }


      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (!user || !user._id) {
          toast.error("User session not found. Please log in again.", toastStyle);
          navigate("/login");
          setIsLoading(false);
          return;
      }

      const url = `${hostUrl}/api/utils/setavatar/${user._id}`; // Keep URL as is

      // console.log(`Sending _id: ${user._id} and avatar data to ${url}`); // Add this log for confirmation

      const { data } = await axios.post(url, {
        _id: user._id,
        avatarimage: finalAvatarDataUrl,
      });
      

      // 3. Handle Backend Response
      if (data?.status === true) {
        // IMPORTANT: Use the data URL potentially returned/confirmed by the backend
        user.avatarimage = data.avatarimage || finalAvatarDataUrl; // Use backend's version if available

        // Update localStorage
        localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
        // console.log('Avatar set successfully. LocalStorage updated.');
        toast.success('Avatar set successfully!', toastStyle);
        navigate('/'); // Navigate on success

      } else {
        // Backend reported an error
        throw new Error(data?.message || 'Backend failed to set avatar.');
      }

    } catch (error) {
      // Catch errors from conversion, network, backend, etc.
      console.error('Failed to set avatar:', error);
      toast.error(`Error: ${error.message || 'Could not set avatar. Please try again.'}`, toastStyle);
    } finally {
      setIsLoading(false); // Hide loader regardless of outcome
    }
  };

  // --- Toggle Avatar Source ---
  const toggleAvatarSource = async () => {
      const switchingToApi = useDefaultAvatars; // Will be true if currently using default
      setUseDefaultAvatars(!useDefaultAvatars);
      setSelectedAvatarIndex(undefined);
      setCustomAvatarDataUrl(null);
      setAvatars([]); // Clear previous API avatars if switching away or re-fetching

      if (switchingToApi) {
          await fetchApiAvatars(); // Fetch new ones when switching to API mode
      } else {
          setIsLoading(false); // Switching to defaults, no fetching needed
      }
  };

  // --- Fetch API Avatars ---
  const fetchApiAvatars = async () => {
    setIsLoading(true);
    const avatarArray = [];
    const maxChoice = 1000;
    const promises = [];
    const numberOfAvatars = 4; // Fetch 4 avatars

    console.log("Fetching API avatars...");

    for (let i = 0; i < numberOfAvatars; i++) {
      const randomSeed = `${Date.now()}${Math.round(Math.random() * maxChoice)}`;
      // Use your proxy route
      const proxyUrl = `${hostUrl}/api/utils/getavatar/${randomSeed}`;
      // Expecting the proxy to return the raw SVG or image data correctly
      promises.push(
          axios.get(proxyUrl, { responseType: 'arraybuffer' }) // Fetch as arraybuffer
          .catch(err => { // Add individual catch for better debugging
              console.error(`Error fetching avatar ${i+1} from ${proxyUrl}:`, err.response?.status, err.message);
              return null; // Return null on error to proceed with others
          })
      );
    }

    try {
        const results = await Promise.all(promises); // Use Promise.all, simpler than allSettled if we just filter nulls

        results.forEach(result => {
            // Check if result is valid (not null and has data)
            if (result && result.data) {
                try {
                    // Convert ArrayBuffer to Base64 string
                    const buffer = Buffer.from(result.data);
                    // Assuming the API returns SVG, directly encode
                    avatarArray.push(buffer.toString('base64'));
                } catch (bufferError) {
                    console.error("Error processing fetched avatar data:", bufferError);
                }
            }
        });

      if (avatarArray.length === 0) {
        toast.error('Failed to fetch any avatars from API. Showing default avatars.', toastStyle);
        setUseDefaultAvatars(true); // Fallback to default
      } else if (avatarArray.length < numberOfAvatars) {
         toast.warn(`Could only fetch ${avatarArray.length} API avatars.`, toastStyle);
         setAvatars(avatarArray);
      }
       else {
        setAvatars(avatarArray);
        console.log(`Successfully fetched ${avatarArray.length} API avatars.`);
      }
    } catch (error) {
      // Catch errors from Promise.all or general logic errors
      console.error('General error fetching API avatars:', error);
      toast.error('Failed fetching API avatars. Showing default avatars.', toastStyle);
      setUseDefaultAvatars(true); // Fallback to default
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render Logic ---
  return (
    <>
      <StyleContainer>
        {isLoading ? (
          <img src={loader} alt="Loading..." className="loader" />
        ) : (
          <>
            <div className="title-container">
              <h1>Choose Your Avatar</h1>
            </div>

            {/* Avatar selection area */}
            <div className="avatar-container">
              {useDefaultAvatars
                ? defaultAvatars.map((avatarUrl, i) => (
                    <div
                      key={`default-${i}`}
                      className={`avatar ${selectedAvatarIndex === i ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(i)}
                    >
                      <img src={avatarUrl} alt={`Default avatar ${i + 1}`} />
                    </div>
                  ))
                : avatars.map((base64String, i) => (
                    <div
                      key={`api-${i}`}
                      className={`avatar ${selectedAvatarIndex === i ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(i)}
                    >
                      <img
                        src={`data:image/svg+xml;base64,${base64String}`}
                        alt={`API avatar ${i + 1}`}
                      />
                    </div>
                  ))}
            </div>

            {/* Custom Avatar Upload Section */}
            <div className="custom-avatar-section">
               <button className="btn-upload" onClick={triggerFileInput}>
                  Upload Custom Avatar
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif, image/svg+xml" // Specify accepted types
                  style={{ display: 'none' }}
                />
               {customAvatarDataUrl && (
                  <div className="custom-avatar-preview">
                    <p>Your Upload:</p>
                    {/* Apply 'selected' style if custom avatar is active */}
                    <div className={`avatar ${customAvatarDataUrl ? 'selected' : ''}`}>
                      <img src={customAvatarDataUrl} alt="Custom avatar preview" />
                    </div>
                  </div>
                )}
            </div>


            {/* Action Buttons Row */}
            <div className="button-row action-buttons">
              <button className="btn-toggle" onClick={toggleAvatarSource}>
                {useDefaultAvatars ? 'Try Online Avatars' : 'Use Default Avatars'}
              </button>

               {/* Main action button */}
              <button className="btn btn-set" onClick={handleSetAvatar} disabled={isLoading}>
                 {isLoading ? 'Setting...' : 'Set as Profile'}
              </button>

              <button className="btn-leave" onClick={() => navigate('/')}>
                Set Later
              </button>
            </div>
          </>
        )}
        <ToastContainer />
      </StyleContainer>
    </>
  );
}

// --- Styled Components (Minor Adjustments) ---
const StyleContainer = styled.div`
  display: flex;
  gap: 1.5rem; /* Slightly reduced gap */
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh; /* Use min-height */
  width: 100vw;
  background-color: #1a2e35; /* Darker teal/blue */
  padding: 2rem; /* Add padding for smaller screens */
  box-sizing: border-box;

  .loader {
    max-height: 50vh; /* Limit loader size */
    width: auto;
  }

  .title-container {
    h1 {
      color: #e0f2f7; /* Lighter text */
      text-align: center;
      margin-bottom: 1rem; /* Added margin */
    }
  }

  .avatar-container {
    display: flex;
    gap: 1.5rem; /* Consistent gap */
    flex-wrap: wrap;
    justify-content: center;
    max-width: 600px; /* Max width */
    width: 100%; /* Take available width */

    .avatar {
      border: 4px solid transparent; /* Slightly thicker border */
      padding: 5px; /* Adjust padding */
      border-radius: 50%; /* Perfect circle */
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      background-color: rgba(255, 255, 255, 0.1); /* Subtle background */

      img {
        height: 6rem;
        width: 6rem;
        object-fit: cover;
        border-radius: 50%; /* Ensure image is also round */
        display: block; /* Remove extra space below image */
      }

      &:hover {
        transform: scale(1.08); /* Slightly larger hover effect */
        border-color: rgba(255, 255, 255, 0.5); /* Hover border */
      }
    }

    .selected {
      border-color: #f0a500; /* Golden yellow for selection */
      transform: scale(1.05); /* Indicate selection */
       box-shadow: 0 0 15px #f0a500;
    }
  }

  .custom-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    width: 100%;
    max-width: 300px; /* Limit width of this section */
  }

  .custom-avatar-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      p {
        color: #b0bec5; /* Softer text color */
        margin: 0;
        font-size: 0.9rem;
      }

      .avatar {
        width: 70px; /* Slightly larger preview */
        height: 70px;
        padding: 4px; /* Adjust padding */
        cursor: default; /* Not clickable */

         &:hover {
            transform: none; /* No hover effect on preview */
            border-color: transparent; /* Keep border consistent with selection state */
         }
         &.selected {
             border-color: #f0a500; /* Ensure preview also shows selection border */
             box-shadow: 0 0 10px #f0a500;
         }

        img {
          height: 100%; /* Fill the avatar div */
          width: 100%;
        }
      }
    }


  .button-row {
    display: flex;
    justify-content: center;
    align-items: center; /* Align items vertically */
    flex-wrap: wrap; /* Allow wrapping on small screens */
    gap: 1rem; /* Gap between buttons */
    width: 100%;
    max-width: 700px; /* Increased max width */
    margin-top: 1.5rem; /* Space above buttons */
  }

  /* Base button style */
  .btn, .btn-upload, .btn-toggle, .btn-leave {
    padding: 0.8rem 1.5rem; /* Adjusted padding */
    border-radius: 8px; /* Smoother radius */
    border: none;
    font-weight: 600; /* Slightly bolder */
    cursor: pointer;
    font-size: 0.95rem; /* Slightly smaller font */
    transition: all 0.2s ease-in-out;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #ffffff; /* Default text color */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

     &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: #555;
     }
  }

  /* Specific button styles */
  .btn-set { /* Renamed from .btn for clarity */
    background-color: #f0a500; /* Golden yellow */
    color: #1a2e35; /* Dark text */
     order: 2; /* Center button */
     padding: 0.8rem 2.5rem; /* Make primary action larger */
    &:hover:not(:disabled) {
      background-color: #d49100;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }

  .btn-leave {
    background-color: #607d8b; /* Slate gray */
    order: 3; /* Right button */
    &:hover:not(:disabled) {
      background-color: #455a64;
      transform: translateY(-2px);
    }
  }

  .btn-upload {
    background-color: #00796b; /* Teal */
     /* Already centered via its container */
    &:hover:not(:disabled) {
      background-color: #004d40;
       transform: translateY(-2px);
    }
  }

  .btn-toggle {
    background-color: #4fc3f7; /* Light blue */
    color: #1a2e35;
    order: 1; /* Left button */
    &:hover:not(:disabled) {
      background-color: #03a9f4;
      transform: translateY(-2px);
    }
  }

  /* Responsive adjustments if needed */
  @media (max-width: 600px) {
     .avatar-container {
        gap: 1rem;
        .avatar img {
           height: 5rem;
           width: 5rem;
        }
     }
     .button-row {
        flex-direction: column; /* Stack buttons vertically */
        gap: 0.8rem;
        .btn, .btn-upload, .btn-toggle, .btn-leave {
           width: 80%; /* Make buttons wider */
           max-width: 300px;
           order: 0; /* Reset order for stacking */
        }
         .btn-set {
             padding: 0.8rem 1.5rem; /* Reset padding */
         }
     }
     .custom-avatar-section {
         margin-top: 0.5rem;
         width: 80%;
     }
  }
`;

export default SetAvatar

