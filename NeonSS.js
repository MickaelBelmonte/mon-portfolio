// ===============================
//  NEON SPACE SHOOTER
//  Base + Menu + Timer + Score
// ===============================

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

    const leaderboardBox = document.getElementById("leaderboard");
    const endlessBox = document.getElementById("endless-btn-box");
    if (leaderboardBox) leaderboardBox.innerHTML = "";
    if (endlessBox) endlessBox.innerHTML = "";

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

    // Nettoyage des intervalles
    if (gameInterval) clearInterval(gameInterval);
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);

    // Timer
    gameInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = "Temps : " + timeElapsed + "s";

        // Apparition du boss après 120s en mode normal uniquement
        if (!isEndless && timeElapsed === 120 && !bossActive) {
            spawnBoss();
        }
    }, 1000);

    // Spawn des ennemis
    const spawnDelay = isEndless ? 700 : 900;
    enemySpawnInterval = setInterval(() => {
        if (gameRunning && !bossActive) {
            spawnEnemy();
            if (isEndless) {
                // Double spawn en Endless
                spawnEnemy();
            }
        }
    }, spawnDelay);

    // Lancement de la boucle du jeu
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
    speed: 6,
    color: "#4cc9f0",
    bullets: []
};

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Tir (barre lumineuse)
document.addEventListener("keydown", e => {
    if (e.key === " " && gameRunning) {
        player.bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y,
            width: 6,
            height: 15,
            speed: 8
        });
    }
});

// ===============================
//  ENNEMIS
// ===============================

let enemySpeed = 2;

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        color: "#ff0054"
    });
}

// ===============================
//  MISE À JOUR DU JEU
// ===============================

function update() {
    // Déplacement du joueur
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

    // Déplacement des tirs
    player.bullets.forEach(b => b.y -= b.speed);
    player.bullets = player.bullets.filter(b => b.y > -20);

    // Déplacement des ennemis
    enemies.forEach(e => e.y += enemySpeed);

    // Collision tirs / ennemis
    enemies.forEach((enemy, ei) => {
        player.bullets.forEach((bullet, bi) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                score += isEndless ? 20 : 10;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                enemies.splice(ei, 1);
                player.bullets.splice(bi, 1);
            }
        });
    });

    // Supprimer les ennemis hors écran
    enemies = enemies.filter(e => e.y < canvas.height + 50);

    // Mise à jour des explosions
    explosions.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.03;
        if (p.alpha <= 0) explosions.splice(i, 1);
    });

    // Mise à jour du boss et des bananes
    updateBoss();
}

// ===============================
//  DESSIN
// ===============================

function draw() {
    // Joueur
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Tirs
    ctx.fillStyle = "#4cc9f0";
    player.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Ennemis
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
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

    // Boss + bananes
    drawBoss();
}
// ===============================
//  EXPLOSIONS NÉON
// ===============================

function createExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
        explosions.push({
            x: x,
            y: y,
            size: Math.random() * 6 + 3,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            alpha: 1,
            color: Math.random() > 0.5 ? "#4cc9f0" : "#ff0054"
        });
    }
}

// ===============================
//  BOSS SINGE COSMIQUE 🐒
// ===============================

function spawnBoss() {
    bossActive = true;
    bossHP = 50;

    boss = {
        x: canvas.width / 2 - 60,
        y: 50,
        width: 120,
        height: 120,
        emoji: "🐒",
        speedX: 3
    };
}

// Attaques du boss (bananes)
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

// Le boss lance une banane toutes les 900 ms
setInterval(() => {
    if (bossActive) bossAttack();
}, 900);

// ===============================
//  MISE À JOUR DU BOSS
// ===============================

function updateBoss() {
    if (!bossActive || !boss) return;

    // Déplacement horizontal du boss
    boss.x += boss.speedX;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.speedX *= -1;
    }

    // Déplacement des bananes
    bananas.forEach(b => {
        b.y += b.speedY;
        b.x += b.angle;
    });

    // Collision tirs / boss
    player.bullets.forEach((bullet, bi) => {
        if (
            bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y
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

    // Supprimer les bananes hors écran
    bananas = bananas.filter(b => b.y < canvas.height + 50);
}

// ===============================
//  DESSIN DU BOSS ET DES BANANES
// ===============================

function drawBoss() {
    if (bossActive && boss) {
        // Boss (emoji géant)
        ctx.font = "90px Arial";
        ctx.textAlign = "center";
        ctx.fillText(boss.emoji, boss.x + boss.width / 2, boss.y + boss.height - 10);

        // Barre de vie
        ctx.fillStyle = "#ff0054";
        ctx.fillRect(boss.x, boss.y - 15, boss.width, 10);

        ctx.fillStyle = "#4cc9f0";
        ctx.fillRect(boss.x, boss.y - 15, (bossHP / 50) * boss.width, 10);
    }

    // Bananes
    bananas.forEach(b => {
        ctx.font = "30px Arial";
        ctx.fillText(b.emoji, b.x, b.y);
    });
}
// ===============================
//  EASTER EGG BONOBOS + LEADERBOARD + ENDLESS
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
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function showLeaderboard() {
    const box = document.getElementById("leaderboard");
    if (!box) return;

    box.innerHTML = "<h3>Leaderboard</h3>";
    leaderboard.forEach((entry, i) => {
        box.innerHTML += `<p>${i + 1}. ${entry.name} — ${entry.score} pts</p>`;
    });
}

function showEndlessButton() {
    const box = document.getElementById("endless-btn-box");
    if (!box) return;

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
