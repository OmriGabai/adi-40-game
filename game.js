/* ============================================
   ADI VS THE BIG 4-0 - GAME LOGIC
   ============================================ */

// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
  gameDuration: 60,
  pitzDuration: 5,
  pitzTriggerTime: 10, // Pitz appears when timer hits this
  spawnInterval: 800, // ms between spawns

  // Visibility durations (ms)
  normalVisibility: 1500,
  familyVisibility: 700,

  // Scoring
  points: {
    gift: 10,
    cake: 15,
    balloon: 5,
    family: 30,
    eran: 50,
    bad: -20,
    pitzTap: 5,
    pitzBonus40: 40
  }
};

// ============================================
// CHARACTER DEFINITIONS
// ============================================

const CHARACTERS = {
  good: [
    { emoji: '🎁', name: '', type: 'good', points: CONFIG.points.gift, message: 'Ooh, presents!' },
    { emoji: '🎂', name: '', type: 'good', points: CONFIG.points.cake, message: 'More cake!' },
    { emoji: '🎈', name: '', type: 'good', points: CONFIG.points.balloon, message: 'Pop!' },
  ],
  bad: [
    { emoji: '4️⃣0️⃣', name: '', type: 'bad', points: CONFIG.points.bad, message: 'NOOOOO!' },
    { emoji: '👓', name: '', type: 'bad', points: CONFIG.points.bad, message: "Bifocals of Doom!" },
    { emoji: '🦳', name: '', type: 'bad', points: CONFIG.points.bad, message: 'Wisdom strand!' },
    { emoji: '💊', name: '', type: 'bad', points: CONFIG.points.bad, message: 'Vitamins already?!' },
  ],
  family: [
    { emoji: '👧', name: 'Gal', type: 'family', points: CONFIG.points.family, message: "Gal: Mom's still got it!" },
    { emoji: '👦', name: 'Bar', type: 'family', points: CONFIG.points.family, message: "Bar: Happy 40th, Mom!" },
    { emoji: '👶', name: 'Liv', type: 'family', points: CONFIG.points.family, message: "Liv: You're the best!" },
    { emoji: '👨', name: 'Eran', type: 'family', points: CONFIG.points.eran, message: "Eran: You don't look a day over 39!" },
  ]
};

// Pitz messages for different tap counts
const PITZ_MESSAGES = {
  default: ['Meow!', 'MEOW!', 'Mrrrow!', 'Prrrt?'],
  milestones: {
    10: 'Pitz is warming up...',
    20: 'Pitz is purring!',
    30: 'PITZ IS IN HEAVEN!',
    40: '🎉 +40 BONUS for hitting 40!'
  }
};

// End game messages
const END_MESSAGES = {
  high: { title: '🎉 ADI DEFEATED THE BIG 4-0! 🎉', message: "(Don't worry, 41 is downloading...)" },
  medium: { title: 'Not Bad! 😄', message: "Pretty good for someone turning 40!" },
  low: { title: 'The 40 Won... 👓', message: "But Adi's still fabulous!" }
};

// ============================================
// GAME STATE
// ============================================

