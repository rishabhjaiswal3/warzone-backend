const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();
const app = express();

// Configure CORS to allow all origins
// const corsOptions = {
//   origin: true, // Allow all origins
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range']
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(cors());
app.use(express.json());

// Rest of your server.js code
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/warzone', profileRoutes);

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));