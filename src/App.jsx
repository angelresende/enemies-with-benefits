import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Search, 
  Tv, 
  ExternalLink, 
  RotateCcw, 
  ListFilter,
  Film,
  Sparkles,
  Info,
  X
} from 'lucide-react'

function App() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEpisode, setSelectedEpisode] = useState('All')
  const [activeVideo, setActiveVideo] = useState(null)

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/videos/enemies-with-benefits')
      if (!response.ok) {
        throw new Error('Não foi possível carregar os episódios da API.')
      }
      const data = await response.json()
      setVideos(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const getEpisodeLabel = (title) => {
    const epMatch = title.match(/ep\.?\s*(\d+)/i)
    if (epMatch) return `EP ${epMatch[1]}`
    if (title.toLowerCase().includes('special')) return 'Especial'
    return 'Outros'
  }

  const getEpisodesList = () => {
    const eps = new Set()
    videos.forEach(v => {
      eps.add(getEpisodeLabel(v.title))
    })

    return ['All', ...Array.from(eps).sort((a, b) => {
      if (a === 'Especial') return 1
      if (b === 'Especial') return -1
      if (a === 'Outros') return 1
      if (b === 'Outros') return -1
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numB - numA
    })]
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedEpisode === 'All' || getEpisodeLabel(video.title) === selectedEpisode
    return matchesSearch && matchesTab
  })

  const cleanTitle = (title) => {
    return title
      .replace(/\[Eng\s*Sub\]/gi, '')
      .replace(/\[ENG\s*SUB\]/gi, '')
      .replace(/ลัลล์ไม่ชอบไวน์/g, '')
      .replace(/Enemies\s*With\s*Benefits/gi, '')
      .replace(/\|/g, '')
      .trim()
  }

  // Helper to extract Part string (e.g., "[1/4]" or "Part 1")
  const getPartLabel = (title) => {
    const partMatch = title.match(/\[(\d+)\s*\/\s*(\d+)\]/)
    if (partMatch) {
      return `Parte ${partMatch[1]} de ${partMatch[2]}`
    }
    return ''
  }

  return (
    <div className="app-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-badge">
              <Sparkles className="icon-pulse" size={16} />
              GMMTV Series
            </span>
            <h1 className="header-title">
              Enemies With <span>Benefits</span>
            </h1>
            <p className="header-subtitle">
             Acompanhe todos os episódios oficiais e assista direto da plataforma.
            </p>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-num">{videos.length}</span>
              <span className="stat-label">Vídeos Disponíveis</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">
                {new Set(videos.map(v => getEpisodeLabel(v.title))).size}
              </span>
              <span className="stat-label">Episódios</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Controls Section */}
        <section className="controls-bar">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por episódio, parte ou palavra-chave..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button onClick={fetchVideos} className="refresh-btn" title="Atualizar lista">
            <RotateCcw size={18} className={loading ? "spin" : ""} />
            <span>Atualizar</span>
          </button>
        </section>

        {/* Filter Tabs */}
        {!loading && !error && videos.length > 0 && (
          <div className="tabs-container">
            <div className="tabs-list">
              {getEpisodesList().map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedEpisode(tab)}
                  className={`tab-item ${selectedEpisode === tab ? 'active' : ''}`}
                >
                  {tab === 'All' ? 'Todos os Episódios' : tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="status-container">
            <div className="loader"></div>
            <p className="status-text">Buscando os episódios mais recentes no YouTube...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="status-container error-state">
            <div className="error-icon-box">⚠️</div>
            <h3>Erro ao conectar com a API</h3>
            <p>{error}</p>
            <p className="error-tip">Certifique-se de que a API FastAPI (porta 8000) está rodando localmente.</p>
            <button onClick={fetchVideos} className="retry-btn">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="status-container empty-state">
            <Film size={48} className="empty-icon" />
            <h3>Nenhum vídeo encontrado</h3>
            <p>Não encontramos nenhum episódio correspondente aos filtros aplicados.</p>
            {(searchTerm || selectedEpisode !== 'All') && (
              <button 
                onClick={() => { setSearchTerm(''); setSelectedEpisode('All'); }} 
                className="retry-btn"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && filteredVideos.length > 0 && (
          <section className="video-grid">
            {filteredVideos.map((video) => {
              const epLabel = getEpisodeLabel(video.title)
              const partLabel = getPartLabel(video.title)
              const displayTitle = cleanTitle(video.title)

              return (
                <article key={video.video_id} className="video-card">
                  {/* Thumbnail Wrapper */}
                  <div className="card-thumb-wrapper" onClick={() => setActiveVideo(video)}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="card-thumb"
                      loading="lazy"
                    />
                    <div className="card-overlay">
                      <div className="play-button-circle">
                        <Play size={24} fill="currentColor" />
                      </div>
                    </div>
                    {/* Badge */}
                    <span className="card-badge">{epLabel}</span>
                  </div>

                  {/* Card Info */}
                  <div className="card-info">
                    <div className="card-meta">
                      {partLabel && <span className="card-part">{partLabel}</span>}
                    </div>
                    <h3 className="card-title" title={video.title}>
                      {displayTitle || video.title}
                    </h3>
                    
                    <div className="card-actions">
                      <button 
                        onClick={() => setActiveVideo(video)} 
                        className="btn-watch-now"
                      >
                        <Play size={14} fill="currentColor" />
                        Assistir
                      </button>
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.video_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-youtube-link"
                        title="Ver no YouTube"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Enemies With Benefits Hub. Desenvolvido para fãs.</p>
        <p className="footer-credits">Dados obtidos em tempo real via YouTube.</p>
      </footer>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-info">
                <span className="modal-badge">{getEpisodeLabel(activeVideo.title)}</span>
                <h3>{cleanTitle(activeVideo.title)}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveVideo(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-player-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="modal-iframe"
              ></iframe>
            </div>

            <div className="modal-footer">
              <Info size={16} />
              <span>Assista com Legenda em Inglês (Eng Sub) ativando a legenda do player do YouTube.</span>
              <a 
                href={`https://www.youtube.com/watch?v=${activeVideo.video_id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modal-external-link"
              >
                Abrir no YouTube <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
