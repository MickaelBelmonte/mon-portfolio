const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");

particlesCanvas.width = window.innerWidth;
particlesCanvas.height = window.innerHeight;

let particlesArray = [];
const mouse = {
    x: null,
    y: null,
    radius: 120
};

window.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.speed = Math.random() * 1 + 0.2;
    }

    draw() {
        particlesCtx.fillStyle = "rgba(76, 201, 240, 0.9)";
        particlesCtx.shadowColor = "rgba(76, 201, 240, 1)";
        particlesCtx.shadowBlur = 12;
        particlesCtx.beginPath();
        particlesCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        particlesCtx.closePath();
        particlesCtx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            this.x += dx / 20;
            this.y += dy / 20;
        } else {
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
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", () => {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    initParticles();
});

initParticles();
animateParticles();
