// Firebase Configuration for Adi vs The Big 4-0
// Database: https://adi-40-game-default-rtdb.europe-west1.firebasedatabase.app

const firebaseConfig = {
  apiKey: "AIzaSyAwTvGXmieqQHghNSBNv6XI0agtAbwzauY",
  authDomain: "adi-40-game.firebaseapp.com",
  databaseURL: "https://adi-40-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "adi-40-game",
  storageBucket: "adi-40-game.firebasestorage.app",
  messagingSenderId: "265601666378",
  appId: "1:265601666378:web:bd80b4001c6f7b97a945b3",
  measurementId: "G-BXG9EB22G8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Mark as initialized for game.js
window.firebaseInitialized = true;

console.log("🔥 Firebase initialized for Adi's 40th Birthday Game!");
