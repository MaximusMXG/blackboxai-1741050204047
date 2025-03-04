import { Link } from 'react-router-dom';
import { FaCrown, FaGamepad, FaHandHoldingUsd, FaPlay } from 'react-icons/fa';

const Home = () => {
  const featuredContent = [
    { id: 1, title: 'Featured Title 1', category: 'Mainstream', type: 'Movie' },
    { id: 2, title: 'Featured Title 2', category: 'Indie', type: 'Game' },
    { id: 3, title: 'Featured Title 3', category: 'Crowdfunding', type: 'Series' },
    { id: 4, title: 'Featured Title 4', category: 'Mainstream', type: 'Movie' },
  ];

  const trendingContent = [
    { id: 5, title: 'Trending Title 1', category: 'Indie', type: 'Game' },
    { id: 6, title: 'Trending Title 2', category: 'Mainstream', type: 'Movie' },
    { id: 7, title: 'Trending Title 3', category: 'Crowdfunding', type: 'Series' },
    { id: 8, title: 'Trending Title 4', category: 'Indie', type: 'Game' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ 
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>
              Your Entertainment, Sliced Just Right
            </h1>
            <p style={{ 
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: 'var(--text-secondary)'
            }}>
              Stream mainstream hits, discover indie gems, and support upcoming projects.
              All in one perfectly curated slice.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary">
                <FaPlay style={{ marginRight: '0.5rem' }} />
                Start Watching
              </button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section>
        <h2 className="section-title">Featured Content</h2>
        <div className="content-grid">
          {featuredContent.map((item) => (
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
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <h2 className="section-title">Trending Now</h2>
        <div className="content-grid">
          {trendingContent.map((item) => (
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
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '2rem 4rem' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <Link to="/mainstream" className="card" style={{ 
            padding: '2rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <FaCrown size={40} style={{ color: 'var(--primary-green)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Mainstream</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Experience blockbuster hits and popular content
            </p>
          </Link>

          <Link to="/indie" className="card" style={{ 
            padding: '2rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <FaGamepad size={40} style={{ color: 'var(--primary-green)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Indie</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Discover unique and innovative content
            </p>
          </Link>

          <Link to="/crowdfunding" className="card" style={{ 
            padding: '2rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <FaHandHoldingUsd size={40} style={{ color: 'var(--primary-green)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Crowdfunding</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Support and be part of upcoming projects
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