const gameState = {
  score: 0,
  timeLeft: CONFIG.gameDuration,
  isPlaying: false,
  isPitzRound: false,
  holes: Array(9).fill(null), // null = empty, object = character
  pitzTaps: 0,
  pitzBonusAwarded: false,
  playerName: '',
  gameScore: 0, // Score before Pitz round
  timerInterval: null,
  spawnInterval: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  screens: {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    pitz: document.getElementById('pitz-screen'),
    end: document.getElementById('end-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
  },
  playerName: document.getElementById('player-name'),
  startBtn: document.getElementById('start-btn'),
  leaderboardBtn: document.getElementById('leaderboard-btn'),
  score: document.getElementById('score'),
  timer: document.getElementById('timer'),
  messagePopup: document.getElementById('message-popup'),
  gameBoard: document.getElementById('game-board'),
  holes: document.querySelectorAll('.hole'),
  pitzTime: document.getElementById('pitz-time'),
  pitzTaps: document.getElementById('pitz-taps'),
  pitzMessage: document.getElementById('pitz-message'),
  pitzCat: document.getElementById('pitz-cat'),
  endTitle: document.getElementById('end-title'),
  endMessage: document.getElementById('end-message'),
  finalGameScore: document.getElementById('final-game-score'),
  finalPitzScore: document.getElementById('final-pitz-score'),
  finalTotalScore: document.getElementById('final-total-score'),
  savingIndicator: document.getElementById('saving-indicator'),
  playAgainBtn: document.getElementById('play-again-btn'),
  endLeaderboardBtn: document.getElementById('end-leaderboard-btn'),
  leaderboardList: document.getElementById('leaderboard-list'),
  backBtn: document.getElementById('back-btn')
};

// ============================================
// SOUND SYSTEM (Web Audio API)
// ============================================

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(frequency, duration, type = 'sine') {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

function playGoodSound() {
  playTone(523, 0.1); // C5
  setTimeout(() => playTone(659, 0.1), 50); // E5
}

function playBadSound() {
  playTone(200, 0.2, 'sawtooth');
}

function playFamilySound() {
  playTone(523, 0.08);
  setTimeout(() => playTone(659, 0.08), 60);
  setTimeout(() => playTone(784, 0.15), 120); // G5
}

function playMeowSound() {
  // Meow-like sound
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.setValueAtTime(700, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.2);
}

function playPurrSound() {
  // Longer purr-like sound
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      playTone(80 + Math.random() * 40, 0.15, 'sine');
    }, i * 100);
  }
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showScreen(screenName) {
  Object.values(elements.screens).forEach(screen => {
    screen.classList.remove('active');
  });
  elements.screens[screenName].classList.add('active');
}

// ============================================
// MESSAGE POPUP
// ============================================

let messageTimeout = null;

function showMessage(text, type = 'good') {
  if (messageTimeout) clearTimeout(messageTimeout);

  elements.messagePopup.textContent = text;
  elements.messagePopup.className = `message-popup show ${type}`;

  messageTimeout = setTimeout(() => {
    elements.messagePopup.classList.remove('show');
  }, 600);
}

// ============================================
// GAME LOGIC
// ============================================

function resetGame() {
  gameState.score = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.isPlaying = false;
  gameState.isPitzRound = false;
  gameState.holes = Array(9).fill(null);
  gameState.pitzTaps = 0;
  gameState.pitzBonusAwarded = false;
  gameState.gameScore = 0;

  // Clear all holes
  elements.holes.forEach(hole => {
    const char = hole.querySelector('.character');
    char.className = 'character';
    char.innerHTML = '';
  });

  updateUI();
}

function updateUI() {
  elements.score.textContent = gameState.score;
  elements.timer.textContent = gameState.timeLeft;

  // Timer warning colors
  elements.timer.classList.remove('warning', 'danger');
  if (gameState.timeLeft <= 10 && gameState.timeLeft > 5) {
    elements.timer.classList.add('warning');
  } else if (gameState.timeLeft <= 5) {
    elements.timer.classList.add('danger');
  }
}

function updateScore(points) {
  gameState.score = Math.max(0, gameState.score + points);
  updateUI();
}

