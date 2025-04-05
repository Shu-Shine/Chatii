import { useNavigate } from 'react-router-dom'
import React from 'react'
import { hostUrl } from "../utils/Router";
import axios from 'axios';

export default function Logout(props) {
  const navigate = useNavigate()

  const handleClick = async (event) => {
    const url = `${hostUrl}/api/logout`;
    const _id = props.currentUser._id
 
    try {
      const res = await axios.post(url, {
        _id,
      });

      // 检查状态码是否成功 (通常是 2xx)
      if (res.status >= 200 && res.status < 300) {
        console.log("Logout successful on server.");
        // 只有服务器成功响应后才清理本地状态并导航
        localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
        navigate("/login");
      } else {
        console.error("Logout failed on server with status:", res.status);
        alert(`Logout failed: Server responded with status ${res.status}`);
      }

    } catch (error) {
      console.error("Logout request failed:", error);
      // 处理网络错误或其他请求级别的错误
      alert("Logout request failed. Please check your connection or try again.");
    }
  };

  return (
    <div className='logout'>
      <i className="logout-icon fa-solid fa-right-from-bracket" onClick={handleClick}></i>
      
    </div>
  )
}
