const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS - VERY IMPORTANT
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Simple health check
app.get("/", (req, res) => {
  res.json({
    status: "✅ LIVE",
    message: "Insta Vibe Backend is running!",
    endpoints: {
      getPosts: "GET /files",
      upload: "POST /upload",
      delete: "DELETE /delete/:id",
      search: "GET /files?username=name"
    },
    note: "Using temporary storage for testing"
  });
});

// Temporary in-memory storage for testing
let posts = [
  {
    _id: "1",
    username: "john_doe",
    caption: "Beautiful sunset at the beach! 🌅",
    file_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "sunset.jpg",
    upload_time: new Date()
  },
  {
    _id: "2",
    username: "jane_smith",
    caption: "Morning coffee vibes ☕",
    file_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "coffee.jpg",
    upload_time: new Date()
  },
  {
    _id: "3",
    username: "travel_buddy",
    caption: "Mountain adventures! ⛰️",
    file_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "mountains.jpg",
    upload_time: new Date()
  },
  {
    _id: "4",
    username: "foodie_lover",
    caption: "Delicious pizza night! 🍕",
    file_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "pizza.jpg",
    upload_time: new Date()
  },
  {
    _id: "5",
    username: "pet_lover",
    caption: "My cute dog 🐶",
    file_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "dog.jpg",
    upload_time: new Date()
  },
  {
    _id: "6",
    username: "city_explorer",
    caption: "Downtown vibes 🌃",
    file_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "city.jpg",
    upload_time: new Date()
  }
];

// Get all posts (with optional username filter)
app.get("/files", (req, res) => {
  console.log("GET /files called");
  
  const username = req.query.username;
  
  let result = posts;
  if (username) {
    result = posts.filter(post => 
      post.username.toLowerCase().includes(username.toLowerCase())
    );
  }
  
  // Sort by newest first
  result.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));
  
  console.log(`Returning ${result.length} posts`);
  res.json(result);
});

// Upload a new post (simulated - no Cloudinary for now)
app.post("/upload", (req, res) => {
  console.log("POST /upload called", req.body);
  
  const { username, caption } = req.body;
  
  // Create a new post
  const newPost = {
    _id: (posts.length + 1).toString(),
    username: username || "anonymous",
    caption: caption || "",
    file_url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    file_name: "uploaded_image.jpg",
    upload_time: new Date()
  };
  
  posts.unshift(newPost); // Add to beginning
  
  res.status(201).json({
    success: true,
    message: "Post created successfully!",
    data: newPost
  });
});

// Delete a post
app.delete("/delete/:id", (req, res) => {
  console.log(`DELETE /delete/${req.params.id} called`);
  
  const id = req.params.id;
  const initialLength = posts.length;
  
  posts = posts.filter(post => post._id !== id);
  
  if (posts.length < initialLength) {
    res.json({
      success: true,
      message: "Post deleted successfully"
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Post not found"
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: {
      "GET /": "Health check",
      "GET /files": "Get all posts",
      "POST /upload": "Create new post",
      "DELETE /delete/:id": "Delete a post"
    }
  });
});

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`📱 Ready to serve requests!`);
});