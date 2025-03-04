import { FaPlay, FaInfoCircle, FaHandHoldingUsd, FaRegClock, FaUsers } from 'react-icons/fa';

const CrowdfundingSection = () => {
  const categories = [
    {
      title: "Trending Projects",
      items: [
        { id: 1, title: "Next-Gen RPG", goal: "$500,000", funded: "80%", daysLeft: 15, backers: 3200 },
        { id: 2, title: "Indie Documentary", goal: "$50,000", funded: "65%", daysLeft: 20, backers: 850 },
        { id: 3, title: "Art Film Project", goal: "$25,000", funded: "45%", daysLeft: 25, backers: 420 },
        { id: 4, title: "Mobile Game", goal: "$100,000", funded: "90%", daysLeft: 5, backers: 1500 },
      ]
    },
    {
      title: "Almost Funded",
      items: [
        { id: 5, title: "VR Experience", goal: "$200,000", funded: "95%", daysLeft: 3, backers: 2100 },
        { id: 6, title: "Short Film Series", goal: "$30,000", funded: "88%", daysLeft: 7, backers: 600 },
        { id: 7, title: "Educational Game", goal: "$75,000", funded: "92%", daysLeft: 4, backers: 980 },
        { id: 8, title: "Animation Project", goal: "$150,000", funded: "85%", daysLeft: 10, backers: 1750 },
      ]
    },
    {
      title: "New Projects",
      items: [
        { id: 9, title: "Puzzle Game", goal: "$40,000", funded: "15%", daysLeft: 28, backers: 245 },
        { id: 10, title: "Music Documentary", goal: "$35,000", funded: "20%", daysLeft: 25, backers: 180 },
        { id: 11, title: "Interactive Story", goal: "$60,000", funded: "10%", daysLeft: 30, backers: 150 },
        { id: 12, title: "Board Game", goal: "$25,000", funded: "25%", daysLeft: 22, backers: 320 },
      ]
    }
  ];

  return (
    <div>
      {/* Featured Project Hero */}
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
              <FaHandHoldingUsd style={{ color: 'var(--primary-green)' }} />
              <span style={{ color: 'var(--primary-green)' }}>Featured Project</span>
            </div>
            <h1 style={{ 
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Next-Gen RPG
            </h1>
            <div style={{ 
              display: 'flex',
              gap: '2rem',
              marginBottom: '1rem'
            }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>80%</div>
                <div>Funded</div>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>$400,000</div>
                <div>of $500,000</div>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>15</div>
                <div>Days Left</div>
              </div>
            </div>
            <p style={{ 
              fontSize: '1rem',
              marginBottom: '2rem',
              color: 'var(--text-secondary)'
            }}>
              Support the development of a groundbreaking RPG that combines
              traditional gameplay with innovative mechanics and stunning visuals.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary">
                <FaHandHoldingUsd style={{ marginRight: '0.5rem' }} />
                Back Project
              </button>
              <button className="btn-secondary">
                <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Categories */}
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
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '4px', 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: item.funded, 
                          height: '100%', 
                          backgroundColor: 'var(--primary-green)'
                        }} />
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaRegClock />
                        <span>{item.daysLeft} days left</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaUsers />
                        <span>{item.backers} backers</span>
                      </div>
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

export default CrowdfundingSection;
