import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gaffer's Pick · Stadium Predictor" },
      { name: "description", content: "Predict scores, manage picks, rank players game-by-game in the most immersive prediction stadium." },
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
  { id: "f1", name: "Formula 1", icon: "🏎" },
];
const LEAGUES = [
  { id: "epl", name: "Premier League", icon: "🏴" },
  { id: "laliga", name: "La Liga", icon: "🇪🇸" },
  { id: "ucl", name: "Champions League", icon: "🏆" },
  { id: "seriea", name: "Serie A", icon: "🇮🇹" },
  { id: "bundesliga", name: "Bundesliga", icon: "🇩🇪" },
  { id: "ligue1", name: "Ligue 1", icon: "🇫🇷" },
];
/* League slot mode — locks how many leagues you predict the WHOLE season */
const MODES = [
  { id: "1v1", name: "1v1", desc: "Lock 1 league all season. Max focus, ×1.0 XP, biggest per-correct multiplier." },
  { id: "2v2", name: "2v2", desc: "Lock 2 leagues. Balanced spread, ×1.4 XP." },
  { id: "3v3", name: "3v3", desc: "Lock 3 leagues. Wide net, ×1.8 XP, smaller multiplier." },
];
/* Per-GW Tactic — adjusts scoring for that GW */
const TACTICS = [
  { id: "attack", name: "Attack", cls: "ack", desc: "+25% scorer pts · −25% clean-sheet pts" },
  { id: "balanced", name: "Balanced", cls: "bal", desc: "Flat scoring across the GW" },
  { id: "park", name: "Park-the-bus", cls: "", desc: "+50% on 0-0 / clean sheet · −25% on scorers" },
];

/* Chips: 8 charges each. 2 plays per GW; 3 plays during the final 5 GWs (34-38). */
const CHIPS = [
  { id: "sn", code: "SN", icon: "🎯", name: "Sniper Pick", pts: 35, color: "#ffd700",
    fx: "Exact scoreline = triple points", desc: "Nail the precise final score and your match points are tripled.", how: "Activate before kick-off — applies to your most confident scoreline pick of the GW." },
  { id: "rt", code: "RT", icon: "♻️", name: "Reset Tactics", pts: 15, color: "#00d4ff",
    fx: "Re-pick locked predictions free", desc: "Unlock and rewrite all locked score predictions for the GW without spending yellows.", how: "Activate, then edit any locked prediction until kick-off." },
  { id: "cs", code: "CS", icon: "🥅", name: "Clean Sheet Call", pts: 25, color: "#c8f400",
    fx: "Bonus if your team keeps shutout", desc: "Pick one team you predict will not concede. If they keep a clean sheet, you bag the bonus.", how: "Activate, then tap a team in any match card to mark them shutout." },
  { id: "hh", code: "HH", icon: "🔥", name: "Hat-Trick Hunter", pts: 40, color: "#e63946",
    fx: "Name a 3+ goal scorer", desc: "Pick a player you predict will score 3 or more goals in their next fixture for the maximum reward.", how: "Activate, then choose a player in the match HUD." },
  { id: "fl", code: "FL", icon: "🌐", name: "Full League Unlock", pts: 30, color: "#9b59b6",
    fx: "Unlock every league fixture this GW", desc: "Predict every game in your active league this GW (not just the top-5 cards) for extra accuracy points.", how: "Activate before the first kick-off — extra fixtures appear in Match Predictions." },
];

