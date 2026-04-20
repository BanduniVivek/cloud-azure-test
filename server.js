const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors'); // 1. Import CORS

const app = express();

// 2. Enable CORS
// This allows your frontend (on port 5500) to talk to this server (on port 3000)
app.use(cors()); 

app.use(express.json());
app.use(express.static(__dirname));

// Replace with your actual MongoDB connection string
const uri = "mongodb+srv://aman11:Aman%234696@cluster0.czqqffc.mongodb.net/?appName=Cluster0"; 
const client = new MongoClient(uri);

let users;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        const db = client.db('auth_demo');
        users = db.collection('users');
        console.log("✅ Connected to MongoDB");
    } catch (e) {
        console.error("❌ MongoDB Connection Error:", e);
    }
}
connectDB();

// Signup Logic
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!users) return res.status(500).json({ message: "Database not ready" });

        const existingUser = await users.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hashedPassword });
        
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error during signup" });
    }
});

// Login Logic
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!users) return res.status(500).json({ message: "Database not ready" });

        const user = await users.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});