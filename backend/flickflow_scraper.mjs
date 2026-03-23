import fs from 'fs';
import path from 'path';
import https from 'https';
import * as cheerio from 'cheerio'; // Make sure npm install cheerio was run

const TMDB_API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const REACT_DATA_PATH = path.resolve("./public/movies.json");
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Cinesubz.lk URLs
const CINESUBZ_MOVIES_URL = "https://cinesubz.lk/movies/page/";
const CINESUBZ_TV_URL = "https://cinesubz.lk/tvshows/page/";

// Fetch helper that mimics browser user-agent
async function fetchHTML(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        if (!response.ok) return null;
        return await response.text();
    } catch (e) {
        console.error("Fetch HTML Error:", e.message);
        return null;
    }
}

async function fetchJSON(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

// Search TMDB for either a Movie or TV Show!
async function searchTMDB(query) {
    try {
        // Clean query from Sinhala words if any exist (e.g. remove "Sinhala Subtitles")
        let cleanQuery = query.replace(/(sinhala sub|sinhala dub|subtitles|sri lanka)/gi, '').trim();
        // Remove year from title like "Avatar (2009)" -> "Avatar "
        cleanQuery = cleanQuery.replace(/\(\d{4}\)/g, '').trim();

        const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanQuery)}`;
        const data = await fetchJSON(url);
        
        if (data && data.results && data.results.length > 0) {
            // Pick the first valid movie or tv result
            return data.results.find(r => r.media_type === 'movie' || r.media_type === 'tv') || data.results[0];
        }
    } catch (e) {
        console.error("TMDB error:", e.message);
    }
    return null;
}

function updateDatabase(movieInfo) {
    let data = [];
    try {
        if (fs.existsSync(REACT_DATA_PATH)) {
            data = JSON.parse(fs.readFileSync(REACT_DATA_PATH, 'utf-8'));
        }
    } catch (e) {}

    const isTV = movieInfo.media_type === 'tv';

    const newItem = {
        id: String(movieInfo.id),
        title: movieInfo.title || movieInfo.name, // name is for TV series
        overview: movieInfo.overview,
        release_date: movieInfo.release_date || movieInfo.first_air_date,
        poster_path: movieInfo.poster_path || '',
        backdrop_path: movieInfo.backdrop_path || '',
        vote_average: movieInfo.vote_average || 0,
        media_type: isTV ? 'tv' : 'movie',
        original_language: movieInfo.original_language || 'en',
        genre_ids: movieInfo.genre_ids || [],
        video_url: '',
        subtitle_file: null,
        is_local: true
    };

    // Replace if exists
    data = data.filter(m => String(m.id) !== String(newItem.id));
    data.unshift(newItem); // Add to top

    fs.writeFileSync(REACT_DATA_PATH, JSON.stringify(data, null, 4));
}

async function scrapeCinesubz(startPage = 1, endPage = 2, isTV = false) {
    let added = 0;
    const baseUrl = isTV ? CINESUBZ_TV_URL : CINESUBZ_MOVIES_URL;

    console.log(`\n=== SCAPING CINESUBZ.LK ${isTV ? 'TV SHOWS' : 'MOVIES'} ===`);
    
    for (let page = startPage; page <= endPage; page++) {
        try {
            console.log(`-> Fetching Page ${page}...`);
            const html = await fetchHTML(`${baseUrl}${page}/`);
            
            if (!html) {
                console.error(`Page ${page} unreachable. Skipping...`);
                continue;
            }

            const $ = cheerio.load(html);
            // Cinesubz uses standard WordPress templates, titles are inside article tags
            const titles = [];
            
            // Grab from article titles or common title classes to avoid sidebar/footer links
            $('h3, h2, .title, .entry-title').each((i, el) => {
                const text = $(el).text().trim();
                // Filter out common non-movie strings and report links
                const forbiddenKeywords = ['problem', 'report', 'contact', 'account', 'login', 'signup', 'home', 'about', 'join', 'telegram', 'facebook', 'youtube', 'settings', 'logout', 'dashboard', 'search', 'menu', 'category', 'year', 'genre', 'country', 'language', 'quality', 'trending', 'recently added', 'movies', 'series', 'latest', 'popular', 'top imdb'];
                const isForbidden = forbiddenKeywords.some(key => text.toLowerCase() === key || text.toLowerCase().includes(key));
                
                if (text && !titles.includes(text) && !isForbidden && text.length > 3 && text.length < 100) {
                    titles.push(text);
                }
            });

            if (titles.length === 0) {
                console.log("No valid movie titles found on this page.");
                continue;
            }

            for (const title of titles) {
                try {
                    console.log(`Look up: ${title}`);
                    const tmdbInfo = await searchTMDB(title);
                    if (tmdbInfo) {
                        if (isTV && tmdbInfo.media_type !== 'tv') tmdbInfo.media_type = 'tv';
                        updateDatabase(tmdbInfo);
                        const itemName = tmdbInfo.title || tmdbInfo.name;
                        console.log(`[+] Saved: ${itemName}`);
                        added++;
                    }
                } catch (movieErr) {
                    console.error(`Error processing title '${title}':`, movieErr.message);
                }
                await sleep(1000); // polite API scraping
            }
        } catch (pageErr) {
            console.error(`CRITICAL: Page ${page} failed completely:`, pageErr.message);
        }
    }
    return added;
}

async function runAutoUpdater() {
    console.log("Welcome to FlickFlow Auto-Updater Engine!");
    let total = 0;
    
    // 1. Scrape latest 12 pages of Cinesubz Movies
    total += await scrapeCinesubz(1, 12, false);
    
    // 2. Scrape latest 5 page of Cinesubz TV Series
    total += await scrapeCinesubz(1, 5, true);

    console.log(`\n>>> SUCCESS! ${total} New items automatically added to FlickFlow! <<<`);
    console.log(`Refresh http://localhost:5173 to see them locally.`);
}

runAutoUpdater();
