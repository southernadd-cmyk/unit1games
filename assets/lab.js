"use strict";

const stations = Object.create(null);
const h = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const pounds = new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 0
}).format;

function control(action, label, data = {}, { main = false, disabled = false, pressed, drag = false, accessibleLabel } = {}) {
  const attributes = Object.entries(data).map(([key, value]) => ' data-' + key + '="' + h(value) + '"').join("");
  const key = [action, ...Object.values(data)].join(":");
  return '<button type="button" class="control' + (main ? " primary" : "") + '" data-act="' + action +
    '" data-focus="' + h(key) + '"' + attributes + (disabled ? " disabled" : "") +
    (accessibleLabel ? ' aria-label="' + h(accessibleLabel) + '"' : "") +
    (pressed === undefined ? "" : ' aria-pressed="' + pressed + '"') + (drag ? ' draggable="true"' : "") +
    ">" + h(label) + "</button>";
}

function panel(title, inner, css = "") {
  return '<section class="panel ' + css + '"><h3>' + h(title) + "</h3>" + inner + "</section>";
}

function signals(values) {
  return '<dl class="signals">' + values.map(([label, value, tone]) =>
    '<div class="' + h(tone) + '"><dt>' + h(label) + "</dt><dd>" + h(value) + "</dd></div>"
  ).join("") + "</dl>";
}

function checklist(items) {
  return '<ul class="checks">' + items.map(([ok, name, detail]) =>
    '<li class="' + (ok ? "clear" : "fault") + '"><b>' + h(name) + '</b><span class="check-state">' +
    (ok ? "Pass" : "Check") + "</span><p>" + h(detail) + "</p></li>"
  ).join("") + "</ul>";
}

function table(head, rows, name = "") {
  return '<div class="table-wrap"><table' + (name ? ' aria-label="' + h(name) + '"' : "") +
    '><thead><tr>' + head.map(value => '<th scope="col">' + h(value) + "</th>").join("") +
    "</tr></thead><tbody>" + rows.map(row =>
      "<tr>" + row.map(cell => "<td>" + cell + "</td>").join("") + "</tr>"
    ).join("") + "</tbody></table></div>";
}
