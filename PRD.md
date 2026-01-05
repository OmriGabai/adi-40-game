# Adi's 40th Birthday Game - Project Plan

## Overview
A simple, funny tap/whack-a-mole style mobile web game for Adi's 40th birthday party tomorrow.

**Project Location:** `/Users/omri/Documents/Code/adi-40-game/`
**Target Build Time:** 1-2 hours
**Priority:** Working game > Perfect game

---

## ⚡ CRITICAL: 1-2 Hour MVP Scope

### MUST BUILD (Core - 60 min)
| Feature | Time | Priority |
|---------|------|----------|
| Game board (3x3 grid) | 10 min | P0 |
| Tap detection | 10 min | P0 |
| Spawning system (good/bad items) | 15 min | P0 |
| Score + Timer | 5 min | P0 |
| Family members (faster, higher points) | 10 min | P0 |
| Pitz bonus round (simple) | 10 min | P0 |

### SHOULD BUILD (Polish - 30 min)
| Feature | Time | Priority |
|---------|------|----------|
| Firebase scoreboard | 15 min | P1 |
| Basic sound effects | 10 min | P1 |
| Funny text labels | 5 min | P1 |

### SKIP IF SHORT ON TIME
| Feature | Why Skip |
|---------|----------|
| Fancy animations | CSS transitions are enough |
| Difficulty progression | Fixed difficulty is fine |
| Multiple sound variations | One sound per action is enough |
| Particle effects | Not essential for fun |

---

## 🛡️ Bug Prevention Strategy

### Common Mobile Game Bugs & Prevention

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUG PREVENTION CHECKLIST                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. TAP DETECTION ISSUES                                                │
│     Problem: Taps not registering, ghost taps, double-taps              │
│     Prevention:                                                         │
│     ✓ Use 'pointerdown' event (works for touch + mouse)                 │
│     ✓ Add visual feedback on EVERY tap (scale animation)                │
│     ✓ Debounce: 100ms cooldown per hole                                 │
│     ✓ Prevent default to stop text selection/zoom                       │
│                                                                         │
│  2. TIMING ISSUES                                                       │
│     Problem: Timer drift, spawns too fast/slow                          │
│     Prevention:                                                         │
│     ✓ Use setInterval for timer (simple, good enough)                   │
│     ✓ Track lastSpawnTime to prevent overlap                            │
│     ✓ Minimum 300ms between spawns in same hole                         │
│                                                                         │
│  3. SPAWN OVERLAP                                                       │
│     Problem: Two items in same hole                                     │
│     Prevention:                                                         │
│     ✓ Track occupied holes in array                                     │
│     ✓ Only spawn in empty holes                                         │
│     ✓ Clear hole state when item disappears                             │
│                                                                         │
│  4. MOBILE SOUND ISSUES                                                 │
│     Problem: Sounds won't play (autoplay policy)                        │
│     Prevention:                                                         │
│     ✓ Unlock audio on first user tap (start button)                     │
│     ✓ Preload all sounds on game start                                  │
│     ✓ Use Audio pool (3 instances per sound) for overlap                │
│                                                                         │
│  5. PERFORMANCE LAG                                                     │
│     Problem: Stuttering, slow response                                  │
│     Prevention:                                                         │
│     ✓ Use CSS transforms (GPU accelerated)                              │
│     ✓ Minimal DOM manipulation                                          │
│     ✓ No heavy computations in game loop                                │
│     ✓ Avoid creating new objects in loop (reuse)                        │
│                                                                         │
│  6. FIREBASE FAILURES                                                   │
│     Problem: Score doesn't save, network error                          │
│     Prevention:                                                         │
│     ✓ Show loading spinner while saving                                 │
│     ✓ Catch errors and show "saved locally" fallback                    │
│     ✓ Retry once on failure                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Code Architecture for Stability

```javascript
// SIMPLE, STABLE GAME STATE
const gameState = {
  score: 0,
  timeLeft: 60,
  isPlaying: false,
  isPitzRound: false,
  holes: [false, false, false, false, false, false, false, false, false], // 9 holes
  pitzTaps: 0
};

// SINGLE SOURCE OF TRUTH - prevents state bugs
function updateScore(points) {
  gameState.score = Math.max(0, gameState.score + points);
  renderScore(); // Always sync UI
}
```

---

## 😂 Funny Elements (Quick Wins)

### Instant Humor - Zero Extra Code

