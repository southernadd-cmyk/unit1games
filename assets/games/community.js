"use strict";

(() => {
  const roles = ["Public", "Volunteer", "Staff", "Partner"];
  const permissions = ["Blocked", "View", "Edit"];
  const products = {
    suite: { name:"SaaS workspace", cost:44, hours:1, cap:80, tags:["co-edit","offline"], note:"Ready to use. Named access, co-editing and an offline copy. Supports 80 users per wave." },
    cdn: { name:"Public cloud publishing", cost:58, hours:0, cap:2500, tags:["publish"], note:"Public pages at scale. 2,500 requests per wave. No staff case files or collaborative editing." },
    vault: { name:"Private document cloud", cost:58, hours:1, cap:110, tags:["private","co-edit"], note:"Private environment with managed access. Supports 110 users per wave." },
    platform: { name:"Managed PaaS runtime", cost:65, hours:1, cap:420, tags:["app"], note:"Deploy the project’s own app. Provider maintains runtime and hosts. 420 requests per wave." },
    servers: { name:"IaaS virtual machines", cost:52, hours:4, cap:320, tags:["app","publish","co-edit"], note:"Configure and patch the system in-house. 320 requests per wave. Four support hours per shift." },
    remote: { name:"Private remote desktop", cost:66, hours:2, cap:35, tags:["remote","private"], note:"Authorised access to an office application via the secure gateway. 35 users per wave." },
    forum: { name:"Moderated hosted forum", cost:47, hours:1, cap:270, tags:["discussion","queue"], note:"Searchable threads, reports and a moderation queue. 270 users per wave." },
    chat: { name:"Group chat", cost:16, hours:1, cap:170, tags:["discussion"], note:"Fast live chat. Some answers are hard to find later. No structured reports queue." },
    wiki: { name:"Read-only public wiki", cost:23, hours:1, cap:320, tags:["publish","reference"], note:"Searchable reference with controlled editors. 320 requests per wave." }
  };

  const shifts = [
    {
      id:"festival", title:"Festival opens on Friday",
      brief:"Set up the volunteer workspace, public programme and confidential reports. Gate staff lose signal at lunchtime; the programme gets its biggest audience just after opening.",
      budget:162, hours:5, stock:["suite","cdn","vault","servers","wiki"],
      tasks:[
        {name:"Volunteer schedule", tag:"co-edit", offline:true, load:42, access:[0,2,2,0], need:"Staff and volunteers co-edit. The gates need an offline copy."},
        {name:"Public programme", tag:"publish", load:1950, access:[1,0,2,1], need:"Public and partners read. Staff publish changes. Volunteers use a different schedule."},
        {name:"Staff incident register", tag:"private", load:26, access:[0,0,2,0], need:"Staff edit. Keep personal records inside the private environment."}
      ],
      debrief:"Explain why this mix of public and private services suits the festival. Identify one new dependency that the organisation now has."
    },
    {
      id:"placements", title:"Placements team works remotely",
      brief:"The college needs a new booking app, a safe route to a legacy office application and a confidential placement workspace. Meet the demand for all three on one support rota.",
      budget:192, hours:5, stock:["suite","vault","platform","servers","remote"],
      tasks:[
        {name:"Interview booking app", tag:"app", load:360, access:[0,1,2,1], need:"Deploy existing app code. Volunteers and partners read availability, staff manage it."},
        {name:"Legacy badge printer console", tag:"remote", load:21, access:[0,0,2,0], need:"The app stays on office computers. Staff use it from home through remote desktop."},
        {name:"Placement notes", tag:"private", load:39, access:[0,0,2,1], need:"Staff edit. Partners view their assigned records through an already scoped role."}
      ],
      debrief:"Compare SaaS, PaaS and IaaS by identifying who maintains the application, runtime and infrastructure."
    },
    {
      id:"community-desk", title:"Keep the public forum open",
      brief:"Moderators must clear 12 flagged posts during the evening shift. Each moderator hour handles three reports. Keep a searchable FAQ and the public outage bulletin available.",
      budget:135, hours:8, stock:["forum","chat","wiki","cdn","suite","servers"],
      tasks:[
        {name:"Public discussion", tag:"discussion", moderation:true, load:228, access:[1,2,2,1], need:"Visitors and partners read. Registered volunteers and staff can post. Reports need a managed queue."},
        {name:"Help wiki", tag:"reference", load:234, access:[1,0,2,1], need:"A searchable reference. Public and partners read, staff edit."},
        {name:"Outage bulletin", tag:"publish", load:1800, access:[1,0,2,1], need:"Keep the public informed during a traffic spike. Staff publish updates."}
      ],
      reports:12,
      debrief:"Explain why a searchable reference and a live discussion have different uses. Describe one cost of making a public forum available."
    }
  ];

  function start(mission) {
    return { active:0, systems: mission.tasks.map(() => null), acl:mission.tasks.map(() => [0,0,0,0]),
      hours:0, passed:false };
  }

  function totals(draft) {
    return draft.systems.reduce((sum,id) => {
      if (!id) return sum;
      return {cost:sum.cost+products[id].cost, hours:sum.hours+products[id].hours};
    }, {cost:0, hours:draft.hours});
  }

  function assess(mission, draft) {
    const used = totals(draft);
    const rows = [
      [used.cost <= mission.budget, "Cost", pounds(used.cost) + " of " + pounds(mission.budget) + " allocated."],
      [used.hours <= mission.hours, "Staff coverage", used.hours + " of " + mission.hours + " support and moderation hours allocated."]
    ];
    for (const [i, task] of mission.tasks.entries()) {
      const product = products[draft.systems[i]];
      const issues = [];
      if (!product?.tags.includes(task.tag)) issues.push("This service cannot perform the required workload.");
      if (product && product.cap < task.load) issues.push((task.load - product.cap) + " users or requests exceed capacity.");
      if (task.offline && !product?.tags.includes("offline")) issues.push("The gate loses its schedule when connectivity drops.");
      if (task.moderation && !product?.tags.includes("queue")) issues.push("There is no queue for reviewing reports.");
      for (const [role, need] of task.access.entries()) {
        if (draft.acl[i][role] > need) issues.push(roles[role] + " has more access than the brief permits.");
        if (draft.acl[i][role] < need) issues.push(roles[role] + " cannot complete the required task.");
      }
      rows.push([!issues.length, task.name, issues.length ? issues.join(" ") : "The capacity, capabilities and access checks passed."]);
    }
    if (mission.reports) {
      const left = Math.max(0, mission.reports - draft.hours * 3);
      rows.push([left === 0, "Moderation backlog", left + " flagged posts would remain at shift end."]);
    }
    return rows;
  }

  function view(mission, draft) {
    const used = totals(draft);
    const task = mission.tasks[draft.active];
    const taskTabs = mission.tasks.map((entry,i) => control("task", entry.name, {index:i}, {pressed: i===draft.active})).join("");
    const services = mission.stock.map(id => {
      const product = products[id];
      return '<div class="stock"><strong>' + h(product.name) + "</strong><p>" + h(product.note) + "</p>" +
        control("deploy", pounds(product.cost) + (draft.systems[draft.active] === id ? " · deployed" : " · deploy"),
          {id}, {pressed:draft.systems[draft.active]===id}) + "</div>";
    }).join("");
    const levels = task.access.map((need, role) =>
      [h(roles[role]), h(permissions[need]), control("access", permissions[draft.acl[draft.active][role]], {role}, {accessibleLabel: roles[role] + " · " + permissions[draft.acl[draft.active][role]]})]
    );
    const cards = mission.tasks.map((entry,i) => '<div class="bay ' + (i===draft.active ? "active" : "") + '"><b>' +
      h(entry.name) + "</b><p>" + h(products[draft.systems[i]]?.name ?? "Awaiting deployment") + "</p></div>").join("");
    return signals([["Spend",pounds(used.cost) + " / " + pounds(mission.budget),used.cost>mission.budget?"fault":""],
      ["Staff rota", used.hours + " / " + mission.hours + " hours",used.hours>mission.hours?"fault":""]]) +
      panel("Services board",'<div class="bay-grid">' + cards + '</div><div class="controls">' + taskTabs + "</div>", "service-board") +
      '<div class="deployment-layout">' +
      panel(task.name, "<p>" + h(task.need) + "</p><p>Peak load · " + task.load + "</p>" +
        '<div class="stock-grid">' + services + "</div>", "service-catalogue") +
      panel("Access control", "<p>Click a permission to cycle Blocked, View and Edit.</p>" +
        table(["Role","Brief","Set permission"],levels,"Role permissions"), "role-ledger") + "</div>" +
      (mission.reports ? panel("Moderation rota",signals([["Flagged posts",mission.reports],["Moderator hours",draft.hours],["Review capacity",draft.hours*3]]) +
        '<div class="controls">' + control("staff","Assign one hour",{delta:1},{disabled:draft.hours>=mission.hours}) +
        control("staff","Remove one hour",{delta:-1},{disabled:draft.hours===0}) + "</div>") : "") +
      '<div class="controls">' + control("rehearse","Run the shift rehearsal",{},{main:true}) + "</div>" +
      (draft.report ? panel("Rehearsal log",checklist(draft.report)) : "");
  }

  function act(mission,draft,action) {
    if (action.act==="task") { draft.active=Number(action.index); return; }
    if (action.act==="rehearse") {
      draft.report=assess(mission,draft);
      draft.passed=draft.report.every(([ok])=>ok);
      draft.message=draft.passed?"All teams can do their work within the budget and access rules.":"The rehearsal found faults. Use the log to fix the deployments or permissions.";
      return;
    }
    if (action.act==="deploy") draft.systems[draft.active]=draft.systems[draft.active]===action.id?null:action.id;
    else if (action.act==="access") {
      const role=Number(action.role);
      const levels=draft.acl[draft.active];
      levels[role]=(levels[role]+1)%permissions.length;
    } else if (action.act==="staff") draft.hours+=Number(action.delta);
    else return false;
    draft.report=null;
    draft.passed=false;
    draft.message="";
  }

  stations.online={
    title:"Community Shift", topic:"C1–C2 · Operating online",
    intro:"Deploy services, set role permissions and staff the shift. The rehearsal sends simulated users through your setup.",
    missions:shifts,start,view,act
  };
})();
