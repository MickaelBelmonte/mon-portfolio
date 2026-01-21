// ===============================
//  CANVAS
// ===============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

// ===============================
//  UI & HUD
// ===============================
const menu = document.getElementById("game-menu");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const bonoboMessage = document.getElementById("bonobo-message");
const livesDisplay = document.getElementById("lives");
const leaderboardBox = document.getElementById("leaderboard");
const endlessBtnBox = document.getElementById("endless-btn-box");

// ===============================
//  LEADERBOARD ONLINE (JSONBIN)
// ===============================
const LEADERBOARD_URL = "https://api.jsonbin.io/v3/b/69709cecd0ea881f407a366b";
const API_KEY = "$2a$10$gCD0Qxxs.NzWK6d1EzrL.emnDKT8Ou2MlGK150480W86zb/qeYtXa";

// Lecture du leaderboard
async function fetchLeaderboard() {
    try {
        const res = await fetch(LEADERBOARD_URL, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await res.json();

        // Structure attendue : { record: { leaderboard: [...] } }
        if (data && data.record && Array.isArray(data.record.leaderboard)) {
            return data.record.leaderboard;
        }

        return [];
    } catch (err) {
        console.error("Erreur récupération leaderboard :", err);
        return [];
    }
}

// Sauvegarde du leaderboard
async function saveLeaderboard(leaderboardArray) {
    try {
        await fetch(LEADERBOARD_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ leaderboard: leaderboardArray })
        });
    } catch (err) {
        console.error("Erreur sauvegarde leaderboard :", err);
    }
}

// ===============================
//  VARIABLES GLOBALES
// ===============================
let gameRunning = false;
let score = 0;
let timeElapsed = 0;
let gameInterval = null;
let enemySpawnInterval = null;
let lives = 3;

let enemies = [];
let explosions = [];
let bananas = [];

let boss = null;
let bossActive = false;
let bossHP = 50;
let enemySpeed = 2;
let isEndless = false;

// ===============================
//  JOUEUR
// ===============================
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 10,
    bullets: [],
    shots: 0,
    color: "#4cc9f0"
};

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Tir
document.addEventListener("keydown", e => {
    if (e.key === " " && gameRunning) {
        player.bullets.push({
            x: player.x + player.width / 2 - 10,
            y: player.y,
            emoji: "🧤",
            size: 30,
            speed: 10
        });
        player.shots++;
    }
});

// ===============================
//  UTILS
// ===============================
function rectsCollide(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

function updateLivesDisplay() {
    livesDisplay.textContent = "Vies : " + "❤️".repeat(lives);
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) gameOver();
}

// ===============================
//  LANCEMENT DU JEU
// ===============================
startBtn.addEventListener("click", () => {
    isEndless = false;
    startGame();
});

function startGame() {
    menu.style.display = "none";
    hud.style.display = "flex";
    bonoboMessage.style.display = "none";
    leaderboardBox.innerHTML = "";
    endlessBtnBox.innerHTML = "";

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
    player.shots = 0;
    updateLivesDisplay();

    clearInterval(gameInterval);
    clearInterval(enemySpawnInterval);

    gameInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = "Temps : " + timeElapsed + "s";
        if (!isEndless && timeElapsed === 120 && !bossActive) spawnBoss();
    }, 1000);

    const spawnDelay = isEndless ? 700 : 900;
    enemySpawnInterval = setInterval(() => {
        if (gameRunning && !bossActive) {
            spawnEnemy();
            if (isEndless) spawnEnemy();
        }
    }, spawnDelay);

    requestAnimationFrame(gameLoop);
}

// ===============================
//  BOUCLE PRINCIPALE
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
//  ENNEMIS
// ===============================
function spawnEnemy() {
    const enemyEmojis = ["🙊", "🙉", "🙈", "🐵"];
    enemies.push({
        x: Math.random() * (canvas.width - 80),
        y: -80,
        emoji: enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)],
        size: 80,
        speed: enemySpeed
    });
}

