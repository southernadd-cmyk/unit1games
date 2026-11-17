"use strict";

const unitProgress = {
  key: "btec-unit1-game-completions-v1",
  read() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  },
  finish(game) {
    try {
      localStorage.setItem(this.key, JSON.stringify([...new Set([...this.read(), game])]));
    } catch {
      // Players can complete games when browser storage is unavailable.
    }
  }
};

const unitFinishedGames = unitProgress.read();
for (const card of document.querySelectorAll("[data-game-card]")) {
  if (unitFinishedGames.includes(card.dataset.gameCard)) {
    const indicator = document.createElement("span");
    indicator.className = "completion-mark";
    indicator.textContent = "Completed";
    card.querySelector(".card-meta").append(" ", indicator);
  }
}
