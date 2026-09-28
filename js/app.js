"use strict";

/* ==========================
   SPILGALLERI (navbar, dialog osv.)
   ========================== */

if (document.querySelector(".spilgalleri-titel")) {
  console.log("🎮 Spilgalleri loaded");
}

let allGames = [];

// #2: Fetch games from JSON file
async function getGames() {
  const response = await fetch("../data/games.json");
  allGames = await response.json();
  console.log("📁 Games loaded:", allGames.length);
  // populateCategoryDropdown(); // Remove or comment out if not implemented
  displayGames(allGames);
}

// #3: Display all games
function displayGames(games) {
  const gameList = document.querySelector(".game-list-all");
  if (!gameList) return;
  gameList.innerHTML = "";

  if (games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre 😢</p>';
    return;
  }

  for (const game of games) {
    displayGame(game);
  }
}

function getLocationClass(location) {
  return `location-${location.toLowerCase().replaceAll(" ", "-")}`;
}

// #4: Render a single game card and add event listeners
function displayGame(game) {
  const gameList = document.querySelector(".game-list-all");
  if (!gameList) return;

  const gameHTML = `
    <article class="game-card" tabindex="0" data-id="${game.id}" aria-label="${game.title}">
        <section class="top-card">
            <img src="${game.image}" 
            alt="${game.title}" 
            class="game-image" />
            <div class="age-tag" aria-label="Alder: ${game.age} år" title="Alder: ${game.age} år">${game.age}</div>
            <div class="rating-tag" aria-label="Bedømmelse: ${game.rating} ud af 5" title="Bedømmelse: ${game.rating} ud af 5">${game.rating}</div>
            <div class="difficulty-tag ${getDifficultyClass(game.difficulty)}" aria-label="Sværhedsgrad: ${game.difficulty}" title="Sværhedsgrad: ${game.difficulty}">${game.difficulty}</div>
        </section>
        <section class="bottom-card">
            <h2 class="card-titel">${game.title}</h2>
            <div class="tags">
                <span class="card-label">Genre:</span>
                <p>${game.genre}</p>
            </div>
            <div class="tags">
                <span class="card-label">Spilletid:</span>
                <p>${game.playtime} min</p>
            </div>
            <div class="tags">
                <span class="card-label">Spillere:</span>
                <p>${game.players.min}-${game.players.max}</p>
            </div>
            <div class="tags">
                <span class="card-label">Sprog:</span>
                <p>${game.language}</p>
            </div>
            <button class="location-tag ${getLocationClass(game.location)}" type="button" aria-label="${game.location}, hylde ${game.shelf}">
              ${game.location} · ${game.shelf}
            </button>
        </section>
    </article>
  `;
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Tilføj click event til den nye card
  const newCard = gameList.lastElementChild;
  newCard.addEventListener("click", function () {
    showGameModal(game.id);
  });
}

//Game Card Dialog
function getDifficultyClass(difficulty) {
  switch (difficulty.trim().toLowerCase()) {
    case "let":
      return "difficulty-easy";
    case "mellem":
      return "difficulty-medium";
    case "svær":
      return "difficulty-hard";
    default:
      return "";
  }
}

function showGameModal(id) {
  const game = allGames.find((g) => g.id == id);
  if (!game) return;

  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <div class="dialog-details">
      <p class="game-description">${game.rules}</p>
    </div> 
  
  `;

  document.querySelector("#game-dialog").showModal();
}

// Luk dialog på klik af X
document.querySelector("#close-dialog").addEventListener("click", () => {
  document.querySelector("#game-dialog").close();
});

// Dropdown-menu //// Åbn/luk dropdowns

// FILTRERINGSSYSTEM //

// værdier fra input felter
function filterGames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const difficultyValue = document.querySelector("#difficulty-select").value;
  const genreValue = document.querySelector("#genre-select").value;
  const playtimeValue = document.querySelector("#playtime-select").value;

  // Start med alle spil - kopieres efterfølgende
  let filteredGames = allGames;

  // filtrer på spil titel
  if (searchValue) {
    // Kun filtrer hvis der er indtastet noget
    filteredGames = filteredGames.filter((game) => {
      // includes() checker om søgeteksten findes i titlen
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // filtrer på valgt sværhedsgrad
  if (difficultyValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredGames = filteredGames.filter((game) => {
      // Eksakt match på sværhedsgrad
      return game.difficulty === difficultyValue;
    });
  }

  // filtrer på valgt genre
  if (genreValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredGames = filteredGames.filter((game) => {
      // Eksakt match på genre
      return game.genre === genreValue;
    });
  }

  // Spilletid - filtrer på spilletid
  if (playtimeValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    const filterTime = Number(playtimeValue) || 0;
    filteredGames = filteredGames.filter((game) => {
      // Check om spillets spilletid er større eller lig filterens tid
      return game.playtime >= filterTime;
    });
  }

  // Vis de filtrerede spil på siden
  displayGames(filteredGames);
}

// Event listeners til alle filtre
document.addEventListener("DOMContentLoaded", () => {
  getGames();

  const filterToggle = document.querySelector(".filter-toggle");
  const filterPanel = document.getElementById("filter-panel");

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", () => {
      const isOpen = filterPanel.hidden === false;
      filterPanel.hidden = isOpen;
      filterToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // Event listener til søgning
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("input", filterGames);
  }

  // Event listeners til alle filter-dropdowns
  const difficultySelect = document.querySelector("#difficulty-select");
  const genreSelect = document.querySelector("#genre-select");
  const playtimeSelect = document.querySelector("#playtime-select");
  const clearFiltersButton = document.querySelector("#clear-filters");

  if (difficultySelect) difficultySelect.addEventListener("change", filterGames);
  if (genreSelect) genreSelect.addEventListener("change", filterGames);
  if (playtimeSelect) playtimeSelect.addEventListener("change", filterGames);

  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", () => {
      searchInput.value = "";
      difficultySelect.value = "all";
      genreSelect.value = "all";
      playtimeSelect.value = "all";
      filterGames();
    });
  }

});
