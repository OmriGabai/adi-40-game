/* ============================================
   ADI VS THE BIG 4-0 - GAME LOGIC
   ============================================ */

// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
  gameDuration: 20,
  pitzDuration: 6,
  pitzTriggerTime: 5, // Pitz appears when timer hits this
  spawnInterval: 400, // ms between spawns (faster = more chaos!)

  // Visibility durations (ms) - 50% longer for easier tapping
  normalVisibility: 1800,
  familyVisibility: 1200,

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
    { image: 'pics/gift.svg', name: 'Gift', type: 'good', points: CONFIG.points.gift, message: 'Ooh, presents!' },
    { image: 'pics/cake.svg', name: 'Cake', type: 'good', points: CONFIG.points.cake, message: 'More cake!' },
    { image: 'pics/balloon.svg', name: 'Balloon', type: 'good', points: CONFIG.points.balloon, message: 'Pop!' },
  ],
  bad: [
    { image: 'pics/forty.svg', name: '40', type: 'bad', points: CONFIG.points.bad, message: 'NOOOOO! The dreaded 40!' },
    { image: 'pics/glasses.svg', name: 'Glasses', type: 'bad', points: CONFIG.points.bad, message: "Bifocals of Doom!" },
    { image: 'pics/grayhair.svg', name: 'Grandma', type: 'bad', points: CONFIG.points.bad, message: 'Not yet grandma!' },
    { image: 'pics/pills.svg', name: 'Vitamins', type: 'bad', points: CONFIG.points.bad, message: 'Vitamins already?!' },
  ],
  family: [
    { image: 'pics/gal.jpg', name: 'Gal', type: 'family', points: CONFIG.points.family, message: "Gal: Mom's still got it!" },
    { image: 'pics/bar.jpg', name: 'Bar', type: 'family', points: CONFIG.points.family, message: "Bar: Happy 40th, Mom!" },
    { image: 'pics/liv.jpg', name: 'Liv', type: 'family', points: CONFIG.points.family, message: "Liv: You're the best!" },
    { image: 'pics/eran.JPG', name: 'Eran', type: 'family', points: CONFIG.points.eran, message: "Eran: You don't look a day over 39!" },
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
    countdown: document.getElementById('countdown-screen'),
    pitzCountdown: document.getElementById('pitz-countdown-screen'),
    game: document.getElementById('game-screen'),
    pitz: document.getElementById('pitz-screen'),
    end: document.getElementById('end-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
  },
  countdownText: document.getElementById('countdown-text'),
  pitzCountdownText: document.getElementById('pitz-countdown-text'),
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
  backBtn: document.getElementById('back-btn'),
  globalMuteBtn: document.getElementById('global-mute-btn')
};

// ============================================
// MUTE STATE
// ============================================

let isMuted = false;

function toggleMute() {
  isMuted = !isMuted;

  if (elements.globalMuteBtn) {
    elements.globalMuteBtn.classList.toggle('muted', isMuted);
  }

  // Mute/unmute all audio
  if (audio) {
    audio.gameplay.muted = isMuted;
    audio.boss.muted = isMuted;
    audio.purr.muted = isMuted;
    audio.meows.forEach(m => m.muted = isMuted);
  }
}

// ============================================
// SOUND SYSTEM (Audio Files)
// ============================================

// Audio elements - create fresh instances to avoid caching issues
let audio = null;

function createAudioElement(src) {
  const audio = new Audio();
  audio.preload = 'auto';
  // iOS-specific attributes
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.src = src;
  return audio;
}

function createAudioElements() {
  audio = {
    gameplay: createAudioElement('audio/gameplay-342069.mp3'),
    boss: createAudioElement('audio/boss-stage.mp3'),
    meows: [
      createAudioElement('audio/cat-meow-401729.mp3'),
      createAudioElement('audio/cat-meow-405456.mp3'),
      createAudioElement('audio/cat-meow-85175.mp3')
    ],
    purr: createAudioElement('audio/cat-purr-361421.mp3')
  };

  // Configure audio settings
  audio.gameplay.loop = true;
  audio.gameplay.volume = 0.4;
  audio.boss.loop = true;
  audio.boss.volume = 0.5;
  audio.purr.volume = 0.7;
  audio.meows.forEach(m => m.volume = 0.6);

  // Force load all audio into memory
  const allAudio = [audio.gameplay, audio.boss, audio.purr, ...audio.meows];
  allAudio.forEach(a => {
    a.load();
    // Pre-buffer by seeking to start
    a.currentTime = 0;
  });
}

// Initialize on page load
createAudioElements();

// ============================================
// RESOURCE PRELOADING
// ============================================

