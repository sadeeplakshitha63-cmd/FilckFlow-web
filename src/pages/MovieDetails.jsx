import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieDetails } from '../services/api';
import { Play, Star, Calendar, Clock, Globe } from 'lucide-react';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMovieDetails(id);
        setMovie(data);
        setLoading(false);

        // Worldwide Dynamic SEO Injection
        if (data && (data.title || data.name)) {
          const mTitle = data.title || data.name;
          document.title = `Watch ${mTitle} Online Free (1080p) - FlickFlow`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.content = `Stream ${mTitle} without registration worldwide in HD, 1080p, and 4K on FlickFlow. ${data.overview ? data.overview.substring(0, 150) : ''}`;
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) return <div className="loader container">Loading Details...</div>;
  if (!movie) return <div className="loader container">Movie not found.</div>;

  const backdropStyle = {
    backgroundImage: `linear-gradient(to right, rgba(15, 12, 27, 1) 20%, rgba(15, 12, 27, 0.6) 100%), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
  };

  return (
    <div className="movie-details animate-fade-in">
      <div className="details-hero" style={backdropStyle}>
        <div className="container details-content">
          <div className="details-poster glass-panel">
             <img 
               src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
               alt={movie.title} 
             />
          </div>
          
          <div className="details-info">
            {movie.is_local && (
              <span className="badge" style={{ marginBottom: '12px' }}>
                <Globe size={14} className="inline mr-1"/> FlickFlow Feature
              </span>
            )}
            <h1 className="details-title">{movie.title || movie.name}</h1>
            <p className="details-tagline">{movie.tagline}</p>
            
            <div className="details-meta">
              <span className="meta-item">
                <Star size={18} color="var(--primary)" fill="currentColor" />
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="meta-item">
                <Calendar size={18} color="var(--text-muted)" />
                {(movie.release_date || movie.first_air_date)?.substring(0, 4)}
              </span>
              {movie.runtime && (
                <span className="meta-item">
                  <Clock size={18} color="var(--text-muted)" />
                  {movie.runtime} min
                </span>
              )}
            </div>

            <div className="genres">
              {movie.genres?.map(g => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <div className="overview-section">
              <h3>Overview</h3>
              <p>{movie.overview}</p>
            </div>

            <div className="ai-feature-highlight" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
               <Globe size={20} color="var(--text-muted)" />
               <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Available Worldwide in 1080p & 4K</span>
            </div>

            <Link to={`/play/${movie.id}`} className="btn-primary mt-4 details-play-btn">
              <Play fill="currentColor" size={24} />
              Watch Movie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
