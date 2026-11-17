"use strict";

(() => {
  const circuits = [
    {
      id: "classroom", title: "Two streams, one bottleneck",
      brief: "The classroom stream and the edit export both need the media server. Split their paths so both meet their capacity and delay targets at the same time.",
      nodes: [["laptop", "Laptop", 60, 77], ["edit", "Edit PC", 60, 232], ["ap", "Class AP", 222, 77], ["dock", "Dock switch", 222, 232], ["core", "Main switch", 395, 77], ["alt", "Media switch", 395, 232], ["server", "Media server", 564, 150]],
      links: [["laptop","ap",42,11,"Wi-Fi"], ["edit","dock",120,2,"Ethernet"], ["ap","core",100,3,"Ethernet"], ["dock","core",100,5,"Ethernet"], ["dock","alt",100,2,"Ethernet"], ["core","server",50,4,"Ethernet"], ["alt","server",65,7,"Fibre"]],
      flows: [
        {name: "Lesson stream", start: "laptop", end: "server", rate: 25, limit: 36},
        {name: "Edit export", start: "edit", end: "server", rate: 46, limit: 70}
      ],
      debrief: "Identify the connection that became congested and explain why a faster client link alone could not clear it."
    },
    {
      id: "branch", title: "Fibre cut at the branch",
      brief: "The fibre is down. Bookings and the branch record sync must share the 4G backup. The sync client supports lossless compression.",
      nodes: [["desk","Booking PC",63,76], ["sync","Sync PC",63,225], ["edge","Branch router",223,150], ["backup","4G gateway",394,229], ["core","HQ router",400,78], ["server","HQ servers",567,151]],
      links: [["desk","edge",100,2,"Ethernet"], ["sync","edge",100,2,"Ethernet"], ["edge","core",900,10,"Fibre","down"], ["edge","backup",31,37,"4G"], ["backup","core",250,15,"Fibre"], ["core","server",250,3,"Ethernet"]],
      flows: [
        {name: "Bookings", start: "desk", end: "server", rate: 16, limit: 70},
        {name: "Record sync", start: "sync", end: "server", rate: 24, limit: 110, mode: {label:"Lossless compression", rate: 12}}
      ],
      debrief: "Calculate the 4G load with and without compression. Explain why a booking response may tolerate less delay than bulk sync."
    },
    {
      id: "checkout", title: "Checkout on the staff network",
      brief: "Send the till to the payment service using the staff network and encrypted web traffic. The visitor display can use guest Wi-Fi and needs the public updates feed.",
      nodes: [["till","Checkout till",62,77], ["display","Visitor display",62,232], ["staff","Staff switch",219,77], ["guest","Guest AP",219,232], ["router","Shop router",394,151], ["pay","Payment API",561,77], ["feed","Public feed",561,232]],
      links: [["till","staff",100,3,"Ethernet"], ["till","guest",32,12,"Wi-Fi","guest"], ["display","guest",25,14,"Wi-Fi","guest"], ["staff","router",100,2,"Fibre"], ["guest","router",55,6,"Ethernet","guest"], ["router","pay",70,35,"Internet"], ["router","feed",48,48,"Internet"]],
      flows: [
        {name: "Payment request", start: "till", end: "pay", rate: 3, limit: 95, staff: true, mode: {label: "HTTPS", needed: true}},
        {name: "Display feed", start: "display", end: "feed", rate: 8, limit: 110}
      ],
      debrief: "Explain why encryption and separating staff traffic address different risks."
    },
    {
      id: "interview", title: "Make the live interview",
      brief: "The raw camera feed is too large for the low-delay path and the satellite path is too slow to respond. Get the picture and separate return audio to the studio.",
      nodes: [["camera","Encoder",65,75], ["audio","Audio unit",65,234], ["mobile","5G relay",221,75], ["sat","Satellite",221,232], ["gateway","Studio router",397,149], ["studio","Studio desk",569,149]],
      links: [["camera","mobile",25,21,"5G"], ["camera","sat",145,217,"Satellite"], ["audio","mobile",25,17,"5G"], ["mobile","gateway",23,17,"Fibre"], ["sat","gateway",150,12,"Fibre"], ["gateway","studio",100,3,"Ethernet"]],
      flows: [
        {name: "Camera feed", start:"camera",end:"studio",rate:88,limit:68,mode:{label:"Compatible compressed codec",rate:16}},
        {name: "Return audio",start:"audio",end:"studio",rate:5,limit:63}
      ],
      debrief: "Compare the bandwidth and latency of the two routes. Explain how a compatible codec changes the answer."
    },
    {
      id: "design-files", title: "Original pixels and a shared mailbox",
      brief: "The design partner needs pixel-exact diagrams over a low-capacity site link. The help desk needs mailbox changes to synchronise on two devices.",
      nodes: [["art","Design PC",68,76], ["office","Help desk PC",69,228], ["switch","Office switch",235,150], ["router","Site router",410,150], ["partner","Partner host",563,77], ["mail","Mail host",560,224]],
      links: [["art","switch",100,3,"Ethernet"], ["office","switch",70,3,"Ethernet"], ["switch","router",59,7,"WAN"], ["router","partner",52,29,"Internet"], ["router","mail",56,31,"Internet"]],
      flows: [
        {name: "Diagram transfer",start:"art",end:"partner",rate:70,limit:105,mode:{label:"Lossless PNG transfer",rate:44}},
        {name: "Mailbox state",start:"office",end:"mail",rate:5,limit:90,mode:{label:"IMAP",needed:true}}
      ],
      debrief: "Explain why lossy JPEG would fail the diagram brief and how IMAP helps the mailbox users."
    }
  ];

  const node = (circuit, id) => circuit.nodes.find(entry => entry[0] === id);
  const edge = (circuit, a, b) => circuit.links.findIndex(link =>
    link[0] === a && link[1] === b || link[0] === b && link[1] === a
  );
  const usedEdges = (circuit, path) => path.slice(1).map((id, i) => edge(circuit, path[i], id));
  const ready = (flow, path) => path.at(-1) === flow.end;
  const demand = (flow, enabled) => enabled && flow.mode?.rate ? flow.mode.rate : flow.rate;

  function start(circuit) {
    return { active: 0, paths: circuit.flows.map(flow => [flow.start]), modes: circuit.flows.map(() => false), passed: false };
  }

  function load(circuit, draft) {
    const totals = circuit.links.map(() => 0);
    draft.paths.forEach((path, f) => {
      if (!ready(circuit.flows[f], path)) return;
      for (const index of usedEdges(circuit, path)) totals[index] += demand(circuit.flows[f], draft.modes[f]);
    });
    return totals;
  }

  function measure(circuit, draft) {
    const totals = load(circuit, draft);
    return circuit.flows.map((flow, f) => {
      const path = draft.paths[f];
      const indexes = usedEdges(circuit, path);
      const rate = demand(flow, draft.modes[f]);
      if (!ready(flow, path)) return [false, flow.name, "The route stops at " + node(circuit, path.at(-1))[1] + "."];
      const links = indexes.map(i => circuit.links[i]);
      if (links.some(link => link[5] === "down")) return [false, flow.name, "An offline link drops this stream."];
      const delivered = Math.min(rate, ...indexes.map(i => rate * circuit.links[i][2] / totals[i]));
      const delay = links.reduce((sum, link) => sum + link[3], 0);
      const reasons = [delivered.toFixed(1) + "/" + rate + " Mb/s delivered · " + delay + " ms delay."];
      if (delivered < rate) reasons.push("A shared link is overloaded.");
      if (delay > flow.limit) reasons.push("Delay exceeds " + flow.limit + " ms.");
      const guest = flow.staff && links.some(link => link[5] === "guest");
      if (guest) reasons.push("The staff request crosses guest Wi-Fi.");
      const modeMissing = flow.mode?.needed && !draft.modes[f];
      if (modeMissing) reasons.push("Enable " + flow.mode.label + " for this service.");
      return [delivered >= rate && delay <= flow.limit && !guest && !modeMissing, flow.name, reasons.join(" ")];
    });
  }

  function mapMarkup(circuit, draft, totals) {
    const active = draft.paths[draft.active];
    const routeEdges = usedEdges(circuit, active);
    const lines = circuit.links.map(([from,to,speed, , ,status], index) => {
      const [, , x1, y1] = node(circuit, from);
      const [, , x2, y2] = node(circuit, to);
      const tone = status === "down" ? "down" : totals[index] > speed ? "crowded" : routeEdges.includes(index) ? "active" : "";
      const angle = Math.atan2(y2 - y1, x2 - x1);
      return '<span class="wire ' + tone + '" style="left:' + x1 / 6.4 + "%;top:" + y1 / 3 +
        "%;width:" + Math.hypot(x2 - x1, y2 - y1) / 6.4 + "%;transform:rotate(" + angle + 'rad)"></span>';
    }).join("");
    const markers = circuit.nodes.map(([id, label, x, y]) => {
      const current = active.at(-1);
      const neighbor = !ready(circuit.flows[draft.active], active) && edge(circuit, current, id) >= 0 && !active.includes(id);
      return '<div class="topology-node ' + (active.includes(id) ? "routed" : "") + '" style="left:' +
        x / 6.4 + "%;top:" + y / 3 + '%">' + (neighbor ? control("hop", label, {node: id}) : "<span>" + h(label) + "</span>") + "</div>";
    }).join("");
    const packets = draft.result ? draft.paths.flatMap((path, f) => path.slice(1).map((id, i) => {
      const link = circuit.links[edge(circuit, path[i], id)];
      if (link[5] === "down") return "";
      const [, , x1, y1] = node(circuit, path[i]);
      const [, , x2, y2] = node(circuit, id);
      return '<i aria-hidden="true" class="packet flow-' + f + '" style="--sx:' + x1 / 6.4 + "%;--sy:" +
        y1 / 3 + "%;--ex:" + x2 / 6.4 + "%;--ey:" + y2 / 3 + "%;--wait:" + i * 320 + 'ms"></i>';
    })).join("") : "";
    return '<div class="topology" role="group" aria-label="Network map">' + lines + markers + packets + "</div>";
  }

  function view(circuit, draft) {
    const f = draft.active;
    const flow = circuit.flows[f];
    const path = draft.paths[f];
    const current = path.at(-1);
    const finished = ready(flow, path);
    const total = load(circuit, draft);
    const nav = circuit.flows.map((stream, i) =>
      control("flow", stream.name + " · " + (ready(stream,draft.paths[i]) ? "routed" : "needs a route"), {index: i},
        {pressed: f === i})).join("");
    const hops = finished ? [] : circuit.nodes.filter(([id]) => edge(circuit, current, id) >= 0 && !path.includes(id));
    const choices = hops.map(([id,label]) =>
      control("hop-line", label + (circuit.links[edge(circuit,current,id)][5] === "down" ? " · offline" : ""), {node:id})).join("");
    const streams = '<div class="controls">' + nav + '</div><p class="path-label">' +
      path.map(id => h(node(circuit,id)[1])).join(" → ") + "</p><p>" + demand(flow,draft.modes[f]) +
      " Mb/s needed · up to " + flow.limit + " ms</p>" +
      '<div class="controls">' + choices + control("undo", "Undo hop", {}, {disabled: path.length < 2}) +
      (flow.mode ? control("mode", flow.mode.label + (draft.modes[f] ? " on" : " off"), {}, {pressed: draft.modes[f]}) : "") + "</div>";
    const links = circuit.links.map(([a,b,speed,delay,kind,status],i) =>
      [h(node(circuit,a)[1] + " ↔ " + node(circuit,b)[1]), h(kind + (status === "down" ? " · offline" : status === "guest" ? " · guest" : "")),
        '<span class="' + (total[i] > speed || status === "down" ? "bad-text" : "") + '">' + total[i] + " / " + speed + " Mb/s</span>", delay + " ms"]);
    return panel("Route the streams", streams + mapMarkup(circuit,draft,total)) +
      panel("Link load", table(["Connection", "Medium", "Allocated / capacity", "Delay"], links, "Link load")) +
      '<div class="controls">' + control("send", "Run simultaneous traffic", {}, {main:true}) + "</div>" +
      (draft.result ? panel("Traffic report", checklist(draft.result)) : "");
  }

  function act(circuit, draft, action) {
    const active = draft.active;
    if (action.act === "flow") { draft.active = Number(action.index); return; }
    if (action.act === "send") {
      draft.result = measure(circuit, draft);
      draft.passed = draft.result.every(([ok]) => ok);
      draft.message = draft.passed ? "All streams reached their destinations within the brief." : "Check the stream report and the shared links before running traffic again.";
      return;
    }
    const path = draft.paths[active];
    if (action.act === "hop" || action.act === "hop-line") path.push(action.node);
    else if (action.act === "undo") path.pop();
    else if (action.act === "mode") draft.modes[active] = !draft.modes[active];
    else return false;
    draft.result = null;
    draft.passed = false;
    draft.message = "";
  }

  stations.network = {
    title: "Packet Route", topic: "B1–B3 · Transmitting data",
    intro: "Route two streams at once. Inspect their combined link loads and send traffic when the network is ready.",
    missions: circuits, start, view, act
  };
})();
