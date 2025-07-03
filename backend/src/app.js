const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Placeholder for chat message model and API route
// const Message = require('./models/message');
const messagesRouter = require('./routes/messages');
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

module.exports = app; 