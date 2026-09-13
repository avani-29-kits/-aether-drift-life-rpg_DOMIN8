# Aether Drift — Life RPG

Turn real-world tasks into a growing personal constellation. Complete
Waypoints (quests) to earn XP, Glimmer (gold), and Attribute points,
build a streak, level up your character, unlock achievements, and
spend Glimmer on cosmetics in the Cartographer's Cache (shop).

**Live demo:** 
https://aether-drift-life-rpg-domin-8.vercel.app/

**Demo video:** 
https://youtu.be/AIcBgUUSdz4?si=DBgp7VUTfLQfZvrS 


## Concept

Traditional to-do apps give you a checkbox. Aether Drift gives you a
character: every completed task feeds a non-linear leveling system,
raises one of four attributes depending on what kind of task it was,
and builds a day-to-day streak. Progress is permanent and visible —
your quest history, your attributes, and your unlocked achievements
are all stored, not just your current totals.

## Features

- **Auth**: signup/login/logout with bcrypt-hashed passwords and a
  JWT stored in an httpOnly cookie (not localStorage). Sessions
  persist across a page refresh.
- **Character**: Level, lifetime XP, Glimmer (currency), four
  attributes (Strength, Intellect, Agility, Vitality), current streak,
  longest streak.
- **Quests ("Waypoints")**: full CRUD (create/view/edit/delete) plus a
  "complete" action. Category, difficulty, and target attribute are
  set per quest.
- **RPG progression**: a non-linear XP curve (`100 x level^1.5` XP to
  go from `level` to `level + 1`) — level and XP-into-level are always
  *derived* from lifetime XP on the server, never stored/trusted as a
  separate client-editable value.
- **Reward economy**: every quest's XP/Glimmer reward is looked up
  server-side from a fixed difficulty -> reward table at creation
  time. The client can choose a difficulty, never a reward amount.
  Completing a quest reads the reward back off the already-stored
  quest row — nothing in the completion request is trusted for
  amounts.
- **Streak system**: completing anything today when you were already
  active yesterday extends the streak by 1; a gap of 2+ days resets
  it to 1; `longest_streak` keeps the historical record separately.
- **Shop (Cartographer's Cache)**: cosmetic-only items (themes, avatar
  frames, badges, titles) purchased with Glimmer, in a transaction
  that locks the character row so two rapid purchase clicks can't both
  succeed off a stale balance. Equipping a theme/frame/title
  un-equips any other owned item of the same type; badges can stack.
- **Achievements**: checked automatically inside the same database
  transaction as quest completion, so an achievement and the quest
  that triggered it either both save or neither does.
- **History preserved**: `quest_history` is an append-only ledger of
  every completion (never edited/deleted), which is what proves data
  persistence across a refresh and gives an audit trail.

## Architecture

```
backend/
  controllers/    request handlers (one per resource)
  routes/         Express routers, wire validation + auth middleware
  middleware/     auth (JWT), validators (express-validator), error handler
  services/       achievements.service.js (unlock-checking logic)
  utils/          leveling.js (XP curve), rewards.js (difficulty -> reward table)
  db/             schema.sql, seed.sql, run-sql.js, pool.js
  server.js
frontend/
  src/
    pages/        Landing, Login, Signup, Dashboard
    components/   QuestList, Shop, ProtectedRoute
    context/      AuthContext (current user + auth actions)
    services/     api.js (fetch wrapper, credentials: include)
```

## Technology stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion (animations),
  React Router, lucide-react (icons)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT in an httpOnly cookie, bcrypt password hashing,
  express-validator for input validation

## Database design

8 tables: `users`, `characters` (1:1 with users), `quests`,
`quest_history` (append-only), `items`, `inventory`, `achievements`,
`user_achievements`. Full definitions with foreign keys, unique
constraints, and indexes are in `backend/db/schema.sql`.

## RPG formulas

