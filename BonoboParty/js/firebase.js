// Configuration Firebase
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function randomId(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function getRoomRef(roomCode) {
  return db.ref('rooms/' + roomCode);
}

// Crée ou rejoint une room (2 à 4 joueurs)
function createOrJoinRoom(playerName, callback) {
  const roomCode = 'BONOBO'; // simple : une seule room pour l’instant
  const roomRef = getRoomRef(roomCode);

  roomRef.transaction(room => {
    if (!room) {
      room = {
        code: roomCode,
        state: 'lobby',
        players: {}
      };
    }
    return room;
  }, (err, committed, snapshot) => {
    if (!committed || !snapshot) return;

    const room = snapshot.val();
    const players = room.players || {};
    const playerCount = Object.keys(players).length;

    if (playerCount >= 4) {
      alert('La room est pleine (max 4 joueurs).');
      return;
    }

    const playerId = randomId();
    const playerRef = roomRef.child('players/' + playerId);

    playerRef.set({
      name: playerName,
      ready: false,
      score: 0,
      tile: 0,
      x: 100,
      finished: false,
      rank: null,
      items: {
        bananaBoost: 0,
        shield: 0,
        goldenDice: 0
      }
    }).then(() => {
      callback(roomRef, playerId);
    });
playerRef.onDisconnect().remove();
  });
}

function listenRoom(roomRef, callback) {
  roomRef.on('value', snapshot => {
    callback(snapshot.val());
  });
}

function updatePlayer(roomRef, playerId, data) {
  return roomRef.child('players/' + playerId).update(data);
}

function setRoomState(roomRef, state) {
  return roomRef.child('state').set(state);
}

function addScore(roomRef, playerId, amount) {
  const ref = roomRef.child('players/' + playerId + '/score');
  return ref.transaction(score => (score || 0) + amount);
}