function getRandomCharacter() {
  // Weighted random selection
  const rand = Math.random();
  let pool;

  if (rand < 0.15) {
    // 15% chance for family (rare but rewarding)
    pool = CHARACTERS.family;
  } else if (rand < 0.35) {
    // 20% chance for bad items
    pool = CHARACTERS.bad;
  } else {
    // 65% chance for good items
    pool = CHARACTERS.good;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function getEmptyHole() {
  const emptyHoles = [];
  gameState.holes.forEach((hole, index) => {
    if (hole === null) emptyHoles.push(index);
  });

  if (emptyHoles.length === 0) return -1;
  return emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
}

function spawnCharacter() {
  if (!gameState.isPlaying || gameState.isPitzRound) return;

  const holeIndex = getEmptyHole();
  if (holeIndex === -1) return;

  const character = getRandomCharacter();
  gameState.holes[holeIndex] = character;

  const holeEl = elements.holes[holeIndex];
  const charEl = holeEl.querySelector('.character');

  // Set character appearance
  charEl.innerHTML = `
    <span class="emoji">${character.emoji}</span>
    ${character.name ? `<span class="name">${character.name}</span>` : ''}
  `;
  charEl.className = `character visible ${character.type}`;

  // Set visibility duration
  const duration = character.type === 'family' ? CONFIG.familyVisibility : CONFIG.normalVisibility;

  setTimeout(() => {
    if (gameState.holes[holeIndex] === character) {
      hideCharacter(holeIndex);
    }
  }, duration);
}

function hideCharacter(holeIndex) {
  gameState.holes[holeIndex] = null;
  const holeEl = elements.holes[holeIndex];
  const charEl = holeEl.querySelector('.character');
  charEl.classList.remove('visible');
}

function handleHoleTap(holeIndex) {
  if (!gameState.isPlaying || gameState.isPitzRound) return;

  const character = gameState.holes[holeIndex];
  if (!character) return; // Empty hole

  const holeEl = elements.holes[holeIndex];
  holeEl.classList.add('tapped');
  setTimeout(() => holeEl.classList.remove('tapped'), 200);

  // Update score and show message
  updateScore(character.points);
  showMessage(character.message, character.type);

  // Play sound
  if (character.type === 'good') {
    playGoodSound();
  } else if (character.type === 'bad') {
    playBadSound();
  } else if (character.type === 'family') {
    playFamilySound();
  }

  // Hide character
  hideCharacter(holeIndex);
}

function startGame() {
  const name = elements.playerName.value.trim();
  if (!name) {
    elements.playerName.focus();
    elements.playerName.style.animation = 'pulse 0.3s ease-in-out 2';
    setTimeout(() => elements.playerName.style.animation = '', 600);
    return;
  }

  initAudio();
  resetGame();

  gameState.playerName = name;
  gameState.isPlaying = true;

  showScreen('game');

  // Start timer
  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateUI();

    if (gameState.timeLeft <= CONFIG.pitzTriggerTime && !gameState.isPitzRound) {
      startPitzRound();
    }
  }, 1000);

  // Start spawning
  gameState.spawnInterval = setInterval(spawnCharacter, CONFIG.spawnInterval);
  spawnCharacter(); // Immediate first spawn
}

// ============================================
// PITZ BONUS ROUND
// ============================================

function startPitzRound() {
  gameState.isPitzRound = true;
  gameState.gameScore = gameState.score;
  gameState.pitzTaps = 0;

  // Stop spawning
  clearInterval(gameState.spawnInterval);
  clearInterval(gameState.timerInterval);

  // Clear holes
  gameState.holes = Array(9).fill(null);
  elements.holes.forEach(hole => {
    const char = hole.querySelector('.character');
    char.classList.remove('visible');
  });

  showScreen('pitz');

  // Pitz timer
  let pitzTime = CONFIG.pitzDuration;
  elements.pitzTime.textContent = pitzTime;
  elements.pitzTaps.textContent = '0';
  elements.pitzMessage.textContent = 'TAP TAP TAP!';

  const pitzTimer = setInterval(() => {
    pitzTime--;
    elements.pitzTime.textContent = pitzTime;

    if (pitzTime <= 0) {
      clearInterval(pitzTimer);
      endPitzRound();
    }
  }, 1000);
}

function handlePitzTap() {
  if (!gameState.isPitzRound) return;

  gameState.pitzTaps++;
  elements.pitzTaps.textContent = gameState.pitzTaps;

  // Bounce animation
  elements.pitzCat.classList.add('happy');
  setTimeout(() => elements.pitzCat.classList.remove('happy'), 100);

  // Play meow
  playMeowSound();

  // Check milestones
  const milestone = PITZ_MESSAGES.milestones[gameState.pitzTaps];
  if (milestone) {
    elements.pitzMessage.textContent = milestone;

    // Award 40-tap bonus
    if (gameState.pitzTaps === 40 && !gameState.pitzBonusAwarded) {
      gameState.pitzBonusAwarded = true;
    }
  } else {
    // Random meow message
    const msg = PITZ_MESSAGES.default[Math.floor(Math.random() * PITZ_MESSAGES.default.length)];
    elements.pitzMessage.textContent = msg;
  }
}

function endPitzRound() {
  gameState.isPitzRound = false;
  gameState.isPlaying = false;

  // Play purr
  playPurrSound();

  // Calculate final score
  const pitzScore = gameState.pitzTaps * CONFIG.points.pitzTap +
                    (gameState.pitzBonusAwarded ? CONFIG.points.pitzBonus40 : 0);
  const totalScore = gameState.gameScore + pitzScore;

  // Show end screen
  setTimeout(() => {
    showEndScreen(gameState.gameScore, pitzScore, totalScore);
  }, 1000);
}