**XP to reach the next level** (from `backend/utils/leveling.js`):
```
xpRequiredForLevel(level) = round(100 x level^1.5)
```
Level and "XP into current level" are computed from lifetime XP every
time — never stored as separate trusted fields — so leveling can't be
spoofed by sending a level directly.

**Quest rewards** (from `backend/utils/rewards.js`):

| Difficulty | XP | Glimmer |
|---|---|---|
| Easy | 15 | 8 |
| Medium | 30 | 15 |
| Hard | 55 | 28 |
| Epic | 100 | 50 |

## Security model

- Every protected route requires a valid JWT (via `requireAuth`
  middleware); `req.userId` — never a client-supplied user ID — is
  used in every ownership-filtering `WHERE` clause.
- Quest completion and shop purchases run inside DB transactions with
  `FOR UPDATE` row locks, preventing duplicate-completion and
  double-spend race conditions from rapid repeated requests.
- Reward amounts are never accepted from the client at any endpoint —
  only a difficulty/item ID selection, with the actual amount always
  looked up server-side.

## Setup

### Backend
```
cd backend
cp .env.example .env      # fill in DB credentials + a JWT secret
npm install
npm run db:schema         # creates the aether_drift database + tables
npm run db:seed           # seeds shop items + achievements
npm run dev                # http://localhost:4000
```

### Frontend
```
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:4000
npm install
npm run dev                # http://localhost:5173
```

### Environment variables
See `.env.example` in each folder. Backend needs `DB_HOST`,
`DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`,
`CLIENT_ORIGIN`. Frontend needs `VITE_API_URL`.

## API overview

```
GET  /api/health

POST /api/auth/signup        { name, email, password, confirmPassword }
POST /api/auth/login         { email, password }
POST /api/auth/logout
GET  /api/auth/me

GET  /api/character

GET    /api/quests           ?completed=true|false
POST   /api/quests           { title, description?, category?, difficulty?, attribute?, dueDate? }
PUT    /api/quests/:id       (same body shape; blocked once completed)
DELETE /api/quests/:id
POST   /api/quests/:id/complete

GET  /api/shop
POST /api/shop/:itemId/purchase
POST /api/shop/:itemId/equip

GET  /api/achievements
```

## How the RPG system works (for judging)

1. Create a quest and pick a difficulty — the server assigns the
   actual XP/Glimmer values from a fixed table at that moment.
2. Complete the quest — one transaction: mark it completed, credit
   XP/Glimmer/the relevant attribute to your character, update your
   streak, log the completion to `quest_history`, and check for any
   newly-earned achievements.
3. Level and XP-into-level shown anywhere in the UI are recalculated
   from lifetime XP every time — open dev tools and inspect the
   completion response: it contains only the amounts earned, never a
   level or total, because the server is the only source of truth for
   those.

## Deployment

**Backend** — any Node host with a MySQL add-on works (Render, Railway,
Fly.io). General steps:
1. Provision a MySQL database on your host.
2. Set the backend's environment variables to point at it, plus a
   production `JWT_SECRET` and `CLIENT_ORIGIN` set to your deployed
   frontend URL.
3. Run `npm run db:schema` and `npm run db:seed` against the
   production database once (most hosts let you run a one-off command).
4. Deploy with the start command `npm start`.

**Frontend** — any static host (Vercel, Netlify):
1. Set `VITE_API_URL` to your deployed backend's URL.
2. Build command `npm run build`, output directory `dist`.

## Demo video checklist

- [ ] Sign up for a new account
- [ ] Create a Waypoint (quest)
- [ ] Complete it — show the XP/Glimmer toast
- [ ] Show the Level/XP bar and an attribute bar update
- [ ] Purchase an item in the shop with earned Glimmer
- [ ] Refresh the page — show XP, gold, and quest history persisted
- [ ] (Optional) complete enough quests/streak days on a test account
      beforehand to show an achievement unlock live

## Team / Contributors

<<<<<<< HEAD
Sharon Lugun
Avani Mitra
Sony Jose J
Nandyala Angel Jessica Joseph
>>>>>>> 
