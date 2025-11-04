import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MomentsPage.css";

const MomentsPage = () => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMoments, setSelectedMoments] = useState([]);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [userIndex, setUserIndex] = useState(0);
  const [momentTimer, setMomentTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle caption input
  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  // Handle file input trigger and selection
  const handleFileInputClick = () => {
    console.log("Triggering file input");
    if (momentTimer) clearInterval(momentTimer);
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    } else {
      console.error("File input element not found");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please select an image file.");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (momentTimer) clearInterval(momentTimer);
    handleFileChange(e);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  // Upload moment
  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for upload");
      return;
    }
    if (!selectedFile) {
      alert("Please select an image to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("momentImage", selectedFile);
    formData.append("caption", caption);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/create-moment", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", response.data);
      setCaption("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUpload(false);
      if (selectedUserId) {
        const res = await axios.get(`http://localhost:5000/api/auth/moments/${selectedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedMoments(
          res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
        );
        setCurrentMomentIndex(0);
      }
      if (momentTimer) clearInterval(momentTimer);
    } catch (err) {
      console.error("Upload error:", err.response ? err.response.data : err.message);
    }
  };

  // Handle user click to fetch their moments
  const handleUserClick = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for fetching moments");
      return;
    }
    if (momentTimer) clearInterval(momentTimer);
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:5000/api/auth/moments/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUserId(userId);
      setSelectedMoments(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
      );
      setCurrentMomentIndex(0);
      const currentUserIndex = following.findIndex((user) => user._id === userId);
      setUserIndex(currentUserIndex !== -1 ? currentUserIndex : 0);
    } catch (err) {
      console.error("Error loading user moments:", err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cycle through moments and users automatically
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedUserId || selectedMoments.length === 0 || following.length === 0) return;

    console.log("Effect running with userIndex:", userIndex, "momentIndex:", currentMomentIndex, "Moments:", selectedMoments.length);
    if (momentTimer) clearInterval(momentTimer);

    const cycle = () => {
      console.log("Cycling: momentIndex:", currentMomentIndex, "of", selectedMoments.length - 1);
      if (currentMomentIndex >= selectedMoments.length - 1) {
        console.log("Last moment reached, switching to next user");
        cycleUsers();
        setCurrentMomentIndex(0); // Reset immediately
      } else {
        setCurrentMomentIndex((prev) => prev + 1);
      }
    };

    setMomentTimer(setInterval(cycle, 3000));

    return () => {
      if (momentTimer) clearInterval(momentTimer);
    };
  }, [selectedUserId, selectedMoments, following, userIndex]);

  // Function to cycle to the next user
  const cycleUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token || following.length === 0) return;

    let nextUserIndex = (userIndex + 1) % following.length;
    let attempts = 0;
    const maxAttempts = following.length;
    setIsLoading(true);

    while (attempts < maxAttempts) {
      const nextUserId = following[nextUserIndex]._id;
      console.log("Attempting to switch to user index:", nextUserIndex, "ID:", nextUserId);

      try {
        const res = await axios.get(`http://localhost:5000/api/auth/moments/${nextUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000, // Add timeout to prevent hanging
        });
        const moments = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        if (moments.length > 0) {
          setSelectedUserId(nextUserId);
          setSelectedMoments(moments);
          setUserIndex(nextUserIndex);
          console.log("Switched to user:", nextUserId, "with", moments.length, "moments");
          break; // Exit loop on success
        } else {
          console.log("No moments for user:", nextUserId, "skipping...");
        }
      } catch (err) {
        console.error("Error loading next user moments:", err.response ? err.response.data : err.message);
      }

      nextUserIndex = (nextUserIndex + 1) % following.length;
      attempts++;
      if (attempts === maxAttempts) {
        console.log("No valid users with moments found, resetting to first user");
        setUserIndex(0); // Reset to first user as fallback
        const firstUserId = following[0]._id;
        try {
          const res = await axios.get(`http://localhost:5000/api/auth/moments/${firstUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          setSelectedUserId(firstUserId);
          setSelectedMoments(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []);
          console.log("Reset to user:", firstUserId);
        } catch (err) {
          console.error("Error resetting to first user:", err.response ? err.response.data : err.message);
        }
      }
    }
    setIsLoading(false);
  };

  // Auto-start with first user if no user is selected
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !following.length || selectedUserId) return;

    const autoStart = async () => {
      const firstUserId = following[0]._id;
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/auth/moments/${firstUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedUserId(firstUserId);
        setSelectedMoments(
          res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
        );
        setUserIndex(0);
        setCurrentMomentIndex(0);
        console.log("Auto-started with user:", firstUserId);
      } catch (err) {
        console.error("Error auto-starting:", err.response ? err.response.data : err.message);
      } finally {
        setIsLoading(false);
      }
    };
    autoStart();
  }, [following, selectedUserId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return;
    }

    const fetchData = async () => {
      try {
        const currentUserRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched current user:", currentUserRes.data);
        setCurrentUser(currentUserRes.data || null);

        const res = await axios.get("http://localhost:5000/api/auth/following", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(res.data.following || []);
      } catch (err) {
        console.error("Error fetching data:", err.response ? err.response.data : err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="moments-body" onClick={() => { if (momentTimer) clearInterval(momentTimer); }}>
      <div className="moments-container">
        <div className="moments-content">
          {/* Left Section - Users List */}
          <div className="left-section">
            <div className="following-list">
              {currentUser ? (
                <div
                  key={currentUser._id}
                  className="following-item"
                  onClick={() => {
                    console.log("Clicked Add Today’s Moment +");
                    if (momentTimer) clearInterval(momentTimer);
                    setShowUpload(true);
                  }}
                >
                  <img
                    src={
                      currentUser.profilePic
                        ? `http://localhost:5000${currentUser.profilePic}`
                        : "https://picsum.photos/50"
                    }
                    alt="Your profile"
                    className="following-photo"
                  />
                  <p className="following-username">Add Today’s Moment +</p>
                </div>
              ) : (
                <p>Loading user...</p>
              )}

              {following.length > 0 ? (
                following.map((user) => (
                  <div
                    key={user._id}
                    className="following-item"
                    onClick={() => {
                      if (momentTimer) clearInterval(momentTimer);
                      handleUserClick(user._id);
                    }}
                  >
                    <img
                      src={
                        user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://picsum.photos/50"
                      }
                      alt={`${user.username}'s profile`}
                      className="following-photo"
                    />
                    <p className="following-username">{user.username}</p>
                  </div>
                ))
              ) : (
                <p>No users followed yet.</p>
              )}
            </div>
          </div>

          {/* Right Section - Moments Feed */}
          <div className="right-section">
            {selectedUserId && following[userIndex] && (
              <div className="user-header" >
                <img
                  src={
                    following[userIndex].profilePic
                      ? `http://localhost:5000${following[userIndex].profilePic}`
                      : "https://picsum.photos/50"
                  }
                  alt={`${following[userIndex].username}'s profile`}
                  className="user-photo"
                />
                <p className="user-username">{following[userIndex].username}</p>
              </div>
            )}
            {isLoading ? (
              <p>Loading next moment...</p>
            ) : selectedMoments.length > 0 && selectedUserId ? (
              <div className="moment-card">
                {selectedMoments[currentMomentIndex] ? (
                  <>
                    <img
                      src={`http://localhost:5000${selectedMoments[currentMomentIndex].image}`}
                      alt="Moment"
                      className="moment-image"
                    />
                    <p className="moment-caption">{selectedMoments[currentMomentIndex].caption}</p>
                  </>
                ) : (
                  <p>Loading next moment...</p>
                )}
              </div>
            ) : (
              <p>No moments to show yet or loading...</p>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-block">
          <h1>Glimpse</h1>
          <button className="nav-button" onClick={() => { if (momentTimer) clearInterval(momentTimer); navigate("/home"); }}>
            Home
          </button>
          <button className="nav-button" onClick={() => { if (momentTimer) clearInterval(momentTimer); navigate("/moments"); }}>
            Moments
          </button>
          <button className="nav-button" onClick={() => { if (momentTimer) clearInterval(momentTimer); navigate("/search"); }}>
            Search
          </button>
          <button className="nav-button" onClick={() => { if (momentTimer) clearInterval(momentTimer); navigate("/chat"); }}>
            Chat
          </button>
          <button className="nav-button" onClick={() => { if (momentTimer) clearInterval(momentTimer); navigate("/profile"); }}>
            Profile
          </button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="modal-overlay" onClick={(e) => { if (momentTimer) clearInterval(momentTimer); setShowUpload(false); }}>
            <div className="upload-block" onClick={(e) => e.stopPropagation()}>
              <div
                className="drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                onClick={handleFileInputClick}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <p>Drag and drop an image here, or click to select one.</p>
                )}
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <input
                type="text"
                placeholder="Caption"
                value={caption}
                onChange={handleCaptionChange}
              />
              <button onClick={() => { if (momentTimer) clearInterval(momentTimer); handleUpload(); }}>
                Upload
              </button>
              <button onClick={() => { if (momentTimer) clearInterval(momentTimer); setShowUpload(false); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentsPage;