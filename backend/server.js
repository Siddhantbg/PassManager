const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

// Connecting to the MongoDB Client
const url = process.env.MONGO_URI;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // App & Database
        const dbName = process.env.DB_NAME;
        const app = express();
        const port = process.env.PORT || 3000;

        // Middleware
        app.use(bodyParser.json());
        app.use(cors());

        const db = client.db(dbName);
        const collection = db.collection('passwords');

        // Get all the passwords
        app.get('/', async (req, res) => {
            try {
                const findResult = await collection.find({}).toArray();
                res.json(findResult);
            } catch (err) {
                console.error('Error fetching passwords:', err);
                res.status(500).send('Internal Server Error');
            }
        });

        // Save a password
        app.post('/', async (req, res) => {
            try {
                const password = req.body;
                console.log('Received password to save:', password);
                const insertResult = await collection.insertOne(password);
                res.send({ success: true, result: insertResult });
            } catch (err) {
                console.error('Error saving password:', err);
                res.status(500).send('Internal Server Error');
            }
        });

        // Delete a password by id
        app.delete('/', async (req, res) => {
            try {
                const password = req.body;
                console.log('Received password to delete:', password);
                const deleteResult = await collection.deleteOne(password);
                res.send({ success: true, result: deleteResult });
            } catch (err) {
                console.error('Error deleting password:', err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.listen(port, () => {
            console.log(`Example app listening on http://localhost:${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

main().catch(console.error);
