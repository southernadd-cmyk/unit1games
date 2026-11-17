"use strict";

const workspace = document.querySelector("#game");
const which = new URLSearchParams(location.search).get("game");

function openStation(id, station) {
  const marked = new Set(unitProgress.read(id));
  const completed = new Set(station.missions.filter(mission => marked.has(mission.id)).map(mission => mission.id));
  const drafts = station.missions.map(mission => station.start(mission));
  let index = 0;
  let dragData;

  function show(focusKey, heading = false, report = false) {
    const mission = station.missions[index];
    const draft = drafts[index];
    const menu = station.missions.map((entry, i) => {
      const current = i === index;
      return '<li><button type="button" class="mission-tab" data-act="mission" data-index="' + i +
        '" data-focus="mission:' + i + '"' + (current ? ' aria-current="step"' : "") + "><span>" +
        h(entry.title) + "</span>" + (completed.has(entry.id) ? '<span class="brief-done">Done</span>' : "") + "</button></li>";
    }).join("");
    const next = index < station.missions.length - 1 ? control("next", "Next brief", {}, {main: true}) : "";
    const progress = completed.size
      ? "<span>" + completed.size + " of " + station.missions.length + " done</span>" : "";
    workspace.innerHTML =
      '<div class="play-header"><p class="course-topic">' + h(station.topic) + "</p><h1>" + h(station.title) +
      "</h1><p>" + h(station.intro) + '</p></div>' +
      '<div class="station-layout"><nav class="mission-menu" aria-label="Briefs"><div class="menu-header"><strong>Briefs</strong>' +
      progress + "</div><ul>" + menu + "</ul></nav>" +
      '<article class="station station-' + id + '"><header class="brief"><div><h2 id="current-brief" tabindex="-1">' + h(mission.title) +
      "</h2><p>" + h(mission.brief) + '</p></div>' +
      control("reset", "Reset brief") + '</header><div class="station-body">' + station.view(mission, draft) +
      (draft.message ? '<div id="report" class="notice ' + (draft.passed ? "good" : "alert") +
          '" role="status" tabindex="-1">' + h(draft.message) + "</div>" : "") +
      (draft.passed ? '<div class="debrief"><div><b>Brief cleared</b><p>' + h(mission.debrief || station.debrief) +
        '</p></div><div class="controls">' + next + '<a class="control" href="../index.html#games">All games</a></div></div>' : "") +
      "</div></article></div>";

    if (heading) document.querySelector("#current-brief").focus();
    else if (report) document.querySelector("#report")?.focus();
    else if (focusKey) {
      const element = [...workspace.querySelectorAll("[data-focus]")].find(el => el.dataset.focus === focusKey);
      if (element && !element.disabled) element.focus({ preventScroll: true });
      else {
        const action = focusKey.split(":")[0];
        const relatedAction = action === "hop" || action === "hop-line" ? "hop-line" : action;
        const related = [...workspace.querySelectorAll("button[data-act]")].find(button =>
          button.dataset.act === relatedAction && !button.disabled
        );
        (related || document.querySelector("#current-brief")).focus({ preventScroll: true });
      }
    }
  }

  function update(data, focusKey) {
    const mission = station.missions[index];
    const draft = drafts[index];
    const previousMessage = draft.message;
    if (station.act(mission, draft, data) === false) return;
    if (draft.passed) {
      completed.add(mission.id);
      unitProgress.finish(id, mission.id);
    }
    show(focusKey, false, Boolean(draft.message && draft.message !== previousMessage));
  }

  workspace.addEventListener("click", event => {
    const target = event.target.closest("[data-act]");
    if (!target || target.disabled) return;
    const action = target.dataset.act;
    if (action === "mission" || action === "next") {
      index = action === "mission" ? Number(target.dataset.index) : index + 1;
      show(null, true);
    } else if (action === "reset") {
      drafts[index] = station.start(station.missions[index]);
      show(null, true);
    } else {
      update(target.dataset, target.dataset.focus);
    }
  });

  workspace.addEventListener("input", event => {
    if (!event.target.dataset.edit) return;
    station.edit?.(station.missions[index], drafts[index], event.target);
  });

  workspace.addEventListener("dragstart", event => {
    const target = event.target.closest('[draggable="true"][data-act]');
    if (!target || !station.drop) return;
    dragData = { ...target.dataset };
    event.dataTransfer.setData("text/plain", target.textContent);
    event.dataTransfer.effectAllowed = "copy";
  });

  workspace.addEventListener("dragover", event => {
    if (dragData && event.target.closest("[data-drop]")) event.preventDefault();
  });

  workspace.addEventListener("drop", event => {
    const target = event.target.closest("[data-drop]");
    if (!target || !dragData) return;
    event.preventDefault();
    const action = station.drop(dragData, target.dataset.drop);
    dragData = null;
    if (action) update(action);
  });

  workspace.addEventListener("dragend", () => { dragData = null; });
  document.title = station.title + " | Unit 1 Games";
  show();
}

if (Object.hasOwn(stations, which)) openStation(which, stations[which]);
else workspace.innerHTML = '<h1>Choose a game</h1><p><a href="../index.html#games">Return to all games</a></p>';
