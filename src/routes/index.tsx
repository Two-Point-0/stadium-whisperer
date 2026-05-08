import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gaffer's Pick · Stadium Predictor" },
      { name: "description", content: "Predict scores, manage picks, rank Barcelona players game-by-game in the most immersive prediction stadium." },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap",
      } as any,
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap" }],
  }),
  component: Index,
});

/* ---------- Static data ---------- */
const SPORTS = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "american", name: "American FB", icon: "🏈" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "rugby", name: "Rugby", icon: "🏉" },
];
const LEAGUES = [
  { id: "epl", name: "Premier League", icon: "🏴" },
  { id: "laliga", name: "La Liga", icon: "🇪🇸" },
  { id: "ucl", name: "Champions League", icon: "🏆" },
  { id: "seriea", name: "Serie A", icon: "🇮🇹" },
  { id: "bundesliga", name: "Bundesliga", icon: "🇩🇪" },
  { id: "ligue1", name: "Ligue 1", icon: "🇫🇷" },
];
const FORMATIONS = [
  { id: "1v1", name: "1V1", desc: "Pick 1 league + 1 cup. Focused predictions, biggest XP multiplier (×1.0)." },
  { id: "2v2", name: "2V2", desc: "Two leagues + UCL. Balanced load (×1.4 XP)." },
  { id: "3v3", name: "3V3", desc: "Three leagues + UCL + UEL. Heavy schedule (×1.8 XP)." },
  { id: "all", name: "ALL-IN", desc: "Every major league. Max chaos, max points (×2.5 XP)." },
];
const CHIPS = [
  { id: "ss", code: "SS", icon: "🎯", name: "Star Striker", pts: 30, color: "#ffd700",
    fx: "3× points on your top pick", desc: "Triples the score awarded by your highest-rated prediction this gameweek.", how: "Tap PLAY before kick-off — applies to your single best pick of the GW." },
  { id: "tr", code: "TR", icon: "♻️", name: "Tactical Reset", pts: 15, color: "#00d4ff",
    fx: "Reshuffle picks free", desc: "Unlock and rewrite all locked predictions in this gameweek without earning yellow cards.", how: "Activate, then edit your locked predictions until kick-off." },
  { id: "fs", code: "FS", icon: "🛡️", name: "Full Squad", pts: 20, color: "#c8f400",
    fx: "Every bench prediction scores", desc: "Bench picks normally score half — Full Squad makes them score 100% for one GW.", how: "Activate before deadline; bench scoring runs at full weight." },
  { id: "og", code: "OG", icon: "⚡", name: "One-Off Gambit", pts: 25, color: "#9b59b6",
    fx: "Single GW power play", desc: "Doubles points on a single match of your choice during this gameweek.", how: "Pick your match in the predictions panel after activating." },
  { id: "ds", code: "DS", icon: "💎", name: "Double Stakes", pts: 40, color: "#e63946",
    fx: "Double next fixture points", desc: "Doubles the total points returned by your next selected live fixture, win or lose.", how: "Activate, then pick the live match you want doubled from the right panel." },
];

const BARCA_PLAYERS = [
  { n: 1, name: "Ter Stegen", pos: "GK" },
  { n: 2, name: "Koundé", pos: "RB" },
  { n: 4, name: "Araujo", pos: "CB" },
  { n: 15, name: "Christensen", pos: "CB" },
  { n: 3, name: "Balde", pos: "LB" },
  { n: 21, name: "De Jong", pos: "CM" },
  { n: 8, name: "Pedri", pos: "CM" },
  { n: 6, name: "Gavi", pos: "CM" },
  { n: 7, name: "Raphinha", pos: "RW" },
  { n: 9, name: "Lewandowski", pos: "ST" },
  { n: 27, name: "Yamal", pos: "LW" },
];

const BARCA_FIXTURES = [
  { gw: 14, opp: "Real Madrid", home: false, score: "2-1", res: "W" },
  { gw: 13, opp: "Sevilla", home: true, score: "3-0", res: "W" },
  { gw: 12, opp: "Atletico", home: false, score: "1-1", res: "D" },
  { gw: 11, opp: "Valencia", home: true, score: "4-1", res: "W" },
  { gw: 10, opp: "Girona", home: false, score: "0-2", res: "L" },
  { gw: 9, opp: "Betis", home: true, score: "2-0", res: "W" },
];

