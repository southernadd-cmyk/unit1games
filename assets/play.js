"use strict";

const gameRoot = document.querySelector("#game");
const gameId = new URLSearchParams(location.search).get("game");

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function optionsMarkup(options, current, done, index) {
  return '<select data-field="' + index + '"' + (done ? " disabled" : "") + ">" +
    '<option value="">Choose an option</option>' +
    options.map((name, i) =>
      '<option value="' + i + '"' + (current === i ? " selected" : "") + ">" +
      escapeHtml(name) + "</option>"
    ).join("") + "</select>";
}

function selectMarkup(label, options, current, done, index) {
  return '<label class="select-field"><span>' + escapeHtml(label) + "</span>" +
    optionsMarkup(options, current, done, index) + "</label>";
}

function feedbackMarkup(result) {
  if (!result) return "";
  const notes = result.notes ?? [];
  const kind = result.passed ? "good" : "warn";
  return '<div id="feedback" class="notice ' + kind + '" tabindex="-1"><b>' + escapeHtml(result.title) +
    "</b>" + (notes.length ? "<ul>" + notes.map(note => "<li>" + escapeHtml(note) + "</li>").join("") + "</ul>" : "") + "</div>";
}

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function costOf(mission, choices) {
  return mission.slots.reduce((total, [, options], i) => total + (options[choices[i]]?.[1] ?? 0), 0);
}

function workshopMarkup(mission, round) {
  return (mission.budget === undefined ? "" : '<p id="budget" class="status"></p>') +
    mission.slots.map(([label, options], index) =>
      "<fieldset><legend>" + escapeHtml(label) + '</legend><div class="choice-grid">' +
      options.map(([name, cost, desc], i) => {
        const flags = (round.selected[index] === i ? " checked" : "") + (round.result?.passed ? " disabled" : "");
        const price = mission.budget === undefined ? "" : " · " + currency.format(cost);
        return '<label class="choice"><input type="radio" name="slot-' + index +
          '" data-field="' + index + '" value="' + i + '"' + flags + "><span><b>" +
          escapeHtml(name + price) + "</b><small>" + escapeHtml(desc) + "</small></span></label>";
      }).join("") + "</div></fieldset>"
    ).join("");
}

function checkWorkshop(mission, round) {
  const notes = [];
  if (mission.budget !== undefined && costOf(mission, round.selected) > mission.budget) {
    notes.push("This configuration exceeds the budget.");
  }
  mission.slots.forEach(([label, options], index) => {
    const option = options[round.selected[index]];
    if (!option) notes.push("Choose an option for " + label.toLowerCase() + ".");
    else if (!option[3]) notes.push(label + " — " + option[2]);
  });
  return notes.length
    ? { passed: false, title: "Revise your configuration.", notes }
    : { passed: true, title: "Configuration approved.", notes: [mission.explanation] };
}

const linkBetween = (mission, a, b) => mission.links.find(([start, end]) =>
  (start === a && end === b) || (start === b && end === a)
);

function pathLinks(mission, path) {
  return path.slice(1).map((id, i) => linkBetween(mission, path[i], id));
}

function pathStats(links) {
  return {
    speed: links.length ? Math.min(...links.map(link => link[3])) : 0,
    delay: links.reduce((sum, link) => sum + link[4], 0)
  };
}

const nodeLabel = (mission, id) => mission.nodes.find(node => node[0] === id)[1];

function linkStatus(status) {
  return status === "down" ? "Down" : status === "guest" ? "Guest network" : "Available";
}

