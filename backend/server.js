const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const socketio = require('socket.io'); 

const app = express();
const server = http.createServer(app); 

// --- UNIVERSAL CORS CONFIGURATION ---
const liveOrigin = "https://nexus-qwymvaguo-ayeshasaba-592s-projects.vercel.app";

// --- DYNAMIC CORS CONFIGURATION ---
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow any localhost (for your local dev)
    const isLocal = !origin || origin.startsWith('http://localhost:');
    
    // 2. Allow ANY Vercel project starting with 'nexus' and ending with '.vercel.app'
    const isVercel = origin && origin.startsWith('https://nexus') && origin.endsWith('.vercel.app');
    
    // 3. Allow your specific production URL just in case
    const isMainProd = origin === "https://nexus-qwymvaguo-ayeshasaba-592s-projects.vercel.app";

    if (isLocal || isVercel || isMainProd) {
      callback(null, true);
    } else {
      console.log("CORS Blocked for origin:", origin); // This helps you see the blocked URL in Railway logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
};

// Apply this to both Socket.io and Express
const io = socketio(server, {
  cors: corsOptions,
  allowEIO3: true
});

app.use(cors(corsOptions)); // Using the same options for Express

// 3. STATIC FOLDERS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents')); 
app.use('/api/transactions', require('./routes/transactions'));

// 5. SOCKET.IO LOGIC
io.on('connection', (socket) => {
  console.log('User connected to Socket:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data.candidate);
  });
});

// 6. DATABASE & SERVER START
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.get('/', (req, res) => {
  res.send("Nexus Backend is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));