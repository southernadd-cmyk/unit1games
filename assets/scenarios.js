"use strict";

const unitGames = {
  systems: {
    title: "Systems Workshop",
    topic: "A · Digital devices in IT systems",
    intro: "Choose one item from each group, then test the configuration against the brief and budget.",
    activity: "Job",
    prompt: "Choose one job. Explain how two of your choices meet specific user needs and identify a disadvantage or cost of one choice.",
    missions: [
      {
        title: "A library workstation for a blind user",
        brief: "A member needs to find catalogue records using a keyboard and listen to on-screen text privately. The browser and catalogue are already keyboard-accessible.",
        budget: 90,
        slots: [
          ["Assistive software", [
            ["Screen magnifier", 12, "Makes text and controls larger. It does not read them aloud.", false],
            ["Screen reader", 25, "Reads interface content aloud and supports keyboard navigation.", true],
            ["Image editor", 15, "Edits pictures and cannot announce catalogue results.", false]
          ]],
          ["Input and output", [
            ["Headphones and tactile keyboard", 48, "The user can navigate by touch and listen without filling the room with sound.", true],
            ["Unlabelled touchscreen and speakers", 43, "This layout relies on sight and broadcasts the spoken output.", false],
            ["Projector and wireless mouse", 52, "Projects the page and relies on visual pointing.", false]
          ]]
        ],
        explanation: "A screen reader handles the interface and the text. Text-to-speech on its own might read a document yet leave controls and navigation inaccessible."
      },
      {
        title: "Edit video from the same drive",
        brief: "A college media team moves a 240 GB project between two workstations every day. It needs a portable drive of at least 500 GB with random reads above 200 MB/s, plus an independent copy of the work.",
        budget: 125,
        slots: [
          ["Working storage", [
            ["500 GB external SSD", 75, "USB 3.2 drive measured at 400 MB/s for this job.", true],
            ["2 TB external HDD", 48, "More capacity, but its measured transfer rate is 110 MB/s.", false],
            ["256 GB flash drive", 39, "Fits in a pocket but falls below the 500 GB capacity requirement.", false]
          ]],
          ["Second copy", [
            ["Scheduled copy to managed storage", 30, "A separate, versioned copy gives the team a recovery point if the working drive fails.", true],
            ["Second folder on the SSD", 0, "A failure or loss of the drive can destroy both folders.", false],
            ["Share the working drive", 6, "Sharing makes the same data available. It creates no independent copy.", false]
          ]]
        ],
        explanation: "The SSD meets the capacity, portability and speed requirements. Scheduling an independent copy introduces some ongoing cost but limits the impact of losing the drive."
      },
      {
        title: "A packing line that has a deadline",
        brief: "A sensor detects a misplaced box. The controller must react within a guaranteed time and warn staff immediately. Alarm records must open in the office spreadsheet package.",
        budget: 110,
        slots: [
          ["Operating system", [
            ["Real-time operating system", 65, "Designed so critical tasks respond within defined timing limits.", true],
            ["General-purpose desktop OS", 28, "Suited to interactive desktop tasks, with no guaranteed timing for this controller.", false],
            ["Replace the OS with a spreadsheet", 10, "A spreadsheet cannot schedule and control the hardware on its own.", false]
          ]],
          ["Output peripheral", [
            ["Warning light and buzzer", 22, "Alerts people beside the line immediately.", true],
            ["Scanner and keypad", 18, "Collects input and provides no visible or audible warning.", false],
            ["Daily laser-printed report", 25, "Provides a record after the event.", false]
          ]],
          ["Event log", [
            ["CSV export", 8, "The existing spreadsheet can import simple rows of event data.", true],
            ["Screenshots of event logs", 5, "A visual record that cannot be imported as rows of data.", false],
            ["Application-only binary file", 4, "The existing spreadsheet cannot open this format.", false]
          ]]
        ],
        explanation: "Picking a real-time system is about meeting deadlines predictably. The alarm is an output device. The log is for later analysis."
      },
      {
        title: "Move the college timetable",
        brief: "The new scheduler has to work with the existing staff sign-in. The switch must finish within one weekend and the old timetable must be available if the migration goes wrong.",
        budget: 100,
        slots: [
          ["Software", [
            ["Supported open-source scheduler", 48, "Works with existing sign-in. The support subscription is included in this quote.", true],
            ["Proprietary scheduler with integration", 60, "Works with existing sign-in and includes vendor support.", true],
            ["Stand-alone scheduler", 24, "Requires a separate account for every user and has no sign-in integration.", false]
          ]],
          ["Implementation", [
            ["Test sample data, pilot sign-in and prepare rollback", 35, "Runs checks before the switch and protects the old timetable.", true],
            ["Replace the live service straight away", 5, "Saves preparation time but leaves no tested fallback.", false],
            ["Buy a vendor-led migration rehearsal and rollback", 52, "Gives staff a supported trial before the weekend switch, at a higher cost.", true]
          ]]
        ],
        explanation: "Two products can meet the same needs. A licence alone does not settle the choice. Integration, support, downtime and rollback matter for this client."
      },
      {
        title: "Reduce waste in the storeroom",
        brief: "Sensors track temperature so staff can act before food spoils. A proposed AI tool flags likely failures. Alarms must still work when the internet connection drops, and staff must be able to review false alerts.",
        budget: 130,
        slots: [
          ["Monitoring", [
            ["Local sensor controller and alarm", 57, "Reads the sensors and triggers a local alert without internet access.", true],
            ["Cloud-only alarm service", 30, "An outage can stop readings reaching the online alert service.", false],
            ["Weekly manual temperature check", 14, "Can miss a rapid change between checks.", false]
          ]],
          ["AI trial", [
            ["Pilot with human review", 48, "Compare alerts with real readings, log false alarms and keep the local alarm active.", true],
            ["Replace the local alarm immediately", 28, "Unverified model output would be the only warning.", false],
            ["Hide low-confidence alerts and keep no log", 34, "Staff have no evidence for reviewing missed failures or false alerts.", false]
          ]]
        ],
        explanation: "Connected sensors can improve visibility and AI may flag patterns sooner. Test that benefit against false alarms, availability and the costs of maintaining the system."
      },
      {
        title: "Draw the barcode check before rollout",
        brief: "Staff will scan a barcode. The system must decide whether it is already in the product list, then either accept the scan or display an error. Choose the flowchart symbols for the first two steps.",
        slots: [
          ["Read the barcode", [
            ["Input/output parallelogram", 12, "The barcode reader supplies data to the process.", true],
            ["Decision diamond", 12, "The scanner read itself has no yes/no branch.", false],
            ["Start/end terminator", 12, "Marks a start or end point, not an input step.", false]
          ]],
          ["Is the barcode in the product list?", [
            ["Process rectangle with one exit", 12, "An ordinary process box does not express the two alternative outcomes here.", false],
            ["Decision diamond with yes/no branches", 14, "The result sends the flow to either acceptance or the error message.", true],
            ["Input/output parallelogram", 12, "The check is a decision rather than the movement of data.", false]
          ]]
        ],
        explanation: "The arrow after the input step leads into the decision. Label the two outgoing arrows so a colleague can follow the valid and invalid paths."
      }
    ]
  },
  network: {
    title: "Packet Route",
    topic: "B · Transmitting data",
    intro: "Select connected devices to build a route. Check the slowest link, total delay and any service-specific rules before sending.",
    activity: "Puzzle",
    prompt: "Describe a route that failed. Explain which link or setting caused the failure and how your replacement route kept the service working.",
    missions: [
      {
        title: "Get the lesson video to the classroom",
        brief: "The teacher’s laptop needs at least 25 Mb/s from the media server and no more than 45 ms of simulated link delay.",
        speed: 25, delay: 45,
        nodes: [["laptop", "Laptop", 70, 140], ["class", "Classroom AP", 225, 65], ["guest", "Hall AP", 225, 215], ["switch", "Main switch", 410, 140], ["server", "Media server", 570, 140]],
        links: [
          ["laptop", "class", "Wi-Fi", 48, 9], ["laptop", "guest", "Wi-Fi", 12, 28],
          ["class", "switch", "Ethernet", 100, 2], ["guest", "switch", "Ethernet", 100, 3],
          ["switch", "server", "Ethernet", 1000, 2]
        ],
        explanation: "The classroom access point offers a faster wireless hop. A fast wired core cannot increase the capacity of the slowest hop in your route."
      },
      {
        title: "A cut fibre link takes bookings offline",
        brief: "Restore the branch booking service using a working path. The branch needs 20 Mb/s and at most 75 ms of combined simulated delay.",
        speed: 20, delay: 75,
        nodes: [["branch", "Branch PC", 70, 140], ["edge", "Branch router", 215, 140], ["core", "Head office", 405, 65], ["backup", "Backup router", 405, 215], ["desk", "Booking server", 565, 140]],
        links: [
          ["branch", "edge", "Ethernet", 100, 2], ["edge", "core", "Fibre", 1000, 10, "down"],
          ["edge", "backup", "4G failover", 29, 44], ["backup", "core", "Fibre", 1000, 11],
          ["core", "desk", "Ethernet", 100, 2]
        ],
        explanation: "The failed fibre is bypassed by a lower-capacity path. The 4G hop adds delay, yet this service can still operate with the available bandwidth and latency."
      },
      {
        title: "Send the shop’s checkout request",
        brief: "The checkout must use the staff network, with web traffic encrypted to the payment service. It needs at least 5 Mb/s and no more than 100 ms.",
        speed: 5, delay: 100, trusted: true,
        modeLabel: "Web protocol",
        modes: [["HTTP", false], ["HTTPS", true], ["IMAP", false]],
        nodes: [["pos", "Checkout", 70, 140], ["staff", "Staff switch", 230, 65], ["guest", "Guest Wi-Fi", 230, 215], ["gateway", "Shop router", 410, 140], ["pay", "Payment service", 570, 140]],
        links: [
          ["pos", "staff", "Ethernet", 100, 2], ["pos", "guest", "Guest Wi-Fi", 45, 8, "guest"],
          ["staff", "gateway", "Ethernet", 1000, 2], ["guest", "gateway", "Ethernet", 100, 4, "guest"],
          ["gateway", "pay", "Internet", 90, 35]
        ],
        explanation: "HTTPS protects web data in transit when configured and verified correctly. The shop also requires separation from its guest network."
      },
      {
        title: "Feed a live interview to the studio",
        brief: "Two feeds are available. Choose a suitable encoding and keep route delay below the 70 ms limit. The chosen live feed needs at least 8 Mb/s.",
        speed: 8, delay: 69,
        modeLabel: "Video encoding",
        modes: [["Compressed live video supported by both ends", true], ["Uncompressed 120 Mb/s video", false], ["ZIP the recording and send it after filming", false]],
        nodes: [["source", "Field encoder", 70, 140], ["relay", "Mobile relay", 230, 65], ["sat", "Satellite link", 230, 215], ["studio", "Studio router", 410, 140], ["edit", "Studio decoder", 570, 140]],
        links: [
          ["source", "relay", "5G", 30, 18], ["source", "sat", "Satellite", 150, 238],
          ["relay", "studio", "Fibre", 1000, 13], ["sat", "studio", "Fibre", 1000, 12],
          ["studio", "edit", "Ethernet", 1000, 2]
        ],
        explanation: "Bandwidth is capacity. Latency is delay. The high-capacity satellite route takes too long for this interview. A compatible video codec makes the live feed fit the faster path."
      },
      {
        title: "Transfer a labelled engineering image",
        brief: "The recipient must recover exactly the same pixels so fine labels remain legible. Select the lossless encoding and meet the 70 Mb/s and 65 ms targets.",
        speed: 70, delay: 65,
        modeLabel: "Image encoding",
        modes: [["PNG using lossless compression", true], ["JPEG using lossy compression", false], ["Send a low-resolution preview", false]],
        nodes: [["design", "Design PC", 70, 140], ["wifi", "Wireless AP", 230, 65], ["switch", "Design switch", 230, 215], ["router", "Site router", 410, 140], ["partner", "Partner host", 570, 140]],
        links: [
          ["design", "wifi", "Wi-Fi", 38, 14], ["design", "switch", "Ethernet", 1000, 2],
          ["wifi", "router", "Ethernet", 100, 3], ["switch", "router", "Fibre", 1000, 2],
          ["router", "partner", "Site link", 120, 32]
        ],
        explanation: "Lossless compression preserves the original pixel data. Here the wired route can carry the higher transfer rate the client requires."
      },
      {
        title: "Read a shared mailbox on two devices",
        brief: "A staff member needs reads and folders to stay synchronised on a laptop and phone. Route the laptop to the mail host with at least 3 Mb/s and no more than 110 ms.",
        speed: 3, delay: 110,
        modeLabel: "Mail protocol",
        modes: [["SMTP to send mail", false], ["IMAP with TLS", true], ["POP configured to download and delete mail", false]],
        nodes: [["desk", "Staff laptop", 70, 140], ["ap", "Office AP", 225, 65], ["dock", "Dock switch", 225, 215], ["router", "Office router", 405, 140], ["mail", "Mail host", 570, 140]],
        links: [
          ["desk", "ap", "Wi-Fi", 22, 22], ["desk", "dock", "Ethernet", 100, 2],
          ["ap", "router", "Ethernet", 100, 2], ["dock", "router", "Ethernet", 100, 3],
          ["router", "mail", "Internet", 65, 36]
        ],
        explanation: "IMAP keeps mailbox state on a server and supports synchronisation between devices. SMTP is for sending. More than one route can satisfy this job."
      }
    ]
  },
  online: {
    title: "Community Shift",
    topic: "C1–C2 · Operating online",
    intro: "You’re running IT for a festival. Keep the budget, service availability and community trust above zero to finish the shift.",
    activity: "Decision",
    prompt: "Pick two decisions. Explain how each affected a different stakeholder, then identify one trade-off you would handle differently next time.",
    stats: ["Budget", "Availability", "Trust"],
    missions: [
      {
        title: "A team of twelve starts on Monday",
        brief: "The festival needs shared schedules, document editing and comments next week. The team has no developers or server administrators.",
        choices: [
          ["Rent virtual servers (IaaS) and build a document service", [-4, -2, 0], "The provider supplies infrastructure. The team still has to install, configure and maintain its software."],
          ["Buy seats for a ready-to-use cloud collaboration service (SaaS)", [-2, 3, 1], "The provider runs the application. The team can start quickly and must budget for licences and manage access."],
          ["Send one spreadsheet attachment to everyone", [0, -2, -1], "Cheap to start, but parallel edits create competing versions and make it harder to know which schedule is current."]
        ]
      },
      {
        title: "Sensitive records must stay in the private environment",
        brief: "The festival’s risk team requires staff case files in its existing private cloud. Public timetables should cope with bursts of traffic on launch day.",
        choices: [
          ["Publish public timetables in a public cloud and keep staff records in the private cloud", [-2, 2, 3], "This hybrid layout uses different environments for different needs. Manage access and integration between them."],
          ["Put all the files in a public link folder", [1, 2, -5], "The public link makes publishing quick. It also exposes staff files to people who do not need them."],
          ["Serve both systems from the existing private environment", [1, -3, 1], "Sensitive files stay private. The team would need extra capacity to cope with a busy launch."]
        ]
      },
      {
        title: "The event map needs a small live API",
        brief: "One developer can write the application but cannot spend the week patching a server operating system. The team may need to scale the map quickly.",
        choices: [
          ["Rent a bare virtual machine and manage every layer", [-2, -2, 0], "IaaS offers more control and gives the festival more work to patch and support the operating system."],
          ["Buy more document-editing seats", [-2, -2, 0], "SaaS seats grant access to an existing app. They give the developer no place to deploy this API."],
          ["Deploy the map code to a managed platform (PaaS)", [-1, 2, 0], "The provider manages the runtime and infrastructure. The team still maintains the application and its data."]
        ]
      },
      {
        title: "Gate staff need the current schedule",
        brief: "Gate staff use tablets. Coverage is unreliable at two entrances. The schedule is public, but staff must avoid using a stale copy all day.",
        choices: [
          ["Give them a read-only offline copy with a visible last-sync time", [-1, 3, 1], "Staff can work during brief outages and check the time on their copy before acting on changes."],
          ["Send a permanent link that loads only when online", [1, -4, -1], "There is one live version, but it is unavailable at the gates when the signal drops."],
          ["Give every tablet full editor access", [0, 0, -3], "More people can change the schedule. Extra permissions do nothing to solve intermittent connectivity."]
        ]
      },
      {
        title: "Volunteers need the old badge application",
        brief: "A small group of authorised volunteers must use an existing application on office computers from home. The application runs only on the office machines.",
        choices: [
          ["Provide authorised remote desktops through the secure remote-access service", [-2, 2, 2], "The app stays on the office machines. Remote desktop provides its interface, with controlled access and a reliable connection still needed."],
          ["Provide a VPN and assume the application appears on every personal laptop", [0, -2, 0], "A VPN creates a network connection. It does not automatically provide the remote desktop or install the app."],
          ["Share one office password across all volunteers", [1, 1, -5], "A shared password is quick to distribute. It makes access difficult to control or attribute to individuals."]
        ]
      },
      {
        title: "The public questions keep repeating",
        brief: "Visitors need accessible answers to the same questions long after the original volunteers log off. New questions still need a place to be raised.",
        choices: [
          ["Use one fast-moving group chat for everything", [1, -2, -1], "Useful for quick exchanges. Important answers are easy to lose among recent messages."],
          ["Use a maintained FAQ or wiki plus a moderated forum", [-1, 1, 2], "Searchable pages handle repeated questions. Threads also preserve useful answers for people who arrive later."],
          ["Publish a weekly audio-only update", [1, -1, -2], "An audio update can suit some visitors. Without transcripts or indexed answers it is much harder to search and use."]
        ]
      },
      {
        title: "A thread includes a volunteer’s phone number",
        brief: "The volunteer did not agree to public sharing. You still need a way for visitors to reach the festival team.",
        choices: [
          ["Redact the number, contact the volunteer and pin the official contact route", [-1, 0, 3], "The public post stops exposing the number. The organisation still receives enquiries through an appropriate shared channel."],
          ["Leave the thread and ask people to be sensible", [1, 1, -4], "The number stays visible and can be copied. A request for good behaviour does not reduce that exposure."],
          ["Close the whole forum for a week", [0, -4, 1], "Removes public access to the thread but also to unrelated help. A targeted action has lower disruption."]
        ]
      },
      {
        title: "Launch day brings a traffic spike",
        brief: "The public site has a queue. The supplier offers a planned temporary capacity increase. The forum is also seeing more reports than volunteers can handle.",
        choices: [
          ["Scale temporarily and triage reports against a clear policy", [-2, 3, 2], "More capacity helps availability. Policy-based triage prioritises serious harm while keeping the service usable."],
          ["Turn off every reporting and moderation control", [2, 1, -4], "Queues look shorter because people cannot report problems. The underlying safety risk remains."],
          ["Pause non-essential site updates and publish the status", [1, 1, 1], "Reduces some load and manages expectations. You will still need to monitor whether the remaining capacity is enough."]
        ]
      }
    ]
  }
};