// ===============================
//  UPDATE
// ===============================
function update() {
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

    player.bullets.forEach(b => b.y -= b.speed);
    player.bullets = player.bullets.filter(b => b.y > -50);

    enemies.forEach(e => e.y += e.speed);

    enemies.forEach((enemy, ei) => {
        if (enemy.y > canvas.height) {
            enemies.splice(ei, 1);
            loseLife();
        }
    });

    enemies.forEach((enemy, ei) => {
        player.bullets.forEach((bullet, bi) => {
            const bulletBox = { x: bullet.x, y: bullet.y, size: bullet.size };
            const enemyBox = { x: enemy.x, y: enemy.y, size: enemy.size };
            if (rectsCollide(bulletBox, enemyBox)) {
                score += isEndless ? 20 : 10;
                createExplosion(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2);
                enemies.splice(ei, 1);
                player.bullets.splice(bi, 1);
            }
        });
    });

    enemies = enemies.filter(e => e.y < canvas.height + 50);

    explosions.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.03;
        if (p.alpha <= 0) explosions.splice(i, 1);
    });

    updateBoss();

    bananas.forEach((b, bi) => {
        const playerBox = { x: player.x, y: player.y, size: player.width };
        const bananaBox = { x: b.x, y: b.y, size: b.size };
        if (rectsCollide(playerBox, bananaBox)) {
            bananas.splice(bi, 1);
            loseLife();
        }
    });

    bananas = bananas.filter(b => b.y < canvas.height + 50);
}

// ===============================
//  DRAW
// ===============================
function draw() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    player.bullets.forEach(b => {
        ctx.font = b.size + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText(b.emoji, b.x, b.y);
    });

    enemies.forEach(e => {
        ctx.font = e.size + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText(e.emoji, e.x + e.size / 2, e.y + e.size);
    });

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
        x: canvas.width / 2 - 180,
        y: 20,
        width: 180,
        height: 180,
        emoji: "🐒",
        speedX: 3
    };
}

function bossAttack() {
    if (!bossActive || !boss) return;
    bananas.push({
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height,
        emoji: "🍌",
        size: 30,
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

    player.bullets.forEach((bullet, bi) => {
        const bulletBox = { x: bullet.x, y: bullet.y, size: bullet.size };
        const bossBox = { x: boss.x, y: boss.y, size: boss.width };
        if (rectsCollide(bulletBox, bossBox)) {
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
    if (!bossActive || !boss) return;

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

// ===============================
//  GAME OVER & BONOBO
// ===============================
async function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(enemySpawnInterval);

    let name = prompt("Game Over ! Entre ton pseudo pour le leaderboard :");
    if (!name) name = "Anonyme";

    await saveScore(name, score);
    await showLeaderboard();
    showEndlessButton();

    bonoboMessage.style.display = "block";
    bonoboMessage.innerHTML = `
        <h2>GAME OVER</h2>
        <p>Dommage ! Retente ta chance !</p>
    `;
}

async function triggerBonoboEasterEgg() {
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

    await saveScore(name, score);
    await showLeaderboard();
    showEndlessButton();
}

// ===============================
//  LEADERBOARD
// ===============================
async function saveScore(name, score) {
    const shots = player.shots;
    const ratio = shots > 0 ? (score / shots).toFixed(2) : score;

    let leaderboard = await fetchLeaderboard();
    leaderboard.push({ name, score, shots, ratio });

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    await saveLeaderboard(leaderboard);
}

async function showLeaderboard() {
    leaderboardBox.innerHTML = "<h3>Leaderboard</h3>";

    const leaderboard = await fetchLeaderboard();

    leaderboard.forEach((entry, i) => {
        leaderboardBox.innerHTML += `
            <p>
                ${i + 1}. ${entry.name} — 
                ${entry.score} pts — 
                ${entry.shots} tirs — 
                Ratio : ${entry.ratio}
            </p>
        `;
    });
}

// ===============================
//  MODE ENDLESS
// ===============================
function showEndlessButton() {
    endlessBtnBox.innerHTML = `
        <button id="endless-btn" class="btn" style="margin-top:20px;">
            Activer le Mode Endless
        </button>
    `;

    document.getElementById("endless-btn").addEventListener("click", startEndlessMode);
}

function startEndlessMode() {
    isEndless = true;
    startGame();
}