function networkMap(mission, route) {
  const selected = pathLinks(mission, route);
  const lines = mission.links.map(link => {
    const [a, b, , , , status] = link;
    const [, , x1, y1] = mission.nodes.find(node => node[0] === a);
    const [, , x2, y2] = mission.nodes.find(node => node[0] === b);
    const width = Math.hypot(x2 - x1, y2 - y1) / 6.4;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const cls = status === "down" ? " down" : selected.includes(link) ? " active" : "";
    return '<span class="map-line' + cls + '" style="left:' + (x1 / 6.4) + "%;top:" +
      (y1 / 2.8) + "%;width:" + width + "%;transform:rotate(" + angle + 'rad)"></span>';
  }).join("");
  const points = mission.nodes.map(([id, name, x, y], i) => {
    const cls = (route.includes(id) ? " chosen" : "") + (i === 0 ? " start" : "") +
      (i === mission.nodes.length - 1 ? " end" : "");
    return '<span class="map-node' + cls + '" style="left:' + x / 6.4 + "%;top:" + y / 2.8 + '%">' +
      escapeHtml(name) + "</span>";
  }).join("");
  return '<div class="map" aria-hidden="true">' + lines + points + "</div>";
}

function possibleHops(mission, path) {
  const current = path.at(-1);
  return mission.links.flatMap(link => {
    const [a, b] = link;
    const destination = a === current ? b : b === current ? a : null;
    return destination && !path.includes(destination) ? [[destination, link]] : [];
  });
}

function networkMarkup(mission, round) {
  const done = Boolean(round.result?.passed);
  const current = round.path.at(-1);
  const finish = mission.nodes.at(-1)[0];
  const links = pathLinks(mission, round.path);
  const stats = pathStats(links);
  const hops = possibleHops(mission, round.path);
  const fullPath = round.path.map(id => escapeHtml(nodeLabel(mission, id))).join(" → ");
  const linkRows = mission.links.map(([a, b, medium, speed, delay, status]) =>
    "<tr><td>" + escapeHtml(nodeLabel(mission, a) + " ↔ " + nodeLabel(mission, b)) + "</td><td>" +
    escapeHtml(medium) + "</td><td>" + speed + " Mb/s</td><td>" + delay + " ms</td><td>" +
    linkStatus(status) + "</td></tr>"
  ).join("");
  const hopChoices = current === finish
    ? "<p>Destination reached. Check the route before sending.</p>"
    : '<p>Next device from <strong>' + escapeHtml(nodeLabel(mission, current)) +
      "</strong></p>" + (hops.length ? '<div class="network-hops">' +
        hops.map(([id, [, , medium, speed, delay, status]]) =>
          '<button type="button" class="button secondary route-choice" data-action="hop" data-node="' +
          escapeHtml(id) + '">' + escapeHtml(nodeLabel(mission, id)) +
          "<small>" + (status === "down" ? "Link down" : escapeHtml(medium) + " · " + speed +
            " Mb/s · " + delay + " ms" + (status === "guest" ? " · Guest" : "")) + "</small></button>"
        ).join("") + "</div>" : "<p>There are no unvisited neighbours. Undo the last hop to try another route.</p>");
  return networkMap(mission, round.path) +
    '<p class="path-label">Route</p><p id="route-path" tabindex="-1">' + fullPath +
    (links.length ? " · " + stats.speed + " Mb/s · " + stats.delay + " ms" : "") + "</p>" +
    (done ? "" : '<div class="route-picker">' + hopChoices + "</div>") +
    (mission.modes ? selectMarkup(mission.modeLabel, mission.modes.map(mode => mode[0]), round.selected[0], done, 0) : "") +
    '<details data-evidence="links"' + (round.openEvidence.has("links") ? " open" : "") +
    '><summary>All network links</summary><div class="test-wrap"><table class="link-table" aria-label="Network links">' +
    "<thead><tr><th>Link</th><th>Connection</th><th>Capacity</th><th>Delay</th><th>Status</th></tr></thead><tbody>" +
    linkRows + "</tbody></table></div></details>";
}

function checkNetwork(mission, round) {
  const notes = [];
  const links = pathLinks(mission, round.path);
  const stats = pathStats(links);
  if (round.path.at(-1) !== mission.nodes.at(-1)[0]) notes.push("The route does not reach the destination.");
  if (links.some(link => link[5] === "down")) notes.push("A link on your route is offline.");
  if (links.length && stats.speed < mission.speed) notes.push("The slowest hop falls below " + mission.speed + " Mb/s.");
  if (stats.delay > mission.delay) notes.push("The combined delay exceeds the allowed " + mission.delay + " ms.");
  if (mission.trusted && links.some(link => link[5] === "guest")) notes.push("The shop requires a route outside the guest network.");
  if (mission.modes && !mission.modes[round.selected[0]]?.[1]) {
    notes.push("Choose the protocol or encoding that meets the service requirement.");
  }
  return notes.length
    ? { passed: false, title: "Route check failed.", notes }
    : { passed: true, title: "Transmission passed.", notes: [mission.explanation] };
}

