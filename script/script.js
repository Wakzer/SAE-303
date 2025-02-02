// URL des données JSON et du fichier SVG
const dataUrl = "script/depression_confinement_complete.json";
const svgUrl = "Style/france.svg";

// Sélection des éléments HTML
const monthSelector = document.getElementById("month-selector");
const barGraph = document.getElementById("bar-graph");
const franceMap = document.getElementById("france-map");

// Correspondance entre les IDs du SVG et les noms des régions dans le JSON
const regionMapping = {
    "FR-A": "Alsace",
    "FR-B": "Aquitaine",
    "FR-C": "Auvergne",
    "FR-D": "Bourgogne",
    "FR-E": "Bretagne",
    "FR-F": "Centre",
    "FR-G": "Champagne-Ardenne",
    "FR-H": "Corse",
    "FR-I": "Franche-Comté",
    "FR-J": "Île-de-France",
    "FR-K": "Languedoc-Roussillon",
    "FR-L": "Limousin",
    "FR-M": "Lorraine",
    "FR-N": "Midi-Pyrénées",
    "FR-O": "Nord-Pas-de-Calais",
    "FR-P": "Basse-Normandie",
    "FR-Q": "Haute-Normandie",
    "FR-R": "Pays de la Loire",
    "FR-S": "Picardie",
    "FR-T": "Poitou-Charentes",
    "FR-U": "Provence-Alpes-Côte d'Azur",
    "FR-V": "Rhône-Alpes"
};

// Charger les données JSON
async function fetchData() {
    const response = await fetch(dataUrl);
    return response.json();
}

// Charger le fichier SVG de la carte
async function fetchSVG() {
    const response = await fetch(svgUrl);
    return response.text();
}

// Initialisation du site
async function initialize() {
    const data = await fetchData();
    const svgContent = await fetchSVG();

    // Insérer la carte SVG dans la page
    franceMap.innerHTML = svgContent;
    document.querySelectorAll("path").forEach((path) => {
        if (!path.classList.contains("region")) {
            path.classList.add("region");
        }
    });

    populateMonths(data);
    generateBarChart(data);

    // Ajouter un écouteur d'événement sur le sélecteur
    monthSelector.addEventListener("change", (event) => {
        const selectedMonth = event.target.value;
        if (selectedMonth !== "") {
            updateMap(data.phases_confinement[selectedMonth]);
        }
    });

    const regionInfo = document.getElementById("region-info");

    // Affichage des données d'une région au clic
    document.querySelectorAll(".region").forEach((region) => {
        region.addEventListener("click", () => {
            const regionId = region.id;
            const regionName = regionMapping[regionId];
            const selectedMonth = monthSelector.value;
            if (selectedMonth !== "" && regionName) {
                const monthData = data.phases_confinement[selectedMonth];
                const regionData = monthData.regions[regionName];
                if (regionData) {
                    regionInfo.innerHTML = `<h2>Informations sur la région</h2><p class="txt-gras">${regionName} : </p> ${regionData.pourcentage}% (${regionData.nombre_absolu} personnes atteint de dépression au total)`;
                } else {
                    regionInfo.innerHTML = `<h2>Informations sur la région</h2><strong>${regionName}</strong> : Données non disponibles`;
                }
            }
        });
    });
}

// Remplit le sélecteur avec les mois disponibles
function populateMonths(data) {
    monthSelector.innerHTML = "<option value=''>Sélectionnez une période</option>";
    data.phases_confinement.forEach((phase, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = phase.mois;
        monthSelector.appendChild(option);
    });
}

// Générer le graphique en barres dynamiquement
function generateBarChart(data) {
    barGraph.innerHTML = "";

    data.phases_confinement.forEach((phase) => {
        const container = document.createElement("div");
        container.classList.add("bar-container");

        const label = document.createElement("p");
        label.textContent = phase.mois;
        container.appendChild(label);

        const total = phase.sexe.hommes.pourcentage + phase.sexe.femmes.pourcentage;
        const hommesWidth = (phase.sexe.hommes.pourcentage / total) * 100;
        const femmesWidth = (phase.sexe.femmes.pourcentage / total) * 100;

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.background = `linear-gradient(90deg, rgba(14,0,255,1) 0%, rgba(14,0,255,1) ${hommesWidth}%, rgba(255,0,254,1) ${hommesWidth}%, rgba(255,0,254,1) 100%)`;
        bar.textContent = `Hommes: ${phase.sexe.hommes.pourcentage}%, Femmes: ${phase.sexe.femmes.pourcentage}%`;
        container.appendChild(bar);

        barGraph.appendChild(container);
    });
}

// Mettre à jour la carte avec la couleur des régions en fonction de la période sélectionnée
function updateMap(monthData) {
    document.querySelectorAll(".region").forEach((region) => {
        const regionId = region.id;
        const regionName = regionMapping[regionId];
        const regionData = monthData.regions[regionName];

        if (regionData) {
            const percentage = regionData.pourcentage;
            const color = calculateColor(percentage);
            region.style.fill = color;
        } else {
            region.style.fill = "#cccccc";
        }
    });
}

// Fonction pour calculer la couleur en fonction du pourcentage (je met des couleur lumineuses, cela permet de rendre le site moins austère.)
function calculateColor(percentage) {
    if (percentage <= 11) return "#0000FF"; // Bleu
    if (percentage <= 13) return "#00CCFF"; // Bleu clair
    if (percentage <= 15) return "#00FF00"; // Vert
    if (percentage <= 17) return "#FFFF00"; // Jaune
    if (percentage <= 19) return "#FFA500"; // Orange
    return "#FF0000"; // Rouge
}

// Lancer l'initialisation
initialize();