// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { CheckoutModal } from './Ticketcheckout';
import Navbar from './components/Navbar';
import { auth } from './firebase';

// ── OFFICIAL FIFA 2026 CLONE STYLES ──────────────────────────────────────────
const FIFA_CLONE_STYLES = `
  :root {
    --fifa-bg: #0a0b10;
    --fifa-card: #141622;
    --fifa-border: #23263b;
    --fifa-neon-magenta: #ff004c;
    --fifa-neon-cyan: #00d4ff;
    --fifa-neon-green: #00ff87;
    --fifa-purple: #4a00e0;
    --fifa-text: #ffffff;
    --fifa-text-muted: #8b8e9f;
  }
  
  body {
    background-color: var(--fifa-bg);
    color: var(--fifa-text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
  }

  .wc-app { 
    max-width: 1600px; 
    width: 96%; 
    margin: 0 auto; 
    padding-bottom: 4rem; 
  }

  .wc-hero {
    background: linear-gradient(135deg, rgba(74,0,224,0.2) 0%, rgba(255,0,76,0.1) 100%);
    border-bottom: 1px solid var(--fifa-border);
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .wc-hero-eyebrow {
    color: var(--fifa-neon-cyan);
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .wc-hero h1 {
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: -1px;
    line-height: 1.2; 
    padding-bottom: 10px; 
    background: linear-gradient(to right, #fff, #b3b3b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sales-phase-banner {
    background-color: rgba(255, 0, 76, 0.15);
    border: 1px solid var(--fifa-neon-magenta);
    color: var(--fifa-neon-magenta);
    padding: 10px 20px;
    border-radius: 4px;
    display: inline-block;
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  .wc-hero-pills {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  .wc-pill {
    background: var(--fifa-card);
    border: 1px solid var(--fifa-border);
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wc-live-dot {
    width: 8px; height: 8px;
    background-color: var(--fifa-neon-green);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--fifa-neon-green);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  .wc-filters {
    display: flex;
    gap: 0.5rem;
    padding: 2rem;
    overflow-x: auto;
    scrollbar-width: none;
    border-bottom: 1px solid var(--fifa-border);
    scroll-margin-top: 80px;
  }

  .wc-filter-btn {
    background: transparent;
    border: 1px solid var(--fifa-border);
    color: var(--fifa-text-muted);
    padding: 8px 16px;
    border-radius: 50px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .wc-filter-btn.active, .wc-filter-btn:hover {
    background: var(--fifa-text);
    color: var(--fifa-bg);
    border-color: var(--fifa-text);
    font-weight: 600;
  }

  .wc-filter-divider { width: 1px; background: var(--fifa-border); margin: 0 10px; }

  .wc-main { padding: 2rem; }
  .wc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
  .wc-section-label {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--fifa-neon-cyan);
    margin: 2rem 0 0.5rem 0;
    border-bottom: 1px solid var(--fifa-border);
    padding-bottom: 10px;
  }

  .wc-card {
    background: var(--fifa-card);
    border: 1px solid var(--fifa-border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.2s, border-color 0.2s;
  }

  .wc-card:not(.wc-card-played):hover {
    transform: translateY(-2px);
    border-color: var(--fifa-purple);
    box-shadow: 0 4px 20px rgba(74,0,224,0.15);
  }

  .wc-card-played {
    opacity: 0.6;
    background: rgba(20, 22, 34, 0.5);
  }

  .wc-card-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    border-right: 1px solid var(--fifa-border);
    padding-right: 1.5rem;
  }

  .wc-date-mon { font-size: 0.85rem; color: var(--fifa-text-muted); text-transform: uppercase; font-weight: bold; }
  .wc-date-num { font-size: 2rem; font-weight: 900; line-height: 1; margin: 5px 0; }
  .wc-date-day { font-size: 0.85rem; color: var(--fifa-text-muted); }

  .wc-card-body {
    flex: 1;
    padding: 0 2rem;
  }

  .wc-matchup {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .wc-team { display: flex; align-items: center; gap: 10px; }
  .wc-vs { font-size: 1rem; color: var(--fifa-text-muted); font-weight: 400; }
  .wc-score { background: var(--fifa-border); padding: 4px 12px; border-radius: 4px; font-variant-numeric: tabular-nums; }
  .wc-time { color: var(--fifa-neon-cyan); font-size: 1.1rem; }

  .wc-flag { width: 28px; height: 20px; border-radius: 3px; object-fit: cover; }
  .wc-flag-unknown { background: var(--fifa-border); display: inline-block; text-align: center; font-size: 12px; line-height: 20px; color: var(--fifa-text-muted); }

  .wc-meta { font-size: 0.9rem; color: var(--fifa-text-muted); display: flex; gap: 1rem; margin-bottom: 0.8rem; }
  
  .wc-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .wc-tag { padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
  .wc-tag-hot { background: rgba(255,0,76,0.1); color: var(--fifa-neon-magenta); border: 1px solid var(--fifa-neon-magenta); }
  .wc-tag-group { background: rgba(255,255,255,0.05); color: #ccc; }
  .wc-tag-knockout { background: rgba(0,212,255,0.1); color: var(--fifa-neon-cyan); border: 1px solid rgba(0,212,255,0.3); }

  .wc-btn {
    background: var(--fifa-purple);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.2s;
  }

  .wc-btn:hover { background: #5c00ff; }
  
  .wc-btn-played {
    background: transparent;
    border: 1px solid var(--fifa-border);
    color: var(--fifa-text-muted);
    cursor: not-allowed;
  }
`;

