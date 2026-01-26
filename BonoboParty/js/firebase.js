// Configuration Firebase (MET TON databaseURL ici)
const firebaseConfig = {
  apiKey: "AIzaSyDgj0Rc_XL07EU8qEzHQmaCoz_bGg2HMxU",
  authDomain: "bonobo-party.firebaseapp.com",
  databaseURL: "https://bonobo-party-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bonobo-party",
  storageBucket: "bonobo-party.firebasestorage.app",
  messagingSenderId: "193175412938",
  appId: "1:193175412938:web:d3dd676d55823d7ef8d433",
  measurementId: "G-RFRLSC5HMQ"
};

// Initialisation Firebase (compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Génération d’un code de room
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

// Rejoindre une room
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

// Écouter la room en temps réel
function listenRoom(roomRef, callback) {
  roomRef.on('value', (snapshot) => {
    callback(snapshot.val());
  });
}

// Mettre un joueur en "prêt"
function setPlayerReady(roomRef, playerId, ready) {
  return roomRef.child('players/' + playerId + '/ready').set(ready);
}
