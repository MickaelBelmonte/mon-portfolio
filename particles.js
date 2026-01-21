const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");

let particlesArray = [];
let mouse = { x: null, y: null, radius: 120 };

window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Ajuste la taille du canvas
function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Création des particules
class Particle {
    constructor() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;

        this.size = Math.random() * 2 + 1;

        const colors = ["#4cc9f0", "#9d4edd"];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            this.x -= dx / 20;
            this.y -= dy / 20;
        }

        if (this.x < 0 || this.x > particlesCanvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > particlesCanvas.height) this.speedY *= -1;
    }

    draw() {
        particlesCtx.beginPath();
        particlesCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        particlesCtx.fillStyle = this.color + "cc";
        particlesCtx.shadowBlur = 12;
        particlesCtx.shadowColor = this.color;
        particlesCtx.fill();
    }
}

// Initialisation
function initParticles() {
    particlesArray = [];
    let numberOfParticles = Math.floor((particlesCanvas.width * particlesCanvas.height) / 15000);

    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}
initParticles();

// Connexions entre particules
function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = dx * dx + dy * dy;

            if (distance < 9000) {
                particlesCtx.strokeStyle = "rgba(76, 201, 240, 0.15)";
                particlesCtx.lineWidth = 1;
                particlesCtx.beginPath();
                particlesCtx.moveTo(particlesArray[a].x, particlesArray[a].y);
                particlesCtx.lineTo(particlesArray[b].x, particlesArray[b].y);
                particlesCtx.stroke();
            }
        }
    }
}

// Animation
function animate() {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particlesArray.forEach((p) => {
        p.update();
        p.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
}

animate();