**Bad Item Labels (just text):**
| Item | Funny Name | On-Tap Message |
|------|------------|----------------|
| 👓 | "Bifocals of Doom" | "Adi can't see this!" |
| 4️⃣0️⃣ | "The Forbidden Number" | "NOOOOO!" |
| 🦳 | "Wisdom Strand" | "Distinguished!" |
| 💊 | "Vitamin of Youth" | "Take daily!" |
| 🩼 | "Early Bird Walker" | "Not yet!" |

**Good Item Messages:**
| Item | On-Tap Message |
|------|----------------|
| 🎁 | "Ooh, presents!" |
| 🎂 | "More cake!" |
| 🎈 | "Pop!" |

**Family Catch Phrases:**
| Character | On-Catch Message |
|-----------|------------------|
| Gal | "Gal: Mom's still got it!" |
| Bar | "Bar: Happy 40th, Mom!" |
| Liv | "Liv: You're the best!" |
| Eran | "Eran: You don't look a day over 39!" |

### Pitz the Cat - Comedy Gold

```
PITZ BONUS ROUND MESSAGES:

On Appear:
  "🐱 PITZ APPEARS!"
  "Quick! Pet the cat for bonus points!"

During Tapping (random each tap):
  - "Meow!" (basic)
  - "MEOW!" (excited)
  - "Mrrrow!" (pleased)
  - "Prrrt?" (confused)

Tap Milestones:
  - 10 taps: "Pitz is warming up..."
  - 20 taps: "Pitz is purring!"
  - 30 taps: "PITZ IS IN HEAVEN!"
  - 40 taps: "🎉 PITZ EXPLOSION! +40 BONUS for hitting 40!"

End Message:
  "Purrrrrrrr... 🐱"
  "Pitz approves. You may continue aging gracefully."
```

### Victory/Defeat Screens

```
VICTORY (score > 200):
  "🎉 ADI DEFEATED THE BIG 4-0! 🎉"
  "Final Score: [X]"
  "Pitz Bonus: [Y]"
  "(Don't worry, 41 is downloading...)"

GOOD SCORE (100-200):
  "Not bad for someone turning 40! 😄"

LOW SCORE (< 100):
  "The 40 won this round... 👓"
  "But Adi's still fabulous!"
```

### Start Screen

```
"🎂 ADI VS THE BIG 4-0 🎂"
"Help Adi survive turning 40!"
"Tap gifts & family for points"
"Avoid the signs of aging!"
"⚠️ BEWARE OF PITZ THE CAT ⚠️"

[Enter Your Name]
[START GAME]
```

---

## Game Concept: "Adi vs. The Big 4-0"

### Core Gameplay
- Whack-a-mole style game - characters pop up from holes/positions
- 60-second rounds with increasing difficulty
- Mobile-first touch controls

### Scoring Tiers

| Type | Items | Behavior | Points |
|------|-------|----------|--------|
| **Regular Good** | 🎁 🎂 🎈 | Normal speed, 1.5s visible | +10 |
| **Family (SPECIAL)** | Gal, Bar, Liv, Eran | **Fast moving + shorter visibility (0.7s)** | +30 to +50 |
| **Bad (AVOID)** | 4️⃣0️⃣ 👓 🦳 💊 🩼 | Normal speed | -20 |

### Family Members - Special Mechanic
- **Appear for only 0.7 seconds** (vs 1.5s for regular items)
- **Move/wiggle** making them harder to tap
- **Higher rewards** for the challenge:
  - Kids (Gal, Bar, Liv): +30 points each
  - Husband (Eran): +50 points (hardest to catch, fastest)

### Pitz the Cat - BONUS ROUND
Appears at the end of the game (last 10 seconds):
- **Rapid-tap mechanic**: Tap as fast as possible in 5-second window
- **More taps = More points**: Each tap = +5 points
- **Sound effects**:
  - Each tap: "Meow!" sound
  - When timer ends: Long satisfying "Purrrrrr" sound
- **Visual**: Pitz bounces/shakes with each tap, gets progressively happier

### Humor Elements
- "Over the hill" jokes in game text
- Bad items have funny labels ("Bifocals of Doom", "The Dreaded 40")
- Victory screen: "Adi conquered 40! (But 41 is coming...)"
- Pitz's purr screen: "Pitz approves. You may age gracefully."

## Tech Stack (Simplicity-First)