/* Per-sport data slice */
const SPORT_DATA: Record<string, any> = {
  football: {
    surface: "football",
    pitchLabel: "PITCH",
    matches: [
      { id: "m1", h: "Barcelona", a: "Real Madrid", hs: 2, as: 1, min: "78'", live: true, league: "La Liga" },
      { id: "m2", h: "Man City", a: "Liverpool", hs: 1, as: 1, min: "62'", live: true, league: "EPL" },
      { id: "m3", h: "Bayern", a: "Dortmund", hs: 0, as: 0, min: "34'", live: true, league: "Bundesliga" },
      { id: "m4", h: "PSG", a: "Marseille", hs: 0, as: 0, min: "20:00", live: false, league: "Ligue 1" },
      { id: "m5", h: "Inter", a: "Juventus", hs: 0, as: 0, min: "21:45", live: false, league: "Serie A" },
    ],
    /* Visible-but-locked unless Full GW Unlock chip is armed */
    lockedMatches: [
      { id: "lm1", h: "Brighton", a: "Brentford", hs: 0, as: 0, min: "17:30", live: false, league: "EPL" },
      { id: "lm2", h: "Getafe", a: "Cadiz", hs: 0, as: 0, min: "19:00", live: false, league: "La Liga" },
      { id: "lm3", h: "Lecce", a: "Empoli", hs: 0, as: 0, min: "18:30", live: false, league: "Serie A" },
      { id: "lm4", h: "Wolfsburg", a: "Mainz", hs: 0, as: 0, min: "15:30", live: false, league: "Bundesliga" },
    ],
    favTeam: "FC Barcelona",
    roster: [
      { id: "p1", n: 1, name: "Ter Stegen", pos: "GK" },
      { id: "p2", n: 2, name: "Koundé", pos: "RB" },
      { id: "p3", n: 4, name: "Araujo", pos: "CB" },
      { id: "p4", n: 15, name: "Christensen", pos: "CB" },
      { id: "p5", n: 3, name: "Balde", pos: "LB" },
      { id: "p6", n: 21, name: "De Jong", pos: "CM" },
      { id: "p7", n: 8, name: "Pedri", pos: "CM" },
      { id: "p8", n: 6, name: "Gavi", pos: "CM" },
      { id: "p9", n: 7, name: "Raphinha", pos: "RW" },
      { id: "p10", n: 9, name: "Lewandowski", pos: "ST" },
      { id: "p11", n: 27, name: "Yamal", pos: "LW" },
    ],
    seasonPicksLabels: { a: "Top Scorer", b: "Top Assist", c: "Ballon d'Or", d: "Golden Boy" },
    leaders: {
      a: [{ name: "E. Haaland", club: "Man City", val: 18 }, { name: "K. Mbappé", club: "Real Madrid", val: 16 }, { name: "R. Lewandowski", club: "Barcelona", val: 14 }, { name: "H. Kane", club: "Bayern", val: 13 }],
      b: [{ name: "K. De Bruyne", club: "Man City", val: 11 }, { name: "Pedri", club: "Barcelona", val: 9 }, { name: "Bruno F.", club: "Man Utd", val: 8 }],
      c: [{ name: "K. Mbappé", club: "Real Madrid", val: 92 }, { name: "L. Yamal", club: "Barcelona", val: 88 }, { name: "E. Haaland", club: "Man City", val: 86 }, { name: "Vinicius Jr", club: "Real Madrid", val: 84 }, { name: "R. Lewandowski", club: "Barcelona", val: 80 }, { name: "Bellingham", club: "Real Madrid", val: 78 }, { name: "K. De Bruyne", club: "Man City", val: 76 }, { name: "Saka", club: "Arsenal", val: 74 }, { name: "Rodri", club: "Man City", val: 72 }, { name: "Pedri", club: "Barcelona", val: 70 }],
      d: [{ name: "L. Yamal", club: "Barcelona", val: 95 }, { name: "K. Güler", club: "Real Madrid", val: 84 }, { name: "Endrick", club: "Real Madrid", val: 79 }],
    },
    standings: [
      { team: "Real Madrid", p: 14, w: 11, d: 2, l: 1, pts: 35 },
      { team: "Barcelona", p: 14, w: 10, d: 3, l: 1, pts: 33, me: true },
      { team: "Atletico", p: 14, w: 9, d: 3, l: 2, pts: 30 },
      { team: "Athletic", p: 14, w: 8, d: 3, l: 3, pts: 27 },
    ],
  },
  basketball: {
    surface: "basketball",
    pitchLabel: "COURT",
    matches: [
      { id: "b1", h: "Lakers", a: "Celtics", hs: 88, as: 92, min: "Q3 4:12", live: true, league: "NBA" },
      { id: "b2", h: "Warriors", a: "Nets", hs: 64, as: 60, min: "Q2 8:30", live: true, league: "NBA" },
      { id: "b3", h: "Bucks", a: "Heat", hs: 0, as: 0, min: "20:00", live: false, league: "NBA" },
      { id: "b4", h: "Suns", a: "Nuggets", hs: 0, as: 0, min: "21:30", live: false, league: "NBA" },
    ],
    favTeam: "LA Lakers",
    roster: [
      { id: "bp1", n: 23, name: "L. James", pos: "SF" },
      { id: "bp2", n: 3, name: "A. Davis", pos: "PF" },
      { id: "bp3", n: 1, name: "D'A. Russell", pos: "PG" },
      { id: "bp4", n: 5, name: "A. Reaves", pos: "SG" },
      { id: "bp5", n: 28, name: "R. Hachimura", pos: "PF" },
      { id: "bp6", n: 7, name: "G. Vincent", pos: "PG" },
      { id: "bp7", n: 12, name: "T. Prince", pos: "SF" },
    ],
    seasonPicksLabels: { a: "Scoring Leader", b: "Assists Leader", c: "MVP", d: "Rookie of Year" },
    leaders: {
      a: [{ name: "L. Doncic", club: "Mavs", val: 33 }, { name: "G. Antetokounmpo", club: "Bucks", val: 31 }, { name: "S. Curry", club: "Warriors", val: 29 }],
      b: [{ name: "T. Haliburton", club: "Pacers", val: 12 }, { name: "T. Young", club: "Hawks", val: 11 }],
      c: [{ name: "N. Jokic", club: "Nuggets", val: 96 }, { name: "G. Antetokounmpo", club: "Bucks", val: 92 }, { name: "L. Doncic", club: "Mavs", val: 90 }, { name: "S. Curry", club: "Warriors", val: 86 }, { name: "J. Tatum", club: "Celtics", val: 84 }],
      d: [{ name: "V. Wembanyama", club: "Spurs", val: 98 }, { name: "C. Holmgren", club: "Thunder", val: 86 }],
    },
    standings: [
      { team: "Celtics", p: 25, w: 21, d: 0, l: 4, pts: 21 },
      { team: "Nuggets", p: 25, w: 19, d: 0, l: 6, pts: 19 },
      { team: "Lakers", p: 25, w: 14, d: 0, l: 11, pts: 14, me: true },
    ],
  },
  american: {
    surface: "american",
    pitchLabel: "FIELD",
    matches: [
      { id: "a1", h: "Chiefs", a: "Bills", hs: 21, as: 17, min: "Q3 9:42", live: true, league: "NFL" },
      { id: "a2", h: "49ers", a: "Cowboys", hs: 14, as: 7, min: "Q2 2:11", live: true, league: "NFL" },
      { id: "a3", h: "Eagles", a: "Giants", hs: 0, as: 0, min: "Sun 18:00", live: false, league: "NFL" },
    ],
    favTeam: "Kansas City Chiefs",
    roster: [
      { id: "ap1", n: 15, name: "P. Mahomes", pos: "QB" },
      { id: "ap2", n: 87, name: "T. Kelce", pos: "TE" },
      { id: "ap3", n: 25, name: "C. McCaffrey", pos: "RB" },
      { id: "ap4", n: 11, name: "M. Hardman", pos: "WR" },
    ],
    seasonPicksLabels: { a: "Pass TDs Leader", b: "Rush Yds Leader", c: "MVP", d: "Off. Rookie" },
    leaders: {
      a: [{ name: "P. Mahomes", club: "Chiefs", val: 38 }, { name: "J. Allen", club: "Bills", val: 34 }],
      b: [{ name: "C. McCaffrey", club: "49ers", val: 1450 }, { name: "D. Henry", club: "Ravens", val: 1320 }],
      c: [{ name: "P. Mahomes", club: "Chiefs", val: 95 }, { name: "J. Allen", club: "Bills", val: 92 }, { name: "L. Jackson", club: "Ravens", val: 90 }],
      d: [{ name: "C. Stroud", club: "Texans", val: 90 }],
    },
    standings: [
      { team: "Chiefs", p: 12, w: 10, d: 0, l: 2, pts: 10, me: true },
      { team: "Bills", p: 12, w: 9, d: 0, l: 3, pts: 9 },
    ],
  },
  tennis: {
    surface: "tennis",
    pitchLabel: "COURT",
    matches: [
      { id: "t1", h: "C. Alcaraz", a: "J. Sinner", hs: 2, as: 1, min: "Set 4", live: true, league: "ATP Finals" },
      { id: "t2", h: "N. Djokovic", a: "D. Medvedev", hs: 1, as: 1, min: "Set 3", live: true, league: "ATP Finals" },
      { id: "t3", h: "I. Swiatek", a: "A. Sabalenka", hs: 0, as: 0, min: "14:00", live: false, league: "WTA Finals" },
    ],
    favTeam: "Carlos Alcaraz",
    roster: [
      { id: "tp1", n: 1, name: "C. Alcaraz", pos: "SP" },
      { id: "tp2", n: 2, name: "J. Sinner", pos: "SP" },
      { id: "tp3", n: 3, name: "N. Djokovic", pos: "SP" },
    ],
    seasonPicksLabels: { a: "Most Slams", b: "Most Aces", c: "Player of Year", d: "Newcomer" },
    leaders: {
      a: [{ name: "C. Alcaraz", club: "ESP", val: 2 }, { name: "J. Sinner", club: "ITA", val: 2 }],
      b: [{ name: "H. Hurkacz", club: "POL", val: 1100 }, { name: "T. Fritz", club: "USA", val: 980 }],
      c: [{ name: "J. Sinner", club: "ITA", val: 96 }, { name: "C. Alcaraz", club: "ESP", val: 94 }, { name: "N. Djokovic", club: "SRB", val: 88 }],
      d: [{ name: "J. Mensik", club: "CZE", val: 80 }],
    },
    standings: [
      { team: "Sinner", p: 65, w: 58, d: 0, l: 7, pts: 11000 },
      { team: "Alcaraz", p: 62, w: 54, d: 0, l: 8, pts: 9200, me: true },
    ],
  },
  cricket: {
    surface: "cricket",
    pitchLabel: "PITCH",
    matches: [
      { id: "c1", h: "India", a: "Australia", hs: 287, as: 142, min: "Day 3", live: true, league: "Test" },
      { id: "c2", h: "England", a: "Pakistan", hs: 198, as: 0, min: "Innings 1", live: true, league: "ODI" },
    ],
    favTeam: "India",
    roster: [
      { id: "cp1", n: 18, name: "V. Kohli", pos: "BAT" },
      { id: "cp2", n: 45, name: "R. Sharma", pos: "BAT" },
      { id: "cp3", n: 93, name: "J. Bumrah", pos: "BOWL" },
    ],
    seasonPicksLabels: { a: "Most Runs", b: "Most Wickets", c: "Player of Series", d: "Emerging" },
    leaders: {
      a: [{ name: "V. Kohli", club: "IND", val: 1240 }, { name: "S. Smith", club: "AUS", val: 980 }],
      b: [{ name: "J. Bumrah", club: "IND", val: 38 }, { name: "P. Cummins", club: "AUS", val: 33 }],
      c: [{ name: "J. Bumrah", club: "IND", val: 92 }, { name: "V. Kohli", club: "IND", val: 90 }],
      d: [{ name: "Y. Jaiswal", club: "IND", val: 84 }],
    },
    standings: [
      { team: "India", p: 8, w: 6, d: 1, l: 1, pts: 13, me: true },
      { team: "Australia", p: 8, w: 5, d: 1, l: 2, pts: 11 },
    ],
  },
  f1: {
    surface: "f1",
    pitchLabel: "CIRCUIT",
    matches: [
      { id: "f1p", h: "Practice", a: "Fastest Lap", hs: 0, as: 0, min: "Fri 14:30", live: false, league: "Bahrain GP · FP" },
      { id: "f1q", h: "Qualifying", a: "Pole Position", hs: 0, as: 0, min: "Sat 18:00", live: false, league: "Bahrain GP · Q" },
      { id: "f1r", h: "Race Day", a: "Grid 1-10", hs: 0, as: 0, min: "Sun 15:00", live: false, league: "Bahrain GP · R" },
    ],
    lockedMatches: [
      { id: "f2p", h: "Practice", a: "Fastest Lap", hs: 0, as: 0, min: "Fri 14:30", live: false, league: "Saudi GP · FP" },
      { id: "f2q", h: "Qualifying", a: "Pole Position", hs: 0, as: 0, min: "Sat 18:00", live: false, league: "Saudi GP · Q" },
    ],
    circuits: ["Bahrain", "Jeddah", "Melbourne", "Suzuka", "Shanghai", "Miami", "Imola", "Monaco", "Montréal", "Barcelona", "Spielberg", "Silverstone", "Budapest", "Spa", "Zandvoort", "Monza", "Baku", "Singapore", "Austin", "México City", "Interlagos", "Las Vegas", "Lusail", "Abu Dhabi"],
    favTeam: "Ferrari",
    roster: [
      { id: "fp1", n: 16, name: "C. Leclerc", pos: "DRV" },
      { id: "fp2", n: 55, name: "C. Sainz", pos: "DRV" },
      { id: "fp3", n: 1, name: "M. Verstappen", pos: "DRV" },
      { id: "fp4", n: 4, name: "L. Norris", pos: "DRV" },
      { id: "fp5", n: 44, name: "L. Hamilton", pos: "DRV" },
    ],
    seasonPicksLabels: { a: "Drivers' Champ", b: "Most Poles", c: "Constructors' Champ", d: "Rookie of Year" },
    leaders: {
      a: [{ name: "M. Verstappen", club: "Red Bull", val: 410 }, { name: "L. Norris", club: "McLaren", val: 360 }, { name: "C. Leclerc", club: "Ferrari", val: 320 }],
      b: [{ name: "M. Verstappen", club: "Red Bull", val: 9 }, { name: "L. Norris", club: "McLaren", val: 6 }],
      c: [{ name: "Red Bull", club: "AUT", val: 720 }, { name: "McLaren", club: "GBR", val: 680 }, { name: "Ferrari", club: "ITA", val: 640 }],
      d: [{ name: "O. Bearman", club: "Haas", val: 76 }],
    },
    standings: [
      { team: "Red Bull", p: 24, w: 16, d: 0, l: 8, pts: 720 },
      { team: "McLaren", p: 24, w: 12, d: 0, l: 12, pts: 680 },
      { team: "Ferrari", p: 24, w: 10, d: 0, l: 14, pts: 640, me: true },
    ],
  },
};