const ALL_IMAGES = [
  // Good items
  'pics/gift.svg',
  'pics/cake.svg',
  'pics/balloon.svg',
  // Bad items
  'pics/forty.svg',
  'pics/glasses.svg',
  'pics/grayhair.svg',
  'pics/pills.svg',
  // Family photos
  'pics/gal.jpg',
  'pics/bar.jpg',
  'pics/liv.jpg',
  'pics/eran.JPG',
  // Special
  'pics/pitz.jpg',
  'pics/adi.jpg'
];

let resourcesLoaded = false;
let loadingProgress = 0;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false); // Still resolve to not block
    img.src = src;
  });
}

function preloadAudio(audioElement) {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (audioElement.readyState >= 4) {
      resolve(true);
      return;
    }

    // Try to fetch the audio file to ensure it's cached
    const src = audioElement.src;
    if (src) {
      fetch(src)
        .then(response => response.blob())
        .then(() => {
          // Force reload from cache
          audioElement.load();
          resolve(true);
        })
        .catch(() => resolve(false));
    }

    // Also listen for canplaythrough as backup
    audioElement.addEventListener('canplaythrough', () => resolve(true), { once: true });
    audioElement.addEventListener('error', () => resolve(false), { once: true });

    // Timeout fallback
    setTimeout(() => resolve(true), 8000);
  });
}

async function preloadAllResources() {
  const loadingScreen = document.getElementById('loading-screen');
  const loaderText = loadingScreen?.querySelector('.loader-text');
  const startScreen = document.getElementById('start-screen');

  const totalResources = ALL_IMAGES.length + 6; // 6 audio files
  let loaded = 0;

  const updateProgress = () => {
    loaded++;
    loadingProgress = Math.round((loaded / totalResources) * 100);
    if (loaderText) {
      loaderText.textContent = `Loading... ${loadingProgress}%`;
    }
  };

  // Preload images
  const imagePromises = ALL_IMAGES.map(src =>
    preloadImage(src).then(result => {
      updateProgress();
      return result;
    })
  );

  // Preload audio
  const audioPromises = [];
  if (audio) {
    audioPromises.push(preloadAudio(audio.gameplay).then(r => { updateProgress(); return r; }));
    audioPromises.push(preloadAudio(audio.boss).then(r => { updateProgress(); return r; }));
    audioPromises.push(preloadAudio(audio.purr).then(r => { updateProgress(); return r; }));
    audio.meows.forEach(m => {
      audioPromises.push(preloadAudio(m).then(r => { updateProgress(); return r; }));
    });
  }

  await Promise.all([...imagePromises, ...audioPromises]);

  resourcesLoaded = true;

  // Initialize meow pool for overlapping sounds
  initMeowPool();

  // Hide loading screen and show start screen
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
  if (startScreen) {
    startScreen.classList.add('active');
  }

  console.log('All resources preloaded!');
}

// Start preloading when DOM is ready
document.addEventListener('DOMContentLoaded', preloadAllResources);
// Also try immediately if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  preloadAllResources();
}

// Track audio unlock status for mobile
let audioUnlocked = false;

// iOS requires audio to be triggered directly from user gesture
// We unlock by playing a silent moment immediately on first tap
function initAudio() {
  if (audioUnlocked || !audio) return;

  // On iOS, we need to play audio in the SAME call stack as user gesture
  // Play and immediately pause each audio to "unlock" it
  const allAudio = [audio.gameplay, audio.boss, audio.purr, ...audio.meows, ...meowPool];

  allAudio.forEach(audioEl => {
    if (!audioEl) return;
    try {
      // Set volume to 0 for silent unlock
      const originalVolume = audioEl.volume;
      audioEl.volume = 0;
      audioEl.play().then(() => {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.volume = originalVolume;
      }).catch(() => {
        audioEl.volume = originalVolume;
      });
    } catch (e) {}
  });

  // Also resume AudioContext if suspended (for synth sounds)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  audioUnlocked = true;
  console.log('Audio unlocked for iOS');
}

function playGameplayMusic() {
  if (!audio || !audio.gameplay) {
    console.log('Audio not initialized');
    return;
  }

  // Make sure boss music is stopped first
  if (audio.boss) {
    audio.boss.pause();
    audio.boss.currentTime = 0;
  }

  try {
    audio.gameplay.currentTime = 0;
    audio.gameplay.volume = 0.4;
    audio.gameplay.muted = isMuted;

    const playPromise = audio.gameplay.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log('Gameplay music started'))
        .catch(e => {
          console.log('Gameplay music blocked:', e);
        });
    }
  } catch (e) {
    console.log('Gameplay music exception:', e);
  }
}

