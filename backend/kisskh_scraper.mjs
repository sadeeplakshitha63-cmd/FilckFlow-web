import fs from 'fs';
import path from 'path';
import https from 'https';

const TMDB_API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const KISSKH_API_BASE = "https://kisskh.co/api/DramaList/List";
const REACT_DATA_PATH = path.resolve("./public/movies.json");

const PAGES_TO_SCRAPE = 10; // Load thousands of Asian Dramas and Movies

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

async function getMovieData(movieName) {
    try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`;
        const data = await fetchJSON(url);
        if (data && data.results && data.results.length > 0) {
            return data.results.find(r => r.media_type === 'tv' || r.media_type === 'movie') || data.results[0];
        }
    } catch (e) {
        console.error("TMDB error:", e.message);
    }
    return null;
}

function updateReactDatabase(movieInfo) {
    let data = [];
    try {
        if (fs.existsSync(REACT_DATA_PATH)) {
            data = JSON.parse(fs.readFileSync(REACT_DATA_PATH, 'utf-8'));
        }
    } catch (e) {}

    const newMovie = {
        id: String(movieInfo.id),
        title: movieInfo.title || movieInfo.name,
        overview: movieInfo.overview,
        release_date: movieInfo.release_date || movieInfo.first_air_date,
        poster_path: movieInfo.poster_path || '',
        backdrop_path: movieInfo.backdrop_path || '',
        vote_average: movieInfo.vote_average || 0,
        media_type: movieInfo.media_type || 'tv', // kisskh is usually tv 
        original_language: movieInfo.original_language || 'ko', // kisskh default to korean if missing
        genre_ids: movieInfo.genre_ids || [],
        video_url: '',
        subtitle_file: null,
        is_local: true
    };

    data = data.filter(m => String(m.id) !== String(newMovie.id));
    data.unshift(newMovie);

    fs.writeFileSync(REACT_DATA_PATH, JSON.stringify(data, null, 4));
}

async function fetchKissKHMovies(page) {
    const url = `${KISSKH_API_BASE}?page=${page}&type=0&sub=0&country=0&status=0&order=1&pageSize=40`;
    try {
        return await fetchJSON(url);
    } catch (e) {
        console.error("Failed KissKH fetch:", e.message);
    }
    return [];
}

async function runBulkImport() {
    console.log(`Starting Node.js Bulk Import from KissKH (First ${PAGES_TO_SCRAPE} Pages)...`);
    
    let totalAdded = 0;
    
    for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
        try {
            console.log(`\n--- Fetching KissKH Page ${page} ---`);
            let items = await fetchKissKHMovies(page);
            
            if (items.data) items = items.data; // sometimes APIs wrap lists in data property
            if (items.list) items = items.list; // or list

            if (!items || !Array.isArray(items) || items.length === 0) {
                console.log("Empty items or failed to fetch. Actually received:", items);
                break;
            }
                
            for (const item of items) {
                try {
                    const title = item.title;
                    if (!title) continue;
                    
                    console.log(`Searching TMDB for: ${title}`);
                    const tmdbInfo = await getMovieData(title);
                    
                    if (tmdbInfo) {
                        const itemName = tmdbInfo.title || tmdbInfo.name;
                        console.log(`Added -> '${itemName}'`);
                        updateReactDatabase(tmdbInfo);
                        totalAdded++;
                    } else {
                        console.log(`Not found -> '${title}'`);
                    }
                } catch (movieErr) {
                    console.error(`Error processing item:`, movieErr.message);
                }
                await sleep(800); // polite delay
            }
        } catch (pageErr) {
            console.error(`CRITICAL: KissKH Page ${page} failed:`, pageErr.message);
        }
    }
    
    console.log(`\n=== BULK IMPORT COMPLETE ===`);
    console.log(`Successfully Added: ${totalAdded} movies to your site!`);
    console.log(`Refresh http://localhost:5173 to see them.`);
}

runBulkImport();
