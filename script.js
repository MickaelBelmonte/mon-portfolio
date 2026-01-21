/* ------------------------------
   MODE SOMBRE / MODE CLAIR
------------------------------ */

const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

toggleBtn.addEventListener("click", () => {
    body.classList.toggle("light-mode");

    if (body.classList.contains("light-mode")) {
        toggleBtn.textContent = "☀️";
        localStorage.setItem("theme", "light");
    } else {
        toggleBtn.textContent = "🌙";
        localStorage.setItem("theme", "dark");
    }
});

// Charger le thème sauvegardé
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-mode");
    toggleBtn.textContent = "☀️";
}


/* ------------------------------
   FILTRES DES PROJETS
------------------------------ */

// Vérifie si on est sur la page projets
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            // Active le bouton sélectionné
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Filtre les cartes
            projectCards.forEach(card => {
                if (filter === "all" || card.classList.contains(filter)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}


/* ------------------------------
   ANIMATION D'APPARITION
------------------------------ */

const fadeElements = document.querySelectorAll(".fade-in");

const appearOptions = {
    threshold: 0.2
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
    });
}, appearOptions);

fadeElements.forEach(el => {
    appearOnScroll.observe(el);
});

/* CURSEUR IA HOLOGRAPHIQUE */

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

/* Animation du halo avec un léger retard */
function animateHalo() {
    haloX += (mouseX - haloX) * 0.12;
    haloY += (mouseY - haloY) * 0.12;

    cursorHalo.style.left = haloX + "px";
    cursorHalo.style.top = haloY + "px";

    requestAnimationFrame(animateHalo);
}
animateHalo();