const ISO = {
  'Mexico':'mx','South Africa':'za','South Korea':'kr','Czechia':'cz',
  'Canada':'ca','Bosnia and Herzegovina':'ba','USA':'us','Paraguay':'py',
  'Qatar':'qa','Switzerland':'ch','Brazil':'br','Morocco':'ma','Haiti':'ht',
  'Scotland':'gb-sct','Australia':'au','Türkiye':'tr','Germany':'de',
  'Curaçao':'cw','Netherlands':'nl','Japan':'jp','Ivory Coast':'ci',
  'Ecuador':'ec','Sweden':'se','Tunisia':'tn','Spain':'es','Cape Verde':'cv',
  'Belgium':'be','Egypt':'eg','Saudi Arabia':'sa','Iran':'ir','New Zealand':'nz',
  'France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no','Argentina':'ar',
  'Algeria':'dz','Austria':'at','Jordan':'jo','Portugal':'pt','DR Congo':'cd',
  'England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa',
  'Uzbekistan':'uz','Colombia':'co','Uruguay':'uy','Bosnia & Herzegovina':'ba',
};

const getApiTeamName = (name) => {
  const aliases = {
    'South Korea': 'Korea Republic',
    'USA': 'United States',
    'Türkiye': 'Turkey',
    'Ivory Coast': "Cote D'Ivoire",
    'Bosnia & Herzegovina': 'Bosnia',
    'Bosnia and Herzegovina': 'Bosnia'
  };
  return aliases[name] || name;
};

const flagUrl = code => `https://img.vggcdn.net/broadway-icons/v2.21.0/flags/small/${code}.svg`;

const STAGE_LABELS = {
  R32:'Round of 32', R16:'Round of 16',
  QF:'Quarterfinals', SF:'Semifinals',
  '3P':'Third-place match', FINAL:'World Cup Final',
};

const FILTERS = [
  { key:'all',       label:'All matches' },
  { key:'upcoming',  label:'Upcoming' },
  { key:'played',    label:'Played' },
  { key:'_div' },
  { key:'USA',       label:'USA' },
  { key:'Mexico',    label:'Mexico' },
  { key:'Canada',    label:'Canada' },
  { key:'Brazil',    label:'Brazil' },
  { key:'England',   label:'England' },
  { key:'Argentina', label:'Argentina' },
  { key:'Germany',   label:'Germany' },
  { key:'France',    label:'France' },
  { key:'_div' },
  { key:'knockout',  label:'Knockout stage' },
];

