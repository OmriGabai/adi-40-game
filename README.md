# 🎂 עדי נגד הארבעים! | Adi vs. The Big 4-0

> A fun whack-a-mole style birthday game created for Adi's 40th birthday party!

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

---

## 🎮 About The Game

**"Adi vs. The Big 4-0"** (עדי נגד הארבעים!) is a mobile-first tap game where players help Adi survive turning 40 by catching gifts and family members while avoiding the dreaded signs of aging!

### How To Play

| Action | Result |
|--------|--------|
| ✅ Tap **gifts, cake, balloons** | +10 points |
| ✅ Tap **family members** (Gal, Bar, Liv, Eran) | +30 to +50 points |
| ❌ Tap **"40", glasses, gray hair, pills** | -20 points |
| 🐱 **Pitz Bonus Round** | Tap the cat as fast as you can! |

---

## ✨ Features

- 🎯 **Whack-a-mole gameplay** - Characters pop up from a 3×3 grid
- 👨‍👩‍👧‍👦 **Family members** - Faster and worth more points!
- 🐱 **Pitz the Cat** - Special bonus round with rapid-tap mechanic
- 🏆 **Live Leaderboard** - Compete with other party guests via Firebase
- 🔊 **Sound Effects** - Cat meows, game music, and more
- 📱 **Mobile-first** - Designed for phones with touch-friendly controls
- 🇮🇱 **Full Hebrew UI** - RTL interface

---

## 🎭 Characters

<table>
<tr>
<td align="center"><b>Good Items</b><br>(Catch these!)</td>
<td align="center"><b>Bad Items</b><br>(Avoid these!)</td>
</tr>
<tr>
<td>

| Item | Points |
|------|--------|
| 🎁 Gift | +10 |
| 🎂 Cake | +10 |
| 🎈 Balloon | +10 |
| 👧 Gal | +30 |
| 👦 Bar | +30 |
| 👶 Liv | +30 |
| 👨 Eran | +50 |

</td>
<td>

| Item | Points |
|------|--------|
| 4️⃣0️⃣ The "40" | -20 |
| 👓 Reading Glasses | -20 |
| 🦳 Gray Hair | -20 |
| 💊 Pills | -20 |

</td>
</tr>
</table>

### 🐱 Pitz Bonus Round

At the end of the game, Pitz the cat appears for a 5-second rapid-tap bonus round:
- Each tap = **+5 points**
- Hit **40 taps** for a special **+40 bonus**!
- Listen for the satisfying cat meows and purrs

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | Firebase Realtime Database |
| Hosting | Vercel |
| Audio | HTML5 Audio API |
| Graphics | SVG + Photos |

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/adi-40-game.git
   cd adi-40-game
   ```

2. **Set up Firebase** (optional, for leaderboard)
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Realtime Database
   - Copy your config to `firebase-config.js`

3. **Run locally**
   - Open `index.html` in a browser, or
   - Use a local server: `npx serve .`

4. **Deploy**
   - Push to GitHub and connect to [Vercel](https://vercel.com) for instant deployment

---

## 📁 Project Structure

```
adi-40-game/
├── index.html          # Main game page
├── style.css           # Styles & animations
├── game.js             # Game logic
├── firebase-config.js  # Firebase configuration
├── pics/               # Images (family photos, SVG icons)
│   ├── adi.jpg
│   ├── gal.jpg, bar.jpg, liv.jpg, eran.JPG
│   ├── pitz.jpg
│   └── *.svg (game items)
└── audio/              # Sound effects
    ├── gameplay-*.mp3
    ├── boss-stage.mp3
    └── cat-*.mp3
```

---

## 🎉 Easter Eggs

The game contains hidden surprises... can you find them all?

<details>
<summary>Hint (click to reveal)</summary>

Try entering certain names when starting the game... 👀

</details>

---

## 🎂 Happy Birthday Adi!

This game was made with love for Adi's 40th birthday celebration.

**מזל טוב עדי! 🎈🎁🎂**

---

<div align="center">

Made with ❤️ for a very special birthday

</div>
