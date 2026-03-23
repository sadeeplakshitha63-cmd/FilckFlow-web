import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const imagePath = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="card-link">
        <div className="image-wrapper">
          <img src={imagePath} alt={movie.title} loading="lazy" />
          <div className="overlay">
            <button className="play-btn">
              <Play size={24} fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="card-info">
          <h3 className="movie-title">{movie.title || movie.name}</h3>
          <div className="meta">
            <span className="rating">
              <Star size={14} fill="var(--primary)" color="var(--primary)" />
              {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
            <span className="year">
              {(movie.release_date || movie.first_air_date || '').substring(0, 4)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