unitGames.security = {
  title: "Defence Desk",
  topic: "D1–D2 · Protecting data and information",
  intro: "Open the evidence for each incident. Identify the threat and choose a response and a longer-term control.",
  activity: "Incident",
  prompt: "Choose an incident. Distinguish the threat from the impact, then explain how your control reduces the impact or likelihood of it happening again.",
  missions: [
    {
      title: "The last-minute payroll request",
      brief: "A member of payroll received a message asking them to confirm a password. They reported it without responding.",
      evidence: [
        ["Message excerpt", "Payroll access expires in 15 minutes. Reply with your current password to keep the account active."],
        ["Sender details", "The displayed name says Payroll Support. The sender address belongs to an unrelated organisation."],
        ["Service note", "IT does not ask staff to send passwords and publishes a separate phone number for verifying requests."]
      ],
      fields: [
        ["Threat", ["Accidental deletion", "Phishing and social engineering", "Natural disaster"], 1, "The message uses urgency and impersonation to obtain a password."],
        ["Immediate response", ["Verify through the known IT contact and report the message", "Reply asking if it is genuine", "Forward the message to the whole department"], 0, "A trusted contact route can verify the request without continuing the conversation with the sender."],
        ["Future control", ["A bigger monitor for payroll", "Weekly file exports only", "Multifactor authentication and reporting practice"], 2, "MFA reduces reliance on a stolen password. Practice helps staff recognise and report suspicious requests."]
      ],
      explanation: "A convincing sender name is easy to imitate. Verification and reporting address the attempt, while MFA adds a separate check at sign-in."
    },
    {
      title: "A managed laptop goes missing",
      brief: "A field worker reports a stolen laptop. The device held copies of appointment records. The staff account is separate from the device.",
      evidence: [
        ["Inventory", "The records were stored locally on the SSD. The device inventory says full-disk encryption was off."],
        ["Access logs", "The staff account has an active session on the laptop. The IT team can revoke sessions."],
        ["Recovery note", "Another managed copy of the records remains available to the team."]
      ],
      fields: [
        ["Threat", ["Loss or theft of a portable device", "A weak Wi-Fi signal", "An online service outage"], 0, "The risk is exposure of local data and any active session on the stolen computer."],
        ["Immediate response", ["Wait for the device to reconnect", "Report the theft internally and revoke its sessions", "Reset the whole file server"], 1, "Revoke what the organisation can still control. The incident team needs to assess whether local records may have been exposed."],
        ["Future control", ["Put a warning sticker on the lid", "Increase SSD capacity", "Require full-disk encryption and protect recovery keys"], 2, "Encryption helps protect local files if locked storage is removed or accessed without the key."]
      ],
      explanation: "Revoking sessions protects access to online systems. Disk encryption protects data stored on the device when the encrypted storage is locked."
    },
    {
      title: "The public link to a private file",
      brief: "A staff member accidentally shared a file containing customer contact details in a public forum post.",
      evidence: [
        ["Link settings", "Anyone who has the link can open the file without signing in."],
        ["Forum log", "The post was public for 20 minutes before a colleague reported it."],
        ["Project brief", "Only the support team needs access to the original file."]
      ],
      fields: [
        ["Threat", ["Malware infection", "Accidental disclosure by an insider", "Hardware failure"], 1, "The access was opened by somebody inside the organisation who made a sharing mistake."],
        ["Immediate response", ["Disable the public link and record the exposure for review", "Delete only the forum post", "Ask readers to ignore the file"], 0, "Removing the post alone leaves any already-copied link working."],
        ["Future control", ["Hide the file extension", "Make private access the default and restrict sharing to authorised roles", "Increase download limits"], 1, "Least privilege limits access to the people who need the file."]
      ],
      explanation: "Stop ongoing exposure first and preserve information for the incident team. Permission defaults reduce the chance of recurrences."
    },
    {
      title: "Files suddenly stop opening",
      brief: "Several documents on a shared drive become unreadable. A workstation shows a demand for payment. IT has recent, isolated backups.",
      evidence: [
        ["Endpoint alert", "The endpoint protection system flagged unusual bulk changes on the affected workstation."],
        ["Network log", "The first affected workstation was reaching a shared drive that many users can write to."],
        ["Backup log", "A restore was tested last week using an isolated copy."]
      ],
      fields: [
        ["Threat", ["Ransomware", "Phishing without malware", "A file format conversion"], 0, "Unreadable files and a payment demand suggest ransomware."],
        ["Immediate response", ["Reconnect the affected PC and keep working", "Replace every monitor", "Isolate affected devices and follow the incident plan"], 2, "Isolation limits possible spread and gives the incident team a chance to investigate before restoring."],
        ["Future control", ["Grant every user admin access", "Keep tested isolated backups and restrict write permissions", "Make the shared drive bigger"], 1, "Usable backups help recover data, and limited write access reduces how much one affected account can change."]
      ],
      explanation: "Endpoint protection can detect suspicious activity. Tested, isolated backups and limited access reduce the recovery impact if detection fails."
    },
    {
      title: "Water damages the server room",
      brief: "A broken pipe makes the main file server and its nearby backup device unusable. Staff are safe. The technical team needs to restore essential records.",
      evidence: [
        ["Facility report", "Both devices were in the same room. The building cannot reopen until repairs finish."],
        ["Off-site backup report", "Last night’s encrypted backup is available from a separate site."],
        ["Restore exercise", "IT documented a successful restore into the standby environment."]
      ],
      fields: [
        ["Threat", ["Environmental or physical damage", "Social engineering", "A compromised password"], 0, "The location is affected by a physical incident."],
        ["Immediate response", ["Leave the standby site unused until the building reopens", "Use the standby system and verify a restore from off-site backup", "Copy files from the water-damaged server straight away"], 1, "A restore into the standby system lets the team verify usable data without relying on the damaged site."],
        ["Future control", ["Store the spare server under the main server", "Keep only a live mirrored folder on the same host", "Keep separate backups and practise restoring services"], 2, "A separate site limits common damage. Practising restoration tests whether recovery actually works."]
      ],
      explanation: "Two copies in one room can fail together. A backup is useful only if staff can restore and verify it when needed."
    },
    {
      title: "Guest traffic reaches an internal server",
      brief: "A practice review shows that visitors on the guest network can reach an internal admin service. A review finds no evidence of successful sign-ins.",
      evidence: [
        ["Network map", "Guest Wi-Fi is meant to provide internet access. It has no business reason to reach admin services."],
        ["Firewall review", "A broad guest-to-internal allow rule was left enabled after a test."],
        ["Service logs", "Internal administrators still need to use the service from their own segment."]
      ],
      fields: [
        ["Risk", ["Unauthorised access from an untrusted network", "Insufficient backup capacity", "Loss of physical documents"], 0, "Guests can reach a destination outside the intended network boundaries."],
        ["Immediate response", ["Disable all staff connections", "Correct the firewall rule and check both guest and staff paths", "Change the wallpaper of the admin service"], 1, "Test that guest access is blocked and legitimate administrator access still works."],
        ["Future control", ["Keep broad access and apply themes by department", "Delete service logs to reduce storage", "Separate guests and regularly review firewall rules"], 2, "Network separation and reviewed rules control allowed traffic between groups."]
      ],
      explanation: "A firewall controls which traffic can pass between networks or hosts. Authentication still matters for the users who can reach a service."
    }
  ]
};

