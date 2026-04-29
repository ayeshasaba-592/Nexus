const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const socketio = require('socket.io'); 

const app = express();
const server = http.createServer(app); 

// --- DYNAMIC CORS CONFIGURATION ---
const corsOptions = {
  origin: function (origin, callback) {
    // Log the origin to Railway logs so we can see exactly what is being blocked
    console.log("Request coming from origin:", origin);

    const isLocal = !origin || origin.startsWith('http://localhost:');
    const isVercel = origin && origin.endsWith('.vercel.app');

    if (isLocal || isVercel) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// --- MIDDLEWARE ---
// app.use(cors()) already handles Pre-flight (OPTIONS) requests automatically
app.use(cors(corsOptions));
app.use(express.json());

// 3. STATIC FOLDERS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents')); 
app.use('/api/transactions', require('./routes/transactions'));

// 5. SOCKET.IO (Now using the same logic)
const io = socketio(server, {
  cors: corsOptions,
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