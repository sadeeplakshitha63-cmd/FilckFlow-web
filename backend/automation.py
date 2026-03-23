import os
import requests
import whisper
import json
import math

# --- Configurations ---
TMDB_API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c" # Use your actual TMDB key here
REACT_DATA_PATH = "../public/movies.json" # Auto-updated database for React
SUBS_DIR = "../public/subs"
OPENAI_MODEL = "base" # Whisper model

def get_movie_data(movie_name):
    """Fetch movie details using TMDB API"""
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_name}"
    response = requests.get(url).json()
    if response and 'results' in response and len(response['results']) > 0:
        return response['results'][0]
    return None

def format_timestamp(seconds):
    """Format seconds into WebVTT timestamp format (HH:MM:SS.mmm)"""
    h = math.floor(seconds / 3600)
    m = math.floor((seconds % 3600) / 60)
    s = seconds % 60
    ms = math.floor((s - math.floor(s)) * 1000)
    s = math.floor(s)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def generate_subtitles(video_path, movie_id, lang="en"):
    """Generate accurate WebVTT subtitles using OpenAI Whisper"""
    if not os.path.exists(video_path):
        print(f"Error: Video file {video_path} not found.")
        return None

    print(f"Transcribing {video_path} using Whisper ({OPENAI_MODEL} model)...")
    model = whisper.load_model(OPENAI_MODEL)
    result = model.transcribe(video_path)
    
    os.makedirs(SUBS_DIR, exist_ok=True)
    sub_relative_path = f"/subs/{movie_id}_{lang}.vtt"
    sub_full_path = os.path.join(SUBS_DIR, f"{movie_id}_{lang}.vtt")
    
    # Generate WebVTT Format instead of raw text
    with open(sub_full_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for segment in result.get("segments", []):
            start = format_timestamp(segment['start'])
            end = format_timestamp(segment['end'])
            text = segment['text'].strip()
            f.write(f"{start} --> {end}\n{text}\n\n")
            
    print(f"Subtitle accurately generated and saved to {sub_full_path}")
    return sub_relative_path

def update_react_database(movie_info, video_url, sub_path):
    """Update movies.json for our newly built React frontend"""
    data = []
    if os.path.exists(REACT_DATA_PATH):
        try:
            with open(REACT_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            pass

    new_movie = {
        'id': str(movie_info['id']), # Ensure string ID
        'title': movie_info['title'],
        'overview': movie_info['overview'],
        'release_date': movie_info['release_date'],
        'poster_path': movie_info.get('poster_path', ''),
        'backdrop_path': movie_info.get('backdrop_path', ''),
        'vote_average': movie_info.get('vote_average', 0),
        'video_url': video_url,
        'subtitle_file': sub_path,
        'is_local': True # Mark as a local AI processed movie
    }
    
    # Remove older version if duplicates exist
    data = [m for m in data if str(m['id']) != new_movie['id']]
    data.insert(0, new_movie) # Add to front

    os.makedirs(os.path.dirname(REACT_DATA_PATH), exist_ok=True)
    with open(REACT_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    print(f"React database successfully updated at {REACT_DATA_PATH}")

def process_new_movie(name, video_link, video_local_path=None):
    print(f"--- Processing: {name} ---")
    info = get_movie_data(name)
    
    if info:
        print(f"Found on TMDB: {info['title']}")
        movie_id = info['id']
        sub_path = ""
        
        # If a local video file is provided, generate proper accurate WebVTT subs!
        if video_local_path and os.path.exists(video_local_path):
            sub_path = generate_subtitles(video_local_path, movie_id, "en")
        else:
            print("No local video provided for whisper. Skipping subtitle generation.")
            sub_path = None

        update_react_database(info, video_link, sub_path)
        print("Successfully added to FlickFlow Application!\n")
    else:
        print(f"Could not find information for {name} on TMDB.")

if __name__ == "__main__":
    # Example Usage:
    # 1. Movie name
    # 2. Local network path or streaming URL
    # 3. Exact local path to generate subtitles from.
    # Note: If you don't have a local video yet, keep it as None
    
    # To test locally: process_new_movie("Avatar", "/videos/avatar.mp4", "./avatar_sample.mp4")
    print("Welcome to FlickFlow AI Engine")
    print("Modify the bottom of this script to run the processor with your local movies.")