const FRIEND_LEAGUES = [
  { name: "Workmates Pro", icon: "💼", sub: "8 players · 4th", pts: 412 },
  { name: "FC Lads", icon: "🍻", sub: "12 players · 2nd", pts: 412 },
  { name: "Family Cup", icon: "👨‍👩‍👧", sub: "6 players · 1st", pts: 412 },
];

const SOCIALS = [
  { id: "ig", name: "Instagram", url: "https://instagram.com/", icon: "📸", color: "#E4405F" },
  { id: "x", name: "X / Twitter", url: "https://x.com/", icon: "🐦", color: "#1DA1F2" },
  { id: "tt", name: "TikTok", url: "https://tiktok.com/", icon: "🎵", color: "#fff" },
  { id: "yt", name: "YouTube", url: "https://youtube.com/", icon: "▶️", color: "#FF0000" },
  { id: "fb", name: "Facebook", url: "https://facebook.com/", icon: "👤", color: "#1877F2" },
];

/* Goalpost-stand video ads — embed YouTube clips muted, looping. */
const GOAL_ADS = [
  { id: "lays", brand: "LAY'S", color: "#FFD700", vid: "ux2ipWkyc6w", start: 23 },
  { id: "pepsi", brand: "PEPSI", color: "#004B93", vid: "bVIUEoP0fCs", start: 15 },
  { id: "gat", brand: "GATORADE", color: "#FF6600", vid: "D7jLvxtD86w", start: 7 },
];

