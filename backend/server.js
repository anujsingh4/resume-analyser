const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoute = require('./routes/upload');
const analyseRoute  = require('./routes/analyse');
const aiAnalyseRoute = require('./routes/aiAnalyse'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://resume-analyser.vercel.app'   // your vercel URL (we'll set this soon)
  ],
  methods     : ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', uploadRoute);
app.use('/api', analyseRoute); 
app.use('/api', aiAnalyseRoute);

app.get('/', (req, res) => {
  res.send('Resume Analyser API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});