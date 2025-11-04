import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components/ProfileModal.css";

const ProfileModal = ({ userId, onClose, token }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/auth/me?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;
        const postsWithLikes = userData.posts.map(post => ({
          ...post,
          likes: post.likes ? post.likes.length : 0,
          userLiked: post.userLiked || false,
        }));
        setUser(userData);
        setPosts(postsWithLikes);
        console.log("Fetched posts with likes for userId", userId, ":", postsWithLikes);
      } catch (error) {
        console.error("Profile modal fetch error for userId", userId, ":", error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, token, refreshTrigger]);

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) {
        console.error("Post not found in local state:", postId);
        return;
      }

      console.log("Attempting to like/unlike post:", postId, "Current state:", { likes: post.likes, userLiked: post.userLiked });
      const response = await axios.post(
        `http://localhost:5000/api/auth/like-post/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Server response for like action:", response.data);

      if (response.data && (response.data.likes !== undefined) && (response.data.userLiked !== undefined)) {
        const updatedPosts = posts.map(p =>
          p._id === postId ? { ...p, likes: response.data.likes, userLiked: response.data.userLiked } : p
        );
        setPosts(updatedPosts);
      } else {
        console.error("Invalid server response format:", response.data);
        setRefreshTrigger(prev => prev + 1); // Re-fetch to sync with server
      }
    } catch (error) {
      console.error("Like action failed:", error.response ? error.response.data : error.message);
      setRefreshTrigger(prev => prev + 1); // Re-fetch on error
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {user && (
          <>
            <div className="modal-header">
              <img
                src={user.profilePic ? `http://localhost:5000${user.profilePic}` : "https://via.placeholder.com/100"}
                alt={`${user.username}'s profile`}
                className="modal-profile-pic"
              />
              <div className="modal-user-info">
                <h2>{user.username}</h2>
                <p>Followers: {user.followers.length}</p>
                <p>Following: {user.following.length}</p>
              </div>
              <button className="close-button" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="modal-posts">
              {posts.map((post) => (
                <div key={post._id} className="post-block">
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt="Post"
                    className="post-image"
                  />
                  <p>{post.caption || "No caption"}</p>
                  <div className="post-actions">
                    <button
                      className={`like-button ${post.userLiked ? "liked" : ""}`}
                      onClick={() => handleLike(post._id)}
                    >
                      👍 {post.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;