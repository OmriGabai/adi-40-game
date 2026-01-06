/* ============================================
   ADI VS THE BIG 4-0 - GAME LOGIC
   ============================================ */

// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
  gameDuration: 25,
  pitzDuration: 6,
  pitzTriggerTime: 5, // Pitz appears when timer hits this
  spawnInterval: 400, // ms between spawns (faster = more chaos!)

  // Visibility durations (ms) - 50% longer for easier tapping
  normalVisibility: 2700,
  familyVisibility: 1800,

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
    { image: 'pics/gift.svg', name: 'מתנה', type: 'good', points: CONFIG.points.gift, message: 'אוו, מתנות!' },
    { image: 'pics/cake.svg', name: 'עוגה', type: 'good', points: CONFIG.points.cake, message: 'עוד עוגה!' },
    { image: 'pics/balloon.svg', name: 'בלון', type: 'good', points: CONFIG.points.balloon, message: 'פופ!' },
  ],
  bad: [
    { image: 'pics/forty.svg', name: '40', type: 'bad', points: CONFIG.points.bad, message: 'לאאאא! ה-40 המפחיד!' },
    { image: 'pics/glasses.svg', name: 'משקפיים', type: 'bad', points: CONFIG.points.bad, message: 'משקפי קריאה של אימא!' },
    { image: 'pics/grayhair.svg', name: 'סבתא', type: 'bad', points: CONFIG.points.bad, message: 'עוד לא סבתא!' },
    { image: 'pics/pills.svg', name: 'ויטמינים', type: 'bad', points: CONFIG.points.bad, message: 'כבר ויטמינים?!' },
  ],
  family: [
    { image: 'pics/gal.jpg', name: 'גל', type: 'family', points: CONFIG.points.family, message: 'גל: אמא עדיין שורפת!' },
    { image: 'pics/bar.jpg', name: 'בר', type: 'family', points: CONFIG.points.family, message: 'בר: מזל טוב אמא!' },
    { image: 'pics/liv.jpg', name: 'ליב', type: 'family', points: CONFIG.points.family, message: 'ליב: את הכי טובה!' },
    { image: 'pics/eran.JPG', name: 'ערן', type: 'family', points: CONFIG.points.eran, message: 'ערן: את לא נראית יום מעל 39!' },
  ]
};

// Pitz messages for different tap counts
const PITZ_MESSAGES = {
  default: ['מיאו!', 'מיאאאו!', 'מררראו!', 'פררר?'],
  milestones: {
    10: 'פיץ מתחמם...',
    20: 'פיץ מרקרק!',
    30: 'פיץ בגן עדן!',
    40: '🎉 +40 בונוס על 40 לחיצות!'
  }
};

// End game messages
const END_MESSAGES = {
  high: { title: '🎉 עדי ניצחה את ה-40! 🎉', message: '(אל דאגה, 41 כבר בהורדה...)' },
  medium: { title: 'לא רע! 😄', message: 'די טוב למישהי שהופכת ל-40!' },
  low: { title: 'ה-40 ניצח... 👓', message: 'אבל עדי עדיין מדהימה!' }
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
  tapToStart: document.getElementById('tap-to-start'),
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
  globalMuteBtn: document.getElementById('global-mute-btn'),
  easterEggModal: document.getElementById('easter-egg-modal'),
  easterEggIcon: document.getElementById('easter-egg-icon'),
  easterEggMessage: document.getElementById('easter-egg-message'),
  easterEggDismiss: document.querySelector('.easter-egg-dismiss')
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

  // Mute/unmute Web Audio API sources
  if (isMuted) {
    // Stop all playing audio when muting
    if (currentGameplaySource && currentGameplaySource.gainNode) {
      currentGameplaySource.gainNode.gain.value = 0;
    }
    if (currentPurrSource && currentPurrSource.gainNode) {
      currentPurrSource.gainNode.gain.value = 0;
    }
  } else {
    // Restore volume when unmuting
    if (currentGameplaySource && currentGameplaySource.gainNode) {
      currentGameplaySource.gainNode.gain.value = 0.28;
    }
    if (currentPurrSource && currentPurrSource.gainNode) {
      currentPurrSource.gainNode.gain.value = 0.7;
    }
  }
}

// ============================================
// SOUND SYSTEM (Web Audio API - iOS compatible)
// ============================================

let audioCtx = null;
let audioBuffers = {
  gameplay: null,
  meows: [],
  purr: null
};
let currentGameplaySource = null;
let audioLoaded = false;

// Initialize Web Audio Context
function initWebAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
}

// Load audio file as buffer
async function loadAudioBuffer(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.log('Failed to load audio:', url, e);
    return null;
  }
}

