## Scope

Big update across `src/routes/index.tsx` and `src/styles.css`. No backend changes.

## 1. Sport-aware data switching

- Define `SPORT_DATA` map keyed by sport (`football`, `basketball`, `tennis`, `f1`, etc. — match existing sport chips). for F1 input the whole season,and track should load on the pitch container,and predictions should be like how the grid will finish,from practice to qualifying) do that for all other sports,and its content should load up when selected on the sports button.
- Each entry contains: matches list, season picks (top scorer / assist / MVP equivalent), standings, fav team roster, pitch surface class.
- All containers (Predict Center matches, Season Picks labels, Standings, Manager HQ roster) read from current sport's slice via a `useMemo` derived from `activeSport`.
- Pitch wrapper gets a `data-surface={sport}` attribute; CSS swaps background (grass / hardwood / clay / asphalt) and hides goalposts when not football.

## 2. Roof-closed panels = season player ratings

- When roof is closed, each roof half shows: fav team crest header + horizontal scroller of all 38 GWs.( and this is where you edit your fav team throughout the season rating it per game,per player,so the interaction and rating should be poping up on the closed roof containers for editing and saving.
- Each GW chip styled as a **whistle** (silver pill with a hole + lanyard, custom SVG/CSS).
- Tapping a GW expands the squad list inline; each player row has a 1-10 rating stepper.(scroll through different  gw,hence only displaying one at a time
- Ratings persist in `playerRatings` state: `{ [playerId]: { [gw]: number } }`.
- Tapping a player name (anywhere) opens a modal showing their season rating curve + average + per-GW list.( and an option if you want to select him as one of your picks as per stats,ie if he is currently leading top goalscorer,option to ask client to unlock his previous pick and select him. 
- also input a part on the roof panels containers with social media icons when client clicks on any it opens the SM account entered there and displays it,so that one can go through his sm accounts on the app 

## 3. Roof-open container popups (zoom mode)

- Existing `editor` modal pattern extended: every panel section (Predict Center, Discipline, Match Predictions, My Season, Season Picks, Standings, Mini-Leagues) becomes clickable when roof is open.
- Click → opens enlarged `ed-modal` variant (`ed-modal--zoom`, ~85vw / 80vh) with the same content rendered larger and editable.

## 4. Chip system rework

- Each of the 5 chips now has **8 charges** for the season (badge shows `x/8`).
- Per-GW limit: max **2 chips** played, and have option that each chip has an extra so that duting the 38 game weeks there are 5 gw one will have an option of using 3 chips ( edit the chips to a better point awarding system,one can be like have option of unlocking the whole season teams playing that gw,so that client has more options of having many correct predictions,since the app only has the top 5 teams picks for prediction every gw,eg la liga -barca,real,athletico,athletic, but during that gw,chip it unlocks all la liga gw games to predict.
- Add `chipsUsedThisGw` counter; chip rail disables remaining chips once limit hit. Tooltip explains.
- Chip charges decrement on play; `gw === 38` unlocks the 3rd slot visually.

## 5. Ballon d'Or mid-season unlock

- Lock the BdO card until `gw >= 19`. Before that, show "Unlocks at GW 19".
- From GW 19+, BdO card opens a dedicated picker: pick **Top 3** (gold/silver/bronze, 50/30/15 pts) + pick up to **7 more** for the rest of top 10 (5 pts each correct).
- This same card continues to show the user's other season individual picks (top scorer, top assist, golden boy) as collapsible rows underneath.

## 6. Billboard ads behind goalposts

- Goalpost stand backgrounds become billboard ad slots.
- Cycle through 3 promo cards ( embed YouTube videos directly inside the billboards reliably). 
- Implementation: small `<BillboardAd />` component cycling via `setInterval` in a `useEffect`, rendered inside the top + bottom stands (the actual goal-end stands, not the side stands).
- Note on YouTube: use the videoos of the links i shared on youtube,embed them on the ad containers

## 7. Pitch surface per sport

- `.pitch[data-surface="football"]` keeps current grass.
- `basketball` → polished wood gradient + center circle + key boxes, hide goalposts.
- `tennis` → clay/court lines, net across middle.
- `f1` → asphalt with start/finish grid.
- Goalpost components rendered conditionally on `sport === 'football'`.

## 8. Remove opposite-side seat highlights

- Remove highlight stripe / glow on left+right `.stand` elements (currently `.stand .seats` shimmer). Keep plain dim seats only on those two sides; top/bottom already have no seats per earlier change.

## Files

- `src/routes/index.tsx` — state, data map, components, modal, conditional rendering.
- `src/styles.css` — whistle scroller, billboard ad card, sport surfaces, zoom modal variant, chip charge badges.