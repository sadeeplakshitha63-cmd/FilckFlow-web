import requests
import json
import time
from automation import update_react_database, get_movie_data

# Configurations
KISSKH_API_BASE = "https://kisskh.co/api/DramaList/List"
PAGES_TO_SCRAPE = 5 # Each page usually has 30-40 items. Adjust this up to scrape more!
DELAY_BETWEEN_REQUESTS = 1 # Seconds to avoid being blocked by TMDB or Kisskh

def fetch_kisskh_movies(page):
    """Fetch movies/dramas from Kisskh API"""
    params = {
        "page": page,
        "type": 0, # 0 usually means all/mixed, or 1 for movies
        "sub": 0,
        "country": 0,
        "status": 0,
        "order": 1,
        "pageSize": 40
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(KISSKH_API_BASE, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch page {page} from KissKH. Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error connecting to KissKH: {str(e)}")
        return []

def run_bulk_import():
    print(f"Starting Bulk Import from KissKH (Pages 1 to {PAGES_TO_SCRAPE})...")
    
    total_added = 0
    total_failed = 0
    
    for page in range(1, PAGES_TO_SCRAPE + 1):
        print(f"\n--- Fetching KissKH Page {page} ---")
        items = fetch_kisskh_movies(page)
        
        if not items:
            print("No more items or blocked. Stopping.")
            break
            
        for item in items:
            # KissKH returns title, we need to find it on TMDB to get the High-Quality posters, ID, and details
            title = item.get("title", "")
            if not title:
                continue
                
            print(f"Searching TMDB for: {title}")
            
            # Fetch from TMDB using our existing automation.py function
            tmdb_info = get_movie_data(title)
            
            if tmdb_info:
                print(f"Found TMDB Data! Adding '{tmdb_info['title']}' to React Database...")
                
                # We don't have local video for all of them yet, so we pass None for subtitle
                # The React player will automatically fallback to the streaming Iframe for these!
                update_react_database(
                    movie_info=tmdb_info, 
                    video_url="", # Can be added manually later
                    sub_path=None
                )
                total_added += 1
            else:
                print(f"Warning: Could not find '{title}' on TMDB. Skipped.")
                total_failed += 1
                
            time.sleep(DELAY_BETWEEN_REQUESTS) # Be polite to APIs
            
    print(f"\n=== BULK IMPORT COMPLETE ===")
    print(f"Successfully Added to FlickFlow: {total_added} Movies/Dramas")
    print(f"Failed/Not Found: {total_failed} items")
    print("Refresh your React website (localhost:5173) to see the newly populated AI Processed directory!")

if __name__ == "__main__":
    run_bulk_import()
