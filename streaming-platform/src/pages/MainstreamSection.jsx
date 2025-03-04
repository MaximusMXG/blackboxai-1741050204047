import { FaPlay, FaInfoCircle } from 'react-icons/fa';

const MainstreamSection = () => {
  const categories = [
    {
      title: "Popular Movies",
      items: [
        { id: 1, title: "Movie Title 1", genre: "Action", year: "2024" },
        { id: 2, title: "Movie Title 2", genre: "Drama", year: "2024" },
        { id: 3, title: "Movie Title 3", genre: "Sci-Fi", year: "2024" },
        { id: 4, title: "Movie Title 4", genre: "Comedy", year: "2024" },
      ]
    },
    {
      title: "Trending TV Shows",
      items: [
        { id: 5, title: "Show Title 1", genre: "Drama", year: "2024" },
        { id: 6, title: "Show Title 2", genre: "Thriller", year: "2024" },
        { id: 7, title: "Show Title 3", genre: "Comedy", year: "2024" },
        { id: 8, title: "Show Title 4", genre: "Action", year: "2024" },
      ]
    },
    {
      title: "New Releases",
      items: [
        { id: 9, title: "New Title 1", genre: "Adventure", year: "2024" },
        { id: 10, title: "New Title 2", genre: "Horror", year: "2024" },
        { id: 11, title: "New Title 3", genre: "Romance", year: "2024" },
        { id: 12, title: "New Title 4", genre: "Mystery", year: "2024" },
      ]
    }
  ];

  return (
    <div>
      {/* Featured Content Hero */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ 
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Latest Blockbuster
            </h1>
            <p style={{ 
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)'
            }}>
              2024 • Action, Adventure • 2h 30m
            </p>
            <p style={{ 
              fontSize: '1rem',
              marginBottom: '2rem',
              color: 'var(--text-secondary)'
            }}>
              Experience the latest blockbuster with stunning visuals and an epic storyline
              that will keep you on the edge of your seat.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary">
                <FaPlay style={{ marginRight: '0.5rem' }} />
                Play Now
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
          <h2 className="section-title">{category.title}</h2>
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
                      <span>{item.year}</span>
                      <span>•</span>
                      <span>{item.genre}</span>
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

export default MainstreamSection;
