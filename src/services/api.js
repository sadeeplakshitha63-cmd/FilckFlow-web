const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Commonly used public demo key for TMDB
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTrending = async () => {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch trending movies');
  const data = await res.json();
  return data.results;
};

export const fetchPopular = async () => {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch popular movies');
  const data = await res.json();
  return data.results;
};

export const fetchMovieDetails = async (id) => {
  // First get local movie status if it exists
  let localData = null;
  try {
    const localRes = await fetch('/movies.json');
    if (localRes.ok) {
      const localMovies = await localRes.json();
      localData = localMovies.find(m => String(m.id) === String(id));
      if (localData) {
         localData.is_local = true;
      }
    }
  } catch (e) {
    console.error("No local data found:", e);
  }

  // Check if it's TV or Movie
  const mediaType = localData?.media_type === 'tv' ? 'tv' : 'movie';
  let tmdbData = null;

  try {
     const res = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
     if (res.ok) {
        tmdbData = await res.json();
     }
  } catch (e) {}

  // If TMDB works, merge local attributes. If TMDB fails (e.g., incorrect type), fall back entirely to localData
  if (!tmdbData && !localData) throw new Error('Failed to fetch media details');
  
  const finalData = tmdbData || localData;
  
  if (localData) {
    finalData.is_local = true;
    finalData.video_url = localData.video_url;
    finalData.subtitle_file = localData.subtitle_file;
    finalData.media_type = localData.media_type || mediaType;
  }
  
  return finalData;
};

export const fetchLocalMovies = async () => {
  try {
    const res = await fetch('/movies.json');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};