function stopGameplayMusic() {
  if (!audio || !audio.gameplay) return;
  try {
    audio.gameplay.pause();
    audio.gameplay.currentTime = 0;
  } catch (e) {}
}

function playBossMusic() {
  if (!audio || !audio.boss) return;

  // CRITICAL: Stop gameplay music first!
  if (audio.gameplay) {
    audio.gameplay.pause();
    audio.gameplay.currentTime = 0;
  }

  try {
    audio.boss.currentTime = 0;
    audio.boss.volume = 0.5;
    audio.boss.muted = isMuted;

    const playPromise = audio.boss.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log('Boss music started'))
        .catch(e => console.log('Boss music error:', e));
    }
  } catch (e) {}
}

function stopBossMusic() {
  if (!audio || !audio.boss) return;
  try {
    audio.boss.pause();
    audio.boss.currentTime = 0;
  } catch (e) {}
}

// Pool of meow sounds for overlapping playback
let meowPool = [];
let meowPoolIndex = 0;
const MEOW_POOL_SIZE = 6; // Allow up to 6 overlapping meows

function initMeowPool() {
  if (!audio || !audio.meows) return;
  meowPool = [];
  // Create pool by cycling through the 3 meow sounds
  for (let i = 0; i < MEOW_POOL_SIZE; i++) {
    const srcIndex = i % audio.meows.length;
    const poolMeow = createAudioElement(audio.meows[srcIndex].src);
    poolMeow.volume = 0.6;
    poolMeow.preload = 'auto';
    poolMeow.load();
    meowPool.push(poolMeow);
  }
}

function playRandomMeow() {
  if (isMuted) return;
  if (meowPool.length === 0) return;

  try {
    // Use pool for overlapping sounds
    const meow = meowPool[meowPoolIndex];
    meowPoolIndex = (meowPoolIndex + 1) % meowPool.length;

    meow.currentTime = 0;
    meow.volume = 0.6;
    meow.play().catch(() => {});
  } catch (e) {}
}

function playPurrSound() {
  if (!audio) return;
  try {
    audio.purr.volume = 0.7;
    audio.purr.currentTime = 0;
    audio.purr.play().catch(e => console.log('Purr error:', e));

    // Fade out after 4 seconds
    setTimeout(() => {
      fadeOutAudio(audio.purr, 2000);
    }, 4000);
  } catch (e) {}
}

function fadeOutAudio(audioEl, duration) {
  if (!audioEl) return;
  const startVolume = audioEl.volume;
  const steps = 20;
  const stepTime = duration / steps;
  const volumeStep = startVolume / steps;

  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    currentStep++;
    audioEl.volume = Math.max(0, startVolume - (volumeStep * currentStep));
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audioEl.pause();
      audioEl.volume = startVolume; // Reset for next play
    }
  }, stepTime);
}

function stopAllAudio() {
  if (!audio) return;
  try {
    // Stop and reset all audio tracks
    [audio.gameplay, audio.boss, audio.purr].forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
        // Reset volume in case it was fading
        track.volume = track === audio.gameplay ? 0.4 :
                       track === audio.boss ? 0.5 : 0.7;
      }
    });
  } catch (e) {
    console.log('Error stopping audio:', e);
  }
}

// Simple synthesized sounds for tap feedback (non-blocking)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initSynthAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(frequency, duration, type = 'sine') {
  if (!audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playGoodSound() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 50);
}

function playBadSound() {
  playTone(200, 0.2, 'sawtooth');
}

function playFamilySound() {
  playTone(523, 0.08);
  setTimeout(() => playTone(659, 0.08), 60);
  setTimeout(() => playTone(784, 0.15), 120);
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
  }, 1500);
}

// ============================================
// GAME LOGIC
// ============================================

