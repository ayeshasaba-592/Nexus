const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const socketio = require('socket.io'); 

const app = express();
const server = http.createServer(app); 

// --- 1. MANUAL BRUTE-FORCE CORS (Fixes the 405 error) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow any Vercel URL, Localhost, or request without origin
  if (!origin || origin.includes('vercel.app') || origin.startsWith('http://localhost:')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle Pre-flight (This is the specific fix for your 405 error)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// --- 2. MIDDLEWARE ---
app.use(express.json());

// 3. STATIC FOLDERS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents')); 
app.use('/api/transactions', require('./routes/transactions'));

// 5. SOCKET.IO
// Using origin: true here to match our manual middleware
const io = socketio(server, {
  cors: {
    origin: true,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

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