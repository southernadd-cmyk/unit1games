"use strict";

const unitProgress = {
  key: "unit1-lab-missions-v2",
  all() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key));
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  },
  read(game) {
    const completed = this.all()[game];
    return Array.isArray(completed) ? completed : [];
  },
  finish(game, mission) {
    try {
      const saved = this.all();
      saved[game] = [...new Set([...this.read(game), mission])];
      localStorage.setItem(this.key, JSON.stringify(saved));
    } catch {
      // Progress remains visible for the current tab if storage is unavailable.
    }
  }
};

for (const card of document.querySelectorAll("[data-game-card]")) {
  const completed = unitProgress.read(card.dataset.gameCard).length;
  if (completed) {
    const count = card.querySelector(".activity-count");
    const total = Number(count.dataset.briefs);
    count.textContent = Math.min(completed, total) + " of " + total + " done";
  }
}
