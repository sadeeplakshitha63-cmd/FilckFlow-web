import { useState, useEffect } from 'react';
import { Server, Play, Trash2, ShieldCheck, Database, Tv, Film } from 'lucide-react';
import { fetchLocalMovies } from '../services/api';

const Admin = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [stats, setStats] = useState({ total: 0, tv: 0, movies: 0 });

  const loadData = async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/movies');
      if (resp.ok) {
          const data = await resp.json();
          setMovies(data);
          setStats({
              total: data.length,
              tv: data.filter(m => m.media_type === 'tv' || (!m.media_type && m.name)).length,
              movies: data.filter(m => m.media_type === 'movie' || (!m.media_type && !m.name)).length,
          });
      }
      setLoading(false);
    } catch (e) {
      console.error("Backend offline. Loading local JSON fallback.", e);
      // Fallback
      const fallback = await fetchLocalMovies();
      setMovies(fallback || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrape = async (type) => {
      setScrapeStatus(`Initializing ${type.toUpperCase()} Scraper Sequence... Please wait a few seconds.`);
      try {
          const res = await fetch(`http://localhost:3001/api/scrape/${type}`, { method: 'POST' });
          if (!res.ok) throw new Error("Scraper failed to run.");
          const data = await res.json();
          setScrapeStatus(`Success! ${type.toUpperCase()} Scraper finished fetching new content. Please reload the page.`);
          loadData();
      } catch (e) {
          setScrapeStatus(`Error connecting to backend: ${e.message}. Is your Node server running?`);
      }
  };

  const handleDelete = async (id, title) => {
      if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the database?`)) return;
      try {
          const res = await fetch(`http://localhost:3001/api/movies/${id}`, { method: 'DELETE' });
          if (res.ok) {
              setScrapeStatus(`Deleted "${title}" successfully.`);
              loadData();
          } else {
              alert("Failed to delete. Backend might be offline.");
          }
      } catch (e) {
          alert("Error: " + e.message);
      }
  };

  if (loading) return <div className="loader container">Authenticating Admin Session...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
         <ShieldCheck size={40} color="var(--primary)" />
         <h1 style={{ fontSize: '3rem', margin: 0, color: 'white', letterSpacing: '-1px' }}>Admin Command Center</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><Database size={20}/> Total Titles</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0', color: 'white' }}>{stats.total}</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #007aff' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><Tv size={20}/> TV Series</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0', color: 'white' }}>{stats.tv}</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #46d369' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}><Film size={20}/> Unique Movies</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0', color: 'white' }}>{stats.movies}</p>
          </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Server color="var(--primary)" /> Scraper Terminal
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Remotely trigger the backend bots to crawl external sites and auto-append content directly into your database perfectly formatted.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <button className="btn-primary" style={{ background: '#E50914' }} onClick={() => handleScrape('netflix')}>
                  <Play size={16} /> Fetch Netflix Top 200
              </button>
              <button className="btn-primary" style={{ background: '#3b82f6' }} onClick={() => handleScrape('kisskh')}>
                  <Play size={16} /> Fetch KissKH (Korean/Asian)
              </button>
              <button className="btn-primary" style={{ background: '#10b981' }} onClick={() => handleScrape('cinesubz')}>
                  <Play size={16} /> Fetch Cinesubz (Sinhala/World)
              </button>
          </div>
          
          {scrapeStatus && (
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', borderLeft: '4px solid #f5c518', fontFamily: 'monospace', color: '#f5c518' }}>
                  {">"} {scrapeStatus}
              </div>
          )}
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Database Manager</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>ID</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Poster</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Title</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Type</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Released</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.slice(0, 100).map(movie => {
                        const mType = movie.media_type || 'movie';
                        return (
                            <tr key={movie.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>{movie.id}</td>
                                <td style={{ padding: '12px' }}>
                                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt="poster" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{movie.title || movie.name}</td>
                                <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        background: mType === 'tv' ? 'rgba(0, 122, 255, 0.2)' : 'rgba(70, 211, 105, 0.2)',
                                        color: mType === 'tv' ? '#007aff' : '#46d369',
                                        fontWeight: '700'
                                    }}>
                                        {mType}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{movie.release_date}</td>
                                <td style={{ padding: '12px' }}>
                                    <button className="btn-icon" onClick={() => handleDelete(movie.id, movie.title || movie.name)} style={{ padding: '8px', background: 'rgba(229, 9, 20, 0.2)', color: 'var(--primary)', borderRadius: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>
          {movies.length > 100 && (
              <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>Showing top 100 recent entries. To fetch all, configure pagination.</p>
          )}
      </div>

    </div>
  );
};

export default Admin;