function FlagImg({ team }) {
  const code = ISO[team];
  if (!code) return <span className="wc-flag wc-flag-unknown">?</span>;
  return (
    <img className="wc-flag" src={flagUrl(code)} alt={team}
      onError={e => { e.target.style.opacity = 0; }} />
  );
}

function Tag({ tag }) {
  return <span className={`wc-tag wc-${tag.c}`}>{tag.l}</span>;
}

function MatchCard({ match: m }) {
  const [checkout, setCheckout] = useState(false);
  const isKnown = name => !['TBD','Winner','Runner-up','Best'].some(x => name.startsWith(x));

  const handleSelectTickets = () => {
    if (!auth.currentUser) {
      alert("🔒 Authentication Required: Please log in or create a FIFA ID using the button in the top navigation bar before selecting tickets.");
      return; 
    }
    setCheckout(true); 
  };

  return (
    <li className={`wc-card${m.played ? ' wc-card-played' : ''}`}>
      <div className="wc-card-date">
        <span className="wc-date-mon">{m.date ? m.date.split(' ')[0] : 'TBD'}</span>
        <span className="wc-date-num">{m.num}</span>
        <span className="wc-date-day">{m.day}</span>
      </div>
      <div className="wc-card-body">
        <div className="wc-matchup">
          <span className="wc-team">
            {isKnown(m.t1) ? <FlagImg team={m.t1} /> : <span className="wc-flag wc-flag-unknown">?</span>}
            {m.t1}
          </span>
          <span className="wc-vs">vs.</span>
          <span className="wc-team">
            {isKnown(m.t2) ? <FlagImg team={m.t2} /> : <span className="wc-flag wc-flag-unknown">?</span>}
            {m.t2}
          </span>
          {m.played
            ? <span className="wc-score">{m.result || "Ended"}</span>
            : <span className="wc-time">{m.time || 'TBD'}</span>}
        </div>
        <div className="wc-meta">
          <span>{m.venue}</span><span>{m.city}</span>
        </div>
        <div className="wc-tags">
          {m.tags && m.tags.map((t, i) => <Tag key={i} tag={t} />)}
        </div>
      </div>
      <div className="wc-card-action">
        {m.played
          ? <button className="wc-btn wc-btn-played" disabled>Played</button>
          : <button className="wc-btn" onClick={handleSelectTickets}>Select Tickets</button>}
      </div>
      {checkout && <CheckoutModal match={m} onClose={() => setCheckout(false)} />}
    </li>
  );
}

function SectionLabel({ date, match }) {
  const prefix = match.played ? '✓ ' : '';
  const stageLabel = match.knockout && STAGE_LABELS[match.grp]
    ? `${STAGE_LABELS[match.grp]} — ` : '';
  return <li className="wc-section-label">{prefix}{stageLabel}{date}</li>;
}

