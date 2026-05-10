# Stadium Layout & Prediction System Overhaul

Single-pass refactor of `src/routes/index.tsx` and `src/styles.css`. No backend.

## 1. Roof-open left container = "Prediction Stand"

- Header: current league (from top menu) + GW number.
- **Selectable predictions**: only the **top 4 teams per league** (football). For each match involving any top-4 team, render a prediction card with score + scorer pickers.
- **Visible-but-locked rows**: the rest of that GW's fixtures from the same league rendered greyed out with a small lock badge. They become selectable only if the user has activated the **"Full GW Unlock" chip** for that GW.
- Sport-aware: `SPORT_DATA` extended so each sport defines its own `getPredictables(gw)` and `getLockedRest(gw)`.
  - Football → top-4 of selected league.
  - Basketball → top-4 conference seeds for that night.
  - Tennis → top-4 seeds active that round.
  - F1 → single GP per "GW" with 3 prediction phases: Practice (FP fastest), Qualifying (pole + Q3 order), Race (full grid 1-10). All 3 always shown. input all circuit tracks ( remove from the internet to be scrolled throughtout the season)
- all containers when selectet should pop up in het area of the pitch to make it seem like ou are doing the editing on the pitch,hence a transparent pop up in the shape of the pitch. make better ui for mobile version even if it means shrinking all containers so that the pitch is still centered,and when you select the shrinked container,eg for prediction,it pops up a transparent container size of pitch to do your editng there or view

## 2. GW scroller = 3-circle pager

Replace the long whistle strip with a compact pager:

```text
  ◄  (gw-1)   ●(gw)   (gw+1)  ►
```

- Three circles; middle is highlighted/active. Side circles show neighbour numbers, dimmer.
- Arrows on the outer edges scroll through 1-38.
- Same component reused on closed-roof rating panel.

## 3. "Formation" → "Mode" pager (1v1 / 2v2 / 3v3)

Repurpose the formation control as a season **League Slot Mode**:

- `1v1` = 1 league for the whole season (max focus, biggest per-correct multiplier).
- `2v2` = 2 leagues.
- `3v3` = 3 leagues (most coverage, smallest multiplier).
- Same 3-circle pager UI as GW scroller.
- Choosing a mode caps how many leagues the user can toggle "active" in the league menu for the season; once locked at GW1 it stays.

## 4. Replacement for old "Formation" chip slot — **"Tactic" pager**

A new small pager next to Mode with picks: `Attack`, `Balanced`, `Park-the-bus`.

- Attack = +25% points on correct scorer picks, -25% on clean-sheet picks.
- Balanced = flat.
- Park-the-bus = +50% on correct 0-0 / clean sheet, -25% on scorer picks.
- Switchable per GW, no chip cost.

## 5. Card / discipline system

Replace today's discipline card with a real referee mechanic:

- **Yellow card** (3 per season): unlock one previously-locked locked prediction (e.g. swap a season pick mid-season, or unlock a non-top-4 fixture without burning a chip).
- **Red card** (1 per season): wipe a single bad GW's negative points (floor that GW at 0).
- **Penalty (5 cards)**: auto-penalty deducted (-10 pts) every time the user fails to submit predictions for at least 1 of the 4 top-4 fixtures before kickoff. Tracked via `penaltiesTaken` counter.

UI: small ref-card stack in the top bar showing remaining yellows / red / penalty count.

## 6. Chip rules refinement

- 5 chips × 8 charges (existing).
- **Per GW: user picks exactly 2 chips to "arm"** before kickoff via a small "Arm Chips" modal (checkbox list with 2-max). Only armed chips fire that GW.
- GW 34-38: arm slot expands to 3.
- "Full GW Unlock" chip is what enables predicting non-top-4 fixtures.

## 7. Roof-open right container = "My Season Stand"

- Client account header (avatar, username, total pts, rank).
- Season individual picks (Top scorer, Top assist, Golden Boy, Ballon d'Or top-3 + 7 extras, MVP for non-football).
- All collapsible rows. Click any → zoom modal to edit (existing `ed-zoom`).

## 8. New stands BEHIND billboards

Currently top + bottom stands are billboard ads. Add a **second tier** behind each:

- **Top stand back row** = live **league standings table** for the league chosen in the top menu (top 6 rows visible, scroll for more).
- **Bottom stand back row** (between pitch and menubar) = **individual stat leaders** for that league: top scorer, top assist, top clean sheets, top rating. 4 small cards.
- Standings/stats come from `SPORT_DATA[sport].leagues[currentLeague]`.
- Billboards stay in front; new stands sit behind via z-index, with a slight perspective tilt.

## 9. Billboard ads — edge-to-edge LED look

- Make `.goal-ad` span full width of the goal-end stand (edge to edge), thinner height, with LED-pixel CSS texture (repeating-radial-gradient dots) and a subtle scrolling shimmer.
- Swap embedded videos to better full-bleed sports promo loops (muted, autoplay, loop). Keep YouTube `embed` URLs but use `playlist=ID&loop=1&controls=0&modestbranding=1` and updated IDs:
  - Lay's UCL 2024 anthem ad: `nQK_zrk7Mxg`
  - Pepsi football "Fizz to Life": `eXz9Bi4UjpI`
  - Heineken UCL "Cheers": `Iq3sg4i2bNA`
- If iframe sizing flickers, fall back to CSS LED panel with brand wordmark + animated gradient (already styled).

## 10. Roof-closed LEFT = Account + Fav Team Ratings

- Top: account card (avatar, handle, total pts, current rank, social icons row).
- Below: fav team header with crest, then **3-circle GW pager**.
- For active GW: show that GW's opponent + the 11 players that started; each row has 0-10 stepper.
- Ratings persist in `playerRatings[playerId][gw]`. Tap player name → modal with full-season curve (reuses existing `playerModal`).

## 11. Roof-closed RIGHT

Stays as season-long aggregate: average ratings leaderboard for own fav team (sorted by season avg), plus "Pick of the Week" auto-derived from highest-rated player that GW.

&nbsp;

better animation of roof opening/closing,have the edges have a rolling effect to make it seem its rolling in

## Files

- `src/routes/index.tsx` — state additions (`armedChips`, `cards`, `tactic`, `leagueMode`, expanded `SPORT_DATA`), new Pager component, restructured roof halves, new BackStand + StatsStand components, updated `GoalAd`, new ArmChips modal, top-4 filter for predictions.
- `src/styles.css` — `.pager-3`, `.back-stand`, `.stats-stand`, `.led-billboard`, `.ref-card`, sport surface tweaks for F1 grid prediction overlay.