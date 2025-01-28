import express from 'express';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import cors from 'cors'; // Import cors

config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Add this line


// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@campusrallye.mx6ej.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

app.get('/', async (req, res) => {
  try {
    await client.connect();

    const db = client.db('campusRallye'); // Replace with your DB name
    const collection = db.collection('data'); // Replace with your collection name

    const data = await collection.findOne(); // Retrieve data from MongoDB
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