function caseMarkup(mission, round) {
  const evidence = mission.evidence.map(([label, desc], index) =>
    '<details data-evidence="' + index + '"' + (round.openEvidence.has(String(index)) ? " open" : "") +
    "><summary>" + escapeHtml(label) + "</summary><p>" + escapeHtml(desc) + "</p></details>"
  ).join("");
  return '<div class="evidence" aria-label="Evidence">' + evidence +
    '</div><div class="select-fields">' + mission.fields.map(([label, options], index) =>
      selectMarkup(label, options, round.selected[index], round.result?.passed, index)
    ).join("") + "</div>";
}

function checkCase(mission, round) {
  const notes = [];
  mission.fields.forEach(([label, , answer, clue], index) => {
    if (round.selected[index] !== answer) notes.push(label + " — " + clue);
  });
  return notes.length
    ? { passed: false, title: "Review the evidence and revise your recommendation.", notes }
    : { passed: true, title: "Recommendation accepted.", notes: [mission.explanation] };
}

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postcode = value => value.toUpperCase().replace(/\s+/g, "");

const serviceRules = {
  range1to6: value => /^[1-6]$/.test(value.trim()),
  number: value => /^-?\d+(\.\d+)?$/.test(value.trim()),
  present: value => Boolean(value.trim()),
  email: value => emailFormat.test(value.trim()),
  same: (value, reference) => Boolean(value) && value === reference,
  kitFormat: value => /^KIT-\d{3}$/.test(value),
  kitInventory: value => ["KIT-041", "KIT-207"].includes(value),
  length4: value => value.length === 4,
  pin4: value => /^\d{4}$/.test(value),
  optionalEmail: value => !value.trim() || emailFormat.test(value.trim()),
  yesOnly: value => value === "Yes",
  yesNo: value => ["Yes", "No"].includes(value),
  currentSurvey: value => value === "A new staff survey",
  oldArticle: value => value === "Last year’s industry article",
  touchOnly: value => value === "Swipe-only slider",
  accessibleForm: value => value === "Labelled fields and keyboard access",
  samePostcode: (value, reference) => Boolean(postcode(value)) && postcode(value) === postcode(reference)
};

function serviceMarkup(mission, round) {
  const verdictText = accepted => accepted ? "Accept" : "Reject";
  const rows = (round.result?.tests ?? []).map(test =>
    "<tr><td>" + escapeHtml(test.field) + "</td><td><code>" + escapeHtml(test.input || "(blank)") +
    "</code>" + (test.reference ? "<br>First entry <code>" + escapeHtml(test.reference) + "</code>" : "") +
    "</td><td>" + verdictText(test.expected) + "</td><td>" + verdictText(test.actual) +
    '</td><td class="verdict ' + (test.correct ? "good" : "warn") + '">' + (test.correct ? "Pass" : "Fail") + "</td></tr>"
  ).join("");
  return '<div class="select-fields">' + mission.fields.map((field, index) =>
    selectMarkup(field.name, field.options.map(option => option[1]), round.selected[index], round.result?.passed, index)
  ).join("") + '</div><div id="test-results" class="test-wrap">' + (rows ?
    '<table aria-label="Test results"><thead><tr><th>Field</th><th>Test input</th><th>Expected</th><th>Actual</th><th>Result</th></tr></thead><tbody>' +
    rows + "</tbody></table>" : "") + "</div>";
}

