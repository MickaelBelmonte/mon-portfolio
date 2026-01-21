// ===============================
//  ÉCRAN DE CHARGEMENT
// ===============================
window.addEventListener("load", () => {
    const loadingScreen = document.getElementById("loading-screen");
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 2200);
});

