import { useState, useEffect } from 'react';
import { fetchTrending, fetchPopular, fetchLocalMovies, fetchMovieDetails } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import { Play, Info, Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [localMovies, setLocalMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroTrailer, setHeroTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filterType, setFilterType] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterLang, setFilterLang] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        let localData = [];
        let trendingData = [];
        let popularData = [];
        
        try { localData = await fetchLocalMovies(); } catch (e) { console.error(e); }
        try { trendingData = await fetchTrending(); } catch (e) { console.error(e); }
        try { popularData = await fetchPopular(); } catch (e) { console.error(e); }
        
        setLocalMovies(localData || []);
        setTrending(trendingData || []);
        setPopular(popularData || []);
        
        // Pick a premium trending global blockbuster instead of the most recent local scrape
        let firstMovie = null;
        if (trendingData && trendingData.length > 0) {
            const topTrending = trendingData.slice(0, 10);
            firstMovie = topTrending[Math.floor(Math.random() * topTrending.length)];
        }
        
        // Fallback if TMDB trending is empty or blocked
        if (!firstMovie && localData && localData.length > 0) firstMovie = localData[0];
        
        setHeroMovie(firstMovie || null);
        setLoading(false);

        // Fetch Netflix-Style Background Trailer silently
        if (firstMovie) {
          try {
            const trailerData = await fetchMovieDetails(firstMovie.id);
            if (trailerData.videos && trailerData.videos.results) {
               const trailer = trailerData.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
               if (trailer) setHeroTrailer(trailer.key);
            }
          } catch (e) {
            console.error("Hero background trailer fetch failed.");
          }
        }
      } catch (error) {
        console.error("Critical error inside Home component:", error);
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  if (loading) return <div className="loader container">Loading amazing movies...</div>;
  if (!heroMovie) return null;

  const heroStyle = {
    backgroundImage: heroTrailer ? 'none' : `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`
  };

  // Derive unique years for dropdown
  const uniqueYears = [...new Set(localMovies
    .map(m => m.release_date?.substring(0, 4))
    .filter(Boolean)
  )].sort((a,b) => b-a);

  const filteredLocalMovies = localMovies.filter(movie => {
    if (filterType !== 'all' && movie.media_type !== filterType) return false;
    if (filterLang !== 'all' && movie.original_language !== filterLang) return false;
    if (filterYear !== 'all') {
      const year = movie.release_date?.substring(0, 4);
      if (year !== filterYear) return false;
    }
    if (filterGenre !== 'all') {
       if (!movie.genre_ids || !movie.genre_ids.includes(parseInt(filterGenre))) return false;
    }
    return true;
  });

  return (
    <div className="home animate-fade-in">
      <section className="hero" style={heroStyle}>
        
        {/* Netflix-Style Cinematic Background Trailer */}
        {heroTrailer && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${heroTrailer}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${heroTrailer}&modestbranding=1`}
              style={{
                 width: '100vw',
                 height: '56.25vw', /* 16:9 Aspect Ratio */
                 minHeight: '100vh',
                 minWidth: '177.77vh',
                 position: 'absolute',
                 top: '50%',
                 left: '50%',
                 transform: 'translate(-50%, -50%)',
                 pointerEvents: 'none',
                 border: 'none',
                 opacity: 0.7 /* Dimmed to allow text readability */
              }}
              allow="autoplay; encrypted-media"
              title="Cinematic Background Video"
            ></iframe>
          </div>
        )}

        <div className="container hero-content">
          <div className="hero-info">
            {heroMovie.is_local ? (
              <span className="badge"><Sparkles size={14} className="inline mr-1"/> FlickFlow Original</span>
            ) : (
              <span className="badge">#1 Trending This Week</span>
            )}
            <h1 className="hero-title">{heroMovie.title || heroMovie.name}</h1>
            <p className="hero-overview">{heroMovie.overview}</p>
            <div className="hero-actions">
              <Link to={`/play/${heroMovie.id}`} className="btn-primary">
                <Play fill="currentColor" size={20} />
                Watch Now
              </Link>
              <Link to={`/movie/${heroMovie.id}`} className="btn-secondary">
                <Info size={20} />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Filters & Display */}
      {localMovies.length > 0 && (
        <section className="container movie-section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            <h2 className="section-title" style={{ margin: '0' }}>FlickFlow Features</h2>
            
            <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', borderRadius: '12px' }}>
              <select className="select-dropdown" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
                 <option value="all">📺 All Types</option>
                 <option value="movie">🎬 Movies</option>
                 <option value="tv">📺 TV Series</option>
              </select>
              
              <select className="select-dropdown" value={filterGenre} onChange={e => setFilterGenre(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
                 <option value="all">🎨 All Genres</option>
                 <option value="28">🔥 Action</option>
                 <option value="18">🎭 Drama</option>
                 <option value="35">😂 Comedy</option>
                 <option value="27">👻 Horror</option>
                 <option value="10749">❤️ Romance</option>
              </select>

              <select className="select-dropdown" value={filterLang} onChange={e => setFilterLang(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
                 <option value="all">🌐 All Languages</option>
                 <option value="en">🇺🇸 English</option>
                 <option value="ko">🇰🇷 Korean</option>
                 <option value="ja">🇯🇵 Japanese</option>
                 <option value="zh">🇨🇳 Chinese</option>
                 <option value="th">🇹🇭 Thai</option>
                 <option value="si">🇱🇰 Sinhala</option>
              </select>

              <select className="select-dropdown" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
                 <option value="all">📅 All Years</option>
                 {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="movie-grid">
            {filteredLocalMovies.length > 0 ? (
               filteredLocalMovies.map((movie) => (
                 <MovieCard key={movie.id} movie={movie} />
               ))
            ) : (
               <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No movies match your filters.</div>
            )}
          </div>
        </section>
      )}

      {/* Movie Rows */}
      <section className="container movie-section">
        <h2 className="section-title">Trending Movies</h2>
        <div className="movie-grid">
          {trending.slice(1, 13).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="container movie-section">
        <h2 className="section-title">Popular Releases</h2>
        <div className="movie-grid">
          {popular.slice(0, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Global Community Section */}
      <section className="container movie-section" style={{ marginTop: '60px', paddingBottom: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Join <span style={{ color: 'var(--primary)' }}>432 Million</span> Active Users</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            FlickFlow is the world's fastest-growing premium streaming platform. See what our global community of over 10 Million certified 5-star reviewers is saying right now.
          </p>
        </div>

        <div className="testimonials-grid">
          {[
            { name: 'Michael C.', email: 'mic***@gmail.com', text: 'Bro, this site is literally better than my actual Netflix subscription. The 4K streaming is insanely fast and no buffering at all. 10/10 recommend.' },
            { name: 'Isuri P.', email: 'isu***@yahoo.com', text: 'මම කාලෙක ඉඳලා හොය හොය හිටියෙ මෙහෙම සයිට් එකක්. සිංහල සබ් එක්කම සම්පූර්ණ movies බලන්න පුළුවන්. පට්ටම ලස්සන UI එකක් තියෙන්නේ! 🔥' },
            { name: 'Carlos R.', email: 'car***@hotmail.com', text: '¡Increíble! He estado buscando todos los episodios de mi serie favorita y aquí están en 1080p. La velocidad de carga es brutal.' },
            { name: 'Min-Jun K.', email: 'min***@naver.com', text: '최신 한국 드라마가 바로바로 올라와서 너무 좋아요! 끊김도 없고 화질도 최고입니다. 정말 잘 이용하고 있어요.' },
            { name: 'Elena S.', email: 'ele***@mail.ru', text: 'Amazing quality. The background video trailer on the homepage is such a premium touch. It feels like a multi-million dollar app.' },
            { name: 'Chen W.', email: 'che***@qq.com', text: '非常流畅的观看体验！没有任何弹出广告，简直是电影爱好者的天堂。强烈推荐给大家！' },
            { name: 'Rajesh M.', email: 'raj***@gmail.com', text: 'Watch any Hollywood movie with perfect translated subtitles instantly. Brilliant work FlickFlow.' },
            { name: 'Chathuranga D.', email: 'cha***@ymail.com', text: 'Server 1 එක අනිත් හැම එකටම වඩා speed. ෆෝන් එකෙත් කිසිම ලැග් එකක් නැතුව වැඩ. Thanks for this amazing site! 😍' }
          ].map((t, idx) => (
            <div key={idx} className="glass-panel testimonial-card">
               <div className="testimonial-header">
                  <div className="user-avatar">{t.name.charAt(0)}</div>
                  <div className="user-info">
                     <strong>{t.name}</strong>
                     <span className="user-email">{t.email}</span>
                  </div>
                  <div className="stars">★★★★★</div>
               </div>
               <p className="testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
