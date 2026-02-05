const express = require("express");
const multer = require("multer");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

// Initialize Cloudinary (you can keep your current credentials)
cloudinary.config({
  cloud_name: "ddvkxhatp",
  api_key: "239824888971874",
  api_secret: "k9-yqxmdotcMLMcraI2OwfusG80"
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "insta-vibe",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `insta_vibe_${timestamp}`;
    }
  }
});

const upload = multer({ storage });

// For testing - temporary in-memory storage
let mockPosts = [
  {
    _id: "1",
    username: "john_doe",
    caption: "Beautiful sunset at the beach! 🌅",
    file_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80",
    file_name: "sunset.jpg",
    upload_time: new Date()
  },
  {
    _id: "2",
    username: "jane_smith",
    caption: "Morning coffee vibes ☕",
    file_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    file_name: "coffee.jpg",
    upload_time: new Date()
  },
  {
    _id: "3",
    username: "travel_buddy",
    caption: "Mountain adventures! ⛰️",
    file_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    file_name: "mountains.jpg",
    upload_time: new Date()
  }
];

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Upload request received:", req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newPost = {
      _id: new ObjectId().toString(),
      username: req.body.username || "anonymous",
      caption: req.body.caption || "",
      file_url: req.file.path,
      file_name: req.file.originalname,
      upload_time: new Date()
    };

    mockPosts.unshift(newPost); // Add to beginning of array
    
    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      data: newPost
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Upload failed",
      details: error.message 
    });
  }
});

// Get all posts or filter by username
app.get("/files", (req, res) => {
  try {
    const username = req.query.username;
    
    let filteredPosts = mockPosts;
    if (username) {
      filteredPosts = mockPosts.filter(post => 
        post.username.toLowerCase().includes(username.toLowerCase())
      );
    }
    
    console.log(`Returning ${filteredPosts.length} posts`);
    res.json(filteredPosts);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ 
      error: "Failed to fetch posts",
      details: error.message 
    });
  }
});

// Delete a post
app.delete("/delete/:id", (req, res) => {
  try {
    const id = req.params.id;
    const initialLength = mockPosts.length;
    
    mockPosts = mockPosts.filter(post => post._id !== id);
    
    if (mockPosts.length < initialLength) {
      res.json({ 
        success: true, 
        message: "Post deleted successfully" 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: "Post not found" 
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Delete failed",
      details: error.message 
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Insta Vibe Backend is running 🚀",
    version: "1.0.0",
    endpoints: {
      upload: "POST /upload",
      getPosts: "GET /files",
      search: "GET /files?username=username",
      delete: "DELETE /delete/:id"
    },
    note: "Using mock data for demonstration"
  });
});

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}`);
  console.log(`✅ Backend is ready to receive requests!`);
});