function checkService(mission, round) {
  if (mission.fields.some((_, i) => round.selected[i] === undefined)) {
    return { passed: false, title: "Set a check for each field first." };
  }
  const tests = mission.fields.flatMap((field, i) => {
    const rule = serviceRules[field.options[round.selected[i]][0]];
    return field.tests.map(([input, expected, reference]) => {
      const actual = rule(input, reference);
      return { field: field.name, input, expected, reference, actual, correct: actual === expected };
    });
  });
  const passed = tests.every(test => test.correct);
  const count = tests.filter(test => test.correct).length;
  return {
    passed,
    tests,
    title: count + " of " + tests.length + " tests passed.",
    notes: [passed ? mission.explanation : "Check the failing rows. The expected column shows what the service should do."]
  };
}

const SHIFT_MAX = 16;

function shiftMarkup(mission, round, game, stats) {
  const meters = game.stats.map((name, index) =>
    '<div class="stat"><label for="stat-' + index + '"><span>' + escapeHtml(name) + "</span><span>" +
    stats[index] + "/" + SHIFT_MAX + '</span></label><meter id="stat-' + index +
    '" min="0" max="' + SHIFT_MAX + '" value="' + stats[index] + '"></meter></div>'
  ).join("");
  const choices = mission.choices.map(([label, difference], index) => {
    const points = difference.map((delta, i) => delta ? game.stats[i] + " " + (delta > 0 ? "+" : "−") +
      Math.abs(delta) : null).filter(Boolean).join(" · ");
    return '<button type="button" class="decision' + (round.selected[0] === index ? " selected" : "") +
      '" data-action="decision" data-choice="' + index + '"' + (round.result ? " disabled" : "") +
      '><b>' + escapeHtml(label) + "</b><span>" + escapeHtml(points) + "</span></button>";
  }).join("");
  return '<div class="status-board">' + meters + '</div><div class="decision-list">' + choices + "</div>";
}

function refsMarkup(game) {
  if (!game.sources) return "";
  return "<details><summary>Reference sources</summary><ul>" + game.sources.map(([name, url]) =>
    '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' + escapeHtml(name) + "</a></li>"
  ).join("") + "</ul></details>";
}

