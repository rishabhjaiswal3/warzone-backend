const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();
const app = express();

// ✅ Define proper CORS options
// const corsOptions = {
//   origin: '*', // 🔁 Or specify your domain like "https://yourgame.kultgames.com"
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   optionsSuccessStatus: 200
// };

// ✅ Use CORS with those options
const corsOptions = {
  origin: 'https://warzonewarriors.xyz', // ✅ allow entire frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests manually (if needed)
// app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());

// Routes
app.use('/warzone', profileRoutes);

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const profileRoutes = require('./routes/profileRoutes');

// dotenv.config();
// const app = express();

// const corsOptions = {
//   origin: '*', // Allow all origins
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range']
// };


// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// app.use(express.json());

// // Rest of your server.js code
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// app.use('/warzone', profileRoutes);

// const PORT = process.env.PORT || 3300;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));