/* ---------- Utility components ---------- */
function Seats({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="stand-inner">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="stand-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <span key={c} className="sv" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* Cycling YouTube billboard ad behind goal — auto rotates ads */
function GoalAd({ position }: { position: "top" | "bottom" }) {
  const [idx, setIdx] = useState(position === "top" ? 0 : 1);
  useEffect(() => {
    const i = setInterval(() => setIdx((v) => (v + 1) % GOAL_ADS.length), 12000);
    return () => clearInterval(i);
  }, []);
  const ad = GOAL_ADS[idx];
  const src = `https://www.youtube.com/embed/${ad.vid}?autoplay=1&mute=1&loop=1&playlist=${ad.vid}&controls=0&modestbranding=1&playsinline=1&start=${ad.start}&rel=0`;
  return (
    <div className={"goal-ad " + position} key={ad.id} style={{ borderColor: ad.color }}>
      <iframe
        title={ad.brand}
        src={src}
        allow="autoplay; encrypted-media"
        frameBorder={0}
        loading="lazy"
      />
      <div className="goal-ad-tag" style={{ color: ad.color }}>{ad.brand}</div>
    </div>
  );
}

function CourtMarkings({ surface }: { surface: string }) {
  if (surface === "basketball") {
    return (
      <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
        <g stroke="rgba(255,255,255,.7)" strokeWidth=".25" fill="none">
          <rect x="2" y="2" width="56" height="96" />
          <line x1="2" y1="50" x2="58" y2="50" />
          <circle cx="30" cy="50" r="6" />
          <rect x="22" y="2" width="16" height="14" />
          <rect x="22" y="84" width="16" height="14" />
          <circle cx="30" cy="14" r="4" />
          <circle cx="30" cy="86" r="4" />
          <path d="M 8 2 A 24 24 0 0 0 52 2" />
          <path d="M 8 98 A 24 24 0 0 1 52 98" />
        </g>
      </svg>
    );
  }
  if (surface === "tennis") {
    return (
      <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
        <g stroke="rgba(255,255,255,.85)" strokeWidth=".3" fill="none">
          <rect x="6" y="6" width="48" height="88" />
          <rect x="10" y="6" width="40" height="88" />
          <line x1="10" y1="50" x2="50" y2="50" strokeWidth=".5" />
          <line x1="10" y1="28" x2="50" y2="28" />
          <line x1="10" y1="72" x2="50" y2="72" />
          <line x1="30" y1="28" x2="30" y2="72" />
        </g>
      </svg>
    );
  }
  if (surface === "american") {
    return (
      <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
        <g stroke="rgba(255,255,255,.7)" strokeWidth=".25" fill="none">
          <rect x="2" y="2" width="56" height="96" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1="2" y1={10 + i * 10} x2="58" y2={10 + i * 10} />
          ))}
          <rect x="2" y="2" width="56" height="8" fill="rgba(200,244,0,.05)" />
          <rect x="2" y="90" width="56" height="8" fill="rgba(200,244,0,.05)" />
        </g>
      </svg>
    );
  }
  if (surface === "cricket") {
    return (
      <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
        <g stroke="rgba(255,255,255,.6)" strokeWidth=".2" fill="none">
          <ellipse cx="30" cy="50" rx="28" ry="46" />
          <ellipse cx="30" cy="50" rx="14" ry="22" />
          <rect x="27" y="40" width="6" height="20" fill="rgba(245,222,179,.4)" stroke="rgba(255,255,255,.7)" />
        </g>
      </svg>
    );
  }
  if (surface === "f1") {
    return (
      <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
        <g stroke="rgba(255,255,255,.7)" strokeWidth=".4" fill="none">
          <path d="M 10 90 Q 5 70 15 55 Q 25 45 20 30 Q 12 15 25 8 Q 40 4 50 18 Q 55 35 45 50 Q 38 65 48 80 Q 50 92 35 94 Z" stroke="rgba(255,255,255,.8)" strokeWidth=".5" />
          <line x1="10" y1="88" x2="14" y2="88" stroke="#fff" strokeWidth=".6" strokeDasharray=".6 .6" />
        </g>
      </svg>
    );
  }
  // football default
  return (
    <svg className="court-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
      <g stroke="rgba(255,255,255,.6)" strokeWidth=".25" fill="none">
        <rect x="2" y="2" width="56" height="96" />
        <line x1="2" y1="50" x2="58" y2="50" />
        <circle cx="30" cy="50" r="8" />
        <circle cx="30" cy="50" r=".6" fill="rgba(255,255,255,.6)" />
        <rect x="12" y="2" width="36" height="14" />
        <rect x="22" y="2" width="16" height="5" />
        <path d="M 22 16 A 8 8 0 0 0 38 16" />
        <rect x="12" y="84" width="36" height="14" />
        <rect x="22" y="93" width="16" height="5" />
        <path d="M 22 84 A 8 8 0 0 1 38 84" />
      </g>
      <g stroke="#fff" strokeWidth=".5" fill="none" strokeLinecap="square">
        <line x1="26" y1="2" x2="26" y2="0" />
        <line x1="34" y1="2" x2="34" y2="0" />
        <line x1="26" y1="0" x2="34" y2="0" />
        <line x1="26" y1="98" x2="26" y2="100" />
        <line x1="34" y1="98" x2="34" y2="100" />
        <line x1="26" y1="100" x2="34" y2="100" />
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
  const [league, setLeague] = useState(LEAGUES[1]);
  const [popup, setPopup] = useState<null | "sport" | "league">(null);

  const data = useMemo(() => SPORT_DATA[sport.id] || SPORT_DATA.football, [sport]);

  const [gw, setGw] = useState(14);
  const [modeIdx, setModeIdx] = useState(1); // 1v1 / 2v2 / 3v3
  const mode = MODES[modeIdx];
  const [tacticByGw, setTacticByGw] = useState<Record<number, string>>({});
  const tacticId = tacticByGw[gw] || "balanced";
  const tactic = TACTICS.find((t) => t.id === tacticId)!;
  const setTactic = (id: string) => setTacticByGw((m) => ({ ...m, [gw]: id }));

  /* Discipline cards: 3 yellows / 1 red / penalty counter */
  const [yellows, setYellows] = useState(3);
  const [reds, setReds] = useState(1);
  const [penalties, setPenalties] = useState(0);

  /* Chip charges + per-GW usage */
  const [chipCharges, setChipCharges] = useState<Record<string, number>>(() =>
    Object.fromEntries(CHIPS.map((c) => [c.id, 8]))
  );
  const [chipsByGw, setChipsByGw] = useState<Record<number, string[]>>({});
  const usedThisGw = chipsByGw[gw]?.length || 0;
  const maxThisGw = gw >= 34 ? 3 : 2; // last 5 GWs allow 3
  const [chipFlash, setChipFlash] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState<typeof CHIPS[number] | null>(null);
  const [chipTip, setChipTip] = useState<{ chip: typeof CHIPS[number]; x: number; y: number } | null>(null);

  const [toast, setToast] = useState<string>("");
  const [editor, setEditor] = useState<null | { type: string; id?: string; data?: any }>(null);

  const [selectedMatch, setSelectedMatch] = useState<any>(data.matches[0]);
  // re-sync when sport changes
  useEffect(() => { setSelectedMatch(data.matches[0]); }, [data]);

  // predictions per match (sport-scoped key)
  const [preds, setPreds] = useState<Record<string, { h: number; a: number; locked: boolean }>>({});
  useEffect(() => {
    setPreds((prev) => {
      const next = { ...prev };
      [...(data.matches || []), ...(data.lockedMatches || [])].forEach((m: any) => {
        if (!next[m.id]) next[m.id] = { h: 1, a: 1, locked: false };
      });
      return next;
    });
  }, [data]);

  // Full-GW unlock chip armed for current GW?
  const flUnlocked = (chipsByGw[gw] || []).includes("fl");

  // season picks per sport
  const [seasonPicks, setSeasonPicks] = useState<Record<string, any>>({});
  const [picksLocked, setPicksLocked] = useState<Record<string, any>>({});
  useEffect(() => {
    setSeasonPicks((prev) => prev[sport.id] ? prev : ({ ...prev, [sport.id]: {
      a: data.leaders.a[0]?.name, b: data.leaders.b[0]?.name, c: data.leaders.c[0]?.name, d: data.leaders.d[0]?.name,
    } }));
    setPicksLocked((prev) => prev[sport.id] ? prev : ({ ...prev, [sport.id]: { a: false, b: false, c: false, d: false } }));
  }, [sport, data]);
  const sp = seasonPicks[sport.id] || { a: "", b: "", c: "", d: "" };
  const sl = picksLocked[sport.id] || { a: false, b: false, c: false, d: false };

  /* Ballon d'Or (or sport equivalent C-pick) deeper picks */
  const bdoUnlocked = gw >= 19;
  const [bdoTop3, setBdoTop3] = useState<Record<string, string[]>>({}); // gold/silver/bronze
  const [bdoOthers, setBdoOthers] = useState<Record<string, string[]>>({}); // up to 7 more
  const top3 = bdoTop3[sport.id] || [];
  const others = bdoOthers[sport.id] || [];

  /* Per-player ratings: { sportId: { playerId: { gw: 1-10 } } } */
  const [ratings, setRatings] = useState<Record<string, Record<string, Record<number, number>>>>({});
  const [ratingGw, setRatingGw] = useState(14);

  // ball position
  const [ball, setBall] = useState({ x: 50, y: 50 });
  useEffect(() => {
    if (roofOpen) return;
    const i = setInterval(() => setBall({ x: 15 + Math.random() * 70, y: 12 + Math.random() * 76 }), 1700);
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

  /* Arm/disarm a chip for the current GW. Per-GW limit: 2 (3 in GW 34-38). */
  const armChip = (id: string) => {
    const chip = CHIPS.find((c) => c.id === id)!;
    const armed = chipsByGw[gw] || [];
    const isArmed = armed.includes(id);
    if (isArmed) {
      // disarm — refund the charge
      setChipsByGw((m) => ({ ...m, [gw]: armed.filter((x) => x !== id) }));
      setChipCharges((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
      showToast(`${chip.icon} ${chip.name} disarmed`);
      return;
    }
    if ((chipCharges[id] || 0) <= 0) return showToast(`${chip.name}: out of charges`);
    if (armed.length >= maxThisGw) return showToast(`Max ${maxThisGw} chips armed this GW`);
    setChipCharges((c) => ({ ...c, [id]: c[id] - 1 }));
    setChipsByGw((m) => ({ ...m, [gw]: [...armed, id] }));
    setChipFlash(id);
    setActiveChip(chip);
    showToast(`${chip.icon} ${chip.name} armed for GW ${gw}`);
    setPoints((p) => p + chip.pts);
    setPtsFloat({ id: Date.now(), v: chip.pts });
    setTimeout(() => setPtsFloat(null), 1100);
    setTimeout(() => setChipFlash(null), 900);
    setTimeout(() => setActiveChip(null), 2600);
  };

  const togglePredLock = (mid: string) => {
    setPreds((p) => {
      const cur = p[mid];
      if (cur.locked) { setYellows((y) => Math.min(y + 1, 5)); showToast("Pick unlocked · +1 Yellow"); }
      else showToast("Pick locked in");
      return { ...p, [mid]: { ...cur, locked: !cur.locked } };
    });
  };
  const updatePred = (mid: string, side: "h" | "a", v: string) => {
    const n = Math.max(0, Math.min(99, parseInt(v) || 0));
    setPreds((p) => ({ ...p, [mid]: { ...p[mid], [side]: n } }));
  };

  const togglePickLock = (key: string) => {
    setPicksLocked((p) => {
      const cur = p[sport.id] || {};
      if (cur[key]) { setYellows((y) => Math.min(y + 1, 5)); showToast("Season pick unlocked · +1 Yellow"); }
      else showToast("Season pick locked");
      return { ...p, [sport.id]: { ...cur, [key]: !cur[key] } };
    });
  };
  const setPick = (key: string, name: string) => {
    setSeasonPicks((p) => ({ ...p, [sport.id]: { ...(p[sport.id] || {}), [key]: name } }));
  };

  /* Player ratings helpers */
  const getRating = (pid: string, g: number) => ratings[sport.id]?.[pid]?.[g] || 0;
  const setRating = (pid: string, g: number, v: number) => {
    setRatings((r) => {
      const sp = r[sport.id] || {};
      const pp = sp[pid] || {};
      return { ...r, [sport.id]: { ...sp, [pid]: { ...pp, [g]: v } } };
    });
  };
  const playerAvg = (pid: string) => {
    const rs = Object.values(ratings[sport.id]?.[pid] || {});
    if (!rs.length) return 0;
    return Math.round((rs.reduce((s, v) => s + v, 0) / rs.length) * 10) / 10;
  };

  /* BdO picker */
  const setBdoSlot = (slot: number, name: string) => {
    setBdoTop3((m) => {
      const cur = [...(m[sport.id] || [])];
      cur[slot] = name;
      return { ...m, [sport.id]: cur };
    });
  };
  const toggleBdoOther = (name: string) => {
    setBdoOthers((m) => {
      const cur = m[sport.id] || [];
      if (cur.includes(name)) return { ...m, [sport.id]: cur.filter((n) => n !== name) };
      if (cur.length >= 7) { showToast("Max 7 extra picks"); return m; }
      return { ...m, [sport.id]: [...cur, name] };
    });
  };

  const openZoom = (type: string, payload?: any) => {
    if (!roofOpen) return;
    setEditor({ type, ...payload });
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
        {/* LEFT PANEL */}
        <aside className="side-panel left">
          <div className="panel-scroll">
            <div className="sec zoomable" onClick={() => openZoom("center")}>⚙ Prediction Stand · {sport.name}</div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", marginBottom: 5, lineHeight: 1.4 }}>
              {league.name} · GW {gw} · top-4 fixtures predictable. Use Full-GW Unlock chip to add the rest.
            </div>

            {/* GW pager */}
            <div className="pager3-label">Game Week</div>
            <Pager3 value={gw} setValue={setGw} min={1} max={38} formatTag="GW" />

            {/* Mode + Tactic pagers */}
            <div className="pager3-label" style={{ marginTop: 8 }}>Mode</div>
            <Pager3
              value={modeIdx}
              setValue={setModeIdx}
              min={0}
              max={MODES.length - 1}
              labelFor={(i) => MODES[i].name}
              formatTag="LEAGUES"
              onCenterClick={() => setEditor({ type: "mode" })}
            />
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", padding: "3px 6px 0", lineHeight: 1.4 }}>{mode.desc}</div>

            <div className="pager3-label" style={{ marginTop: 8 }}>Tactic · GW {gw}</div>
            <div className="tag-row">
              {TACTICS.map((t) => (
                <button key={t.id} className={"tag-chip " + (tacticId === t.id ? "on " + t.cls : "")} onClick={() => { setTactic(t.id); showToast(`Tactic: ${t.name}`); }}>{t.name}</button>
              ))}
            </div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".38rem", color: "var(--sub)", padding: "0 4px", lineHeight: 1.4 }}>{tactic.desc}</div>

            <div className="sec" style={{ marginTop: 8 }}>🟨 Discipline</div>
            <div className="ref-stack">
              <div className="ref-card y" title="Yellow: unlock 1 locked prediction"><span className="refc-icon y" /><span className="refc-v">{yellows}</span><span className="refc-l">Yellow</span></div>
              <div className="ref-card r" title="Red: wipe a bad GW (floor at 0)"><span className="refc-icon r" /><span className="refc-v">{reds}</span><span className="refc-l">Red</span></div>
              <div className="ref-card p" title="Penalty: missed a top-4 prediction (-10 pts each)"><span className="refc-icon p" /><span className="refc-v">{penalties}</span><span className="refc-l">Pen</span></div>
            </div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".38rem", color: "var(--sub)", padding: "0 6px 4px", lineHeight: 1.4 }}>
              {usedThisGw}/{maxThisGw} chips armed · {flUnlocked ? "🌐 GW unlocked" : "Top-4 only"}
            </div>

            <div className="divr" />

            <div className="sec zoomable" onClick={() => openZoom("matches")}>{sport.id === "f1" ? "🏁 Race Predictions" : "⚽ Top-4 Predictions"} · GW {gw}</div>
            {data.matches.map((m: any) => {
              const p = preds[m.id] || { h: 0, a: 0, locked: false };
              return (
                <div className={"pred-card " + (selectedMatch?.id === m.id ? "act" : "")} key={m.id} onClick={() => { setSelectedMatch(m); setEditor({ type: "pred", id: m.id }); }}>
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
                    <span className="pred-lbl">{sport.id === "f1" ? "GRID" : "PICK"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <input className="sinp" disabled={p.locked} value={p.h} onChange={(e) => updatePred(m.id, "h", e.target.value)} onClick={(e) => e.stopPropagation()} />
                      <span style={{ fontFamily: "var(--hd)", color: "var(--sub)" }}>-</span>
                      <input className="sinp" disabled={p.locked} value={p.a} onChange={(e) => updatePred(m.id, "a", e.target.value)} onClick={(e) => e.stopPropagation()} />
                      <button className={"lock-btn " + (p.locked ? "locked" : "unlocked")} onClick={(e) => { e.stopPropagation(); togglePredLock(m.id); }}>
                        {p.locked ? "🔒" : "🔓"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Locked rest of GW (visible-but-not-selectable unless FL chip armed) */}
            {(data.lockedMatches || []).length > 0 && (
              <>
                <div className="sec" style={{ marginTop: 6, color: flUnlocked ? "var(--lime)" : "var(--sub)" }}>
                  {flUnlocked ? "🌐 Unlocked Rest of GW" : "🔒 Rest of GW (Full-Unlock Chip)"}
                </div>
                {data.lockedMatches.map((m: any) => {
                  const p = preds[m.id] || { h: 0, a: 0, locked: false };
                  return (
                    <div key={m.id} className={"pred-card " + (flUnlocked ? "" : "locked-fix")} onClick={() => flUnlocked && (setSelectedMatch(m), setEditor({ type: "pred", id: m.id }))}>
                      <div className="pc-head">
                        <span className="pc-time">{m.min}</span>
                        <span className="pred-locked-tag">{flUnlocked ? "OPEN" : "LOCKED"}</span>
                      </div>
                      <div className="pc-teams">
                        <span className="pc-tn">{m.h}</span>
                        <span className="pc-tn a">{m.a}</span>
                      </div>
                      {flUnlocked && (
                        <div className="pred-row">
                          <span className="pred-lbl">PICK</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <input className="sinp" value={p.h} onChange={(e) => updatePred(m.id, "h", e.target.value)} onClick={(e) => e.stopPropagation()} />
                            <span style={{ fontFamily: "var(--hd)", color: "var(--sub)" }}>-</span>
                            <input className="sinp" value={p.a} onChange={(e) => updatePred(m.id, "a", e.target.value)} onClick={(e) => e.stopPropagation()} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </aside>

        {/* PITCH WRAP */}
        <main className="pitch-wrap">
          {/* TOP goal-end ad behind goalpost */}
          {data.surface === "football" && <GoalAd position="top" />}

          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            {/* left stand (no highlight seats) */}
            <div className="stand">
              <Seats rows={36} cols={6} />
            </div>

            <div className="chip-rail left">
              <div className="chip-rail-title">ARM·{usedThisGw}/{maxThisGw}</div>
              {CHIPS.map((c) => {
                const charges = chipCharges[c.id] || 0;
                const armed = (chipsByGw[gw] || []).includes(c.id);
                const out = charges <= 0 && !armed;
                const blocked = usedThisGw >= maxThisGw && !armed && !out;
                return (
                  <button
                    key={c.id}
                    className={"chip-btn " + (out ? "used " : "") + (chipFlash === c.id ? "flash " : "") + (blocked ? "blocked " : "") + (armed ? "armed" : "")}
                    style={{
                      borderColor: out ? "rgba(255,255,255,.08)" : `${c.color}55`,
                      background: out ? "linear-gradient(160deg,rgba(0,0,0,.55),rgba(10,20,30,.7))" : `linear-gradient(160deg,${c.color}1f,rgba(0,0,0,.6))`,
                    }}
                    onClick={() => armChip(c.id)}
                    onMouseEnter={(e) => {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setChipTip({ chip: c, x: r.right + 8, y: r.top });
                    }}
                    onMouseLeave={() => setChipTip(null)}
                  >
                    {armed && <span className="chip-armed-tag">ON</span>}
                    <span className="chip-icon">{c.icon}</span>
                    <span className="chip-code" style={{ color: c.color }}>{c.code}</span>
                    <span className="chip-pts">+{c.pts}</span>
                    <span className="chip-charges">{charges}/8</span>
                  </button>
                );
              })}
            </div>

            {chipTip && (
              <div className="chip-tip" style={{ left: chipTip.x, top: chipTip.y, borderColor: `${chipTip.chip.color}88`, boxShadow: `0 8px 28px ${chipTip.chip.color}33` }}>
                <div className="ct-name" style={{ color: chipTip.chip.color }}>{chipTip.chip.icon} {chipTip.chip.name}</div>
                <div className="ct-fx" style={{ color: chipTip.chip.color }}>{chipTip.chip.fx} · +{chipTip.chip.pts} pts</div>
                <div className="ct-desc">{chipTip.chip.desc}</div>
                <div className="ct-how">▸ {chipTip.chip.how}</div>
              </div>
            )}

            <div className="court-area" data-surface={data.surface}>
              <div className="court-bg" />
              <CourtMarkings surface={data.surface} />

              {activeChip && (
                <div className="chip-active-badge">
                  <span className="cab-icon">{activeChip.icon}</span>
                  <div>
                    <div className="cab-name">{activeChip.name}</div>
                    <div className="cab-pts">+{activeChip.pts} PTS APPLIED</div>
                  </div>
                </div>
              )}

              {!roofOpen && selectedMatch && (
                <div className="match-hud">
                  <div className="hud-score-row">
                    <span className="hud-team">{selectedMatch.h}</span>
                    <span className="hud-score">{selectedMatch.hs} - {selectedMatch.as}</span>
                    <span className="hud-team">{selectedMatch.a}</span>
                  </div>
                  <div className="hud-status">{selectedMatch.live ? `LIVE · ${selectedMatch.min}` : `KICK-OFF ${selectedMatch.min}`} · {selectedMatch.league}</div>
                </div>
              )}

              {!roofOpen && selectedMatch?.live && data.surface === "football" && (
                <div className="ball" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} />
              )}
            </div>

            <div className="stand right">
              <Seats rows={36} cols={6} />
            </div>
          </div>

          {data.surface === "football" && <GoalAd position="bottom" />}
        </main>

        {/* RIGHT PANEL */}
        <aside className="side-panel right">
          <div className="panel-scroll">
            <div className="sec zoomable" onClick={() => openZoom("season")}>📈 My Season · {sport.name}</div>
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
                <div className="sc"><span className="sc-v">71%</span><span className="sc-l">Acc</span></div>
              </div>
            </div>

            <div className="divr" />
            <div className="sec zoomable" onClick={() => openZoom("picks")}>🥇 Season Picks vs Reality</div>
            <div style={{ fontFamily: "var(--cd)", fontSize: ".4rem", color: "var(--sub)", marginBottom: 5, lineHeight: 1.4 }}>
              Lock in your season-long bets. Unlock costs 1 yellow card.
            </div>

            {(["a", "b", "c", "d"] as const).map((key) => {
              const list = data.leaders[key] as any[];
              const label = data.seasonPicksLabels[key];
              const isC = key === "c";
              return (
                <div key={key} style={{ marginBottom: 7 }}>
                  <div style={{ fontFamily: "var(--cd)", fontSize: ".42rem", color: "rgba(200,244,0,.5)", letterSpacing: "1.5px", marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{label.toUpperCase()}{isC && !bdoUnlocked && " · 🔒 GW19"}</span>
                    {(!isC || bdoUnlocked) && (
                      <button className={"lock-btn " + (sl[key] ? "locked" : "unlocked")} onClick={() => togglePickLock(key)}>{sl[key] ? "🔒" : "🔓"}</button>
                    )}
                  </div>
                  {isC && bdoUnlocked ? (
                    <button className="bdo-open" onClick={() => setEditor({ type: "bdo" })}>
                      <span>🏆 Top 3 + Top 10 picker</span>
                      <span className="bdo-cnt">{top3.filter(Boolean).length}/3 · {others.length}/7</span>
                    </button>
                  ) : isC && !bdoUnlocked ? (
                    <div className="locked-tag">Unlocks at mid-season — GW 19. Pick gold/silver/bronze + 7 more for top 10.</div>
                  ) : (
                    list.slice(0, 3).map((p: any, i: number) => (
                      <div className="stat-item" key={p.name} onClick={() => !sl[key] && setPick(key, p.name)} style={{ cursor: sl[key] ? "default" : "pointer" }}>
                        <span className="si-pos">{i + 1}</span>
                        <div className="si-info">
                          <div className="si-name">{p.name}</div>
                          <div className="si-club">{p.club} · {p.val}</div>
                        </div>
                        {sp[key] === p.name && <span className="si-pick">YOUR PICK</span>}
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            <div className="divr" />
            <div className="sec zoomable" onClick={() => openZoom("standings")}>📊 Standings</div>
            <table className="stbl">
              <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
              <tbody>
                {data.standings.map((s: any, i: number) => (
                  <tr key={s.team} className={(i === 0 ? "t1 " : "") + (s.me ? "me" : "")}>
                    <td className="t-nm">{s.team}</td><td>{s.p}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td><td><b>{s.pts}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divr" />
            <div className="sec zoomable" onClick={() => openZoom("leagues")}>🤝 Mini-Leagues</div>
            {FRIEND_LEAGUES.map((l) => (
              <div className="league-item" key={l.name}>
                <span className="league-icon">{l.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="league-name">{l.name}</div>
                  <div className="league-sub">{l.sub}</div>
                </div>
                <span className="league-pts">{l.pts}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ROOF RAILS */}
        <div className="roof-rail left" />
        <div className="roof-rail right" />

        {/* ROOF CURTAIN — when closed shows fav-team rating UI */}
        <div className={"roof body-roof " + roofAnim}>
          <div className="roof-half left">
            <div className="roof-strip team-strip">
              <div className="ts-avatar">{data.favTeam[0]}</div>
              <div className="ts-info">
                <div className="ts-name">{data.favTeam}</div>
                <div className="ts-meta">Your team · Season 25/26</div>
              </div>
              <div className="ts-stat"><span className="ts-v">{points}</span><span className="ts-l">PTS</span></div>
              <div className="ts-stat gold"><span className="ts-v">14k</span><span className="ts-l">RANK</span></div>
            </div>
            <RatingPanel
              roster={data.roster}
              gw={ratingGw}
              setGw={setRatingGw}
              getRating={getRating}
              setRating={setRating}
              playerAvg={playerAvg}
              onPlayer={(pid: string) => setEditor({ type: "player", id: pid })}
              onPick={(name: string) => setEditor({ type: "pickPlayer", data: name })}
              leaders={data.leaders}
              picks={sp}
              labels={data.seasonPicksLabels}
            />
          </div>

          <div className="roof-half right">
            <div className="roof-strip team-strip">
              <div className="ts-trophy">🏆</div>
              <div className="ts-info">
                <div className="ts-name">{data.standings[0]?.team || "—"} leading</div>
                <div className="ts-meta">{sport.name} · Live tables</div>
              </div>
              <div className="ts-stat"><span className="ts-v">{data.standings.findIndex((s: any) => s.me) + 1 || "—"}</span><span className="ts-l">POS</span></div>
              <div className="ts-stat gold"><span className="ts-v">{data.standings.find((s: any) => s.me)?.pts || 0}</span><span className="ts-l">PTS</span></div>
            </div>
            <div className="roof-content-r">
              <div className="rcr-title">📡 Quick Standings</div>
              <table className="stbl">
                <thead><tr><th>Team</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
                <tbody>
                  {data.standings.map((s: any, i: number) => (
                    <tr key={s.team} className={(i === 0 ? "t1 " : "") + (s.me ? "me" : "")}>
                      <td className="t-nm">{s.team}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td><td><b>{s.pts}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="rcr-title" style={{ marginTop: 10 }}>📲 Socials</div>
              <div className="social-row">
                {SOCIALS.map((s) => (
                  <a key={s.id} className="soc-btn" href={s.url} target="_blank" rel="noopener noreferrer" style={{ borderColor: `${s.color}66` }}>
                    <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                    <span style={{ fontFamily: "var(--cd)", fontSize: ".44rem", letterSpacing: 1 }}>{s.name}</span>
                  </a>
                ))}
              </div>

              <div className="rcr-title" style={{ marginTop: 10 }}>🥇 Your Picks</div>
              <div className="rmp-list">
                {(["a", "b", "c", "d"] as const).map((k) => (
                  <div key={k} className="rmp-item">
                    <span style={{ flex: 1 }}>{data.seasonPicksLabels[k]}</span>
                    <span className="rmp-sc">{sp[k] || "—"}</span>
                    {sl[k] ? "🔒" : "🔓"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
          <span className="rt-sub">{roofOpen ? "Hide HQ" : "View HQ"}</span>
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

      {/* Edit modal */}
      {editor && (
        <>
          <div className="ed-overlay" onClick={() => setEditor(null)} />
          <div className={"ed-modal " + (["center", "matches", "season", "picks", "standings", "leagues", "player", "bdo"].includes(editor.type) ? "ed-zoom" : "")} onClick={(e) => e.stopPropagation()}>
            <button className="ed-close" onClick={() => setEditor(null)}>✕</button>

            {editor.type === "gw" && (
              <>
                <div className="ed-title">🗓 Game Week</div>
                <div className="ed-sub">Browse gameweeks. Final 5 GWs allow 3 chips per round.</div>
                <div className="ed-grid">
                  {Array.from({ length: 38 }).map((_, i) => (
                    <button key={i} className={"ed-grid-cell " + (gw === i + 1 ? "sel" : "") + (i + 1 >= 34 ? " final" : "")} onClick={() => setGw(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              </>
            )}

            {(editor.type === "form" || editor.type === "mode") && (
              <>
                <div className="ed-title">⚔ Season League Mode</div>
                <div className="ed-sub">How many leagues you commit to predicting all 38 GWs. Locked at GW 1 — choose carefully.</div>
                {MODES.map((f, i) => (
                  <button key={f.id} className={"ed-list-item " + (modeIdx === i ? "sel" : "")} onClick={() => { setModeIdx(i); showToast(`Mode: ${f.name}`); }}>
                    <span className="eli-name">{f.name}</span>
                    <span className="eli-desc">{f.desc}</span>
                  </button>
                ))}
              </>
            )}

            {editor.type === "armChips" && (
              <>
                <div className="ed-title">🎯 Arm Chips · GW {gw}</div>
                <div className="ed-sub">Pick the {maxThisGw} chips that fire this GW. Click an armed chip again to disarm and refund.</div>
                {CHIPS.map((c) => {
                  const armed = (chipsByGw[gw] || []).includes(c.id);
                  const charges = chipCharges[c.id] || 0;
                  return (
                    <button key={c.id} className={"ed-list-item " + (armed ? "sel" : "")} onClick={() => armChip(c.id)} disabled={charges <= 0 && !armed}>
                      <span className="eli-name">{c.icon} {c.name} {armed ? "· ARMED" : ""}</span>
                      <span className="eli-desc">{c.desc} · {charges}/8 charges left</span>
                    </button>
                  );
                })}
              </>
            )}

            {editor.type === "pred" && editor.id && (() => {
              const m = data.matches.find((x: any) => x.id === editor.id);
              if (!m) return null;
              const p = preds[m.id] || { h: 0, a: 0, locked: false };
              return (
                <>
                  <div className="ed-title">{sport.id === "f1" ? "🏁" : "⚽"} {m.h} vs {m.a}</div>
                  <div className="ed-sub">{m.league} · {m.live ? `LIVE ${m.min}` : `${sport.id === "f1" ? "Lights out" : "Kick-off"} ${m.min}`}</div>
                  {m.live && <div className="ed-live-score">{m.hs} - {m.as}</div>}
                  <div style={{ fontFamily: "var(--cd)", fontSize: ".5rem", color: "rgba(200,244,0,.6)", letterSpacing: "1.5px", marginTop: 8 }}>YOUR PREDICTION</div>
                  <div className="ed-score-row">
                    <div className="ed-team-col">
                      <div className="ed-team-nm">{m.h}</div>
                      <div className="ed-stepper">
                        <button onClick={() => updatePred(m.id, "h", String(Math.max(0, p.h - 1)))} disabled={p.locked}>−</button>
                        <span>{p.h}</span>
                        <button onClick={() => updatePred(m.id, "h", String(p.h + 1))} disabled={p.locked}>+</button>
                      </div>
                    </div>
                    <div className="ed-vs">vs</div>
                    <div className="ed-team-col">
                      <div className="ed-team-nm">{m.a}</div>
                      <div className="ed-stepper">
                        <button onClick={() => updatePred(m.id, "a", String(Math.max(0, p.a - 1)))} disabled={p.locked}>−</button>
                        <span>{p.a}</span>
                        <button onClick={() => updatePred(m.id, "a", String(p.a + 1))} disabled={p.locked}>+</button>
                      </div>
                    </div>
                  </div>
                  <button className={"lock-btn " + (p.locked ? "locked" : "unlocked")} style={{ width: "100%", padding: "8px", fontSize: ".6rem", marginTop: 10 }} onClick={() => togglePredLock(m.id)}>
                    {p.locked ? "🔒 LOCKED · tap to unlock (-1 yellow)" : "🔓 LOCK IN PICK"}
                  </button>
                </>
              );
            })()}

            {editor.type === "bdo" && (
              <>
                <div className="ed-title">🏆 {data.seasonPicksLabels.c} · Top 3 + Top 10</div>
                <div className="ed-sub">Gold = 50 pts · Silver = 30 · Bronze = 15 · Each correct top-10 = 5 pts</div>
                <div className="bdo-podium">
                  {[0, 1, 2].map((slot) => (
                    <div key={slot} className={"bdo-slot s" + slot}>
                      <div className="bdo-medal">{slot === 0 ? "🥇" : slot === 1 ? "🥈" : "🥉"}</div>
                      <div className="bdo-name">{top3[slot] || "— pick —"}</div>
                    </div>
                  ))}
                </div>
                <div className="ed-sub" style={{ marginTop: 10 }}>TAP TO ASSIGN PODIUM (cycle: gold → silver → bronze → clear)</div>
                <div className="bdo-list">
                  {data.leaders.c.map((p: any) => {
                    const slot = top3.indexOf(p.name);
                    const inOthers = others.includes(p.name);
                    return (
                      <div key={p.name} className="bdo-row">
                        <div style={{ flex: 1 }}>
                          <div className="bdo-pname">{p.name}</div>
                          <div className="bdo-pclub">{p.club} · {p.val}</div>
                        </div>
                        <button className="bdo-podium-btn" onClick={() => {
                          const next = (slot + 2) % 4 - 1; // -1, 0, 1, 2
                          if (next === -1) {
                            setBdoTop3((m) => ({ ...m, [sport.id]: (m[sport.id] || []).map((n) => n === p.name ? "" : n) }));
                          } else {
                            setBdoSlot(next, p.name);
                          }
                        }}>{slot >= 0 ? (slot === 0 ? "🥇" : slot === 1 ? "🥈" : "🥉") : "—"}</button>
                        <button className={"bdo-other-btn " + (inOthers ? "on" : "")} onClick={() => toggleBdoOther(p.name)}>
                          {inOthers ? "✓ TOP10" : "+ Top10"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {editor.type === "player" && editor.id && (() => {
              const pl = data.roster.find((p: any) => p.id === editor.id);
              if (!pl) return null;
              const all = ratings[sport.id]?.[pl.id] || {};
              const entries = Object.entries(all).map(([g, v]) => ({ g: +g, v })).sort((a, b) => a.g - b.g);
              return (
                <>
                  <div className="ed-title">#{pl.n} {pl.name}</div>
                  <div className="ed-sub">{pl.pos} · Avg {playerAvg(pl.id) || "—"} / 10 · {entries.length} ratings</div>
                  <div className="rating-curve">
                    {entries.length === 0 && <div style={{ color: "var(--sub)", fontFamily: "var(--cd)", fontSize: ".55rem", textAlign: "center", padding: 14 }}>No ratings yet — close roof and rate per GW.</div>}
                    {entries.map((e) => (
                      <div className="rc-row" key={e.g}>
                        <span className="rc-gw">GW {e.g}</span>
                        <div className="rc-bar"><div className="rc-fill" style={{ width: (e.v * 10) + "%" }} /></div>
                        <span className="rc-val">{e.v}</span>
                      </div>
                    ))}
                  </div>
                  <button className="bdo-open" style={{ marginTop: 10 }} onClick={() => { setEditor({ type: "pickPlayer", data: pl.name }); }}>
                    ⭐ Promote to season pick…
                  </button>
                </>
              );
            })()}

            {editor.type === "pickPlayer" && editor.data && (
              <>
                <div className="ed-title">⭐ Promote {editor.data}</div>
                <div className="ed-sub">Pick a season slot. If it's locked, you'll spend 1 yellow card to swap.</div>
                {(["a", "b", "c", "d"] as const).map((k) => (
                  <button key={k} className="ed-list-item" onClick={() => {
                    if (sl[k]) { setYellows((y) => Math.min(y + 1, 5)); showToast("Swapped (-1 yellow)"); }
                    setPick(k, editor.data);
                    setPicksLocked((p) => ({ ...p, [sport.id]: { ...(p[sport.id] || {}), [k]: true } }));
                    showToast(`${editor.data} → ${data.seasonPicksLabels[k]}`);
                    setEditor(null);
                  }}>
                    <span className="eli-name">{data.seasonPicksLabels[k]}</span>
                    <span className="eli-desc">Currently: {sp[k] || "—"} {sl[k] ? "🔒" : ""}</span>
                  </button>
                ))}
              </>
            )}

            {/* Zoom views (roof open click on container) */}
            {editor.type === "matches" && (
              <>
                <div className="ed-title">{sport.id === "f1" ? "🏁 Race Predictions" : "⚽ Match Predictions"} · GW {gw}</div>
                <div className="ed-sub">Tap any match to edit. Lock costs nothing — unlock costs 1 yellow.</div>
                {data.matches.map((m: any) => {
                  const p = preds[m.id] || { h: 0, a: 0, locked: false };
                  return (
                    <div key={m.id} className="ed-list-item" onClick={() => setEditor({ type: "pred", id: m.id })}>
                      <span className="eli-name">{m.h} vs {m.a}</span>
                      <span className="eli-desc">{m.league} · {m.live ? `LIVE ${m.min} (${m.hs}-${m.as})` : m.min} · Pick {p.h}-{p.a} {p.locked ? "🔒" : "🔓"}</span>
                    </div>
                  );
                })}
              </>
            )}

            {editor.type === "season" && (
              <>
                <div className="ed-title">📈 My Season · {sport.name}</div>
                <div className="ed-sub">Account snapshot, current run.</div>
                <div className="stat3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  <div className="sc"><span className="sc-v">{points}</span><span className="sc-l">Total Pts</span></div>
                  <div className="sc"><span className="sc-v">62</span><span className="sc-l">GW Best</span></div>
                  <div className="sc"><span className="sc-v">71%</span><span className="sc-l">Accuracy</span></div>
                  <div className="sc"><span className="sc-v">14k</span><span className="sc-l">Rank</span></div>
                  <div className="sc"><span className="sc-v">{Object.values(chipCharges).reduce((s, v) => s + v, 0)}</span><span className="sc-l">Chips Left</span></div>
                  <div className="sc"><span className="sc-v">{usedThisGw}/{maxThisGw}</span><span className="sc-l">GW Chips</span></div>
                </div>
              </>
            )}

            {editor.type === "picks" && (
              <>
                <div className="ed-title">🥇 Season Picks</div>
                <div className="ed-sub">Pick rankings vs current real-world leaders.</div>
                {(["a", "b", "c", "d"] as const).map((k) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div className="eli-name">{data.seasonPicksLabels[k]}</div>
                    {(data.leaders[k] as any[]).slice(0, 5).map((p, i) => (
                      <div key={p.name} className="stat-item" onClick={() => !sl[k] && setPick(k, p.name)} style={{ cursor: sl[k] ? "default" : "pointer" }}>
                        <span className="si-pos">{i + 1}</span>
                        <div className="si-info"><div className="si-name">{p.name}</div><div className="si-club">{p.club} · {p.val}</div></div>
                        {sp[k] === p.name && <span className="si-pick">PICK</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {editor.type === "standings" && (
              <>
                <div className="ed-title">📊 Standings · {sport.name}</div>
                <table className="stbl" style={{ marginTop: 8 }}>
                  <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
                  <tbody>
                    {data.standings.map((s: any, i: number) => (
                      <tr key={s.team} className={(i === 0 ? "t1 " : "") + (s.me ? "me" : "")}>
                        <td className="t-nm">{s.team}</td><td>{s.p}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td><td><b>{s.pts}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {editor.type === "leagues" && (
              <>
                <div className="ed-title">🤝 Mini-Leagues</div>
                {FRIEND_LEAGUES.map((l) => (
                  <div className="league-item" key={l.name}>
                    <span className="league-icon">{l.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="league-name">{l.name}</div>
                      <div className="league-sub">{l.sub}</div>
                    </div>
                    <span className="league-pts">{l.pts}</span>
                  </div>
                ))}
              </>
            )}

            {editor.type === "center" && (
              <>
                <div className="ed-title">⚙ Predict Center · {sport.name}</div>
                <div className="ed-sub">Quick view of GW, mode and discipline.</div>
                <div className="mini-row" style={{ marginBottom: 10 }}>
                  <div className="mini-chip"><span className="mini-lbl">GW</span><span className="mini-val">{gw}</span></div>
                  <div className="mini-chip"><span className="mini-lbl">MODE</span><span className="mini-val">{mode.name}</span></div>
                  <div className="mini-chip"><span className="mini-lbl">CHIPS</span><span className="mini-val">{usedThisGw}/{maxThisGw}</span></div>
                </div>
                <div className="ed-sub">{mode.desc}</div>
              </>
            )}
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ---------- Rating panel (roof closed) ---------- */
function RatingPanel({
  roster, gw, setGw, getRating, setRating, playerAvg, onPlayer, onPick: _onPick, leaders: _leaders, picks: _picks, labels: _labels,
}: any) {
  return (
    <div className="rating-panel">
      <div className="ratp-head">
        <div className="ratp-title">⭐ Rate Your Squad · GW {gw}</div>
        <div className="ratp-sub">Scroll the whistle rail to switch GW. Tap a player to see their season curve.</div>
      </div>
      <Pager3 value={gw} setValue={setGw} min={1} max={38} formatTag="GW" />
      <div className="rating-list">
        {roster.map((p: any) => {
          const r = getRating(p.id, gw);
          return (
            <div className="rate-row2" key={p.id}>
              <span className="rr-num">#{p.n}</span>
              <button className="rr-name" onClick={() => (onPlayer as (pid: string) => void)(p.id)}>
                {p.name}
                <span className="rr-pos">{p.pos}</span>
                <span className="rr-avg">avg {playerAvg(p.id) || "—"}</span>
              </button>
              <div className="rr-stepper">
                <button onClick={() => setRating(p.id, gw, Math.max(0, r - 1))}>−</button>
                <span className={"rr-val " + (r >= 8 ? "hi" : r >= 5 ? "md" : r > 0 ? "lo" : "")}>{r || "—"}</span>
                <button onClick={() => setRating(p.id, gw, Math.min(10, r + 1))}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
