const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const mouse = {
    x: null,
    y: null,
    radius: 120 // zone d’attraction
};

window.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.speed = Math.random() * 1 + 0.2;
    }

    draw() {
        ctx.fillStyle = "rgba(76, 201, 240, 0.9)";
        ctx.shadowColor = "rgba(76, 201, 240, 1)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            // Attraction vers la souris
            this.x += dx / 20;
            this.y += dy / 20;
        } else {
            // Retour à la position initiale
            if (this.x !== this.baseX) {
                let dxBack = this.x - this.baseX;
                this.x -= dxBack / 40;
            }
            if (this.y !== this.baseY) {
                let dyBack = this.y - this.baseY;
                this.y -= dyBack / 40;
            }
        }
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 150; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

initParticles();
animateParticles();
