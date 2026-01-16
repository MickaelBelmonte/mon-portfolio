
// Canvas du jeu
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

// Éléments du menu et HUD
const menu = document.getElementById("game-menu");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

// Easter Egg
const bonoboMessage = document.getElementById("bonobo-message");

// Leaderboard + Endless
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let isEndless = false;

// Variables globales
let gameRunning = false;
let score = 0;
let timeElapsed = 0;
let gameInterval = null;
let enemySpawnInterval = null;
let lives = 3;


// Entités
let enemies = [];
let explosions = [];
let bananas = [];

// Boss
let boss = null;
let bossActive = false;
let bossHP = 50;

// ===============================
//  LANCEMENT DU JEU
// ===============================

startBtn.addEventListener("click", () => {
    isEndless = false;
    startGame();
});

function startGame() {
    // Reset UI
    menu.style.display = "none";
    hud.style.display = "flex";
    bonoboMessage.style.display = "none";

    document.getElementById("leaderboard").innerHTML = "";
    document.getElementById("endless-btn-box").innerHTML = "";

    // Reset état
    gameRunning = true;
    score = 0;
    timeElapsed = 0;
    enemies = [];
    explosions = [];
    bananas = [];
    boss = null;
    bossActive = false;
    bossHP = 50;
    lives = 3;
    updateLivesDisplay();
    player.shots = 0;

    // Nettoyage des intervalles
    if (gameInterval) clearInterval(gameInterval);
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);

    // Timer
    gameInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = "Temps : " + timeElapsed + "s";

        if (!isEndless && timeElapsed === 120 && !bossActive) {
            spawnBoss();
        }
    }, 1000);

    // Spawn des ennemis
    const spawnDelay = isEndless ? 700 : 900;
    enemySpawnInterval = setInterval(() => {
        if (gameRunning && !bossActive) {
            spawnEnemy();
            if (isEndless) spawnEnemy();
        }
    }, spawnDelay);

    // Lancement du jeu
    requestAnimationFrame(gameLoop);
}

// ===============================
//  BOUCLE PRINCIPALE DU JEU
// ===============================

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update();
    draw();

    scoreDisplay.textContent = "Score : " + score;

    requestAnimationFrame(gameLoop);
}

// ===============================
//  JOUEUR
// ===============================

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 10,
    color: "#4cc9f0",
    bullets: []
};

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Tir
document.addEventListener("keydown", e => {
    if (e.key === " " && gameRunning) {
player.bullets.push({
    x: player.x + player.width / 2 - 10,
    y: player.y,
    emoji: "🧤",
    size: 30,   // taille de l’emoji
    speed: 10
});


        player.shots++; // ← compteur de tirs
    }
});


function loseLife() {
    lives--;

    if (lives <= 0) {
        gameOver();
    }
}
const livesDisplay = document.getElementById("lives");

shots: 0

// ===============================
//  ENNEMIS
// ===============================

let enemySpeed = 2;

function spawnEnemy() {
    const enemyEmojis = ["🙊", "🙉", "🙈","🐵"];

    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        emoji: enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)],
        size: 80,
        speed: enemySpeed
    });
}

// ===============================
//  UPDATE
// ===============================

function update() {
    // Déplacement du joueur
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

    // Tirs
player.bullets.forEach(b => b.y -= b.speed);
player.bullets = player.bullets.filter(b => b.y > -50);

    // Ennemis
enemies.forEach(e => e.y += e.speed);


    // Collisions tirs / ennemis
// Collision tirs / ennemis
enemies.forEach((enemy, ei) => {
    player.bullets.forEach((bullet, bi) => {
        if (
            bullet.x < enemy.x + enemy.size &&
            bullet.x + bullet.size > enemy.x &&
            bullet.y < enemy.y + enemy.size &&
            bullet.y + bullet.size > enemy.y
        ) {
            score += isEndless ? 20 : 10;
            createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
            enemies.splice(ei, 1);
            player.bullets.splice(bi, 1);
        }
    });
});

// Supprimer les ennemis sortis de l'écran
enemies = enemies.filter(e => e.y < canvas.height + 50);

// Explosions
explosions.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.alpha -= 0.03;
    if (p.alpha <= 0) explosions.splice(i, 1);
});

updateBoss();

// Collision banane / joueur
bananas.forEach((b, bi) => {
    if (
        b.x < player.x + player.width &&
        b.x + b.size > player.x &&
        b.y < player.y + player.height &&
        b.y + b.size > player.y
    ) {
        bananas.splice(bi, 1);
        loseLife();
    }
});

// (SUPPRIMÉ) ❌ Ce bloc était illégal
// if (enemy.y > canvas.height) { ... }

