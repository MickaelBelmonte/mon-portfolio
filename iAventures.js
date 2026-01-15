// -----------------------------
// 1) AVENTURE ALÉATOIRE
// -----------------------------
function genererAventure() {
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

    const monde = random(mondes);
    const lieu = random(lieux);
    const objet = random(objets);

    afficher(`
🌍 Monde : ${monde}
🏛️ Lieu : ${lieu}
🔮 Objet : ${objet}
    `);
}



// -----------------------------
// 2) MODE EXPLORATION
// -----------------------------
function exploration() {
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

    afficher(`
🧭 EXPLORATION
➡️ Tu arrives dans ${lieu}
⚠️ ${event}
    `);
}



// -----------------------------
// 3) CRÉATION DE MONDE
// -----------------------------
function creationMonde() {
    const nom = prompt("Nom du monde ?");
    const climat = prompt("Climat ?");
    const ressource = prompt("Ressource rare ?");

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

    afficher(`
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
    `);
}



// -----------------------------
// 4) GÉNÉRATEUR DE CRÉATURES
// -----------------------------
function genererCreature() {
    const types = ["spectre", "golem", "chimère", "gardien", "voyageur"];
    const traits = ["lumineux", "sans ombre", "à voix multiple", "qui flotte", "qui change de forme"];
    const pouvoirs = ["manipule le temps", "voit les souvenirs", "ouvre des portails", "altère la gravité"];

    afficher(`
🐉 Créature générée
Type : ${random(types)}
Trait : ${random(traits)}
Pouvoir : ${random(pouvoirs)}
    `);
}



// -----------------------------
// 5) CARTE ASCII
// -----------------------------
function genererCarte() {
    let carte = "🗺️ CARTE ASCII\n\n";
    const symbols = ["#", ".", "~", "^", " "];

    for (let y = 0; y < 12; y++) {
        let ligne = "";
        for (let x = 0; x < 30; x++) {
            ligne += random(symbols);
        }
        carte += ligne + "\n";
    }

    afficher(carte);
}



// -----------------------------
// 6) HISTOIRE COMPLÈTE
// -----------------------------
function genererHistoire() {
    const heros = ["un archiviste", "une voyageuse", "un enfant", "un cartographe"];
    const quetes = ["retrouver un souvenir", "cartographier un lieu", "sauver un objet", "comprendre un mystère"];
    const twists = ["mais le monde change autour d’eux", "mais le temps se déforme", "mais une ombre les suit"];

    afficher(`
📜 HISTOIRE GÉNÉRÉE

Il était une fois ${random(heros)} chargé de ${random(quetes)}.
Son voyage commence dans ${randomLieu()}.
Tout semble normal… ${random(twists)}.
    `);
}



// -----------------------------
// OUTILS
// -----------------------------
function random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function randomLieu() {
    const lieux = ["un désert infini", "une forêt vivante", "une ville suspendue", "un océan noir"];
    return random(lieux);
}

function afficher(txt) {
    document.getElementById("output").textContent = txt;
}