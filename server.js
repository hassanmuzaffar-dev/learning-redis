const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');

const app = express();
const PORT = 3000;

const redisClient = Redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.log('Redis Error: ' + err);
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const rateLimiter = async (req, res, next) => {
    const ip = req.ip;
    const key = `rate:${ip}`;
    const LIMIT = 5;
    const WINDOW = 60; // seconds

    try {
        const requests = await redisClient.incr(key);

        if (requests === 1) {
            await redisClient.expire(key, WINDOW);
        }

        if (requests > LIMIT) {
            return res.status(429).json({
                message: "Too many requests. Try again later."
            });
        }

        next();
    } catch (err) {
        console.error("Rate limiter error:", err);
        next();
    }
};

app.get('/photos', rateLimiter, async (req, res) => {
    const albumId = req.query.albumId;
    const cacheKey = `photos?albumId=${albumId || 'all'}`;

    try {
        const cachedPhotos = await redisClient.get(cacheKey);

        if (cachedPhotos) {
            console.log("cache Hit");
            return res.json(JSON.parse(cachedPhotos));
        }

        console.log("cache Miss");
        const params = albumId ? { albumId } : { _limit: 100 };
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos', { params });

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
        res.json(data);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/photos/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `photo:${id}`;

    try {
        const cachedPhoto = await redisClient.get(cacheKey);

        if (cachedPhoto) {
            console.log("cache Hit (Single Photo)");
            return res.json(JSON.parse(cachedPhoto));
        }

        console.log("cache Miss (Single Photo)");
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${id}`);

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
        res.json(data);
    } catch (err) {
        console.error('Error fetching photo:', err);
        res.status(500).json({ error: 'Error fetching photo' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