function playGame(id, game) {
  const builders = {
    systems: workshopMarkup, network: networkMarkup, online: shiftMarkup,
    security: caseMarkup, services: serviceMarkup, policy: caseMarkup
  };
  const checks = { systems: checkWorkshop, network: checkNetwork, security: checkCase, services: checkService, policy: checkCase };
  const actions = { systems: "Test configuration", network: "Check route", security: "Check response", services: "Run tests", policy: "Check recommendation" };
  let index = 0;
  let stats = [SHIFT_MAX, 9, 9];
  let round = createRound();

  function createRound() {
    const mission = game.missions[index];
    return {
      selected: [],
      result: null,
      path: mission.nodes ? [mission.nodes[0][0]] : [],
      openEvidence: new Set()
    };
  }

  function gameTitle() {
    return '<div class="play-title"><p class="eyebrow">' + escapeHtml(game.topic) + '</p><h1>' +
      escapeHtml(game.title) + "</h1><p>" + escapeHtml(game.intro) + "</p></div>";
  }

  function progressLabel() {
    return '<p class="progress-label">' + escapeHtml(game.activity) + " " + (index + 1) + " of " + game.missions.length + "</p>";
  }

  function actionMarkup() {
    if (round.result?.ended) {
      return '<button type="button" class="button" data-action="restart">Restart shift</button>';
    }
    if (round.result?.passed) {
      const label = index + 1 === game.missions.length ? "See debrief" : "Next " + game.activity.toLowerCase();
      return '<button type="button" class="button" data-action="next">' + label + "</button>";
    }
    if (id === "online") return "";
    const routeButtons = id === "network"
      ? '<button type="button" class="button secondary" data-action="undo"' +
        (round.path.length === 1 ? " disabled" : "") + '>Undo last hop</button>' : "";
    return '<button type="button" class="button" data-action="check">' + actions[id] + "</button>" + routeButtons;
  }

  function renderRound() {
    const mission = game.missions[index];
    gameRoot.innerHTML = gameTitle() + '<article class="mission"><header>' + progressLabel() +
      '<h2 id="mission-title" tabindex="-1">' + escapeHtml(mission.title) + "</h2><p>" + escapeHtml(mission.brief) +
      '</p></header><div class="mission-body">' + builders[id](mission, round, game, stats) +
      '<div id="feedback-box">' + feedbackMarkup(round.result) + '</div><div class="actions">' + actionMarkup() +
      "</div>" + refsMarkup(game) + "</div></article>";
    updateBudget();
  }

  function updateBudget() {
    const label = document.querySelector("#budget");
    if (!label) return;
    const mission = game.missions[index];
    const total = costOf(mission, round.selected);
    label.textContent = "Spent " + currency.format(total) + " · Budget " + currency.format(mission.budget);
    label.classList.toggle("over-budget", total > mission.budget);
  }

  function finishGame() {
    unitProgress.finish(id);
    const shiftSummary = id === "online"
      ? '<ul class="result-notes">' + game.stats.map((name, i) => "<li>" + escapeHtml(name) + " " + stats[i] +
        "/" + SHIFT_MAX + "</li>").join("") + "</ul>" : "";
    gameRoot.innerHTML = gameTitle() + '<article class="mission"><header><p class="progress-label">Game complete</p>' +
      '<h2 id="mission-title" tabindex="-1">Debrief</h2></header><div class="mission-body">' + shiftSummary +
      '<p><b>For your class notebook</b></p><p>' + escapeHtml(game.prompt) + '</p><div class="actions">' +
      '<a class="button" href="../index.html#games">Choose another game</a>' +
      '<button type="button" class="button secondary" data-action="restart">Play again</button></div>' +
      refsMarkup(game) + "</div></article>";
    document.querySelector("#mission-title").focus();
  }

  function readOpenEvidence() {
    round.openEvidence = new Set([...gameRoot.querySelectorAll("[data-evidence][open]")].map(el => el.dataset.evidence));
  }

  function showResult(result) {
    readOpenEvidence();
    round.result = result;
    renderRound();
    document.querySelector("#feedback").focus();
  }

  gameRoot.addEventListener("change", event => {
    const field = event.target.dataset.field;
    if (field === undefined || round.result?.passed) return;
    round.selected[Number(field)] = event.target.value === "" ? undefined : Number(event.target.value);
    round.result = null;
    document.querySelector("#feedback-box").replaceChildren();
    document.querySelector("#test-results")?.replaceChildren();
    updateBudget();
  });

  gameRoot.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    const mission = game.missions[index];
    if (action === "check") {
      showResult(checks[id](mission, round));
      return;
    }
    if (action === "hop" || action === "undo") {
      readOpenEvidence();
      if (action === "hop") round.path.push(button.dataset.node);
      else round.path.pop();
      round.result = null;
      renderRound();
      document.querySelector("#route-path").focus({ preventScroll: true });
      return;
    }
    if (action === "decision") {
      const picked = Number(button.dataset.choice);
      const [, change, explanation] = mission.choices[picked];
      round.selected[0] = picked;
      stats = stats.map((value, i) => Math.min(SHIFT_MAX, Math.max(0, value + change[i])));
      const ended = stats.includes(0);
      showResult({
        passed: !ended,
        ended,
        title: ended ? "The shift ended because a measure reached zero." : "Decision recorded.",
        notes: [explanation]
      });
      return;
    }
    if (action === "restart") {
      index = 0;
      stats = [SHIFT_MAX, 9, 9];
    } else if (action === "next") {
      index += 1;
      if (index === game.missions.length) {
        finishGame();
        return;
      }
    }
    round = createRound();
    renderRound();
    document.querySelector("#mission-title").focus();
  });

  document.title = game.title + " | Unit 1 Games";
  renderRound();
}

if (Object.hasOwn(unitGames, gameId)) {
  playGame(gameId, unitGames[gameId]);
} else {
  gameRoot.innerHTML = '<div class="notice"><h1>Choose a game</h1><p><a href="../index.html#games">' +
    "Return to the Unit 1 games list</a>.</p></div>";
}