function resetGame() {
  // Stop any playing audio first
  stopAllAudio();

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

  if (rand < 0.30) {
    // 30% chance for family
    pool = CHARACTERS.family;
  } else if (rand < 0.70) {
    // 40% chance for bad items
    pool = CHARACTERS.bad;
  } else {
    // 30% chance for good items
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

  // Set character appearance - all use images now
  charEl.innerHTML = `<img src="${character.image}" alt="${character.name}" class="char-image">`;
  charEl.className = `character visible ${character.type}`;
  charEl.dataset.holeIndex = holeIndex; // Store index for tap handling

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
  // Clear content after animation
  setTimeout(() => {
    if (!charEl.classList.contains('visible')) {
      charEl.innerHTML = '';
      charEl.className = 'character';
    }
  }, 200);
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

// ============================================
// COUNTDOWN FUNCTIONS
// ============================================

function runCountdown(textElement, callback) {
  const steps = [
    { text: 'READY...', delay: 1000 },
    { text: 'SET...', delay: 1000 },
    { text: 'GO!', delay: 500 }
  ];

  let stepIndex = 0;

  function nextStep() {
    if (stepIndex < steps.length) {
      textElement.textContent = steps[stepIndex].text;
      setTimeout(() => {
        stepIndex++;
        nextStep();
      }, steps[stepIndex].delay);
    } else {
      callback();
    }
  }

  // Start with initial display, then countdown
  setTimeout(nextStep, 1500); // Show instructions for 1.5 seconds first
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
  initSynthAudio();
  resetGame();

  gameState.playerName = name;

  // Show countdown screen first
  showScreen('countdown');
  elements.countdownText.textContent = 'GET READY!';

  runCountdown(elements.countdownText, () => {
    // Now actually start the game
    gameState.isPlaying = true;
    showScreen('game');

    // Start background music
    setTimeout(() => {
      playGameplayMusic();
    }, 100);

    // Start timer
    gameState.timerInterval = setInterval(() => {
      gameState.timeLeft--;
      updateUI();

      // Start screen shake 2 seconds before Pitz
      if (gameState.timeLeft === CONFIG.pitzTriggerTime + 2 && !gameState.isPitzRound) {
        elements.screens.game.classList.add('screen-shake');
      }

      if (gameState.timeLeft <= CONFIG.pitzTriggerTime && !gameState.isPitzRound) {
        elements.screens.game.classList.remove('screen-shake');
        startPitzRound();
      }
    }, 1000);

    // Start spawning
    gameState.spawnInterval = setInterval(spawnCharacter, CONFIG.spawnInterval);
    spawnCharacter(); // Immediate first spawn
  });
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

  // Stop all audio to prevent overlap
  stopAllAudio();

  // Clear holes
  gameState.holes = Array(9).fill(null);
  elements.holes.forEach(hole => {
    const char = hole.querySelector('.character');
    char.classList.remove('visible');
  });

  // Show Pitz countdown screen first
  showScreen('pitzCountdown');
  elements.pitzCountdownText.textContent = 'GET READY!';
  playRandomMeow();

  runCountdown(elements.pitzCountdownText, () => {
    // Now start the actual Pitz round
    showScreen('pitz');
    // Small delay to ensure clean audio transition
    setTimeout(() => playBossMusic(), 100);

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
  });
}

function handlePitzTap() {
  if (!gameState.isPitzRound) return;

  gameState.pitzTaps++;
  elements.pitzTaps.textContent = gameState.pitzTaps;

  // Bounce animation
  elements.pitzCat.classList.add('happy');
  setTimeout(() => elements.pitzCat.classList.remove('happy'), 100);

  // Play random meow
  playRandomMeow();

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

  // Stop boss music and play purr
  stopBossMusic();
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
        const entry = child.val();
        // Exclude test entries
        if (!entry.name.toLowerCase().includes('test')) {
          scores.push(entry);
        }
      });
      scores.reverse(); // Highest first
    } else {
      // Load from local storage
      scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
      scores = scores.filter(s => !s.name.toLowerCase().includes('test'));
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

// Global mute button
if (elements.globalMuteBtn) {
  elements.globalMuteBtn.addEventListener('click', toggleMute);
}

// Enter key on name input
elements.playerName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') startGame();
});

// Hole taps - robust handling using bounding box detection
function handleGameBoardTap(e) {
  e.preventDefault();
  e.stopPropagation();

  // Get tap coordinates
  let x, y;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  // Find which hole was tapped by checking each hole's bounding box
  for (let i = 0; i < elements.holes.length; i++) {
    const hole = elements.holes[i];
    const rect = hole.getBoundingClientRect();

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      handleHoleTap(i);
      return;
    }
  }
}

// Multiple event listeners for maximum compatibility
elements.gameBoard.addEventListener('mousedown', handleGameBoardTap);
elements.gameBoard.addEventListener('touchstart', handleGameBoardTap, { passive: false });

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

// iOS audio unlock on first touch anywhere
document.addEventListener('touchstart', function iosAudioUnlock() {
  initAudio();
  initSynthAudio();
  // Remove listener after first touch
  document.removeEventListener('touchstart', iosAudioUnlock);
}, { once: true });

// Also try on click for desktop
document.addEventListener('click', function desktopAudioUnlock() {
  initAudio();
  initSynthAudio();
  document.removeEventListener('click', desktopAudioUnlock);
}, { once: true });

// Initialize
console.log("🎂 Adi vs The Big 4-0 - Game loaded!");
console.log("Audio will unlock on first tap/click.");