| Component | Technology | Why |
|-----------|------------|-----|
| Game | Vanilla HTML/CSS/JS | Fast to build, no setup |
| Graphics | CSS + Emojis + Simple SVGs | Quick, works everywhere |
| Scoreboard | Firebase Realtime DB | Free tier, easy setup |
| Hosting | Vercel | Free, GitHub integration |

## Project Structure

```
adi-40-game/
├── index.html          # Main game page
├── style.css           # Game styling + animations
├── game.js             # Game logic
├── firebase-config.js  # Firebase setup for scoreboard
├── assets/
│   └── (optional simple images/sounds)
└── README.md
```

## Implementation Steps

### 1. Project Setup (5 min)
- [ ] Create new directory `adi-40-game`
- [ ] Initialize with basic HTML5 template
- [ ] Set up mobile-responsive viewport

### 2. Game UI (20 min)
- [ ] Create game board with 9 "holes" (3x3 grid)
- [ ] Style for mobile-first (touch-friendly, large tap targets)
- [ ] Add score display, timer, lives counter
- [ ] Create start screen with "Adi's 40th Birthday!" title
- [ ] Create game over / victory screens

### 3. Core Game Logic (30 min)
- [ ] Random character spawning system
- [ ] Tap detection and scoring
- [ ] Point values: Gifts (+10), Family (+25), Bad items (-15)
- [ ] Timer countdown (60 seconds)
- [ ] Difficulty progression (faster spawns over time)

### 4. Characters & Humor (15 min)
- [ ] Good items: 🎁 🎂 🎈 ❤️
- [ ] Family avatars with names: Gal, Bar, Liv, Eran
- [ ] Bad items: "40" 👓 (reading glasses) 🦳 (gray hair)
- [ ] Add funny popup text on hits/misses

### 5. Final Boss: Pitz (15 min)
- [ ] At 15 seconds remaining, Pitz appears
- [ ] Requires 10 taps to defeat
- [ ] Cat says funny things: "Adi's getting OLD!", "Meow-ver the hill!"
- [ ] Victory celebration if defeated

### 6. Scoreboard with Firebase (20 min)
- [ ] Set up Firebase project (free tier)
- [ ] Add player name input before game
- [ ] Save scores to Firebase Realtime DB
- [ ] Display top 10 leaderboard
- [ ] Show leaderboard after game ends

### 7. Hosting on Vercel (10 min)
- [ ] Push code to GitHub repository
- [ ] Connect repo to Vercel
- [ ] Deploy and get shareable URL
- [ ] Test on mobile device

## Character Design (Simple CSS/Emoji)

| Character | Visual | Points | Notes |
|-----------|--------|--------|-------|
| Gift | 🎁 | +10 | Common spawn |
| Cake | 🎂 | +15 | Less common |
| Balloon | 🎈 | +5 | Very common |
| Gal | 👧 "Gal" | +25 | Kid bonus |
| Bar | 👦 "Bar" | +25 | Kid bonus |
| Liv | 👶 "Liv" | +25 | Kid bonus |
| Eran | 👨 "Eran" | +30 | Husband bonus |
| The "40" | 4️⃣0️⃣ | -20 | AVOID! |
| Glasses | 👓 | -15 | AVOID! |
| Pitz (Boss) | 🐱 "Pitz" | Win condition | 10 taps to defeat |

## Firebase Setup Notes

1. Create project at console.firebase.google.com
2. Enable Realtime Database
3. Set rules to allow read/write (for simplicity):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
4. Copy config to firebase-config.js

## Vercel Deployment

1. Create GitHub repo
2. Go to vercel.com → Import project
3. Select repo → Deploy
4. Share URL with party guests!

## Timeline Estimate

| Task | Time |
|------|------|
| Setup | 5 min |
| UI | 20 min |
| Game Logic | 30 min |
| Characters | 15 min |
| Boss Fight | 15 min |
| Scoreboard | 20 min |
| Deploy | 10 min |
| Testing | 15 min |
| **Total** | **~2 hours** |

---

## Team Agents

### Agent Definitions

