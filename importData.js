import { config } from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { readFile } from 'fs/promises'; // For reading the JSON file

// Load environment variables from the .env file
config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@campusrallye.mx6ej.mongodb.net/?retryWrites=true&w=majority&appName=CampusRallye`;

const client = new MongoClient(uri);

async function importData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('campusRallye'); // Replace with your DB name
    const collection = db.collection('data'); // Replace with your collection name

    // Read data from data.json
    const data = JSON.parse(await readFile('data.json', 'utf-8'));

    // Insert data into the collection
    const result = await collection.insertOne(data);
    console.log('Data inserted:', result.insertedId);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await client.close();
  }
}

importData();
