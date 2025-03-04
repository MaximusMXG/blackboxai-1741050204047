import { FaPlay, FaInfoCircle, FaGamepad, FaFilm } from 'react-icons/fa';

const IndieSection = () => {
  const categories = [
    {
      title: "Indie Games",
      items: [
        { id: 1, title: "Pixel Adventure", genre: "Platformer", creator: "Indie Studio A" },
        { id: 2, title: "Space Explorer", genre: "Adventure", creator: "Solo Dev B" },
        { id: 3, title: "Puzzle Master", genre: "Puzzle", creator: "Indie Team C" },
        { id: 4, title: "Retro RPG", genre: "RPG", creator: "Indie Studio D" },
      ]
    },
    {
      title: "Indie Films",
      items: [
        { id: 5, title: "Urban Stories", genre: "Drama", creator: "Director X" },
        { id: 6, title: "Nature's Call", genre: "Documentary", creator: "Studio Y" },
        { id: 7, title: "Digital Dreams", genre: "Sci-Fi", creator: "Creator Z" },
        { id: 8, title: "Life in Colors", genre: "Art Film", creator: "Artist W" },
      ]
    },
    {
      title: "Rising Stars",
      items: [
        { id: 9, title: "New Project 1", genre: "Experimental", creator: "New Studio A" },
        { id: 10, title: "New Project 2", genre: "Mixed Media", creator: "Artist B" },
        { id: 11, title: "New Project 3", genre: "Animation", creator: "Team C" },
        { id: 12, title: "New Project 4", genre: "Interactive", creator: "Creator D" },
      ]
    }
  ];

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
      {categories.map((category) => (
        <section key={category.title}>
          <h2 className="section-title">
            <span style={{ marginRight: '0.5rem' }}>
              {category.title === "Indie Games" ? <FaGamepad /> : <FaFilm />}
            </span>
            {category.title}
          </h2>
          <div className="content-grid">
            {category.items.map((item) => (
              <div key={item.id} className="card">
                <div style={{ 
                  aspectRatio: '16/9',
                  backgroundColor: '#2a2a2a',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '4rem 1rem 1rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                  }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem'
                    }}>
                      <span>{item.genre}</span>
                      <span>•</span>
                      <span>{item.creator}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default IndieSection;