// ============================================
// END SCREEN
// ============================================

function showEndScreen(gameScore, pitzScore, totalScore) {
  // Determine message based on score
  let endData;
  if (totalScore >= 200) {
    endData = END_MESSAGES.high;
  } else if (totalScore >= 100) {
    endData = END_MESSAGES.medium;
  } else {
    endData = END_MESSAGES.low;
  }

  elements.endTitle.textContent = endData.title;
  elements.endMessage.textContent = endData.message;
  elements.finalGameScore.textContent = gameScore;
  elements.finalPitzScore.textContent = pitzScore;
  elements.finalTotalScore.textContent = totalScore;

  showScreen('end');

  // Save score
  saveScore(gameState.playerName, totalScore);
}

// ============================================
// FIREBASE / LEADERBOARD
// ============================================

// Firebase initialized status (set by firebase-config.js)
let firebaseInitialized = window.firebaseInitialized || false;

async function saveScore(name, score) {
  elements.savingIndicator.textContent = 'Saving score...';
  elements.savingIndicator.classList.remove('hidden');

  try {
    if (typeof firebase !== 'undefined' && firebaseInitialized) {
      await firebase.database().ref('scores').push({
        name: name,
        score: score,
        timestamp: Date.now()
      });
      elements.savingIndicator.textContent = 'Score saved!';
    } else {
      // Fallback: save locally
      const scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
      scores.push({ name, score, timestamp: Date.now() });
      localStorage.setItem('adi40scores', JSON.stringify(scores));
      elements.savingIndicator.textContent = 'Score saved locally!';
    }
  } catch (error) {
    console.error('Error saving score:', error);
    // Fallback to local storage
    const scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
    scores.push({ name, score, timestamp: Date.now() });
    localStorage.setItem('adi40scores', JSON.stringify(scores));
    elements.savingIndicator.textContent = 'Score saved locally!';
  }

  setTimeout(() => {
    elements.savingIndicator.classList.add('hidden');
  }, 2000);
}

async function loadLeaderboard() {
  elements.leaderboardList.innerHTML = '<p class="loading">Loading scores...</p>';

  let scores = [];

  try {
    if (typeof firebase !== 'undefined' && firebaseInitialized) {
      const snapshot = await firebase.database().ref('scores')
        .orderByChild('score')
        .limitToLast(10)
        .once('value');

      snapshot.forEach(child => {
        scores.push(child.val());
      });
      scores.reverse(); // Highest first
    } else {
      // Load from local storage
      scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10);
    }
  } catch (error) {
    console.error('Error loading scores:', error);
    scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
  }

  if (scores.length === 0) {
    elements.leaderboardList.innerHTML = '<p class="loading">No scores yet. Be the first!</p>';
    return;
  }

  elements.leaderboardList.innerHTML = scores.map((entry, index) => {
    let rankClass = '';
    if (index === 0) rankClass = 'gold';
    else if (index === 1) rankClass = 'silver';
    else if (index === 2) rankClass = 'bronze';

    return `
      <div class="leaderboard-entry">
        <span class="rank ${rankClass}">#${index + 1}</span>
        <span class="name">${entry.name}</span>
        <span class="entry-score">${entry.score}</span>
      </div>
    `;
  }).join('');
}

function showLeaderboard() {
  showScreen('leaderboard');
  loadLeaderboard();
}

// ============================================
// EVENT LISTENERS
// ============================================

// Start button
elements.startBtn.addEventListener('click', startGame);

// Enter key on name input
elements.playerName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') startGame();
});

// Hole taps
elements.holes.forEach((hole, index) => {
  hole.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleHoleTap(index);
  });
});

// Pitz tap
elements.pitzCat.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handlePitzTap();
});

// Leaderboard buttons
elements.leaderboardBtn.addEventListener('click', showLeaderboard);
elements.endLeaderboardBtn.addEventListener('click', showLeaderboard);

// Back button
elements.backBtn.addEventListener('click', () => {
  showScreen('start');
});

// Play again
elements.playAgainBtn.addEventListener('click', () => {
  showScreen('start');
});

// Prevent zoom on double tap
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Initialize
console.log("🎂 Adi vs The Big 4-0 - Game loaded!");
console.log("Add Firebase config to enable online leaderboard.");