Each agent is a specialized Task agent with a specific role and responsibilities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT TEAM STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📋 PRODUCT MANAGER (PM)                                                    │
│  ├── Role: Requirements clarification & feature prioritization              │
│  ├── Responsibilities:                                                      │
│  │   • Clarify ambiguous requirements                                       │
│  │   • Define acceptance criteria for each feature                          │
│  │   • Prioritize features given time constraints (tomorrow!)               │
│  │   • Create user stories                                                  │
│  │   • Validate that implementation matches requirements                    │
│  └── Agent Type: general-purpose                                            │
│                                                                             │
│  🎮 GAME DEVELOPER                                                          │
│  ├── Role: Core game logic implementation                                   │
│  ├── Responsibilities:                                                      │
│  │   • Implement game mechanics (spawning, scoring, timing)                 │
│  │   • Build tap detection and hit registration                             │
│  │   • Create difficulty progression system                                 │
│  │   • Implement special mechanics (family wiggle, Pitz rapid-tap)          │
│  │   • Integrate sound effects                                              │
│  │   • Handle game state (start, playing, bonus round, end)                 │
│  └── Agent Type: general-purpose                                            │
│                                                                             │
│  🎨 DESIGNER                                                                │
│  ├── Role: UI/UX and visual design                                          │
│  ├── Responsibilities:                                                      │
│  │   • Design mobile-first responsive layout                                │
│  │   • Create character visuals (CSS/emoji-based)                           │
│  │   • Design animations (pop-up, wiggle, tap feedback)                     │
│  │   • Style game screens (start, game, bonus, end, leaderboard)            │
│  │   • Ensure touch targets are finger-friendly (min 44px)                  │
│  │   • Create visual feedback for hits/misses                               │
│  └── Agent Type: general-purpose                                            │
│                                                                             │
│  🧪 QA ENGINEER                                                             │
│  ├── Role: Testing and bug fixing                                           │
│  ├── Responsibilities:                                                      │
│  │   • Test all game mechanics work correctly                               │
│  │   • Verify scoring is accurate                                           │
│  │   • Test on different screen sizes                                       │
│  │   • Check for edge cases (rapid taps, simultaneous spawns)               │
│  │   • Verify sound effects play correctly                                  │
│  │   • Test Firebase scoreboard saves/loads properly                        │
│  │   • Apply fixes for any bugs found                                       │
│  └── Agent Type: general-purpose                                            │
│                                                                             │
│  🔧 CODE QUALITY ENGINEER                                                   │
│  ├── Role: Code standards and best practices                                │
│  ├── Responsibilities:                                                      │
│  │   • Review code for duplication - DRY principle                          │
│  │   • Ensure clear, readable code structure                                │
│  │   • Proper separation of concerns (HTML/CSS/JS)                          │
│  │   • Meaningful variable/function names                                   │
│  │   • Remove dead code and console.logs                                    │
│  │   • Ensure consistent code style                                         │
│  │   • Optimize performance where needed                                    │
│  └── Agent Type: general-purpose                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Workflow

```
Phase 1: Requirements
┌──────────────────┐
│  Product Manager │ ──→ Clarify all requirements, create acceptance criteria
└──────────────────┘

Phase 2: Implementation
┌──────────────────┐     ┌──────────────────┐
│  Game Developer  │ ←──→│     Designer     │  (Work in parallel)
└──────────────────┘     └──────────────────┘

Phase 3: Quality
┌──────────────────┐     ┌──────────────────┐
│   QA Engineer    │ ──→ │ Code Quality Eng │  (Test, then clean up)
└──────────────────┘     └──────────────────┘

Phase 4: Final Review
┌──────────────────┐
│  Product Manager │ ──→ Validate against acceptance criteria
└──────────────────┘
```

### How Agents Will Be Invoked

```javascript
// Example: Invoke Product Manager
Task(subagent_type="general-purpose", prompt=`
  You are the PRODUCT MANAGER for "Adi vs. The Big 4-0" game.

  Review these requirements and create clear acceptance criteria:
  [requirements here]

  Output: User stories with acceptance criteria
`)

// Example: Invoke QA Engineer
Task(subagent_type="general-purpose", prompt=`
  You are the QA ENGINEER for "Adi vs. The Big 4-0" game.

  Test the following functionality:
  - Tap detection accuracy
  - Scoring calculations
  - Timer countdown
  - Pitz bonus round mechanics

  Report bugs found and apply fixes.
`)
```

---

## Implementation Phases with Agents

### Phase 1: Requirements (Product Manager)
| Task | Agent | Output |
|------|-------|--------|
| Clarify game requirements | **PM** | Detailed acceptance criteria |
| Prioritize for MVP | **PM** | Must-have vs nice-to-have list |
| Define scoring rules | **PM** | Exact point values and rules |

