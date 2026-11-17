"use strict";

(() => {
  const jobs = [
    {
      id: "accessible-catalogue", title: "Library access station",
      brief: "The library needs a workstation that can announce catalogue results privately. Connect a tactile keyboard, a braille display and a headset. The three devices each use USB.",
      budget: 390,
      slots: [["host", "Workstation"], ["reader", "Screen reader"], ["input", "Input and braille kit"], ["sound", "Audio"]],
      stock: [
        ["mini", "host", "Mini PC", 190, "Windows · two USB ports", { os: "Windows", ports: 2 }],
        ["tower", "host", "Refurbished tower", 246, "Windows · four USB ports", { os: "Windows", ports: 4 }],
        ["linux", "host", "Linux desktop", 224, "Linux · four USB ports", { os: "Linux", ports: 4 }],
        ["win-read", "reader", "Windows screen reader", 25, "Windows · speech and braille output", { os: "Windows", braille: true }],
        ["lin-read", "reader", "Linux screen reader", 12, "Linux · speech and braille output", { os: "Linux", braille: true }],
        ["magnify", "reader", "Magnifier", 11, "Windows · visual enlargement", { os: "Windows" }],
        ["tactile", "input", "Tactile keyboard and braille display", 87, "Two USB ports", { ports: 2, braille: true }],
        ["touch", "input", "Touchscreen tablet input", 30, "One USB port · touch input", { ports: 1 }],
        ["phones", "sound", "USB headphones", 24, "One USB port · private audio", { ports: 1, private: true }],
        ["speakers", "sound", "USB speakers", 18, "One USB port · room audio", { ports: 1 }]
      ],
      assess({host, reader, input, sound}) {
        const used = (input.ports || 0) + (sound.ports || 0);
        return [
          [host.os && host.os === reader.os, "Driver compatibility", "The reader must support the workstation OS."],
          [host.ports >= used, "USB sockets", used + " required, " + (host.ports || 0) + " available."],
          [input.braille && reader.braille, "Braille navigation", "Both the display and the reader must provide braille support."],
          [sound.private, "Private speech", "Catalogue output needs to stay at the workstation."]
        ];
      },
      debrief: "Explain how the operating system, ports and assistive tools interact, then compare two workable builds."
    },
    {
      id: "edit-storage", title: "Media editing storage",
      brief: "The editing team needs a 500 GB working drive with at least 220 MB/s measured read speed and an independent recovery copy of its 310 GB project. It owns just the equipment shown in the stock list.",
      budget: 275,
      slots: [["host", "Editing PC"], ["drive", "Working drive"], ["cable", "Connection"], ["backup", "Recovery copy"]],
      stock: [
        ["usb2", "host", "Older PC", 50, "USB · 38 MB/s", { rate: 38 }],
        ["usb3", "host", "Studio PC", 98, "USB · 430 MB/s", { rate: 430 }],
        ["hdd", "drive", "2 TB HDD", 65, "110 MB/s measured", { gb: 2000, rate: 110 }],
        ["ssd", "drive", "500 GB SSD", 91, "540 MB/s measured", { gb: 500, rate: 540 }],
        ["small", "drive", "256 GB SSD", 52, "520 MB/s measured", { gb: 256, rate: 520 }],
        ["slow", "cable", "USB 2 cable", 3, "35 MB/s in the test", { rate: 35 }],
        ["fast", "cable", "USB 3 cable", 16, "450 MB/s in the test", { rate: 450 }],
        ["folder", "backup", "Duplicate folder", 0, "Same working drive", { gb: 500, independent: false }],
        ["server", "backup", "File-server share", 58, "500 GB versioned recovery storage", { gb: 500, independent: true }],
        ["stick", "backup", "128 GB flash drive", 16, "Separate media", { gb: 128, independent: true }]
      ],
      assess({host, drive, cable, backup}) {
        const rate = Math.min(host.rate || 0, drive.rate || 0, cable.rate || 0);
        return [
          [drive.gb >= 500, "Working capacity", (drive.gb || 0) + " GB available."],
          [rate >= 220, "End-to-end read speed", rate + " MB/s. The slowest part of the chain limits reads."],
          [backup.independent && backup.gb >= 310, "Recoverable second copy", "Needs a separate device or service with room for the project."]
        ];
      },
      debrief: "Explain why a faster drive alone cannot fix a slow cable or a slow host port."
    },
    {
      id: "packing-line", title: "Packing-line alarm",
      brief: "A misplaced item must be detected and trigger an output within 20 ms even at peak load. Dispatch staff also need event data they can open in a spreadsheet.",
      budget: 290,
      slots: [["sensor", "Input sensor"], ["control", "Controller"], ["alarm", "Output"], ["log", "Event export"]],
      stock: [
        ["camera", "sensor", "Frame camera", 42, "17 ms worst-case detection", { delay: 17 }],
        ["beam", "sensor", "Photoelectric beam", 82, "4 ms worst-case detection", { delay: 4 }],
        ["desktop", "control", "Desktop task", 49, "30 ms during peak load · timing varies", { delay: 30 }],
        ["rtos", "control", "Real-time controller", 132, "6 ms worst-case handling", { delay: 6 }],
        ["buzzer", "alarm", "Lamp and buzzer", 43, "3 ms actuation", { delay: 3 }],
        ["printer", "alarm", "Print an alert", 36, "220 ms to first mark", { delay: 220 }],
        ["report", "log", "Daily PDF picture", 8, "Image of the log", {}],
        ["csv", "log", "CSV export", 14, "Rows accepted by dispatch spreadsheet", { rows: true }]
      ],
      assess({sensor, control, alarm, log}) {
        const complete = sensor.delay && control.delay && alarm.delay;
        const time = complete ? sensor.delay + control.delay + alarm.delay : null;
        return [
          [time !== null && time <= 20, "Peak response", time === null ? "Connect the whole path to measure it." : time + " ms from detection to output."],
          [log.rows, "Spreadsheet compatibility", "The office needs usable records in rows and columns."]
        ];
      },
      debrief: "Show where time is spent in the input–process–output chain. Explain the role of a real-time operating system."
    },
    {
      id: "scheduler-migration", title: "Weekend timetable migration",
      brief: "The timetable must use the college sign-in service and import the current CSV. Only 14 hours of implementation work fit before Monday. A tested rollback is required.",
      budget: 280,
      slots: [["app", "Scheduling software"], ["convert", "Data conversion"], ["rehearsal", "Rehearsal and rollback"]],
      stock: [
        ["oss", "app", "Supported open-source scheduler", 95, "College sign-in · CSV import · six hours to configure", { signIn: true, csv: true, hours: 6 }],
        ["vendor", "app", "Vendor scheduler", 154, "College sign-in · JSON import · four hours to configure", { signIn: true, hours: 4 }],
        ["standalone", "app", "Stand-alone scheduler", 67, "Local sign-in only · CSV import · three hours to configure", { csv: true, hours: 3 }],
        ["direct", "convert", "Pass the CSV directly", 0, "No conversion · one hour to check", { format: "CSV", hours: 1 }],
        ["mapping", "convert", "CSV-to-JSON converter", 32, "Outputs JSON · three hours to validate", { format: "JSON", hours: 3 }],
        ["same", "rehearsal", "Trial and saved rollback image", 58, "Five hours · both trial and rollback", { rollback: true, hours: 5 }],
        ["fast", "rehearsal", "Fast cutover", 15, "One hour · no rollback test", { hours: 1 }]
      ],
      assess({app, convert, rehearsal}) {
        const hours = (app.hours || 0) + (convert.hours || 0) + (rehearsal.hours || 0);
        return [
          [app.signIn, "Account integration", "Existing college sign-in must work."],
          [convert.format && (app.csv ? "CSV" : "JSON") === convert.format, "Import compatibility", "The converter must produce the format the app accepts."],
          [rehearsal.rollback && hours <= 14, "Weekend cutover", hours + " hours planned. Allow 14 hours and include a rollback exercise."]
        ];
      },
      debrief: "Compare two configurations. Explain when the higher cost of changing an existing system might be warranted."
    },
    {
      id: "cold-store", title: "Connected cold store",
      brief: "A cold store trial must alarm during an internet outage. Predictions should catch at least 8 out of 10 simulated warm-ups and trigger no more than two false alarms. Staff must be able to inspect flagged readings.",
      budget: 295,
      slots: [["controller", "Alarm controller"], ["model", "Prediction model"], ["report", "Evidence"]],
      stock: [
        ["edge", "controller", "Local sensor hub", 110, "Sounds a local alarm without internet", { offline: true }],
        ["cloud", "controller", "Cloud-only alarms", 48, "Receives sensor readings over the internet", {}],
        ["alert-all", "model", "High-sensitivity model", 68, "10 detected · 7 false alarms", { detected: 10, falseAlarms: 7 }],
        ["pilot", "model", "Tuned trial model", 106, "8 detected · 2 false alarms", { detected: 8, falseAlarms: 2 }],
        ["quiet", "model", "Quiet model", 54, "5 detected · 0 false alarms", { detected: 5, falseAlarms: 0 }],
        ["audit", "report", "Reading and alert log", 57, "Retains readings with alerts for staff to review", { readings: true }],
        ["totals", "report", "Monthly totals", 20, "Stores the number of warnings only", {}]
      ],
      assess({controller, model, report}) {
        return [
          [controller.offline, "Connection outage", "The alarm must sound without sending readings to a cloud service."],
          [model.detected >= 8 && model.falseAlarms <= 2, "Model trial", model.detected === undefined ? "Fit a model and run the ten cases." : model.detected + " found, " + model.falseAlarms + " false alarms."],
          [report.readings, "Reviewable evidence", "Staff need the reading that produced each alert."]
        ];
      },
      debrief: "State one benefit of the model and one cost or risk the organisation should track during rollout."
    },
    {
      id: "barcode-flow", title: "Trace the barcode process",
      brief: "Build a flow that reads a barcode, checks it against the inventory, accepts known stock and reports an error for an unknown item. The bench checks both paths.",
      slots: [["entry", "1 · Receive code"], ["condition", "2 · Check list"], ["yes", "3A · In list"], ["no", "3B · Unknown"]],
      stock: [
        ["read", "entry", "Input / output · Scan code", 0, "Receives code from the scanner", { effect: "read" }],
        ["start", "entry", "Terminator · Start", 0, "Begins the flow without receiving a value", {}],
        ["lookup", "condition", "Decision · Code in stock?", 0, "Branches by the inventory result", { effect: "branch" }],
        ["flat", "condition", "Process · Save code", 0, "Writes a code without testing it", {}],
        ["continue", "yes", "Process · Accept stock", 0, "Records an accepted item", { effect: "accept" }],
        ["reject-yes", "yes", "Output · Unknown code", 0, "Shows an error", { effect: "reject" }],
        ["reject", "no", "Output · Unknown code", 0, "Shows an error", { effect: "reject" }],
        ["force", "no", "Process · Accept stock", 0, "Records an accepted item", { effect: "accept" }]
      ],
      assess({entry, condition, yes, no}) {
        const trace = code => entry.effect === "read" && condition.effect === "branch"
          ? (["041", "207"].includes(code) ? yes.effect : no.effect) : "stopped";
        return [
          [trace("041") === "accept", "Trace 041 (known)", "Path result: " + (trace("041") || "unfinished") + "."],
          [trace("999") === "reject", "Trace 999 (unknown)", "Path result: " + (trace("999") || "unfinished") + "."]
        ];
      },
      debrief: "Draw the tested flow with a start, the input, the decision, labelled branches and an end."
    }
  ];

  function start(mission) {
    return { installed: {}, open: mission.slots[0][0], tests: null, passed: false };
  }

  const find = (mission, id) => mission.stock.find(part => part[0] === id);
  const cost = (mission, draft) => Object.values(draft.installed).reduce((sum, id) => sum + find(mission, id)[3], 0);

  function view(mission, draft) {
    const price = cost(mission, draft);
    const bays = mission.slots.map(([slot, label]) => {
      const installed = find(mission, draft.installed[slot]);
      return '<div class="bay ' + (draft.open === slot ? "active" : "") + '" data-drop="' + slot +
        '"><p class="mono">' + h(label) + "</p><strong>" + h(installed?.[2] ?? "Empty bay") + "</strong><p>" +
        h(installed?.[4] ?? "Choose stock below.") + '</p><div class="controls">' +
        control("bay", "Browse", {slot}, {pressed: draft.open === slot}) +
        (installed ? control("remove", "Remove", {slot}) : "") + "</div></div>";
    }).join("");
    const stock = mission.stock.filter(part => part[1] === draft.open).map(part =>
      '<div class="stock"><b>' + h(part[2]) + "</b><p>" + h(part[4]) + "</p>" +
      control("install", mission.budget ? "Fit · " + pounds(part[3]) : "Fit block", {id: part[0]}, {drag: true, accessibleLabel: "Fit " + part[2]}) + "</div>"
    ).join("");
    const budget = mission.budget === undefined ? [] : [["Spent", pounds(price), price > mission.budget ? "fault" : ""], ["Budget", pounds(mission.budget)]];
    return signals([["Bays fitted", Object.keys(draft.installed).length + "/" + mission.slots.length], ...budget]) +
      panel("Build bench", '<div class="bay-grid">' + bays + "</div>") +
      panel("Stock for " + mission.slots.find(([slot]) => slot === draft.open)[1], '<div class="stock-grid">' + stock + "</div>") +
      '<div class="controls">' + control("bench", mission.budget === undefined ? "Run both traces" : "Power on and test", {}, {main: true}) + "</div>" +
      (draft.tests ? panel("Bench test", checklist(draft.tests)) : "");
  }

  function act(mission, draft, action) {
    if (action.act === "bay") {
      draft.open = action.slot;
      return;
    }
    if (action.act === "bench") {
      const fitted = Object.fromEntries(mission.slots.map(([slot]) =>
        [slot, find(mission, draft.installed[slot])?.[5] || {}]
      ));
      const full = mission.slots.every(([slot]) => draft.installed[slot]);
      draft.tests = [[full, "Assembly", full ? "Every bay is fitted." : "The build still has empty bays."]];
      if (mission.budget !== undefined) {
        const total = cost(mission, draft);
        draft.tests.push([total <= mission.budget, "Budget", pounds(total) + " of " + pounds(mission.budget) + "."]);
      }
      draft.tests.push(...mission.assess(fitted));
      draft.passed = draft.tests.every(([ok]) => ok);
      draft.message = draft.passed ? "The build meets the client’s acceptance tests." : "Use the failed checks to identify the bottleneck and swap parts.";
      return;
    }
    if (action.act === "install") {
      const part = find(mission, action.id);
      if (!part || (action.slot && action.slot !== part[1])) return false;
      draft.installed[part[1]] = part[0];
      const next = mission.slots.find(([slot]) => !draft.installed[slot]);
      if (next) draft.open = next[0];
    } else if (action.act === "remove") delete draft.installed[action.slot];
    else return false;
    draft.tests = null;
    draft.message = "";
    draft.passed = false;
  }

  stations.systems = {
    title: "Systems Workshop", topic: "A1.3–A5 · Digital devices in IT systems",
    intro: "Fit or drag parts into the bench, then power up. The tests measure the configuration as a whole.",
    missions: jobs, start, view, act,
    drop: (source, slot) => ({...source, slot})
  };
})();
