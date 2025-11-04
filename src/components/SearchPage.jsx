import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "./ProfileModal"; // Import the modal
import "../components/SearchPage.css";

const SearchPage = () => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); // State for modal
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("useEffect triggered with searchQuery:", searchQuery);
    if (searchQuery && token) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/auth/search-users?username=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("API Response:", response.data);
          setSearchResults(response.data.users || []);
        })
        .catch((error) => {
          console.error("API Error:", error.response ? error.response.data : error.message);
        })
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, token]);

  const handleSearch = () => {
    if (!input.trim()) {
      console.log("No username entered, please type something");
      return;
    }
    console.log("Find button clicked, setting searchQuery to:", input.trim());
    setSearchQuery(input.trim());
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/follow`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Follow Response:", response.data);
      setSearchResults(
        searchResults.map((user) =>
          user._id === userId ? { ...user, isFollowing: response.data.isFollowing } : user
        )
      );
    } catch (error) {
      console.error("Follow action failed:", error);
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId); // Open modal with selected user
  };

  const handleCloseModal = () => {
    setSelectedUserId(null); // Close modal
  };

  return (
    <div className="search-container">
      <div className="content">
        <input
          type="text"
          className="search-input"
          placeholder="Enter username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          Find
        </button>
        {loading && <p className="loading">Loading...</p>}
        <div className="search-results">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="search-result-item"
              onClick={() => handleUserClick(user._id)}
            >
              <img
                src={
                  user.profilePic
                    ? `http://localhost:5000${user.profilePic}`
                    : "https://via.placeholder.com/50"
                }
                alt={`${user.username}'s profile`}
                className="result-profile-pic"
              />
              <span className="result-username">{user.username}</span>
              <button
                className={`follow-button ${user.isFollowing ? "unfollow" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user._id, user.isFollowing);
                }}
              >
                {user.isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedUserId && (
        <ProfileModal userId={selectedUserId} onClose={handleCloseModal} token={token} />
      )}
      <div className="bottom-block">
        <h1>Glimpse</h1>
        <button className="nav-button" onClick={() => navigate("/home")}>
          Home
        </button>
        <button className="nav-button" onClick={() => navigate("/moments")}>
          Moments
        </button>
        <button className="nav-button" onClick={() => navigate("/search")}>
          Search
        </button>
        <button className="nav-button" onClick={() => navigate("/chat")}>
          Chat
        </button>
        <button className="nav-button" onClick={() => navigate("/profile")}>
          Profile
        </button>
      </div>
    </div>
  );
};

export default SearchPage;