// Collision banane / joueur (doublon supprimable si tu veux)
bananas.forEach((b, bi) => {
    if (
        b.x < player.x + player.width &&
        b.x + b.size > player.x &&
        b.y < player.y + player.height &&
        b.y + b.size > player.y
    ) {
        bananas.splice(bi, 1);
        loseLife();
    }
});

// ===============================
//  DRAW
// ===============================

function draw() {
    // Joueur
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Tirs
player.bullets.forEach(b => {
    ctx.font = b.size + "px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.emoji, b.x, b.y);
});

    // Ennemis
    enemies.forEach(e => {
ctx.font = e.size + "px Arial";
ctx.textAlign = "center";
ctx.fillText(e.emoji, e.x + e.size / 2, e.y + e.size);

    });

    // Explosions
    explosions.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    drawBoss();
}

// ===============================
//  EXPLOSIONS
// ===============================

function createExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
        explosions.push({
            x,
            y,
            size: Math.random() * 6 + 3,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            alpha: 1,
            color: Math.random() > 0.5 ? "#4cc9f0" : "#ff0054"
        });
    }
}

// ===============================
//  BOSS
// ===============================

function spawnBoss() {
    bossActive = true;
    bossHP = 50;

boss = {
    x: canvas.width / 2 - 180, // centré
    y: 20,
    width: 360,
    height: 360,
    emoji: "🐒",
    speedX: 3
};

}

function bossAttack() {
    if (!bossActive || !boss) return;

    bananas.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height,
        width: 20,
        height: 20,
        emoji: "🍌",
        speedY: 4,
        angle: (Math.random() - 0.5) * 2
    });
}

setInterval(() => {
    if (bossActive) bossAttack();
}, 900);

function updateBoss() {
    if (!bossActive || !boss) return;

    boss.x += boss.speedX;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.speedX *= -1;

    bananas.forEach(b => {
        b.y += b.speedY;
        b.x += b.angle;
    });

    // Collision tirs / boss
    player.bullets.forEach((bullet, bi) => {
        if (
            bullet.x < boss.x + boss.width &&
            bullet.x + bullet.size > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.size > boss.y
        ) {
            bossHP--;
            player.bullets.splice(bi, 1);
            createExplosion(bullet.x, bullet.y);

            if (bossHP <= 0) {
                bossActive = false;
                boss = null;
                bananas = [];
                triggerBonoboEasterEgg();
            }
        }
    });

    bananas = bananas.filter(b => b.y < canvas.height + 50);
}

function drawBoss() {
    if (bossActive && boss) {
        ctx.font = "360px Arial";
        ctx.textAlign = "center";
        ctx.fillText(boss.emoji, boss.x + boss.width / 2, boss.y + boss.height - 40);
        
        ctx.fillStyle = "#ff0054";
        ctx.fillRect(boss.x, boss.y - 25, boss.width, 20);

        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(boss.x, boss.y - 25, (bossHP / 50) * boss.width, 20);


    bananas.forEach(b => {
        ctx.font = "30px Arial";
        ctx.fillText(b.emoji, b.x, b.y);
    });
    }
}

// ===============================
//  BONOBOS + LEADERBOARD + ENDLESS
// ===============================

function triggerBonoboEasterEgg() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(enemySpawnInterval);

    bonoboMessage.style.display = "block";
    bonoboMessage.innerHTML = `
        <h2>Bienvenue dans le Royaume des Bonobos</h2>
        <p>Tu as vaincu le Singe Cosmique.</p>
    `;

    let name = prompt("Entre ton pseudo pour le leaderboard :");
    if (!name) name = "Anonyme";

    saveScore(name, score);
    showLeaderboard();
    showEndlessButton();
}

function saveScore(name, score) {
    const shots = player.shots;
    const ratio = shots > 0 ? (score / shots).toFixed(2) : score;

    leaderboard.push({ name, score, shots, ratio });

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}


function showLeaderboard() {
    const box = document.getElementById("leaderboard");
    box.innerHTML = "<h3>Leaderboard</h3>";

    leaderboard.forEach((entry, i) => {
        
box.innerHTML += `
    <p>
        ${i + 1}. ${entry.name} — 
        ${entry.score} pts — 
        ${entry.shots} tirs — 
        Ratio : ${entry.ratio}
    </p>
`;

    });
}

function showEndlessButton() {
    const box = document.getElementById("endless-btn-box");

    box.innerHTML = `
        <button id="endless-btn" class="btn" style="margin-top:20px;">
            Activer le Mode Endless
        </button>
    `;

    document.getElementById("endless-btn").addEventListener("click", () => {
        startEndlessMode();
    });
}

function startEndlessMode() {
    isEndless = true;
    startGame();
}
