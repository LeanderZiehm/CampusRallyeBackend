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

    const db = client.db('campusRallye'); 
    const collection = db.collection('data'); 

    const data = await collection.findOne(); 
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


app.post('/update', async (req, res) => {
  try {
    const { _id, updatedFields } = req.body;

    if (!_id || !updatedFields) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    await client.connect();
    const db = client.db('campusRallye'); 
    const collection = db.collection('data');

    const result = await collection.updateOne(
      { _id },
      { $set: updatedFields }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Data updated successfully' });
    } else {
      res.status(404).json({ message: 'Data not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});






app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
