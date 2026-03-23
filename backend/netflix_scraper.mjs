import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

const TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const DB_PATH1 = path.resolve('./public/movies.json');
const DB_PATH2 = path.resolve('../public/movies.json');
const DB_PATH = fs.existsSync(DB_PATH1) ? DB_PATH1 : DB_PATH2;

const PAGES_TO_SCRAPE = 5; // Top 100 movies + 100 TV shows

async function fetchJSON(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
}

async function scrapeNetflix() {
    console.log("🎬 Initiating FlickFlow Netflix Content Scraper...");
    let db = [];
    try {
        const fileData = await fsPromises.readFile(DB_PATH, 'utf-8');
        db = JSON.parse(fileData);
    } catch (e) {
        console.log("No existing database found or error reading, starting fresh.");
    }

    let addedCount = 0;
    const existingIds = new Set(db.map(m => String(m.id)));

    // 1. Fetch Netflix Original TV Shows (Network ID: 213 is Netflix)
    for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
        console.log(`📺 Fetching Netflix TV Shows - Page ${page}...`);
        const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213&sort_by=popularity.desc&page=${page}`;
        try {
            const data = await fetchJSON(tvUrl);
            for (const item of data.results) {
                if (item.poster_path && !existingIds.has(String(item.id))) {
                    db.unshift({
                        id: item.id,
                        title: item.name || item.original_name,
                        poster_path: item.poster_path,
                        overview: item.overview,
                        vote_average: item.vote_average,
                        release_date: item.first_air_date,
                        genre_ids: item.genre_ids || [],
                        original_language: item.original_language,
                        media_type: 'tv',
                        is_local: false,
                        video_url: '',
                        subtitle_file: null
                    });
                    existingIds.add(String(item.id));
                    addedCount++;
                }
            }
        } catch (e) {
            console.error(`Failed to fetch TV page ${page}:`, e.message);
        }
    }

    // 2. Fetch Netflix Movies (Watch Provider: 8 is Netflix)
    for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
        console.log(`🍿 Fetching Netflix Movies - Page ${page}...`);
        const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc&page=${page}`;
        try {
            const data = await fetchJSON(movieUrl);
            for (const item of data.results) {
                if (item.poster_path && !existingIds.has(String(item.id))) {
                    db.unshift({
                        id: item.id,
                        title: item.title || item.original_title,
                        poster_path: item.poster_path,
                        overview: item.overview,
                        vote_average: item.vote_average,
                        release_date: item.release_date,
                        genre_ids: item.genre_ids || [],
                        original_language: item.original_language,
                        media_type: 'movie',
                        is_local: false,
                        video_url: '',
                        subtitle_file: null
                    });
                    existingIds.add(String(item.id));
                    addedCount++;
                }
            }
        } catch (e) {
            console.error(`Failed to fetch Movie page ${page}:`, e.message);
        }
    }

    console.log(`\n✅ Netflix Scraper Finished: Added ${addedCount} new Netflix items into database!`);
    
    // Save to DB
    await fsPromises.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`💾 Netflix library successfully merged into Database at ${DB_PATH}!`);
}

scrapeNetflix();
