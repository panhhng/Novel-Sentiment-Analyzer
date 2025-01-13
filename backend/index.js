require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sequelize = require('./config/database');
const Analysis = require('./models/Analysis');

const app = express();
const port = 3001;

// Initialize Sequelize
sequelize.sync().then(() => {
  console.log('Database connected and tables created');
}).catch(err => {
  console.error('Failed to connect to the database', err);
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/analyze', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const uploadedFile = req.files.file;
    const text = uploadedFile.data.toString('utf-8');

    // Call Gemini API for sentiment analysis
    const sentimentResult = await runSentimentAnalysis(text);

    // Store analysis in database
    const analysis = await Analysis.create({
      text,
      results: JSON.stringify(sentimentResult), // Assuming sentimentResult is an object/array
      sentiment: sentimentResult // Adjust based on how sentiment is returned
    });

    // Send sentiment results back to the client
    res.json({ chapter: text.slice(0, 30), sentiment: sentimentResult });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/past-entries', async (req, res) => {
  try {
    const pastEntries = await Analysis.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(pastEntries);
  } catch (error) {
    console.error('Error fetching past entries:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function runSentimentAnalysis(userInput) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze the sentiment of the sentence given below.\n${userInput}\nThe output should be in the format- Sentiment: Value`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini API for sentiment analysis:', error);
    throw error;
  }
}
