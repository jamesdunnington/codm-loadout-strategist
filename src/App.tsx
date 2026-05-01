import { useState, useCallback, useEffect, useMemo } from 'react';
import { PlayMode, GeneratedLoadout, ElectronAPI } from './types';
import { generateLoadout, formatLoadoutForExport, getAllWeapons } from './engine/loadoutGenerator';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const modes: { id: PlayMode; label: string; desc: string; color: string }[] = [
  { id: 'rush', label: 'RUSH', desc: 'CQC King', color: '#00FF00' },
  { id: 'aggro', label: 'AGGRO', desc: 'Mid-Range Slayer', color: '#FFFF00' },
  { id: 'stealth', label: 'STEALTH', desc: 'Silent Killer', color: '#00ffff' },
  { id: 'tactical', label: 'TACTICAL', desc: 'Strategic Play', color: '#ff3333' },
];

const tierColors: Record<string, string> = {
  'S': '#00FF00',
  'A': '#FFFF00',
  'B': '#ff9933',
  'C': '#ff3333',
};

function App() {
  const [selectedMode, setSelectedMode] = useState<PlayMode>('rush');
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');
  const [loadout, setLoadout] = useState<GeneratedLoadout | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedLoadouts, setSavedLoadouts] = useState<GeneratedLoadout[]>([]);
  
  const allWeapons = useMemo(() => getAllWeapons(), []);

  useEffect(() => {
    const saved = localStorage.getItem('codm_saved_loadouts');
    if (saved) {
      try {
        setSavedLoadouts(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleGenerate = useCallback(() => {
    const newLoadout = generateLoadout(selectedMode, selectedWeapon || undefined);
    setLoadout(newLoadout);
    setCopied(false);
  }, [selectedMode, selectedWeapon]);

  const handleCopy = useCallback(async () => {
    if (!loadout) return;
    const text = formatLoadoutForExport(loadout);
    
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard(text);
    } else {
      navigator.clipboard.writeText(text);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [loadout]);

  const handleSave = useCallback(() => {
    if (!loadout) return;
    const updated = [loadout, ...savedLoadouts].slice(0, 10);
    setSavedLoadouts(updated);
    localStorage.setItem('codm_saved_loadouts', JSON.stringify(updated));
  }, [loadout, savedLoadouts]);

  const getTierBadgeStyle = (tier: string) => ({
    backgroundColor: tierColors[tier] || '#888',
    color: tier === 'S' ? '#000' : tier === 'A' ? '#000' : '#fff',
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>CODM LOADOUT STRATEGIST</h1>
        <p style={styles.subtitle}>TACTICAL LOADOUT GENERATION SYSTEM</p>
      </header>

      {/* Mode Selector */}
      <section style={styles.modeSection}>
        <h2 style={styles.sectionTitle}>SELECT SMART MODE</h2>
        <div style={styles.modeGrid}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                ...styles.modeBtn,
                borderColor: mode.color,
                backgroundColor: selectedMode === mode.id ? mode.color : '#2a2a2a',
                color: selectedMode === mode.id ? '#000' : '#fff',
                boxShadow: selectedMode === mode.id ? `4px 4px 0px ${mode.color}` : '4px 4px 0px #555',
              }}
            >
              <div style={styles.modeBtnLabel}>{mode.label}</div>
              <div style={styles.modeBtnDesc}>{mode.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Weapon Selector */}
      <section style={styles.weaponSection}>
        <h2 style={styles.sectionTitle}>SELECT WEAPON (OPTIONAL)</h2>
        <div style={styles.weaponSelectorContainer}>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            style={styles.weaponSelect}
            title="Select a specific weapon or leave as Random"
          >
            <option value="">RANDOM (Based on Mode)</option>
            {allWeapons.map((weapon) => (
              <option key={weapon.id} value={weapon.id}>
                [{weapon.tier}] {weapon.name}
              </option>
            ))}
          </select>
          {selectedWeapon && (
            <button
              onClick={() => setSelectedWeapon('')}
              style={styles.clearWeaponBtn}
            >
              CLEAR
            </button>
          )}
        </div>
        <p style={styles.weaponHint}>
          {selectedWeapon 
            ? 'Using selected weapon with mode-optimized attachments' 
            : 'Random weapon will be selected based on Smart Mode'}
        </p>
      </section>

      {/* Generate Button */}
      <section style={styles.generateSection}>
        <button 
          onClick={handleGenerate}
          style={styles.generateBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px #fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '6px 6px 0px #00FF00';
          }}
        >
          DEPLOY LOADOUT
        </button>
      </section>

      {/* Loadout Result */}
      {loadout && (
        <div style={styles.resultContainer} className="animate-slide-in">
          <div style={styles.loadoutCard}>
            {/* Weapon Header */}
            <div style={styles.weaponHeader}>
              <div style={styles.weaponInfo}>
                <span style={{...styles.tierBadge, ...getTierBadgeStyle(loadout.weapon.tier)}}>
                  {loadout.weapon.tier}-TIER
                </span>
                <h2 style={styles.weaponName}>{loadout.weapon.name}</h2>
                <span style={styles.modeTag}>{loadout.mode.toUpperCase()} BUILD</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {Object.entries(loadout.weapon.base_stats).map(([stat, value]) => (
                <div key={stat} style={styles.statItem}>
                  <div style={styles.statLabel}>{stat.toUpperCase()}</div>
                  <div style={styles.statBarContainer}>
                    <div 
                      style={{
                        ...styles.statBar,
                        width: `${value}%`,
                        backgroundColor: value > 75 ? '#00FF00' : value > 50 ? '#FFFF00' : '#ff3333',
                      }}
                    />
                  </div>
                  <div style={styles.statValue}>{value}</div>
                </div>
              ))}
            </div>

            {/* Attachments */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>ATTACHMENTS</h3>
              <div style={styles.attachmentsGrid}>
                {loadout.attachments.map((att, idx) => (
                  <div key={idx} style={styles.attachmentCard}>
                    <div style={styles.attachmentSlot}>{att.slot.toUpperCase()}</div>
                    <div style={styles.attachmentName}>{att.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>PERKS</h3>
              <div style={styles.perksGrid}>
                <div style={styles.perkCard}>
                  <div style={styles.perkColor} className="perk-red" />
                  <div style={styles.perkName}>{loadout.perks.red.name}</div>
                  <div style={styles.perkDesc}>{loadout.perks.red.description}</div>
                </div>
                <div style={styles.perkCard}>
                  <div style={styles.perkColor} className="perk-green" />
                  <div style={styles.perkName}>{loadout.perks.green.name}</div>
                  <div style={styles.perkDesc}>{loadout.perks.green.description}</div>
                </div>
                <div style={styles.perkCard}>
                  <div style={styles.perkColor} className="perk-blue" />
                  <div style={styles.perkName}>{loadout.perks.blue.name}</div>
                  <div style={styles.perkDesc}>{loadout.perks.blue.description}</div>
                </div>
              </div>
            </div>

            {/* Scorestreaks */}
            <div style={styles.section}>
              <h3 style={styles.sectionHeader}>SCORESTREAKS</h3>
              <div style={styles.streaksGrid}>
                {loadout.scorestreaks.map((streak, idx) => (
                  <div key={idx} style={styles.streakCard}>
                    <div style={styles.streakName}>{streak.name}</div>
                    <div style={styles.streakCost}>{streak.cost} PTS</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button 
                onClick={handleCopy}
                style={{
                  ...styles.actionBtn,
                  backgroundColor: copied ? '#00FF00' : '#FFFF00',
                }}
              >
                {copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
              </button>
              <button 
                onClick={handleSave}
                style={{
                  ...styles.actionBtn,
                  backgroundColor: '#2a2a2a',
                  color: '#00FF00',
                  border: '3px solid #00FF00',
                }}
              >
                SAVE LOADOUT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Loadouts */}
      {savedLoadouts.length > 0 && (
        <div style={styles.savedSection}>
          <h2 style={styles.sectionTitle}>SAVED LOADOUTS</h2>
          <div style={styles.savedList}>
            {savedLoadouts.map((saved, idx) => (
              <div key={idx} style={styles.savedItem}>
                <span style={styles.savedWeapon}>{saved.weapon.name}</span>
                <span style={styles.savedMode}>{saved.mode.toUpperCase()}</span>
                <span style={{...styles.savedTier, color: tierColors[saved.weapon.tier]}}>
                  {saved.weapon.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p>CODM Loadout Strategist v1.0 | Windows Edition</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    padding: '20px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  header: {
    textAlign: 'center',
    padding: '30px 20px',
    border: '3px solid #00FF00',
    boxShadow: '4px 4px 0px #00FF00',
    marginBottom: '30px',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#00FF00',
    margin: 0,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#888',
    marginTop: '10px',
    letterSpacing: '4px',
  },
  modeSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#fff',
    marginBottom: '15px',
    fontWeight: 800,
    letterSpacing: '2px',
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  modeBtn: {
    padding: '20px',
    border: '3px solid',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: '1rem',
    textTransform: 'uppercase',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  modeBtnLabel: {
    fontSize: '1.3rem',
  },
  modeBtnDesc: {
    fontSize: '0.8rem',
    fontWeight: 400,
    opacity: 0.8,
  },
  weaponSection: {
    marginBottom: '30px',
  },
  weaponSelectorContainer: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  weaponSelect: {
    flex: 1,
    minWidth: '250px',
    padding: '15px 20px',
    backgroundColor: '#1a1a1a',
    border: '3px solid #00FF00',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #00FF00',
    outline: 'none',
  },
  clearWeaponBtn: {
    padding: '15px 25px',
    backgroundColor: '#ff3333',
    color: '#fff',
    border: '3px solid #fff',
    fontWeight: 900,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    boxShadow: '4px 4px 0px #ff3333',
    transition: 'all 0.1s ease',
  },
  weaponHint: {
    marginTop: '15px',
    fontSize: '0.85rem',
    color: '#888',
    fontStyle: 'italic',
  },
  generateSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  generateBtn: {
    backgroundColor: '#00FF00',
    color: '#000',
    border: '3px solid #fff',
    boxShadow: '6px 6px 0px #00FF00',
    fontWeight: 900,
    fontSize: '1.5rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    padding: '20px 50px',
    transition: 'all 0.1s ease',
  },
  resultContainer: {
    marginBottom: '30px',
  },
  loadoutCard: {
    backgroundColor: '#1a1a1a',
    border: '3px solid #00FF00',
    boxShadow: '4px 4px 0px #00FF00',
    padding: '25px',
  },
  weaponHeader: {
    marginBottom: '25px',
  },
  weaponInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  tierBadge: {
    padding: '5px 15px',
    fontWeight: 900,
    fontSize: '0.9rem',
    letterSpacing: '2px',
  },
  weaponName: {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#fff',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  modeTag: {
    padding: '5px 15px',
    backgroundColor: '#2a2a2a',
    color: '#00FF00',
    fontWeight: 700,
    fontSize: '0.8rem',
    letterSpacing: '2px',
    border: '2px solid #00FF00',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: '#0a0a0a',
    border: '2px solid #2a2a2a',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  statBarContainer: {
    height: '8px',
    backgroundColor: '#2a2a2a',
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  statValue: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
  },
  section: {
    marginBottom: '25px',
  },
  sectionHeader: {
    fontSize: '1rem',
    color: '#00FF00',
    fontWeight: 900,
    letterSpacing: '3px',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #00FF00',
  },
  attachmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  attachmentCard: {
    backgroundColor: '#0a0a0a',
    border: '2px solid #2a2a2a',
    padding: '12px',
  },
  attachmentSlot: {
    fontSize: '0.7rem',
    color: '#00FF00',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '5px',
  },
  attachmentName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#fff',
  },
  perksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  perkCard: {
    backgroundColor: '#0a0a0a',
    border: '2px solid #2a2a2a',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  perkColor: {
    width: '30px',
    height: '4px',
  },
  perkName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase',
  },
  perkDesc: {
    fontSize: '0.8rem',
    color: '#888',
  },
  streaksGrid: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  streakCard: {
    backgroundColor: '#0a0a0a',
    border: '2px solid #FFFF00',
    padding: '15px 25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: '150px',
  },
  streakName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
  },
  streakCost: {
    fontSize: '0.8rem',
    color: '#FFFF00',
    fontWeight: 600,
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginTop: '25px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '15px 30px',
    fontWeight: 900,
    fontSize: '1rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: '3px solid #000',
    boxShadow: '4px 4px 0px #000',
    transition: 'all 0.1s ease',
    color: '#000',
  },
  savedSection: {
    marginTop: '30px',
    marginBottom: '30px',
  },
  savedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  savedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #2a2a2a',
    fontWeight: 600,
  },
  savedWeapon: {
    color: '#fff',
    fontSize: '1rem',
  },
  savedMode: {
    color: '#888',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  savedTier: {
    fontWeight: 900,
    fontSize: '1.2rem',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    borderTop: '2px solid #2a2a2a',
    color: '#555',
    fontSize: '0.8rem',
  },
};

export default App;