unitGames.services = {
  title: "Service Launch",
  topic: "E1–E2 · Impact of IT systems",
  intro: "Configure two checks for each online service, then run the test cases. A release passes when the service accepts or rejects every example correctly.",
  activity: "Release",
  prompt: "Write one test you would add. Explain the difference between validation and verification using a mistake from one of the releases.",
  missions: [
    {
      title: "Museum ticket booking",
      brief: "Each booking has to reserve 1–6 whole seats. A receipt goes to the email address entered at checkout, so visitors type it twice to catch discrepancies.",
      fields: [
        { name: "Seats per booking", options: [["range1to6", "Whole number from 1 to 6"], ["number", "Any number"], ["present", "Entry is present"]],
          tests: [["2", true], ["1", true], ["6", true], ["0", false], ["7", false], ["4.5", false], ["", false]] },
        { name: "Email confirmation", options: [["email", "Email format"], ["same", "Matches the first entry"], ["present", "Entry is present"]],
          tests: [["maya@example.org", true, "maya@example.org"], ["may@example.org", false, "maya@example.org"], ["", false, "maya@example.org"]] }
      ],
      explanation: "Range validation protects the seat count. Comparing two entries is verification. A syntactically valid email can still be the wrong address."
    },
    {
      title: "Equipment hire and collection",
      brief: "The website accepts only equipment codes shown in the live hire inventory. The collection PIN is four digits and leading zeroes are allowed.",
      fields: [
        { name: "Equipment code", options: [["kitFormat", "KIT- followed by three digits"], ["kitInventory", "Check against hire inventory"], ["present", "Entry is present"]],
          tests: [["KIT-041", true], ["KIT-207", true], ["KIT-999", false], ["041", false], ["", false]] },
        { name: "Collection PIN", options: [["length4", "Four characters"], ["number", "Any number"], ["pin4", "Exactly four digits"]],
          tests: [["0321", true], ["2081", true], ["321", false], ["C421", false], ["99999", false]] }
      ],
      explanation: "A code can have the right format yet refer to an item that cannot be hired. Store a PIN as text when leading zeroes matter."
    },
    {
      title: "The shop’s email offers",
      brief: "The marketing email field is optional. When a customer enters an address it must have a plausible email format. The customer must choose either Yes or No for offers, with no answer chosen in advance.",
      fields: [
        { name: "Optional offers email", options: [["present", "Entry is present"], ["optionalEmail", "Empty or valid email format"], ["email", "Email format required"]],
          tests: [["may@example.org", true], ["may", false], ["may@", false], ["", true]] },
        { name: "Marketing choice", options: [["present", "Entry is present"], ["yesOnly", "Accept only Yes"], ["yesNo", "Restrict to Yes or No"]],
          tests: [["Yes", true], ["No", true], ["Maybe", false], ["", false]] }
      ],
      explanation: "Transactional data can support targeted marketing. Clear choices and an optional address let customers complete checkout without being steered towards offers."
    },
    {
      title: "A remote-working support survey",
      brief: "The college needs first-hand views from staff right now. Confirm that the survey source is primary and the form can be completed using a keyboard and assistive software.",
      fields: [
        { name: "Source", options: [["present", "Use any available source"], ["currentSurvey", "Collect a new staff survey"], ["oldArticle", "Reuse an old published article"]],
          tests: [["A new staff survey", true], ["Last year’s industry article", false], ["Estimates from the IT team", false]] },
        { name: "Interface", options: [["touchOnly", "Accept swipe-only controls"], ["accessibleForm", "Require labelled fields and keyboard access"], ["present", "Accept any interface"]],
          tests: [["Labelled fields and keyboard access", true], ["Swipe-only slider", false], ["Unlabelled text boxes", false]] }
      ],
      explanation: "A survey gathers primary data for the question being asked. Accessible controls reduce barriers to responding. Check whose views are still missing before generalising."
    },
    {
      title: "A delivery address from the checkout",
      brief: "Customers need an order email and a postcode for a UK delivery. Use a simple practice format check for the email, and compare the second postcode to the first, allowing differences in case and spaces.",
      fields: [
        { name: "Required order email", options: [["optionalEmail", "Empty or valid email format"], ["present", "Entry is present"], ["email", "Require email format"]],
          tests: [["dispatch@example.org", true], ["dispatch at example.org", false], ["dispatch@example", false], ["", false]] },
        { name: "Postcode confirmation", options: [["same", "Exact text match"], ["samePostcode", "Compare entries ignoring case and spaces"], ["present", "Entry is present"]],
          tests: [["ex4 3sr", true, "EX4 3SR"], ["EX43SR", true, "EX4 3SR"], ["EX4 3RS", false, "EX4 3SR"], ["", false, "EX4 3SR"]] }
      ],
      explanation: "Normalising entries avoids rejecting harmless formatting differences. Two matching copies can still contain the same mistake, so confirmation does not prove an address exists."
    }
  ]
};