// Load all audio buffers
async function loadAllAudio() {
  initWebAudio();

  const [gameplay, meow1, meow2, meow3, purr] = await Promise.all([
    loadAudioBuffer('audio/gameplay-342069.mp3'),
    loadAudioBuffer('audio/cat-meow-401729.mp3'),
    loadAudioBuffer('audio/cat-meow-405456.mp3'),
    loadAudioBuffer('audio/cat-meow-85175.mp3'),
    loadAudioBuffer('audio/cat-purr-361421.mp3')
  ]);

  audioBuffers.gameplay = gameplay;
  audioBuffers.meows = [meow1, meow2, meow3].filter(m => m !== null);
  audioBuffers.purr = purr;
  audioLoaded = true;
  console.log('Web Audio loaded');
}

// Legacy audio object for compatibility (will be null)
let audio = null;

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
      loaderText.textContent = `טוען... ${loadingProgress}%`;
    }
  };

  // Preload images
  const imagePromises = ALL_IMAGES.map(src =>
    preloadImage(src).then(result => {
      updateProgress();
      return result;
    })
  );

  // Wait for images first
  await Promise.all(imagePromises);

  // Load audio with Web Audio API (5 files)
  if (loaderText) loaderText.textContent = 'טוען אודיו...';
  await loadAllAudio();

  resourcesLoaded = true;

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
  if (audioUnlocked) return;

  // Resume AudioContext on user gesture (required for iOS)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      console.log('AudioContext resumed');
    });
  }

  audioUnlocked = true;
  console.log('Audio unlocked for iOS');
}

// Play a buffer with Web Audio API
function playBuffer(buffer, loop = false, volume = 1.0) {
  if (!audioCtx || !buffer || isMuted) return null;

  // Resume context if suspended (iOS requirement)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();

  source.buffer = buffer;
  source.loop = loop;
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);

  return { source, gainNode };
}

function playGameplayMusic() {
  if (!audioBuffers.gameplay || isMuted) return;

  // Stop existing gameplay music
  stopGameplayMusic();

  const result = playBuffer(audioBuffers.gameplay, true, 0.28);
  if (result) {
    currentGameplaySource = result;
    console.log('Gameplay music started (Web Audio)');
  }
}

function stopGameplayMusic() {
  if (currentGameplaySource) {
    try {
      currentGameplaySource.source.stop();
    } catch (e) {}
    currentGameplaySource = null;
  }
}

// Not used but kept for compatibility
function playBossMusic() {}
function stopBossMusic() {}

// Meow counter for variety
let meowIndex = 0;

function playRandomMeow() {
  if (isMuted || !audioBuffers.meows.length) return;

  const buffer = audioBuffers.meows[meowIndex % audioBuffers.meows.length];
  meowIndex++;
  playBuffer(buffer, false, 0.6);
}

let currentPurrSource = null;

function playPurrSound() {
  if (!audioBuffers.purr || isMuted) return;

  const result = playBuffer(audioBuffers.purr, false, 0.7);
  if (result) {
    currentPurrSource = result;

    // Fade out after 4 seconds
    setTimeout(() => {
      if (currentPurrSource && currentPurrSource.gainNode) {
        const gain = currentPurrSource.gainNode.gain;
        gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
      }
    }, 4000);
  }
}

function stopAllAudio() {
  stopGameplayMusic();
  if (currentPurrSource) {
    try {
      currentPurrSource.source.stop();
    } catch (e) {}
    currentPurrSource = null;
  }
}

// Simple synthesized sounds for tap feedback (non-blocking)
// (audioCtx already defined above)

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