### Phase 2: Design & Development (Designer + Game Dev)
| Task | Agent | Output |
|------|-------|--------|
| Create game board layout | **Designer** | HTML + CSS structure |
| Design character visuals | **Designer** | CSS classes for each character |
| Build animations | **Designer** | CSS keyframes |
| Implement spawning system | **Game Dev** | JS game loop |
| Build tap detection | **Game Dev** | JS event handlers |
| Implement scoring | **Game Dev** | JS score management |
| Build Pitz bonus round | **Game Dev** | JS bonus round logic |
| Add sound effects | **Game Dev** | JS audio integration |

### Phase 3: Backend (Game Dev)
| Task | Agent | Output |
|------|-------|--------|
| Firebase integration | **Game Dev** | firebase-config.js |
| Scoreboard save/load | **Game Dev** | JS Firebase functions |
| Leaderboard display | **Designer** | HTML + CSS for leaderboard |

### Phase 4: Quality (QA + Code Quality)
| Task | Agent | Output |
|------|-------|--------|
| Functional testing | **QA** | Bug report + fixes |
| Mobile responsiveness | **QA** | Responsive fixes |
| Sound testing | **QA** | Audio fixes |
| Code review | **Code Quality** | Refactored clean code |
| Remove duplications | **Code Quality** | DRY codebase |
| Final optimization | **Code Quality** | Optimized code |

### Phase 5: Validation (Product Manager)
| Task | Agent | Output |
|------|-------|--------|
| Validate vs requirements | **PM** | Sign-off or issues list |
| Final acceptance | **PM** | Ready for deployment |

---

## Sound Assets Needed

| Sound | When | Source |
|-------|------|--------|
| Pop/boop | Regular item tap | Free sound library |
| Cha-ching | Family member caught | Free sound library |
| Buzz/wrong | Bad item tapped | Free sound library |
| "Meow!" | Each Pitz tap | Free cat sound |
| "Purrrr" | Pitz round complete | Free cat sound |
| Victory jingle | Game win | Free sound library |

---

## Deliverables
1. Working mobile web game at a shareable Vercel URL
2. Real-time scoreboard for party competition
3. Personalized with Adi, Gal, Bar, Liv, Eran, and Pitz
4. Sound effects including cat meows and purrs

---

## 🚀 EXECUTION ORDER (Optimized for Speed)

### Step 1: Project Setup (5 min)
```bash
mkdir -p /Users/omri/Documents/Code/adi-40-game
cd /Users/omri/Documents/Code/adi-40-game
git init
```
Create: `index.html`, `style.css`, `game.js`

### Step 2: Build Core Game (35 min)
**Do these in order - each builds on previous:**

1. **HTML skeleton** (5 min)
   - Start screen, game board, end screen
   - 3x3 grid of holes
   - Score/timer display

2. **CSS styling** (10 min)
   - Mobile-first layout
   - Hole styling
   - Character pop-up animations
   - Touch-friendly sizes (min 60px)

3. **Basic game loop** (10 min)
   - Start/stop game
   - Timer countdown
   - Random spawning

4. **Tap detection & scoring** (10 min)
   - Pointer events
   - Score calculation
   - Visual feedback

### Step 3: Special Features (20 min)

5. **Family members** (8 min)
   - Faster disappear (0.7s)
   - Wiggle animation
   - Higher points

6. **Pitz bonus round** (12 min)
   - Triggers at 10 seconds left
   - Rapid tap counter
   - Meow sounds (use Web Audio beep if no time)
   - Final purr

### Step 4: Polish & Deploy (30 min)

7. **Sounds** (10 min)
   - Web Audio API simple tones OR
   - Free sound files from web

8. **Firebase scoreboard** (15 min)
   - User creates Firebase project
   - I write integration code
   - Test save/load

9. **Deploy** (5 min)
   - Push to GitHub
   - Connect to Vercel
   - Test on phone

---

## 📁 Final File Structure

```
/Users/omri/Documents/Code/adi-40-game/
├── index.html          # Single page with all screens
├── style.css           # All styles + animations
├── game.js             # All game logic
├── sounds.js           # Sound management (optional)
├── firebase-config.js  # Firebase setup
└── README.md           # Quick setup notes
```

---

## ✅ Pre-Flight Checklist (Before Party)

- [ ] Game loads on mobile browser
- [ ] Taps register correctly
- [ ] Score updates properly
- [ ] Timer counts down
- [ ] Family members are harder to tap
- [ ] Pitz bonus round triggers
- [ ] Meow sounds play
- [ ] Purr plays at end
- [ ] Scores save to Firebase
- [ ] Leaderboard displays
- [ ] Shareable URL works