unitGames.policy = {
  title: "Policy Files",
  topic: "F1–F2 · Moral, ethical and legal issues",
  intro: "Read the case file. Choose the main issue raised by the evidence and recommend a proportionate response.",
  activity: "Case",
  prompt: "Choose one legal case and one ethical case. Explain who is affected and how your proposed action balances the interests of the organisation and the user.",
  sources: [
    ["Computer Misuse Act 1990, section 1", "https://www.legislation.gov.uk/ukpga/1990/18/section/1"],
    ["Copyright, Designs and Patents Act 1988", "https://www.legislation.gov.uk/ukpga/1988/48/contents"],
    ["Copyright (Computer Programs) Regulations 1992", "https://www.legislation.gov.uk/uksi/1992/3233/contents/made"],
    ["ICO guidance on data minimisation", "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/"],
    ["HSE guidance on display screen equipment", "https://www.hse.gov.uk/msd/dse/"]
  ],
  missions: [
    {
      title: "The public results table",
      brief: "An organiser wants to publish competition winners. The first draft exports the whole registration table.",
      evidence: [
        ["Purpose", "Publish the names of the winners and their categories. The organiser has already confirmed the basis for publishing those details."],
        ["Export", "Includes home contact details and information collected to arrange accommodations."],
        ["Audience", "Anyone can search for or download the published results."]
      ],
      fields: [
        ["Main issue", ["Software licence terms", "Data protection and data minimisation", "Display screen equipment"], 1, "The proposed export contains personal details unrelated to the results announcement."],
        ["Action", ["Publish the full export once", "Hide columns in the workbook and upload it", "Produce a new copy with only the approved results fields"], 2, "Exclude unnecessary data from the published file itself."]
      ],
      explanation: "Data minimisation limits personal data to what is needed for a stated purpose. The registration file serves a different purpose from the public results."
    },
    {
      title: "A test account without permission",
      brief: "An employee asks to use another person’s account to look at restricted HR records. They know they have no authorisation to access the files.",
      evidence: [
        ["Account policy", "Only named HR staff may access the production records."],
        ["Work request", "The employee was asked to test how a report looks, using a sample data set."],
        ["Available resource", "A test environment contains fictional records and is open to the employee."]
      ],
      fields: [
        ["Main issue", ["Computer misuse and unauthorised access", "Digital exclusion", "Software licensing"], 0, "The facts point to intended access that the user knows is unauthorised."],
        ["Action", ["Use the borrowed account briefly", "Use the authorised test environment or request explicit permission", "Proceed if the restricted files are opened read-only"], 1, "A different purpose and a read-only action do not grant authority to access someone else’s records."]
      ],
      explanation: "The Computer Misuse Act addresses knowingly unauthorised access. Use a permitted environment and sample data for testing."
    },
    {
      title: "Roll out the editing package",
      brief: "A small design team needs a commercial editor on ten workstations. The current licence covers one workstation.",
      evidence: [
        ["Licence", "One authorised installation on one workstation. The licence does not cover the additional nine proposed installs."],
        ["Budget", "The team can ask for a volume quote or evaluate alternatives."],
        ["Suggestion", "Duplicate the installed software now and deal with the paperwork later."]
      ],
      fields: [
        ["Main issue", ["Display screen equipment", "Environmental impact", "Software copyright and licensing"], 2, "The proposed copies fall outside the stated permission."],
        ["Action", ["Obtain suitable licences or choose an alternative permitted by its licence", "Copy the program and change its name", "Install first because there will be only one user at a time"], 0, "The scenario describes an installation limit. The team needs permission for the intended use."]
      ],
      explanation: "Copyright protects computer programs. A software licence sets the scope of permitted use and copying, so check the actual terms when planning a rollout."
    },
    {
      title: "Shift after shift at the screen",
      brief: "Call centre staff use computers for most of the working day and report discomfort. The employer has never assessed the workstations.",
      evidence: [
        ["Staff report", "Some cannot adjust their seating and several describe tired eyes or shoulder pain."],
        ["Schedule", "The rota has long screen-based stretches with few changes of task."],
        ["Manager note", "Purchasing a new brand of monitor was proposed without reviewing individual needs."]
      ],
      fields: [
        ["Main issue", ["Netiquette", "Health and safety for display screen equipment", "Computer misuse"], 1, "The employees are regular display screen equipment users and raise workstation risks."],
        ["Action", ["Leave risk assessment to staff on their own", "Buy identical monitors and close the report", "Assess workstations, make adjustments and plan breaks or changes of task"], 2, "Assess how people actually work, then match changes to the risks identified."]
      ],
      explanation: "The HSE covers both workstation assessment and arranging breaks or changes of activity for display screen equipment users."
    },
    {
      title: "Appointments move online",
      brief: "A community centre plans to make all appointments bookable by smartphone. Some visitors have limited internet access or no suitable device.",
      evidence: [
        ["Resident feedback", "Several residents rely on pay-as-you-go phones or shared computers."],
        ["Current service", "Staff already take bookings by telephone on weekday mornings."],
        ["Project target", "Make booking easier while preserving access for current visitors."]
      ],
      fields: [
        ["Main issue", ["Software copying", "Display screen equipment", "Unequal access to IT"], 2, "Visitors have different access to suitable devices and affordable connectivity."],
        ["Action", ["Keep a phone or assisted booking route alongside the site", "Make the website accessible only from the newest phones", "Use a larger logo on the booking home page"], 0, "An assisted alternative gives people a way to book without needing their own internet device."]
      ],
      explanation: "An online channel can be efficient. The organisation should consider who loses access when it withdraws existing routes."
    },
    {
      title: "Clear out the computer lab",
      brief: "A lab is replacing forty workstations. Some devices still work and all have storage that may hold account information.",
      evidence: [
        ["Assessment", "Twenty PCs are suitable for reuse and twenty have reached the end of their useful life."],
        ["Asset records", "Every device needs to leave the inventory through the approved disposal procedure."],
        ["Objective", "Reduce e-waste without releasing user data."]
      ],
      fields: [
        ["Main issue", ["Unauthorised software copying", "Environmental impact and safe disposal", "Netiquette"], 1, "The fate of working hardware and material waste is the central concern."],
        ["Action", ["Remove the stickers and donate every PC as it is", "Wipe and verify storage, then reuse suitable PCs and recycle the rest responsibly", "Store all the computers indefinitely"], 1, "Protect information before transfer. Reuse can extend working life, and responsible recycling deals with unusable devices."]
      ],
      explanation: "Reuse and repair can reduce the impact of replacement. Data protection still matters when equipment changes hands."
    },
    {
      title: "A club’s enrolment form",
      brief: "Several applicants using screen readers report being unable to finish the online enrolment form.",
      evidence: [
        ["User test", "The participant moves through unlabeled entry fields and cannot tell which value is required."],
        ["Staff review", "Errors appear only as a red outline. The form never tells assistive software where the error is."],
        ["Objective", "Allow the same application to be completed using a keyboard and screen reader."]
      ],
      fields: [
        ["Main issue", ["Screen time at work", "Software licensing", "Barriers for people using assistive technology"], 2, "The form does not communicate labels and errors in a way the reported assistive tool can read."],
        ["Action", ["Add labels and accessible error messages, then retest with affected users", "Make red outlines brighter", "Offer instructions in an image"], 0, "Clear, usable labels and errors give people a way to complete the same process."]
      ],
      explanation: "Accessibility depends on how the interface behaves with the tools people use. Retest the complete task, including error recovery."
    },
    {
      title: "The group chat and the placement student",
      brief: "A staff member repeatedly posts insulting replies to a placement student in a team chat. The organisation has an acceptable use policy and a reporting route.",
      evidence: [
        ["Policy excerpt", "Work chat should be respectful. Report repeated harassment to a supervisor through the established channel."],
        ["Message history", "The replies continued after the student asked the person to stop."],
        ["Supervisor note", "The student is worried that being moved to another group will affect their placement."]
      ],
      fields: [
        ["Main issue", ["Copyright licences", "Online behaviour and acceptable use", "Network bandwidth"], 1, "The repeated behaviour conflicts with the organisation’s published rules for communication."],
        ["Action", ["Ask the student to leave the chat and do nothing else", "Share the screenshots publicly", "Use the reporting route, retain relevant evidence securely and support the student"], 2, "A proportionate response applies the policy and supports the affected person without wider publication."]
      ],
      explanation: "Acceptable use policies turn expectations about online behaviour into practical reporting and response procedures."
    }
  ]
};
