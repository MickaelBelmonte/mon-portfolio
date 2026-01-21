// =============================
// IAventures v2 – "IA" évolutive
// =============================

// --- Sélecteurs principaux ---
const outputEl = document.getElementById("output");
let iaStatusEl = document.getElementById("ia-status");

// Si tu n'as pas encore ajouté #ia-status dans le HTML, on le crée dynamiquement
if (!iaStatusEl) {
    iaStatusEl = document.createElement("div");
    iaStatusEl.id = "ia-status";
    iaStatusEl.className = "ia-status";
    outputEl.parentNode.insertBefore(iaStatusEl, outputEl);
}

// --- État interne de l'IA ---
let iaMemory = JSON.parse(localStorage.getItem("ia_memory") || "[]");
let iaVocabulary = JSON.parse(localStorage.getItem("ia_vocab") || "[]");
let continuousMode = false;
let continuousTimeout = null;

// =============================
// OUTILS GÉNÉRAUX
// =============================

function setIAStatus(text, thinking = false) {
    iaStatusEl.textContent = text;
    iaStatusEl.classList.toggle("thinking", thinking);
}

function random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function randomLieu() {
    const lieux = [
        "un désert infini",
        "une forêt vivante",
        "une ville suspendue",
        "un océan noir",
        "un labyrinthe de verre",
        "une cité engloutie",
        "un ciel fracturé"
    ];
    return random(lieux);
}

