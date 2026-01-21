/* ------------------------------
   MODE SOMBRE / MODE CLAIR
------------------------------ */

const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// Fonction pour appliquer le thème
function applyTheme(theme) {
    if (theme === "light") {
        body.classList.add("light-mode");
        toggleBtn.textContent = "☀️";
    } else {
        body.classList.remove("light-mode");
        toggleBtn.textContent = "🌙";
    }
}

// Animation holographique lors du changement
function triggerThemeTransition() {
    body.classList.add("theme-transition");
    setTimeout(() => body.classList.remove("theme-transition"), 600);
}

// Toggle du thème
toggleBtn.addEventListener("click", () => {
    const isLight = body.classList.toggle("light-mode");

    applyTheme(isLight ? "light" : "dark");
    localStorage.setItem("theme", isLight ? "light" : "dark");

    triggerThemeTransition();
});

// Charger le thème sauvegardé
applyTheme(localStorage.getItem("theme") || "dark");


/* ------------------------------
   FILTRES DES PROJETS
------------------------------ */

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            projectCards.forEach(card => {
                card.style.display =
                    filter === "all" || card.classList.contains(filter)
                        ? "block"
                        : "none";
            });
        });
    });
}


/* ------------------------------
   ANIMATION D'APPARITION
------------------------------ */

const fadeElements = document.querySelectorAll(".fade-in");

const appearOptions = { threshold: 0.2 };

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
    });
}, appearOptions);

fadeElements.forEach(el => appearOnScroll.observe(el));


/* ------------------------------
   CURSEUR IA HOLOGRAPHIQUE
------------------------------ */

const cursorDot = document.querySelector(".cursor-dot");
const cursorHalo = document.querySelector(".cursor-halo");

let mouseX = 0, mouseY = 0;
let haloX = 0, haloY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
});

function animateHalo() {
    haloX += (mouseX - haloX) * 0.12;
    haloY += (mouseY - haloY) * 0.12;

    cursorHalo.style.left = haloX + "px";
    cursorHalo.style.top = haloY + "px";

    requestAnimationFrame(animateHalo);
}
animateHalo();