// ── Main match listing page ──────────────────────────────────────────────────
function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBaseMatches = async () => {
      try {
        const response = await fetch('https://fifa-ticket-api-1.onrender.com/api/matches');
        if (!response.ok) throw new Error('Failed to fetch from backend');
        const data = await response.json();

        const monthMap = { Jun: 5, Jul: 6 };
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const processedMatches = data.map(m => {
          const dateStr = m.date || "TBD 0";
          const [mon, day] = dateStr.split(' ');
          if (monthMap[mon] !== undefined) {
            const matchDate = new Date(now.getFullYear(), monthMap[mon], parseInt(day), 0, 0, 0);
            if (matchDate < now) {
              return { ...m, played: true, result: m.result || "Ended" };
            }
          }
          return m;
        });

        setMatches(processedMatches);
        setIsLoading(false);
      } catch (err) {
        console.error("Backend fetch error:", err);
        setIsLoading(false);
      }
    };

    fetchBaseMatches();
  }, []);

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        const response = await fetch("https://v3.football.api-sports.io/fixtures?league=1&season=2026", {
          method: "GET",
          headers: {
            "x-apisports-key": "edd80e28bac87cfa81cd65a639e9db89",
            "Accept": "application/json"
          }
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.response && data.response.length > 0) {
          setMatches(currentMatches => currentMatches.map(m => {
            const apiTeam1 = getApiTeamName(m.t1);
            const apiTeam2 = getApiTeamName(m.t2);
            const liveMatch = data.response.find(apiMatch =>
              (apiMatch.teams.home.name.includes(apiTeam1) || apiMatch.teams.away.name.includes(apiTeam1)) &&
              (apiMatch.teams.home.name.includes(apiTeam2) || apiMatch.teams.away.name.includes(apiTeam2))
            );
            if (liveMatch) {
              const status = liveMatch.fixture.status.short;
              const isFinished = ['FT', 'AET', 'PEN'].includes(status);
              const isLive = ['1H', 'HT', '2H', 'ET', 'BT', 'P'].includes(status);
              let newTags = [...m.tags];
              if (isLive) {
                newTags = newTags.filter(t => t.c !== 'tag-hot');
                newTags.unshift({ l: `LIVE: ${liveMatch.fixture.status.elapsed}'`, c: 'tag-hot' });
              }
              return {
                ...m,
                played: isFinished || m.played,
                result: isFinished || isLive
                  ? `${liveMatch.goals.home ?? 0}–${liveMatch.goals.away ?? 0}`
                  : m.result,
                tags: newTags
              };
            }
            return m;
          }));
        }
      } catch (err) {
        console.error("API failed:", err);
      }
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    return matches.filter(m => {
      const searchOk = !q ||
        m.t1.toLowerCase().includes(q) ||
        m.t2.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        (m.grp && m.grp.toLowerCase().includes(q));
      let filterOk = true;
      if (activeFilter === 'upcoming')      filterOk = !m.played;
      else if (activeFilter === 'played')   filterOk = m.played;
      else if (activeFilter === 'knockout') filterOk = !!m.knockout;
      else if (activeFilter !== 'all')
        filterOk = m.t1.includes(activeFilter) || m.t2.includes(activeFilter);
      return searchOk && filterOk;
    });
  }, [matches, activeFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(m => {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date).push(m);
    });
    return map;
  }, [filtered]);

  return (
    <div className="wc-app">
      <Navbar search={search} onSearch={setSearch} />

      <div className="wc-hero">
        <div className="wc-hero-eyebrow">Official Ticketing Portal</div>
        <h1>FIFA World Cup 26™</h1>
        <div className="sales-phase-banner">
          ● SALES PHASE 2: LAST MINUTE SALES NOW OPEN
        </div>
        <p style={{ margin: 0, color: 'var(--fifa-text-muted)' }}>
          48 teams · 104 matches · USA, Canada &amp; Mexico
        </p>
        <div className="wc-hero-pills">
          <span className="wc-pill"><span className="wc-live-dot" />Live now</span>
          <span className="wc-pill"><b>16</b> Host Cities</span>
          <span className="wc-pill">Final: <b>Jul 19, New York New Jersey</b></span>
        </div>
      </div>

      <div className="wc-filters" id="explore">
        {FILTERS.map((f, i) =>
          f.key === '_div'
            ? <div key={i} className="wc-filter-divider" />
            : (
              <button key={f.key}
                className={`wc-filter-btn${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}>
                {f.label}
              </button>
            )
        )}
      </div>

      <main className="wc-main">
        <div className="wc-list-header" style={{ marginBottom: '1rem' }}>
          <span className="wc-count" style={{ color: 'var(--fifa-text-muted)' }}>
            {isLoading ? "Connecting to server..." : `Showing ${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`}
          </span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fifa-neon-cyan)' }}>
            Fetching live schedule from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fifa-text-muted)' }}>
            No matches found in this category.
          </div>
        ) : (
          <ul className="wc-list">
            {[...grouped.entries()].map(([date, matchesGroup]) => (
              <React.Fragment key={date}>
                <SectionLabel date={date} match={matchesGroup[0]} />
                {matchesGroup.map((m, i) => <MatchCard key={`${date}-${i}`} match={m} />)}
              </React.Fragment>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// ── Root: styles only, routing handled by main.jsx ───────────────────────────
export default function App() {
  return (
    <>
      <style>{FIFA_CLONE_STYLES}</style>
      <MatchesPage />
    </>
  );
}