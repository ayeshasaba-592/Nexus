const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const socketio = require('socket.io'); 
const swaggerUi = require('swagger-ui-express'); 
const swaggerJsdoc = require('swagger-jsdoc'); 

const app = express();
const server = http.createServer(app); 

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nexus API Documentation',
      version: '1.0.0',
      description: 'API for Entrepreneur and Investor matching platform',
    },
    servers: [
      {
        url: 'https://nexus-production-9dfd.up.railway.app',
        description: 'Production server',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// --- 1. MANUAL BRUTE-FORCE CORS ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin.includes('vercel.app') || origin.startsWith('http://localhost:')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// --- 2. MIDDLEWARE ---
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Swagger Route

app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});
// 3. STATIC FOLDERS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents')); 
app.use('/api/transactions', require('./routes/transactions'));

// 5. SOCKET.IO
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
    socket.to(roomId).emit('user-connected', userId);
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
  socket.on('offer', (data) => socket.to(data.roomId).emit('offer', data.offer));
  socket.on('answer', (data) => socket.to(data.roomId).emit('answer', data.answer));
  socket.on('ice-candidate', (data) => socket.to(data.roomId).emit('ice-candidate', data.candidate));
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
