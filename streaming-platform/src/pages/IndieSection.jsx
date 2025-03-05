import { useState, useEffect } from 'react';
import { FaPlay, FaInfoCircle, FaGamepad, FaFilm } from 'react-icons/fa';
import VideoCard from '../components/common/VideoCard';
import api from '../services/api';

const IndieSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // TODO: Replace with actual user authentication
  const mockUserId = 1;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.video.getAll();
        const videoData = response.data;
        
        // Group videos by category
        const grouped = videoData.reduce((acc, video) => {
          const category = video.genre === 'Game' ? 'Indie Games' : 
                          video.genre === 'Film' ? 'Indie Films' : 'Rising Stars';
          
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(video);
          return acc;
        }, {});

        setVideos(Object.entries(grouped).map(([title, items]) => ({
          title,
          items
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load videos');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      {/* Featured Indie Content Hero */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ maxWidth: '600px' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(152, 251, 152, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              marginBottom: '1rem'
            }}>
              <FaGamepad style={{ color: 'var(--primary-green)' }} />
              <span style={{ color: 'var(--primary-green)' }}>Featured Indie Game</span>
            </div>
            <h1 style={{ 
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Pixel Adventure
            </h1>
            <p style={{ 
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)'
            }}>
              By Indie Studio A • Platformer • Single Player
            </p>
            <p style={{ 
              fontSize: '1rem',
              marginBottom: '2rem',
              color: 'var(--text-secondary)'
            }}>
              Embark on a nostalgic journey through beautifully crafted pixel art worlds.
              A love letter to classic platformers with modern game design.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary">
                <FaPlay style={{ marginRight: '0.5rem' }} />
                Play Demo
              </button>
              <button className="btn-secondary">
                <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                More Info
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Categories */}
      {videos.map((category) => (
        <section key={category.title}>
          <h2 className="section-title">
            <span style={{ marginRight: '0.5rem' }}>
              {category.title === "Indie Games" ? <FaGamepad /> : <FaFilm />}
            </span>
            {category.title}
          </h2>
          <div className="content-grid">
            {category.items.map((video) => (
              <VideoCard 
                key={video.id} 
                video={video}
                userId={mockUserId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default IndieSection;
