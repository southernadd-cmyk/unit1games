"use strict";

(() => {
  const incidents = [
    {
      id:"payroll", title:"Stop the payroll message",
      brief:"One payroll account has a suspicious active session. A fake password request is still arriving in other inboxes. Contain the message, revoke the affected session and keep ordinary payroll access open.",
      initial:{mail:true, sessions:{rory:true, mae:true}, exposure:2, preserved:false},
      assets:[
        {id:"mail",name:"Message queue", evidence:"A lookalike sender asked staff to return their password. Mail delivery continues until the message is quarantined.", controls:[["quarantine","Quarantine message",1]]},
        {id:"rory",name:"Rory’s account", evidence:"The sign-in report shows a session Rory did not recognise. Payroll have verified this over the known phone line.",controls:[["revoke","Revoke session",1]]},
        {id:"mae",name:"Mae’s account", evidence:"Mae’s session matches her managed workstation and her normal shift.",controls:[["revoke","Revoke session",1]]},
        {id:"history",name:"Security log",evidence:"The record contains sender, delivery and sign-in evidence the incident team needs.",controls:[["preserve","Preserve evidence",2]]}
      ],
      advance(s, minutes) { if (s.mail) s.exposure += 2*minutes; },
      commands:{
        quarantine(s) { s.mail=false; return "The mail gateway stopped further delivery."; },
        revoke(s,target) { s.sessions[target]=false; return "The selected account’s active session is revoked."; },
        preserve(s) { s.preserved=true; return "The message and sign-in evidence was saved to the incident record."; }
      },
      status(s,id) {
        if (id==="mail") return s.mail?"Delivering":"Quarantined";
        if (id==="history") return s.preserved?"Saved":"Unsaved";
        return s.sessions[id]?"Active session":"Revoked";
      },
      metrics:s=>[["Inbox exposures",s.exposure],["Delivery",s.mail?"Active":"Stopped",s.mail?"fault":""]],
      checks:s=>[
        [!s.mail,"Contain the sender","Quarantine the queued copies."],
        [!s.sessions.rory && s.sessions.mae,"Session scope","Revoke Rory's suspicious session and keep Mae working."],
        [s.preserved,"Incident evidence","Keep the delivery and sign-in record."],
        [s.exposure<=8,"Limit exposure",s.exposure + " inboxes exposed. Target: at most eight. Reset the brief for another run if needed."]
      ],
      debrief:"Explain which evidence identified phishing, why session revocation helps, and one additional protection such as MFA."
    },
    {
      id:"shared-link", title:"Contain a public file link",
      brief:"A customer list escaped into a public post. Stop new access while keeping authorised support staff working. The incident record needs enough information to assess the earlier exposure.",
      initial:{post:true, publicLink:true, team:true, preserved:false, views:1},
      assets:[
        {id:"forum",name:"Public forum",evidence:"The post references the file. Some readers may already have copied the URL.",controls:[["remove","Remove post",1]]},
        {id:"share",name:"File sharing",evidence:"The file has a public link and a separate authorisation for the support team.",controls:[["disable","Disable public link",1],["lock","Disable all file access",1]]},
        {id:"trail",name:"Access history",evidence:"The log shows requests that occurred while the link was open.",controls:[["preserve","Record the access history",2]]}
      ],
      advance(s, minutes) { if(s.publicLink) s.views += minutes*(s.post?3:1); },
      commands:{
        remove(s) { s.post=false; return "The post is down. Copied links can still work until disabled."; },
        disable(s) { s.publicLink=false; return "The public URL now denies access."; },
        lock(s) { s.publicLink=false; s.team=false; return "All access is off, including the support team’s normal work."; },
        preserve(s) { s.preserved=true; return "The available access history was secured."; }
      },
      status(s,id) {return id==="forum"?(s.post?"Post visible":"Post removed"):id==="share"?(s.publicLink?"Anyone with link":s.team?"Support only":"All blocked"):s.preserved?"Recorded":"Unrecorded";},
      metrics:s=>[["Public opens",s.views],["Support team",s.team?"Access available":"Blocked",s.team?"":"fault"]],
      checks:s=>[
        [!s.publicLink && !s.post,"Public exposure","Disable the link itself and take down the public post."],
        [s.team,"Business continuity","Support still needs access through its restricted role."],
        [s.preserved,"Exposure assessment","Retain the log for incident review."],
        [s.views<=10,"Contain quickly",s.views + " simulated public opens. Target: at most ten."]
      ],
      debrief:"Describe how sharing defaults and least privilege could have reduced the chance of this incident."
    },
    {
      id:"unreadable", title:"Recover the corrupted share",
      brief:"PC 07 is changing files on the shared drive. Stop further changes, identify a clean backup and bring the share back after a verification check. The live-mirror copy is part of the affected environment.",
      initial:{isolate:false, harmless:false, damaged:6, source:null, restored:false, verified:false, open:false},
      assets:[
        {id:"pc07",name:"PC 07 · reception",evidence:"The share’s audit trail shows bulk file changes from PC 07. The activity is still continuing.",controls:[["isolate","Isolate workstation",1]]},
        {id:"pc09",name:"PC 09 · dispatch",evidence:"No unusual changes. Dispatch relies on this workstation to continue taking calls.",controls:[["isolate","Isolate workstation",1]]},
        {id:"mirror",name:"Live mirror · 09:08",evidence:"A live mirror replicates file changes. The last health check flagged unreadable sample files.",controls:[["copy","Select for recovery",1]]},
        {id:"archive",name:"Isolated backup · 08:45",evidence:"The protected copy pre-dates the reported changes and was not reachable from PC 07.",controls:[["copy","Select for recovery",1]]},
        {id:"drive",name:"Recovery work area",evidence:"Restore into a separate work area before reopening general access.",controls:[["restore","Restore selected backup",3],["validate","Verify sample files",1],["open","Reopen the share",1]]}
      ],
      advance(s,minutes) { if(!s.isolate) s.damaged += minutes*3; },
      commands:{
        isolate(s,target) { if(target==="pc07") s.isolate=true; else s.harmless=true; return target==="pc07"?"PC 07 is cut off from the shared drive.":"A working dispatch PC has been taken offline."; },
        copy(s,target) {s.source=target; return "Recovery source selected.";},
        restore(s) {
          if(!s.source) return "Choose a backup before restoring.";
          s.restored=s.source; s.verified=false; s.open=false; return "The selected copy was restored to the work area.";
        },
        validate(s) {s.verified=s.restored==="archive" && s.isolate; return s.verified?"Sample files open and the affected workstation is contained.":"Verification failed. Check containment and the source copy.";},
        open(s) {s.open=s.verified; return s.open?"The verified recovery copy is available.":"Handover blocked. The restored data is not verified.";}
      },
      status(s,id) {
        if(id==="pc07") return s.isolate?"Isolated":"Writing to share";
        if(id==="pc09") return s.harmless?"Isolated":"Working";
        if(id==="drive") return s.open?"Service live":s.verified?"Verified":s.restored?"Awaiting checks":"Closed";
        return s.source===id?"Selected":"Available";
      },
      metrics:s=>[["Files affected",s.damaged],["Share",s.open?"Available":"Closed"]],
      checks:s=>[
        [s.isolate && !s.harmless,"Containment","Isolate the affected workstation and keep dispatch running."],
        [s.damaged<=15,"Limit spread",s.damaged + " changed files. Target: at most 15."],
        [s.verified && s.open,"Service recovery","Restore clean data, verify it and reopen service."]
      ],
      debrief:"Why did the more recent mirror fail? Explain how the isolated copy helped recovery and what data might still be missing."
    },
    {
      id:"flood", title:"Bring bookings back after a flood",
      brief:"The main site is offline. Restore the booking service on the designated standby, with no more than 60 minutes of lost booking data and no more than 10 minutes of play-time work. Use the inventory and verify the restored service before handover.",
      initial:{selected:null, restore:null, verified:false, live:false},
      assets:[
        {id:"onsite",name:"Onsite backup · 09:55",evidence:"Five minutes old at the time of the failure, but stored in the flooded server room.", controls:[["source","Select snapshot",1]]},
        {id:"offsite",name:"Offsite backup · 09:25",evidence:"35 minutes old at failure. Replicated overnight to managed storage and checked at 09:26.",controls:[["source","Select snapshot",1]]},
        {id:"weekly",name:"Weekly archive",evidence:"Available from the standby site. Seven days of newer records are missing.",controls:[["source","Select snapshot",1]]},
        {id:"standby",name:"Standby booking server",evidence:"Runs at a second site. Verification must check that an existing booking and a new booking both work.",controls:[["restore","Restore snapshot",4],["verify","Check booking service",2],["publish","Switch service to standby",1]]}
      ],
      advance() {},
      commands:{
        source(s,target){s.selected=target; return "Snapshot selected.";},
        restore(s){s.restore=s.selected==="onsite"?null:s.selected; s.verified=false; s.live=false; return s.restore?"Snapshot restored to standby.":"Restore failed: select an available snapshot.";},
        verify(s){s.verified=Boolean(s.restore); return s.verified?"Both existing and new bookings work on standby.":"No restored service to test.";},
        publish(s){s.live=s.verified; return s.live?"Bookings now use the verified standby service.":"Verification is required before switchover.";}
      },
      status(s,id){return id==="standby"?(s.live?"Live":s.verified?"Verified":s.restore?"Awaiting checks":"Idle"):(s.selected===id?"Selected":id==="onsite"?"Unavailable":"Available");},
      metrics:s=>[["Data gap",s.restore==="offsite"?"35 min":s.restore==="weekly"?"7 days":"Pending"]],
      checks:s=>[
        [s.restore==="offsite","Recovery point","The restored booking data must be no older than 60 minutes."],
        [s.live && s.verified,"Operational service","Verify existing and new bookings before switchover."],
        [s.clock<=10,"Recovery time",s.clock+" minutes elapsed. Target: 10 minutes or less."]
      ],
      debrief:"Identify the achieved recovery point and recovery time. Explain the effect of keeping backups in the same room as the live server."
    },
    {
      id:"guest-lan", title:"Separate guests from staff systems",
      brief:"A review found that guests can reach an internal admin service. Restore the intended access boundaries while keeping guest internet access and staff admin access working. Keep the traffic audit.",
      initial:{guestAdmin:true, guestWeb:true, staffAdmin:true, audit:false},
      assets:[
        {id:"gadmin",name:"Guest → admin",evidence:"The guest network has no business requirement to reach the internal admin service.",controls:[["toggle","Toggle access",1]]},
        {id:"gweb",name:"Guest → internet",evidence:"Guest internet browsing is part of the visitor service.",controls:[["toggle","Toggle access",1]]},
        {id:"sadmin",name:"Staff → admin",evidence:"Authorised staff need this route to manage the private system.",controls:[["toggle","Toggle access",1]]},
        {id:"logs",name:"Traffic audit",evidence:"The audit contains details of requests sent before the rule changed.",controls:[["preserve","Save rule and traffic audit",1]]}
      ],
      advance() {},
      commands:{
        toggle(s,target) {
          const keys={gadmin:"guestAdmin",gweb:"guestWeb",sadmin:"staffAdmin"};
          s[keys[target]]=!s[keys[target]];
          return s[keys[target]]?"The selected route now permits traffic.":"The selected route now blocks traffic.";
        },
        preserve(s){s.audit=true;return "The original evidence and rule changes are preserved.";}
      },
      status(s,id){return ({gadmin:s.guestAdmin?"Allowed":"Blocked",gweb:s.guestWeb?"Allowed":"Blocked",sadmin:s.staffAdmin?"Allowed":"Blocked",logs:s.audit?"Saved":"Unsaved"})[id];},
      metrics:s=>[["Guest access to admin",s.guestAdmin?"Open":"Blocked",s.guestAdmin?"fault":""]],
      checks:s=>[
        [!s.guestAdmin,"Guest administrative probe","A guest probe to the admin service must be denied."],
        [s.guestWeb,"Guest web probe","A guest can still use the internet."],
        [s.staffAdmin,"Staff administrative probe","The authorised staff route must stay usable."],
        [s.audit,"Audit trail","Record the original access and changes."]
      ],
      debrief:"Explain the difference between reaching a service through the firewall and being authorised to sign in to it."
    }
  ];

  function start(incident) {
    return { ...structuredClone(incident.initial), clock:0, activeAsset:incident.assets[0].id, log:[], passed:false };
  }

  function view(incident,draft) {
    const entry=incident.assets.find(asset=>asset.id===draft.activeAsset);
    const cards=incident.assets.map(asset=>'<div class="stock '+(asset.id===draft.activeAsset?"active":"")+'"><b>'+
      h(asset.name)+'</b><p>'+h(incident.status(draft,asset.id))+'</p>'+
      control("inspect","Inspect",{id:asset.id},{pressed:asset.id===draft.activeAsset})+'</div>').join("");
    const moves=entry.controls.map(([id,label,minutes])=>control("command",label+" · "+minutes+" min",{id})).join("");
    const logs=draft.log.length?'<ol class="event-log">'+draft.log.slice().reverse().map(([time,event])=>
      '<li><time>+'+time+' min</time><span>'+h(event)+'</span></li>').join("")+'</ol>':'<p>No actions recorded.</p>';
    return signals([["Elapsed",draft.clock+" min"],...incident.metrics(draft)])+
      panel("Systems and evidence",'<div class="stock-grid">'+cards+'</div>',"asset-register")+
      '<div class="incident-layout">'+panel(entry.name,'<p>'+h(entry.evidence)+'</p><div class="controls">'+moves+'</div>',"incident-evidence")+
      panel("Activity log",logs,"incident-log")+"</div>"+
      '<div class="controls">'+control("handover","Run handover checks",{},{main:true})+'</div>'+
      (draft.report?panel("Handover",checklist(draft.report)):"");
  }

  function act(incident,draft,action) {
    if(action.act==="inspect"){draft.activeAsset=action.id;return;}
    if(action.act==="handover"){
      draft.report=incident.checks(draft);
      draft.passed=draft.report.every(([ok])=>ok);
      draft.message=draft.passed?"The incident is ready for handover.":"Review the exposed assets and restore any service the organisation still needs.";
      return;
    }
    const asset=incident.assets.find(entry=>entry.id===draft.activeAsset);
    const command=asset.controls.find(([id])=>id===action.id);
    if(action.act!=="command" || !command)return false;
    const minutes=command[2];
    incident.advance(draft,minutes);
    draft.clock+=minutes;
    draft.log.push([draft.clock,asset.name+" — "+incident.commands[action.id](draft,asset.id)]);
    draft.report=null;
    draft.passed=false;
    draft.message="";
  }

  stations.security={
    title:"Defence Desk",topic:"D1–D2 · Protecting data and information",
    intro:"Inspect the evidence and act on individual assets. Each operation advances the incident clock.",
    missions:incidents,start,view,act
  };
})();
