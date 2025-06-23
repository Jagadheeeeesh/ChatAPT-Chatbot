require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the root directory

app.post('/chat', async (req, res) => {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      return res.status(400).json({ error: { message: 'Groq API key is not configured on the server.' } });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    if (error.response) {
      // Forward the error from Groq API
      res.status(error.response.status).json(error.response.data);
    } else {
      // Generic server error
      res.status(500).json({ error: { message: 'An internal server error occurred while contacting the Groq API.' } });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
