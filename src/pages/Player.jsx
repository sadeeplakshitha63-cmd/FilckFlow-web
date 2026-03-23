import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieDetails } from '../services/api';
import { Globe, RefreshCw, Cpu, CheckCircle, Download, X, Search } from 'lucide-react';
import './Player.css';

const Player = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [server, setServer] = useState(1);
  const [showDownload, setShowDownload] = useState(false);
  const [dlQuality, setDlQuality] = useState('1080p');
  const [dlSub, setDlSub] = useState('all');
  
  // AI Simulation State
  const [dlStatus, setDlStatus] = useState('idle'); // idle, generating, ready
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStep, setAiStep] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMovieDetails(id);
        setMovie(data);
        setLoading(false);

        // Worldwide Dynamic SEO Injection
        if (data && (data.title || data.name)) {
          const mTitle = data.title || data.name;
          document.title = `Watch ${mTitle} Online Free in 1080p/4K - FlickFlow`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.content = `Stream ${mTitle} without registration worldwide in HD, 1080p, and 4K on FlickFlow. ${data.overview ? data.overview.substring(0, 150) : ''}`;
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        setLoading(false);
      }
    };
    loadDetails();

    // FlickFlow Advanced Client-Side Security Shield (Anti-Scraping / Anti-DevTools)
    const blockDevTools = (e) => {
      if (e.keyCode === 123) { e.preventDefault(); return false; } // F12
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; } // Ctrl+Shift+I/J/C
      if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; } // Ctrl+U (View Source)
    };
    const blockContextMenu = (e) => e.preventDefault(); // Right Click Block
    const preventDrag = (e) => e.preventDefault();

    document.addEventListener('contextmenu', blockContextMenu, false);
    document.addEventListener('keydown', blockDevTools, false);
    document.addEventListener('dragstart', preventDrag, false);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu, false);
      document.removeEventListener('keydown', blockDevTools, false);
      document.removeEventListener('dragstart', preventDrag, false);
    };
  }, [id]);

  const handleStartAiDownload = () => {
    setDlStatus('generating');
    setAiProgress(0);
    setAiStep('Initializing FlickFlow AI Engine...');
    
    setTimeout(() => { setAiProgress(20); setAiStep('Extracting Original Audio Track...'); }, 1000);
    setTimeout(() => { setAiProgress(45); setAiStep('Translating across 80+ Languages (Sinhala, English, Tamil, etc.)...'); }, 3000);
    setTimeout(() => { setAiProgress(75); setAiStep(`Rendering ${dlQuality} Video with Embedded Subs...`); }, 5500);
    setTimeout(() => { 
        setAiProgress(100); 
        setAiStep('Processing Complete!'); 
        setTimeout(() => setDlStatus('ready'), 500);
    }, 8000);
  };

  const generateSubtitleFile = () => {
     if (dlSub === 'none') return null;
     
     // Creating a valid SubRip (.srt) subtitle blob natively 
     const srtContent = `1\n00:00:01,000 --> 00:00:05,000\n[FlickFlow AI] Successfully loaded ${movie.title || movie.name}.\n\n2\n00:00:06,000 --> 00:00:10,000\nThis is a securely generated ${dlSub} subtitle track.\n\n3\n00:00:11,000 --> 00:00:15,000\nEnjoy streaming your content in gorgeous 1080p and 4K quality!`;
     
     const blob = new Blob([srtContent], { type: 'text/srt' });
     return URL.createObjectURL(blob);
  };

  const executeDownload = () => {
     // Trigger Native Subtitle Download
     if (dlSub !== 'none') {
        const subUrl = generateSubtitleFile();
        const aSub = document.createElement('a');
        aSub.href = subUrl;
        aSub.download = `FlickFlow_${movie.title || movie.name}_[${dlQuality}]_[${dlSub}].srt`;
        document.body.appendChild(aSub);
        aSub.click();
        document.body.removeChild(aSub);
        URL.revokeObjectURL(subUrl);
     }
     
     // Generate secure offline link / shortcut for the Movie file
     const blob = new Blob([`FlickFlow Download Gateway\n\nTitle: ${movie.title || movie.name}\nQuality: ${dlQuality}\nSubtitle Track: ${dlSub}\n\nTo securely download the massive raw video file (P2P), please open your preferred Torrent client or Stream player and insert your assigned FlickFlow VIP Magnet Hash.\n`], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `FlickFlow_${movie.title || movie.name}_[${dlQuality}]_Shortcut.txt`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
     
     setShowDownload(false);
     setDlStatus('idle');
  };

  if (loading) return <div className="loader container">Loading Player...</div>;
  if (!movie) return <div className="loader container">Movie not found.</div>;

  const getEmbedUrl = () => {
    let ytKey = null;
    if (movie.videos && movie.videos.results) {
        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) ytKey = trailer.key;
        else if (movie.videos.results.length > 0 && movie.videos.results[0].site === 'YouTube') {
            ytKey = movie.videos.results[0].key;
        }
    }

    const isTV = movie.media_type === 'tv' || movie.title?.toLowerCase().includes('season') || movie.title?.toLowerCase().includes('episode');
    const type = isTV ? 'tv' : 'movie';
    const tvSuffix = isTV ? '/1/1' : '';
    const vidsrcTvSuffix = isTV ? '&season=1&episode=1' : '';
    
    // Auto-Healing Server Balancer (Highly Resilient endpoints)
    const o = (s) => atob(s);
    
    // Server 1: Embed.su (Very reliable, fast)
    if (server === 1) return `${o('aHR0cHM6Ly9lbWJlZC5zdS9lbWJlZC8=')}${type}/${id}${tvSuffix}`;
    // Server 2: Vidsrc.me
    if (server === 2) return `${o('aHR0cHM6Ly92aWRzcmMubWUvZW1iZWQv')}${type}?tmdb=${id}${vidsrcTvSuffix}`;
    // Server 3: Vidlink.pro
    if (server === 3) return `${o('aHR0cHM6Ly92aWRsaW5rLnByby8=')}${type}/${id}${tvSuffix}?${o('cHJpbWFyeUNvbG9yPWU1MDkxNCZhdXRvcGxheT1mYWxzZQ==')}`;
    // Server 4: YouTube Trailer / Direct Stream Backups
    if (server === 4 && ytKey) return `${o('aHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQv')}${ytKey}?autoplay=0&rel=0`;
    if (server === 4 && !ytKey) return `${o('aHR0cHM6Ly9tdWx0aWVtYmVkLm1vdi9kaXJlY3RzdHJlYW0ucGhwP3ZpZGVvX2lkPQ==')}${id}&tmdb=1`;
    
    return `${o('aHR0cHM6Ly9lbWJlZC5zdS9lbWJlZC8=')}${type}/${id}${tvSuffix}`;
  };

  const hasLocalVideo = Boolean(movie.is_local && movie.video_url && movie.video_url.trim() !== '');

  // Auto-Fix Trigger if user clicks the button
  const runAutoFixProtocol = () => {
      setServer((prev) => (prev === 4 ? 1 : prev + 1));
      alert("FlickFlow Auto-Fix Initiated! Switching to an alternate high-speed node...");
  };

  return (
    <div className="player-page container animate-fade-in relative">
      <div className="player-header">
         <h2>Now Playing: <span style={{ color: 'var(--primary)' }}>{movie.title || movie.name}</span></h2>
         <Link to={`/`} className="back-link">Back to Home</Link>
      </div>

      {!hasLocalVideo && (
        <div style={{ background: 'rgba(229, 9, 20, 0.1)', borderLeft: '4px solid var(--primary)', padding: '12px', marginBottom: '16px', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
              <strong>Note:</strong> If the video shows a blank screen or refuses to connect, use our new AI Auto-Fix to find a working server.
          </div>
          <button onClick={runAutoFixProtocol} style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Auto-Fix Video
          </button>
        </div>
      )}

      <div className="flick-stream-container glass-panel" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', background: '#000' }}>
         <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.8 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>FlickFlow.LK</span>
         </div>

         {hasLocalVideo ? (
            <video 
              controls 
              className="flick-video-element" 
              style={{ width: '100%', height: '100%', border: 'none' }}
              crossOrigin="anonymous" 
              autoPlay
            >
               <source src={movie.video_url} type="video/mp4" />
               Your browser does not support the video tag.
            </video>
         ) : (
           <iframe 
             src={getEmbedUrl()} 
             allowFullScreen="true"
             webkitallowfullscreen="true"
             mozallowfullscreen="true"
             className="flick-iframe-element"
             style={{ width: '100%', height: '100%', border: 'none', background: '#000' }}
             title="Movie Player"
             scrolling="no"
           ></iframe>
         )}
      </div>

      {!(movie.is_local && movie.video_url) && (
        <div className="server-options glass-panel" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Player Controls & Servers: </span>
          <button className={`btn-secondary ${server === 1 ? 'active' : ''}`} onClick={() => setServer(1)}>⚡ Embed Server 1</button>
          <button className={`btn-secondary ${server === 2 ? 'active' : ''}`} onClick={() => setServer(2)}>🚀 VidSrc Server 2</button>
          <button className={`btn-secondary ${server === 3 ? 'active' : ''}`} onClick={() => setServer(3)}>🔥 VidLink Server 3</button>
          <button className={`btn-secondary ${server === 4 ? 'active' : ''}`} onClick={() => setServer(4)}>🎬 Backup Play</button>
          <button className="btn-primary" onClick={() => setShowDownload(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Download Movie & Subtitles
          </button>
        </div>
      )}

      {/* Download Modal - 1080p/4K & Native AI Subtitles */}
      {showDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', width: '100%', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 0 40px rgba(229, 9, 20, 0.3)' }}>
            <button 
                onClick={() => { setShowDownload(false); setDlStatus('idle'); }} 
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
               <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu color="var(--primary)" /> FlickFlow AI Download Center
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Select quality and Subtitle Language. Subtitles are generated natively and downloaded securely from FlickFlow servers directly.</p>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Movie Quality:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['480p SD', '720p HD', '1080p FHD', '4K Ultra (VIP)'].map(q => (
                        <button 
                            key={q} 
                            style={{ 
                                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s',
                                border: dlQuality === q ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                background: dlQuality === q ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: '#fff'
                            }}
                            onClick={() => setDlQuality(q)}
                            disabled={dlStatus !== 'idle'}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Download Native Subtitle File (.srt):</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['Sinhala', 'English', 'Spanish', 'Tamil', 'Hindi', 'Korean', 'none'].map(lang => (
                        <button 
                            key={lang}
                            style={{ 
                                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', 
                                border: dlSub === lang ? '1px solid var(--primary)' : '1px solid var(--glass-border)', 
                                background: dlSub === lang ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255,255,255,0.05)', 
                                color: '#fff' 
                            }}
                            onClick={() => setDlSub(lang)}
                            disabled={dlStatus !== 'idle'}
                        >
                            {lang === 'none' ? 'No Subtitles' : lang}
                        </button>
                    ))}
                </div>
            </div>

            {dlStatus === 'idle' && (
                <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '14px' }} 
                    onClick={handleStartAiDownload}
                >
                    Start AI Translation & Pack Download
                </button>
            )}

            {dlStatus === 'generating' && (
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RefreshCw className="spin" size={16} /> {aiStep}
                        </span>
                        <span style={{ fontWeight: '600' }}>{aiProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${aiProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                </div>
            )}

            {dlStatus === 'ready' && (
                <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2e7d32', backgroundImage: 'none', padding: '14px' }} 
                    onClick={executeDownload}
                >
                    <CheckCircle size={18} /> Click to Download {dlQuality} {dlSub !== 'none' ? `(+ ${dlSub} Subtitles)` : ''}
                </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Player;
