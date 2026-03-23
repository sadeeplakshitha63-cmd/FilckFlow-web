import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.resolve(__dirname, '../public/movies.json');

// Dashboard Stats API
app.get('/api/stats', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
        const total = data.length;
        const netflix = data.filter(m => m.overview && m.overview.includes("Netflix")).length;
        const tv = data.filter(m => m.media_type === 'tv').length;
        res.json({ totalMovies: total, tvSeries: tv, netflixExclusive: netflix });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete a movie
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
        const filtered = data.filter(m => String(m.id) !== String(req.params.id));
        await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
        res.json({ success: true, count: filtered.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Trigger Scrapers Manually
app.post('/api/scrape/:type', (req, res) => {
    const { type } = req.params;
    let scriptPath = '';
    if (type === 'netflix') scriptPath = 'netflix_scraper.mjs';
    else if (type === 'kisskh') scriptPath = 'kisskh_scraper.mjs';
    else if (type === 'cinesubz') scriptPath = 'flickflow_scraper.mjs';
    else return res.status(400).json({ error: "Invalid type" });

    const fullPath = path.resolve(__dirname, scriptPath);
    exec(`node "${fullPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Scrape Error: ${error}`);
            return res.status(500).json({ error: error.message });
        }
        res.json({ success: true, logs: stdout });
    });
});

app.listen(3001, () => {
    console.log("🚀 FlickFlow Admin Backend connected directly to Database! Running on Port 3001.");
});
