const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');

const app = express();
const PORT = 3000;

const redisClient = Redis.createClient({
    host: 'localhost',
    port: 6379
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.log('Error: ' + err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/photos', async (req, res) => {
    const albumId = req.query.albumId;
    const photos = await axios.get('https://jsonplaceholder.typicode.com/photos', {
        params: {
            albumId: albumId
        }
    });
    res.json(photos.data);
});

app.get('/photos/:id', async (req, res) => {
    const id = req.params.id;
    const photos = await axios.get(`https://jsonplaceholder.typicode.com/photos/${id}`);
    res.json(photos.data);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