const LIVE_MATCHES = [
  { id: "m1", h: "Barcelona", a: "Real Madrid", hs: 2, as: 1, min: "78'", live: true, league: "La Liga" },
  { id: "m2", h: "Man City", a: "Liverpool", hs: 1, as: 1, min: "62'", live: true, league: "EPL" },
  { id: "m3", h: "Bayern", a: "Dortmund", hs: 0, as: 0, min: "34'", live: true, league: "Bundesliga" },
  { id: "m4", h: "PSG", a: "Marseille", hs: 0, as: 0, min: "20:00", live: false, league: "Ligue 1" },
  { id: "m5", h: "Inter", a: "Juventus", hs: 0, as: 0, min: "21:45", live: false, league: "Serie A" },
];

const TOP_SCORERS = [
  { name: "E. Haaland", club: "Man City", val: 18 },
  { name: "K. Mbappé", club: "Real Madrid", val: 16 },
  { name: "R. Lewandowski", club: "Barcelona", val: 14 },
  { name: "H. Kane", club: "Bayern", val: 13 },
];
const TOP_ASSISTS = [
  { name: "K. De Bruyne", club: "Man City", val: 11 },
  { name: "Pedri", club: "Barcelona", val: 9 },
  { name: "Bruno F.", club: "Man Utd", val: 8 },
];
const BALLON_DOR = [
  { name: "K. Mbappé", club: "Real Madrid", val: 92 },
  { name: "L. Yamal", club: "Barcelona", val: 88 },
  { name: "E. Haaland", club: "Man City", val: 86 },
];
const GOLDEN_BOY = [
  { name: "L. Yamal", club: "Barcelona", val: 95 },
  { name: "K. Güler", club: "Real Madrid", val: 84 },
  { name: "Endrick", club: "Real Madrid", val: 79 },
];

const STANDINGS_LALIGA = [
  { team: "Real Madrid", p: 14, w: 11, d: 2, l: 1, pts: 35 },
  { team: "Barcelona", p: 14, w: 10, d: 3, l: 1, pts: 33, me: true },
  { team: "Atletico", p: 14, w: 9, d: 3, l: 2, pts: 30 },
  { team: "Athletic", p: 14, w: 8, d: 3, l: 3, pts: 27 },
  { team: "Villarreal", p: 14, w: 7, d: 4, l: 3, pts: 25 },
  { team: "Sevilla", p: 14, w: 6, d: 4, l: 4, pts: 22 },
];
const STANDINGS_UCL = [
  { team: "Bayern", p: 5, w: 5, d: 0, l: 0, pts: 15 },
  { team: "Barcelona", p: 5, w: 4, d: 1, l: 0, pts: 13, me: true },
  { team: "Arsenal", p: 5, w: 4, d: 0, l: 1, pts: 12 },
  { team: "Real Madrid", p: 5, w: 3, d: 1, l: 1, pts: 10 },
];

const FRIEND_LEAGUES = [
  { name: "Workmates Pro", icon: "💼", sub: "8 players · 4th", pts: 412 },
  { name: "FC Lads", icon: "🍻", sub: "12 players · 2nd", pts: 412 },
  { name: "Family Cup", icon: "👨‍👩‍👧", sub: "6 players · 1st", pts: 412 },
  { name: "Office Champs", icon: "🏆", sub: "20 players · 7th", pts: 412 },
];

const ADS = ["NIKE", "ADIDAS", "EA SPORTS", "QATAR AIRWAYS", "VISA", "HEINEKEN", "LAYS", "PEPSI"];