// Machine à écrire
function typeText(text, speed = 18) {
    return new Promise(resolve => {
        outputEl.textContent = "";
        let i = 0;

        function type() {
            if (i < text.length) {
                outputEl.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Sauvegarde mémoire
function saveToMemory(text) {
    iaMemory.push(text);
    if (iaMemory.length > 80) iaMemory.shift();
    localStorage.setItem("ia_memory", JSON.stringify(iaMemory));

    // Enrichir le vocabulaire
    const words = text
        .replace(/[^\wÀ-ÿ'-]+/g, " ")
        .split(" ")
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 4);

    words.forEach(w => {
        if (!iaVocabulary.includes(w)) {
            iaVocabulary.push(w);
        }
    });
    if (iaVocabulary.length > 200) iaVocabulary = iaVocabulary.slice(-200);
    localStorage.setItem("ia_vocab", JSON.stringify(iaVocabulary));
}

// Génération à partir de la mémoire
function generateFromMemory() {
    if (iaMemory.length < 3) return null;

    const parts = [];
    for (let i = 0; i < 3; i++) {
        const sample = random(iaMemory);
        const split = sample.split(/[.!?\n]/).filter(Boolean);
        if (split.length > 0) {
            parts.push(split[Math.floor(Math.random() * split.length)].trim());
        }
    }
    if (parts.length === 0) return null;

    let base = parts.join(". ") + ".";
    base = applyStyleRules(base);
    return base;
}

// Règles de style / auto-discipline
function applyStyleRules(text) {
    // 1) Éviter les répétitions exactes
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const s of sentences) {
        const key = s.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(s);
        }
    }

    // 2) Ajouter un ton mystérieux / poétique
    const endings = [
        "comme si le monde retenait son souffle",
        "et pourtant, quelque chose échappe à ta compréhension",
        "dans un silence que même le temps n’ose briser",
        "sous un ciel qui semble t’observer",
        "comme si quelqu’un écrivait ton histoire en direct"
    ];

    let result = unique.join(". ") + ".";
    if (!result.includes("…") && Math.random() < 0.6) {
        result += " " + random(endings) + ".";
    }

    return result;
}

// Wrapper principal d'affichage
async function afficherIA(texteBrut) {
    setIAStatus("Génération en cours...", true);
    const finalText = applyStyleRules(texteBrut);
    await typeText(finalText);
    saveToMemory(finalText);
    setIAStatus("Prête pour une nouvelle aventure.", false);
}

// =============================
// 1) AVENTURE ALÉATOIRE
// =============================
async function genererAventure() {
    setIAStatus("Analyse des mondes possibles...", true);

    const mondes = [
        "Les Falaises de Verre",
        "Le Désert des Horloges Brisées",
        "L’Océan des Miroirs Noirs",
        "La Forêt des Murmures",
        "Les Ruines Suspendues"
    ];

    const lieux = [
        "Le Temple des Échos Perdus",
        "La Bibliothèque Vivante",
        "La Tour Aveugle",
        "Le Puits des Souvenirs",
        "Le Marché des Objets Impossibles"
    ];

    const objets = [
        "une boussole oubliée",
        "un sablier inversé",
        "un masque du passé",
        "une clé qui ouvre des portes détruites",
        "un carnet qui écrit seul"
    ];

    let texte = generateFromMemory();
    if (!texte || Math.random() < 0.4) {
        const monde = random(mondes);
        const lieu = random(lieux);
        const objet = random(objets);

        texte = `
🌍 Monde : ${monde}
🏛️ Lieu : ${lieu}
🔮 Objet : ${objet}

Tu sens que ce monde n’attendait que toi.
        `;
    } else {
        texte = "Nouvelle aventure générée à partir de la mémoire de l’IA :\n\n" + texte;
    }

    await afficherIA(texte);
}

// =============================
// 2) MODE EXPLORATION
// =============================
async function exploration() {
    setIAStatus("Exploration des zones inconnues...", true);

    const lieux = [
        "une clairière silencieuse",
        "un village abandonné",
        "une grotte lumineuse",
        "un pont effondré",
        "un temple enfoui"
    ];

    const events = [
        "un murmure étrange",
        "un tremblement léger",
        "une ombre lointaine",
        "un objet apparaît dans ta main",
        "le vent transporte un message"
    ];

    const lieu = random(lieux);
    const event = random(events);

    const texte = `
🧭 EXPLORATION

Tu avances dans ${lieu}.
Soudain, ${event}.
Rien n’est vraiment à sa place ici.
    `;

    await afficherIA(texte);
}

// =============================
// 3) CRÉATION DE MONDE
// =============================
async function creationMonde() {
    setIAStatus("Création d’un nouveau monde...", true);

    const nom = prompt("Nom du monde ?");
    const climat = prompt("Climat ?");
    const ressource = prompt("Ressource rare ?");

    if (!nom || !climat || !ressource) {
        setIAStatus("Création annulée.", false);
        return;
    }

    const lieux = [
        `la vallée de ${nom}`,
        `les montagnes ${climat}`,
        `la forêt des ${ressource}`,
        `le désert de ${nom}`,
        `les ruines du ${climat}`
    ];

    const creatures = [
        `des esprits liés à ${ressource}`,
        `des créatures adaptées au climat ${climat}`,
        `des voyageurs perdus dans ${nom}`,
        `des gardiens de la ressource ${ressource}`
    ];

    const texte = `
🌍 Monde créé

Nom : ${nom}
Climat : ${climat}
Ressource rare : ${ressource}

📍 Lieux :
 - ${random(lieux)}
 - ${random(lieux)}
 - ${random(lieux)}

🐾 Créatures :
 - ${random(creatures)}
 - ${random(creatures)}
 - ${random(creatures)}
    `;

    await afficherIA(texte);
}

// =============================
// 4) GÉNÉRATEUR DE CRÉATURES
// =============================
async function genererCreature() {
    setIAStatus("Synthèse d’une nouvelle créature...", true);

    const types = ["spectre", "golem", "chimère", "gardien", "voyageur"];
    const traits = ["lumineux", "sans ombre", "à voix multiple", "qui flotte", "qui change de forme"];
    const pouvoirs = ["manipule le temps", "voit les souvenirs", "ouvre des portails", "altère la gravité"];

    const texte = `
🐉 Créature générée

Type : ${random(types)}
Trait : ${random(traits)}
Pouvoir : ${random(pouvoirs)}

On raconte qu’elle n’apparaît qu’à ceux qui doutent encore de la réalité de ce monde.
    `;

    await afficherIA(texte);
}

// =============================
// 5) CARTE ASCII
// =============================
async function genererCarte() {
    setIAStatus("Cartographie en cours...", true);

    let carte = "🗺️ CARTE ASCII\n\n";
    const symbols = ["#", ".", "~", "^", " "];

    for (let y = 0; y < 12; y++) {
        let ligne = "";
        for (let x = 0; x < 30; x++) {
            ligne += random(symbols);
        }
        carte += ligne + "\n";
    }

    await afficherIA(carte);
}

// =============================
// 6) HISTOIRE COMPLÈTE
// =============================
async function genererHistoire() {
    setIAStatus("Construction d’une histoire complète...", true);

    const heros = ["un archiviste", "une voyageuse", "un enfant", "un cartographe"];
    const quetes = ["retrouver un souvenir", "cartographier un lieu", "sauver un objet", "comprendre un mystère"];
    const twists = ["mais le monde change autour d’eux", "mais le temps se déforme", "mais une ombre les suit"];

    let base = `
📜 HISTOIRE GÉNÉRÉE

Il était une fois ${random(heros)} chargé de ${random(quetes)}.
Son voyage commence dans ${randomLieu()}.
Tout semble normal… ${random(twists)}.
    `;

    // Si la mémoire est riche, on ajoute un paragraphe généré
    const mem = generateFromMemory();
    if (mem) {
        base += "\n\nL’IA se souvient de fragments d’autres histoires :\n" + mem;
    }

    await afficherIA(base);
}

// =============================
// 7) MODE AVENTURE CONTINUE
// =============================

async function runContinuous() {
    if (!continuousMode) return;

    const actions = [genererAventure, exploration, genererHistoire, genererCreature];
    const action = random(actions);

    await action();

    const delay = 4000 + Math.random() * 5000;
    continuousTimeout = setTimeout(runContinuous, delay);
}

function toggleAventureContinue() {
    continuousMode = !continuousMode;

    if (continuousMode) {
        setIAStatus("Mode aventure continue activé.", true);
        runContinuous();
    } else {
        setIAStatus("Mode aventure continue désactivé.", false);
        if (continuousTimeout) clearTimeout(continuousTimeout);
    }
}