// Red flash effect for bad items
function flashScreenRed() {
  const flash = document.createElement('div');
  flash.className = 'red-flash';
  document.body.appendChild(flash);

  // Trigger animation
  requestAnimationFrame(() => {
    flash.classList.add('active');
  });

  // Remove after animation
  setTimeout(() => {
    flash.remove();
  }, 300);
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
  } else if (rand < 0.65) {
    // 35% chance for bad items
    pool = CHARACTERS.bad;
  } else {
    // 35% chance for good items
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
  // Using loading="eager" and decoding="sync" for instant display
  charEl.innerHTML = `<img src="${character.image}" alt="${character.name}" class="char-image" loading="eager" decoding="sync">`;
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

  // Play sound and effects
  if (character.type === 'good') {
    playGoodSound();
  } else if (character.type === 'bad') {
    playBadSound();
    flashScreenRed();
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
    { text: 'מוכנים...', delay: 1000 },
    { text: 'היכון...', delay: 1000 },
    { text: 'צא!', delay: 500 }
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

// ============================================
// EASTER EGGS
// ============================================

function checkEasterEgg(name) {
  const nameLower = name.toLowerCase();

  // Check for Adi (birthday girl!) - starts with "adi" or "עדי"
  if (nameLower.startsWith('adi') || name.startsWith('עדי')) {
    return {
      type: 'birthday',
      icon: '🎂🎉🎁',
      message: 'הו! קרפדה! לכבוד הוא לנו שהצטרפת. קבלי מאיתנו תוספת של 250 נקודות כמתנת יום הולדת, בהצלחה',
      bonus: 250
    };
  }

  // Check for Tomer - contains "tomer" or "lagbaomer" or "לגבעומר" or "תומר"
  if (nameLower.includes('tomer') || nameLower.includes('lagbaomer') || name.includes('לגבעומר') || name.includes('תומר')) {
    return {
      type: 'tomer',
      icon: '🔥',
      message: 'אה! כל הגוף מנצח את הרגליים! נקנסת ב-50 נקודות. בהצלחה, מהקרמבוץ 😈',
      bonus: -50
    };
  }

  // Check for Yana/Yanu (starts with "yan" or "יאנ")
  if (nameLower.startsWith('yan') || name.startsWith('יאנ')) {
    return {
      type: 'love',
      icon: '❤️',
      message: 'נוצ׳קית, אני אוהב אותך! קבלי 100 נקודות בונוס, רק אל תספרי לאף אחד 😉',
      bonus: 100
    };
  }

  return null;
}

function showEasterEggModal(easterEgg, callback) {
  elements.easterEggModal.className = 'easter-egg-modal active';
  if (easterEgg.type === 'birthday') {
    elements.easterEggModal.classList.add('birthday');
  }

  elements.easterEggIcon.textContent = easterEgg.icon;
  elements.easterEggMessage.textContent = easterEgg.message;

  const handleDismiss = () => {
    elements.easterEggDismiss.removeEventListener('click', handleDismiss);
    elements.easterEggModal.classList.remove('active', 'birthday');
    callback();
  };

  elements.easterEggDismiss.addEventListener('click', handleDismiss);
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

  // Check for Easter eggs
  const easterEgg = checkEasterEgg(name);

  // Apply bonus if any (can be positive or negative)
  if (easterEgg && easterEgg.bonus !== 0) {
    gameState.score = Math.max(0, easterEgg.bonus);
    updateUI();
  }

  // Function to proceed to countdown screen
  const proceedToCountdown = () => {
    showScreen('countdown');
    elements.countdownText.classList.add('hidden');
    elements.tapToStart.classList.remove('hidden');

    // Wait for tap to start countdown
    const handleTapToStart = () => {
      elements.tapToStart.removeEventListener('click', handleTapToStart);
      elements.tapToStart.classList.add('hidden');
      elements.countdownText.classList.remove('hidden');
      elements.countdownText.textContent = 'התכוננו!';

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
    };

    elements.tapToStart.addEventListener('click', handleTapToStart);
  };

  // Show Easter egg modal if applicable, then proceed
  if (easterEgg) {
    showEasterEggModal(easterEgg, proceedToCountdown);
  } else {
    proceedToCountdown();
  }
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

  // Keep gameplay music running through Pitz
  // (simpler audio = better iOS compatibility)

  // Clear holes
  gameState.holes = Array(9).fill(null);
  elements.holes.forEach(hole => {
    const char = hole.querySelector('.character');
    char.classList.remove('visible');
  });

  // Show Pitz countdown screen first
  showScreen('pitzCountdown');
  elements.pitzCountdownText.textContent = 'התכוננו!';
  playRandomMeow();

  runCountdown(elements.pitzCountdownText, () => {
    // Now start the actual Pitz round
    showScreen('pitz');
    // Gameplay music continues through Pitz

    // Pitz timer
    let pitzTime = CONFIG.pitzDuration;
    elements.pitzTime.textContent = pitzTime;
    elements.pitzTaps.textContent = '0';
    elements.pitzMessage.textContent = 'לחצו לחצו לחצו!';

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

  // Stop gameplay music and play purr
  stopGameplayMusic();
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
  elements.savingIndicator.textContent = 'שומר ניקוד...';
  elements.savingIndicator.classList.remove('hidden');

  const nameLower = name.toLowerCase();

  try {
    if (typeof firebase !== 'undefined' && firebaseInitialized) {
      // Check if player already has a score
      const snapshot = await firebase.database().ref('scores')
        .orderByChild('nameLower')
        .equalTo(nameLower)
        .once('value');

      let existingKey = null;
      let existingScore = 0;

      snapshot.forEach(child => {
        const data = child.val();
        if (data.score > existingScore) {
          existingKey = child.key;
          existingScore = data.score;
        }
      });

      if (existingKey && score <= existingScore) {
        // Existing score is higher, don't update
        elements.savingIndicator.textContent = `השיא שלך: ${existingScore}`;
      } else if (existingKey) {
        // Update existing entry with new high score
        await firebase.database().ref('scores/' + existingKey).update({
          score: score,
          timestamp: Date.now()
        });
        elements.savingIndicator.textContent = 'שיא חדש!';
      } else {
        // New player, create entry
        await firebase.database().ref('scores').push({
          name: name,
          nameLower: nameLower,
          score: score,
          timestamp: Date.now()
        });
        elements.savingIndicator.textContent = 'ניקוד נשמר!';
      }
    } else {
      // Fallback: save locally with max logic
      let scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
      const existingIndex = scores.findIndex(s => s.name.toLowerCase() === nameLower);

      if (existingIndex >= 0) {
        if (score > scores[existingIndex].score) {
          scores[existingIndex].score = score;
          scores[existingIndex].timestamp = Date.now();
          elements.savingIndicator.textContent = 'שיא חדש!';
        } else {
          elements.savingIndicator.textContent = `השיא שלך: ${scores[existingIndex].score}`;
        }
      } else {
        scores.push({ name, nameLower, score, timestamp: Date.now() });
        elements.savingIndicator.textContent = 'ניקוד נשמר מקומית!';
      }
      localStorage.setItem('adi40scores', JSON.stringify(scores));
    }
  } catch (error) {
    console.error('Error saving score:', error);
    // Fallback to local storage
    let scores = JSON.parse(localStorage.getItem('adi40scores') || '[]');
    scores.push({ name, score, timestamp: Date.now() });
    localStorage.setItem('adi40scores', JSON.stringify(scores));
    elements.savingIndicator.textContent = 'Score saved locally!';
  }

  setTimeout(() => {
    elements.savingIndicator.classList.add('hidden');
  }, 2000);
}

async function loadLeaderboard(silentRefresh = false) {
  // Only show loading text on initial load
  if (!silentRefresh) {
    elements.leaderboardList.innerHTML = '<p class="loading">טוען ניקוד...</p>';
  }

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
    elements.leaderboardList.innerHTML = '<p class="loading">אין עדיין ניקוד. היו הראשונים!</p>';
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

// Leaderboard auto-refresh
let leaderboardRefreshInterval = null;

// Hidden admin: clear leaderboard
let liveClickCount = 0;
let liveClickTimeout = null;

function setupAdminClear() {
  const liveIndicator = document.querySelector('.live-indicator');
  if (!liveIndicator) return;

  liveIndicator.style.cursor = 'pointer';
  liveIndicator.addEventListener('click', () => {
    liveClickCount++;

    // Reset count after 2 seconds of no clicks
    if (liveClickTimeout) clearTimeout(liveClickTimeout);
    liveClickTimeout = setTimeout(() => {
      liveClickCount = 0;
    }, 2000);

    // After 3 clicks, ask for password
    if (liveClickCount >= 3) {
      liveClickCount = 0;
      const password = prompt('הכנס סיסמת מנהל:');
      if (password === 'test') {
        clearAllScores();
      }
    }
  });
}

async function clearAllScores() {
  try {
    if (typeof firebase !== 'undefined' && firebaseInitialized) {
      await firebase.database().ref('scores').remove();
      alert('טבלת המובילים נמחקה!');
      loadLeaderboard();
    }
  } catch (error) {
    console.error('Error clearing scores:', error);
    alert('שגיאה במחיקת טבלת המובילים');
  }
}

// Initialize admin feature when DOM ready
document.addEventListener('DOMContentLoaded', setupAdminClear);

function showLeaderboard() {
  showScreen('leaderboard');
  loadLeaderboard();

  // Start auto-refresh every 2 seconds
  startLeaderboardRefresh();
}

function startLeaderboardRefresh() {
  // Clear any existing interval
  stopLeaderboardRefresh();

  leaderboardRefreshInterval = setInterval(() => {
    loadLeaderboard(true); // true = silent refresh (no loading text)
  }, 2000);
}

function stopLeaderboardRefresh() {
  if (leaderboardRefreshInterval) {
    clearInterval(leaderboardRefreshInterval);
    leaderboardRefreshInterval = null;
  }
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
  stopLeaderboardRefresh();
  showScreen('start');
});

// Play again
elements.playAgainBtn.addEventListener('click', () => {
  stopLeaderboardRefresh();
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