/* ---------- Utility components ---------- */
function Seats({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="stand-inner">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="stand-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <span key={c} className={"sv " + (((r * cols + c) % 4 !== 1) ? "on" : "")} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Billboard({ reverse }: { reverse?: boolean }) {
  const cells = [...ADS, ...ADS];
  return (
    <div className="bb">
      <div className={"bb-inner " + (reverse ? "rv" : "go")}>
        {cells.map((t, i) => (
          <div className="bb-block" key={i} style={{ background: i % 2 ? "#0a0a0a" : "#000" }}>
            <span className="bb-text" style={{ color: i % 3 === 0 ? "#c8f400" : i % 3 === 1 ? "#fff" : "#ffd700" }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourtMarkings() {
  return (
    <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
      <g stroke="rgba(255,255,255,.6)" strokeWidth=".25" fill="none">
        {/* outer */}
        <rect x="2" y="2" width="56" height="96" />
        {/* halfway */}
        <line x1="2" y1="50" x2="58" y2="50" />
        <circle cx="30" cy="50" r="8" />
        <circle cx="30" cy="50" r=".6" fill="rgba(255,255,255,.6)" />
        {/* top penalty box */}
        <rect x="12" y="2" width="36" height="14" />
        <rect x="22" y="2" width="16" height="5" />
        <circle cx="30" cy="11" r=".5" fill="rgba(255,255,255,.6)" />
        <path d="M 22 16 A 8 8 0 0 0 38 16" />
        {/* bottom penalty box */}
        <rect x="12" y="84" width="36" height="14" />
        <rect x="22" y="93" width="16" height="5" />
        <circle cx="30" cy="89" r=".5" fill="rgba(255,255,255,.6)" />
        <path d="M 22 84 A 8 8 0 0 1 38 84" />
        {/* corner arcs */}
        <path d="M 2 4 A 2 2 0 0 0 4 2" />
        <path d="M 58 4 A 2 2 0 0 1 56 2" />
        <path d="M 2 96 A 2 2 0 0 1 4 98" />
        <path d="M 58 96 A 2 2 0 0 0 56 98" />
      </g>
      {/* GOALPOSTS top */}
      <g stroke="#fff" strokeWidth=".5" fill="none" strokeLinecap="square">
        <line x1="26" y1="2" x2="26" y2="0" />
        <line x1="34" y1="2" x2="34" y2="0" />
        <line x1="26" y1="0" x2="34" y2="0" />
        {/* net hatch */}
        <line x1="26" y1="0" x2="34" y2="2" stroke="rgba(255,255,255,.35)" strokeWidth=".18" />
        <line x1="34" y1="0" x2="26" y2="2" stroke="rgba(255,255,255,.35)" strokeWidth=".18" />
      </g>
      {/* GOALPOSTS bottom */}
      <g stroke="#fff" strokeWidth=".5" fill="none" strokeLinecap="square">
        <line x1="26" y1="98" x2="26" y2="100" />
        <line x1="34" y1="98" x2="34" y2="100" />
        <line x1="26" y1="100" x2="34" y2="100" />
        <line x1="26" y1="100" x2="34" y2="98" stroke="rgba(255,255,255,.35)" strokeWidth=".18" />
        <line x1="34" y1="100" x2="26" y2="98" stroke="rgba(255,255,255,.35)" strokeWidth=".18" />
      </g>
    </svg>
  );
}

/* ---------- Main component ---------- */
function Index() {
  const [roofOpen, setRoofOpen] = useState(false);
  const [roofAnim, setRoofAnim] = useState<"open" | "closed" | "opening" | "closing">("closed");
  const [points, setPoints] = useState(412);
  const [ptsFloat, setPtsFloat] = useState<{ id: number; v: number } | null>(null);

  const [sport, setSport] = useState(SPORTS[0]);
  const [league, setLeague] = useState(LEAGUES[1]); // La Liga
  const [popup, setPopup] = useState<null | "sport" | "league">(null);

  const [gw, setGw] = useState(14);
  const [formIdx, setFormIdx] = useState(0);
  const formation = FORMATIONS[formIdx];

  const [yellows, setYellows] = useState(2);
  const [reds, setReds] = useState(0);

  const [chipsUsed, setChipsUsed] = useState<Record<string, boolean>>({});
  const [chipFlash, setChipFlash] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<typeof CHIPS[number] | null>(null);
  const [chipTip, setChipTip] = useState<{ chip: typeof CHIPS[number]; x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string>("");
  const [editor, setEditor] = useState<null | { type: "gw" | "form" | "pred" | "pick"; id?: string }>(null);

  const [selectedMatch, setSelectedMatch] = useState(LIVE_MATCHES[0]);

  // predictions store: per match {h, a, locked}
  const [preds, setPreds] = useState<Record<string, { h: number; a: number; locked: boolean }>>({
    m1: { h: 2, a: 1, locked: true },
    m2: { h: 1, a: 2, locked: true },
    m3: { h: 1, a: 1, locked: false },
    m4: { h: 2, a: 0, locked: false },
    m5: { h: 1, a: 1, locked: false },
  });

  // season picks
  const [seasonPicks, setSeasonPicks] = useState({
    topScorer: "E. Haaland",
    topAssist: "K. De Bruyne",
    ballonDor: "L. Yamal",
    goldenBoy: "L. Yamal",
  });
  const [picksLocked, setPicksLocked] = useState({
    topScorer: true, topAssist: true, ballonDor: true, goldenBoy: false,
  });

  // ratings: barca players ratings per gw
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingGw, setRatingGw] = useState(14);
  const ratingFix = BARCA_FIXTURES.find((f) => f.gw === ratingGw) || BARCA_FIXTURES[0];

  // ball position simulation
  const [ball, setBall] = useState({ x: 50, y: 50 });
  useEffect(() => {
    if (roofOpen) return;
    const i = setInterval(() => {
      setBall({ x: 15 + Math.random() * 70, y: 12 + Math.random() * 76 });
    }, 1700);
    return () => clearInterval(i);
  }, [roofOpen]);

  const toggleRoof = () => {
    if (roofAnim === "opening" || roofAnim === "closing") return;
    if (roofOpen) {
      setRoofAnim("closing");
      setTimeout(() => { setRoofOpen(false); setRoofAnim("closed"); }, 540);
    } else {
      setRoofAnim("opening");
      setTimeout(() => { setRoofOpen(true); setRoofAnim("open"); }, 640);
    }
  };

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  const setRating = (gw: number, name: string, v: number) => {
    setRatings((r) => ({ ...r, [`${gw}-${name}`]: v }));
  };

  const useChip = (id: string) => {
    if (chipsUsed[id]) return;
    const chip = CHIPS.find(c => c.id === id)!;
    setChipsUsed({ ...chipsUsed, [id]: true });
    setChipFlash(id);
    setActiveChip(chip);
    showToast(`${chip.icon} ${chip.name} activated · +${chip.pts} pts`);
    setPoints(p => p + chip.pts);
    setPtsFloat({ id: Date.now(), v: chip.pts });
    setTimeout(() => setPtsFloat(null), 1100);
    setTimeout(() => setChipFlash(null), 900);
    setTimeout(() => setActiveChip(null), 2600);
  };

  const togglePredLock = (mid: string) => {
    setPreds(p => {
      const cur = p[mid];
      if (cur.locked) {
        // unlock costs yellow
        setYellows(y => Math.min(y + 1, 5));
        showToast("Pick unlocked · +1 Yellow card");
      } else {
        showToast("Pick locked in");
      }
      return { ...p, [mid]: { ...cur, locked: !cur.locked } };
    });
  };

  const updatePred = (mid: string, side: "h" | "a", v: string) => {
    const n = Math.max(0, Math.min(20, parseInt(v) || 0));
    setPreds(p => ({ ...p, [mid]: { ...p[mid], [side]: n } }));
  };

  const togglePickLock = (key: keyof typeof picksLocked) => {
    setPicksLocked(p => {
      if (p[key]) { setYellows(y => Math.min(y + 1, 5)); showToast("Season pick unlocked · +1 Yellow"); }
      else showToast("Season pick locked");
      return { ...p, [key]: !p[key] };
    });
  };

  const cyclePick = (key: keyof typeof seasonPicks, list: { name: string }[]) => {
    if (picksLocked[key]) return;
    const cur = seasonPicks[key];
    const idx = list.findIndex(l => l.name === cur);
    const next = list[(idx + 1) % list.length];
    setSeasonPicks(s => ({ ...s, [key]: next.name }));
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="hdr">
        <span className="season-tag">SEASON 25/26</span>
        <h1 className="brand">GAFFER'S PICK</h1>
        <div className="pts-pill" title="Total points">
          <span className="pts-num">{points}</span>
          <span className="pts-lbl">PTS</span>
        </div>
        {ptsFloat && (
          <div style={{ position: "absolute", right: 80, top: 8, fontFamily: "var(--hd)", fontSize: "1.4rem", color: "var(--lime)", animation: "ptsUp 1.1s ease forwards" }}>
            +{ptsFloat.v}
          </div>
        )}
      </header>

      {/* BODY */}
      <div className="body">
        {/* LEFT PANEL — Container 3 */}
        <aside className="side-panel left">
          <div className="panel-scroll">
            <div className="sec">⚙ Predict Center · This Week</div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", marginBottom: 5, lineHeight: 1.4 }}>
              Set GW, formation, and score picks. Tap any match card to simulate it on the pitch.
            </div>

            {/* GW scroll */}
            <div className="card">
              <div style={{ fontFamily: "var(--cd)", fontSize: ".44rem", color: "rgba(200,244,0,.5)", letterSpacing: "1.5px", marginBottom: 4 }}>GAME WEEK</div>
              <div className="gw-nav">
                <button className="gw-nav-btn" onClick={() => setGw(g => Math.max(1, g - 1))}>‹</button>
                <div className="gw-display">
                  <div className="gw-num">GW {gw}</div>
                  <div className="gw-pts-big">+{32 + (gw % 5) * 6}</div>
                  <div className="gw-meta">5 / 10 correct</div>
                </div>
                <button className="gw-nav-btn" onClick={() => setGw(g => Math.min(38, g + 1))}>›</button>
              </div>
            </div>

            {/* Formation scroll */}
            <div className="card">
              <div style={{ fontFamily: "var(--cd)", fontSize: ".44rem", color: "rgba(200,244,0,.5)", letterSpacing: "1.5px", marginBottom: 4 }}>FORMATION MODE</div>
              <div className="gw-nav">
                <button className="gw-nav-btn" onClick={() => setFormIdx(i => (i - 1 + FORMATIONS.length) % FORMATIONS.length)}>‹</button>
                <div className="form-display">
                  <div className="form-name">{formation.name}</div>
                  <div className="form-desc">{formation.desc}</div>
                </div>
                <button className="gw-nav-btn" onClick={() => setFormIdx(i => (i + 1) % FORMATIONS.length)}>›</button>
              </div>
            </div>

            {/* Cards tracker */}
            <div className="sec" style={{ marginTop: 8 }}>🟨 Discipline</div>
            <div className="card-tracker">
              <span className="card-lbl">YELLOW</span>
              <div className="ycards-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={"ycard-pip " + (i < yellows ? "earned" : "")} />
                ))}
              </div>
              <span style={{ fontFamily: "var(--hd)", fontSize: ".7rem", color: "var(--gold)" }}>{yellows}</span>
            </div>
            <div className="card-tracker">
              <span className="card-lbl">RED</span>
              <div className="ycards-row">
                {Array.from({ length: reds }).map((_, i) => <span key={i} className="rcard-pip" />)}
                {reds === 0 && <span style={{ fontFamily: "var(--cd)", fontSize: ".42rem", color: "var(--sub)" }}>None — clean run</span>}
              </div>
              <span style={{ fontFamily: "var(--hd)", fontSize: ".7rem", color: "var(--red)" }}>{reds}</span>
            </div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", padding: "3px 6px" }}>
              5 yellows = 1 GW ban · 1 red = 2 GW ban
            </div>

            <div className="divr" />

            {/* Goal predictions */}
            <div className="sec">⚽ Match Predictions · GW {gw}</div>
            {LIVE_MATCHES.map((m) => {
              const p = preds[m.id];
              return (
                <div className={"pred-card " + (selectedMatch.id === m.id ? "act" : "")} key={m.id} onClick={() => setSelectedMatch(m)}>
                  <div className="pc-head">
                    {m.live ? (
                      <span className="live-pill"><span className="live-dot" />LIVE {m.min}</span>
                    ) : (
                      <span className="pc-time">{m.min}</span>
                    )}
                    <span style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)" }}>{m.league}</span>
                  </div>
                  <div className="pc-teams">
                    <span className="pc-tn">{m.h}</span>
                    {m.live && <span className="pc-sc">{m.hs}-{m.as}</span>}
                    <span className="pc-tn a">{m.a}</span>
                  </div>
                  <div className="pred-row">
                    <span className="pred-lbl">YOUR PICK</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <input className="sinp" disabled={p.locked} value={p.h} onChange={(e) => updatePred(m.id, "h", e.target.value)} onClick={(e) => e.stopPropagation()} />
                      <span style={{ fontFamily: "var(--hd)", color: "var(--sub)" }}>-</span>
                      <input className="sinp" disabled={p.locked} value={p.a} onChange={(e) => updatePred(m.id, "a", e.target.value)} onClick={(e) => e.stopPropagation()} />
                      <button className={"lock-btn " + (p.locked ? "locked" : "unlocked")} onClick={(e) => { e.stopPropagation(); togglePredLock(m.id); }}>
                        {p.locked ? "🔒 LOCKED" : "🔓 UNLOCK"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* PITCH WRAP */}
        <main className="pitch-wrap">
          <Billboard />

          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            {/* left stand */}
            <div className="stand">
              <Seats rows={36} cols={6} />
            </div>

            {/* Sub chips column — OUTSIDE the pitch */}
            <div className="chip-rail left">
              <div className="chip-rail-title">CHIPS</div>
              {CHIPS.map((c) => {
                const used = !!chipsUsed[c.id];
                return (
                  <button
                    key={c.id}
                    className={"chip-btn " + (used ? "used " : "") + (chipFlash === c.id ? "flash" : "")}
                    style={{
                      borderColor: used ? "rgba(255,255,255,.08)" : `${c.color}55`,
                      background: used
                        ? "linear-gradient(160deg,rgba(0,0,0,.55),rgba(10,20,30,.7))"
                        : `linear-gradient(160deg,${c.color}1f,rgba(0,0,0,.6))`,
                    }}
                    onClick={() => useChip(c.id)}
                    onMouseEnter={(e) => {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setChipTip({ chip: c, x: r.right + 8, y: r.top });
                    }}
                    onMouseLeave={() => setChipTip(null)}
                  >
                    <span className="chip-icon">{c.icon}</span>
                    <span className="chip-code" style={{ color: c.color }}>{c.code}</span>
                    <span className="chip-pts">+{c.pts}</span>
                    {used && <span className="chip-st">USED</span>}
                  </button>
                );
              })}
            </div>

            {/* Chip hover tooltip */}
            {chipTip && (
              <div
                className="chip-tip"
                style={{
                  left: chipTip.x,
                  top: chipTip.y,
                  borderColor: `${chipTip.chip.color}88`,
                  boxShadow: `0 8px 28px ${chipTip.chip.color}33`,
                }}
              >
                <div className="ct-name" style={{ color: chipTip.chip.color }}>
                  {chipTip.chip.icon} {chipTip.chip.name}
                </div>
                <div className="ct-fx" style={{ color: chipTip.chip.color }}>{chipTip.chip.fx} · +{chipTip.chip.pts} pts</div>
                <div className="ct-desc">{chipTip.chip.desc}</div>
                <div className="ct-how">▸ {chipTip.chip.how}</div>
              </div>
            )}

            {/* COURT */}
            <div className="court-area">
              <div className="court-bg" />
              <CourtMarkings />

              {/* Active chip badge overlay (simulation) */}
              {activeChip && (
                <div className="chip-active-badge">
                  <span className="cab-icon">{activeChip.icon}</span>
                  <div>
                    <div className="cab-name">{activeChip.name}</div>
                    <div className="cab-pts">+{activeChip.pts} PTS APPLIED</div>
                  </div>
                </div>
              )}

              {/* Match HUD */}
              {!roofOpen && (
                <div className="match-hud">
                  <div className="hud-score-row">
                    <span className="hud-team">{selectedMatch.h}</span>
                    <span className="hud-score">{selectedMatch.hs} - {selectedMatch.as}</span>
                    <span className="hud-team">{selectedMatch.a}</span>
                  </div>
                  <div className="hud-status">{selectedMatch.live ? `LIVE · ${selectedMatch.min}` : `KICK-OFF ${selectedMatch.min}`} · {selectedMatch.league}</div>
                </div>
              )}

              {/* Ball */}
              {!roofOpen && selectedMatch.live && (
                <div className="ball" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} />
              )}

              {/* ROOF — covers the pitch when closed */}
              <div className={"roof " + roofAnim}>
                <div className="roof-half left">
                  <div className="roof-pane">
                    {/* CONTAINER 1 — Account / Favorite team */}
                    <div className="roof-pane-title">👤 Manager HQ <span className="num-badge">01</span></div>

                    <div className="acc-head">
                      <div className="acc-avatar">G</div>
                      <div style={{ flex: 1 }}>
                        <div className="acc-name">GAFFER_92</div>
                        <div className="acc-rank">Global Rank #14,288 · Top 3%</div>
                      </div>
                    </div>

                    <div className="stat3">
                      <div className="sc"><span className="sc-v">{points}</span><span className="sc-l">Total</span></div>
                      <div className="sc"><span className="sc-v">62</span><span className="sc-l">GW Best</span></div>
                      <div className="sc"><span className="sc-v">71%</span><span className="sc-l">Accuracy</span></div>
                    </div>

                    <div className="sec" style={{ marginTop: 6 }}>🔵🔴 Favorite · FC Barcelona</div>

                    {/* Fixture scroll */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                      <button className="gw-nav-btn" onClick={() => {
                        const i = BARCA_FIXTURES.findIndex(f => f.gw === ratingGw);
                        setRatingGw(BARCA_FIXTURES[(i + 1) % BARCA_FIXTURES.length].gw);
                      }}>‹</button>
                      <div className="form-display" style={{ padding: "4px 7px" }}>
                        <div style={{ fontFamily: "var(--hd)", fontSize: ".7rem", color: "var(--lime)" }}>GW {ratingFix.gw} · {ratingFix.home ? "vs" : "@"} {ratingFix.opp}</div>
                        <div style={{ fontFamily: "var(--cd)", fontSize: ".48rem", color: "var(--sub)" }}>Result {ratingFix.score} ({ratingFix.res === "W" ? "Win" : ratingFix.res === "D" ? "Draw" : "Loss"})</div>
                      </div>
                      <button className="gw-nav-btn" onClick={() => {
                        const i = BARCA_FIXTURES.findIndex(f => f.gw === ratingGw);
                        setRatingGw(BARCA_FIXTURES[(i - 1 + BARCA_FIXTURES.length) % BARCA_FIXTURES.length].gw);
                      }}>›</button>
                    </div>

                    {/* Fav team formation pitch */}
                    <div className="fav-pitch">
                      <div className="fav-overlay">
                        <div className="fav-row">{BARCA_PLAYERS.slice(8, 11).map(p => (
                          <div className="fav-pl" key={p.n}><div className="fav-dot">{p.n}</div><div className="fav-pname">{p.name}</div></div>
                        ))}</div>
                        <div className="fav-row">{BARCA_PLAYERS.slice(5, 8).map(p => (
                          <div className="fav-pl" key={p.n}><div className="fav-dot">{p.n}</div><div className="fav-pname">{p.name}</div></div>
                        ))}</div>
                        <div className="fav-row">{BARCA_PLAYERS.slice(1, 5).map(p => (
                          <div className="fav-pl" key={p.n}><div className="fav-dot">{p.n}</div><div className="fav-pname">{p.name}</div></div>
                        ))}</div>
                        <div className="fav-row">{BARCA_PLAYERS.slice(0, 1).map(p => (
                          <div className="fav-pl" key={p.n}><div className="fav-dot">{p.n}</div><div className="fav-pname">{p.name}</div></div>
                        ))}</div>
                      </div>
                    </div>

                    {/* Player ratings 1-10 */}
                    <div style={{ fontFamily: "var(--cd)", fontSize: ".46rem", color: "rgba(200,244,0,.5)", letterSpacing: "1.5px", marginBottom: 4 }}>RATE PLAYERS · GW {ratingGw}</div>
                    {BARCA_PLAYERS.map(p => {
                      const r = ratings[`${ratingGw}-${p.name}`] || 0;
                      return (
                        <div className="rate-row" key={p.name}>
                          <span className="rate-num">{p.n}</span>
                          <span className="rate-name">{p.name}</span>
                          <span className="rate-pos">{p.pos}</span>
                          <div className="stars">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <span key={i} className={"star " + (i < r ? "on" : "")} onClick={() => setRating(ratingGw, p.name, i + 1)}>★</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="roof-half right">
                  <div className="roof-pane">
                    {/* CONTAINER 4 — Standings + friend leagues */}
                    <div className="roof-pane-title">🏆 Standings <span className="num-badge">04</span></div>

                    <div style={{ fontFamily: "var(--cd)", fontSize: ".48rem", color: "var(--sub)", marginBottom: 6 }}>
                      Showing: <span style={{ color: "var(--lime)", fontWeight: 700 }}>{sport.name} · {league.name} · {formation.name}</span>
                    </div>

                    <div className="sec">📊 La Liga</div>
                    <table className="stbl">
                      <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
                      <tbody>
                        {STANDINGS_LALIGA.map((t, i) => (
                          <tr key={t.team} className={(i < 4 ? "t1 " : "") + (t.me ? "me" : "")}>
                            <td><span className={"pos-n " + (i < 4 ? "pos-g" : "")}>{i + 1}</span> <span className="t-nm">{t.team}</span></td>
                            <td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
                            <td style={{ fontFamily: "var(--hd)", color: "var(--lime)" }}>{t.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="divr" />

                    <div className="sec">🌍 Champions League</div>
                    <table className="stbl">
                      <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
                      <tbody>
                        {STANDINGS_UCL.map((t, i) => (
                          <tr key={t.team} className={(i < 2 ? "t1 " : "") + (t.me ? "me" : "")}>
                            <td><span className={"pos-n " + (i < 2 ? "pos-g" : "")}>{i + 1}</span> <span className="t-nm">{t.team}</span></td>
                            <td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
                            <td style={{ fontFamily: "var(--hd)", color: "var(--lime)" }}>{t.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="divr" />

                    <div className="sec">👥 Your Mini-Leagues</div>
                    {FRIEND_LEAGUES.map(l => (
                      <div className="league-item" key={l.name}>
                        <span className="league-icon">{l.icon}</span>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div className="league-name">{l.name}</div>
                          <div className="league-sub">{l.sub}</div>
                        </div>
                        <div className="league-pts">{l.pts}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>


            {/* right stand */}
            <div className="stand right">
              <Seats rows={36} cols={6} />
            </div>
          </div>

          <Billboard reverse />
        </main>

        {/* RIGHT PANEL — Container 2 */}
        <aside className="side-panel right">
          <div className="panel-scroll">
            {/* My Season snapshot — quick glance, deep view in roof Manager HQ */}
            <div className="sec">📈 My Season</div>
            <div className="card highlight" style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div className="acc-avatar" style={{ width: 28, height: 28, fontSize: ".9rem" }}>G</div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div className="acc-name" style={{ fontSize: ".78rem" }}>GAFFER_92</div>
                  <div className="acc-rank">Rank #14,288 · Top 3%</div>
                </div>
              </div>
              <div className="stat3">
                <div className="sc"><span className="sc-v">{points}</span><span className="sc-l">Total</span></div>
                <div className="sc"><span className="sc-v">62</span><span className="sc-l">GW Best</span></div>
                <div className="sc"><span className="sc-v">71%</span><span className="sc-l">Accuracy</span></div>
              </div>
              <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", textAlign: "center", marginTop: 4 }}>
                Open the roof for full Manager HQ ↑
              </div>
            </div>

            <div className="divr" />

            {/* Season picks vs actual leaders */}
            <div className="sec">🥇 Season Picks vs Reality</div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", marginBottom: 5, lineHeight: 1.4 }}>
              Lock in your season-long bets. Unlock costs 1 yellow card.
            </div>

            {[
              { key: "topScorer" as const, list: TOP_SCORERS, label: "Top Scorer" },
              { key: "topAssist" as const, list: TOP_ASSISTS, label: "Top Assists" },
              { key: "ballonDor" as const, list: BALLON_DOR, label: "Ballon d'Or" },
              { key: "goldenBoy" as const, list: GOLDEN_BOY, label: "Golden Boy" },
            ].map(({ key, list, label }) => (
              <div key={key} style={{ marginBottom: 7 }}>
                <div style={{ fontFamily: "var(--cd)", fontSize: ".42rem", color: "rgba(200,244,0,.5)", letterSpacing: "1.5px", marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{label.toUpperCase()}</span>
                  <button className={"lock-btn " + (picksLocked[key] ? "locked" : "unlocked")} onClick={() => togglePickLock(key)}>
                    {picksLocked[key] ? "🔒" : "🔓"}
                  </button>
                </div>
                {list.slice(0, 3).map((p, i) => (
                  <div className="stat-item" key={p.name}>
                    <span className="si-pos">{i + 1}</span>
                    <div className="si-info">
                      <div className="si-name">{p.name}</div>
                      <div className="si-club">{p.club} · {p.val}</div>
                    </div>
                    {seasonPicks[key] === p.name && <span className="si-pick">YOUR PICK</span>}
                  </div>
                ))}
                {!picksLocked[key] && (
                  <button className="gw-nav-btn" style={{ width: "100%", height: 18, marginTop: 2, fontSize: ".5rem" }} onClick={() => cyclePick(key, list)}>↻ Change pick</button>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* NAV */}
      <nav className="nav">
        <button className="nav-btn" onClick={() => setPopup(popup === "sport" ? null : "sport")}>
          <span className="nav-icon">{sport.icon}</span>
          <span className="nav-label">Sport</span>
          <span className="nav-sub">{sport.name}</span>
        </button>
        <button className={"roof-toggle " + (roofOpen ? "is-open" : "")} onClick={toggleRoof} aria-label={roofOpen ? "Close roof" : "Open roof"}>
          <span className="rt-arrows">
            <span className="rt-arrow up">▲</span>
            <span className="rt-arrow dn">▼</span>
          </span>
          <span className="rt-label">{roofOpen ? "Close Roof" : "Open Roof"}</span>
          <span className="rt-sub">{roofOpen ? "Hide HQ + Standings" : "View HQ + Standings"}</span>
        </button>
        <button className="nav-btn" onClick={() => setPopup(popup === "league" ? null : "league")}>
          <span className="nav-icon">{league.icon}</span>
          <span className="nav-label">League</span>
          <span className="nav-sub">{league.name}</span>
        </button>
      </nav>

      {/* Popups */}
      {popup && (
        <>
          <div className="pop-overlay" onClick={() => setPopup(null)} />
          <div className="pop-menu" style={popup === "sport" ? { left: 14 } : { right: 14 }}>
            {(popup === "sport" ? SPORTS : LEAGUES).map((it: any) => (
              <div key={it.id} className={"pop-item " + ((popup === "sport" ? sport.id : league.id) === it.id ? "sel" : "")}
                onClick={() => { popup === "sport" ? setSport(it) : setLeague(it); setPopup(null); showToast(`${it.name} selected`); }}>
                <span style={{ fontSize: "1rem" }}>{it.icon}</span> {it.name}
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
