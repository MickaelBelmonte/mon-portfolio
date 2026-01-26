// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgj0Rc_XL07EU8qEzHQmaCoz_bGg2HMxU",
  authDomain: "bonobo-party.firebaseapp.com",
  projectId: "bonobo-party",
  storageBucket: "bonobo-party.firebasestorage.app",
  messagingSenderId: "193175412938",
  appId: "1:193175412938:web:d3dd676d55823d7ef8d433",
  measurementId: "G-RFRLSC5HMQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Code Room
function generateRoomCode(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Créer une room
async function createRoom() {
  const roomCode = generateRoomCode();
  const roomRef = db.ref('rooms/' + roomCode);

  await roomRef.set({
    createdAt: Date.now(),
    state: 'waiting',
    players: {}
  });

  return { roomCode, roomRef };
}

// Rejoindre une room existante
async function joinRoom(roomCode) {
  const roomRef = db.ref('rooms/' + roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists()) {
    throw new Error('Room introuvable');
  }

  const playerId = 'player_' + Math.floor(Math.random() * 1000000);

  await roomRef.child('players/' + playerId).set({
    joinedAt: Date.now(),
    ready: false
  });

  return { roomRef, playerId };
}

// Écouter les changements de la room
function listenRoom(roomRef, callback) {
  roomRef.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

// Mettre à jour l’état d’un joueur
function setPlayerReady(roomRef, playerId, ready) {
  return roomRef.child('players/' + playerId + '/ready').set(ready);
}
