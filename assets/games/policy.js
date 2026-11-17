"use strict";

(() => {
  const ico="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/";
  const cma="https://www.legislation.gov.uk/ukpga/1990/18/section/1";
  const copyright="https://www.legislation.gov.uk/ukpga/1988/48/contents";
  const hse="https://www.hse.gov.uk/msd/dse/";
  const showToggle=(id,label,values)=>control("toggle",label,{id},{pressed:values[id]});
  const cycle=(id,options,index)=>control("cycle",options[index],{id,length:options.length});

  const fields=[
    ["name","Winner name","Sam Morgan","Jordan Bell"],
    ["award","Category","Animation","Photography"],
    ["email","Email","sam@example.org","jordan@example.org"],
    ["address","Postal address","Address A, EX4","Address B, EX2"],
    ["access","Access request","Step-free entrance","Large print"]
  ];
  const lots=[
    ["repair","Lab desktops",18,true,2],
    ["broken","Damaged units",12,false,2],
    ["small","Working mini PCs",8,true,1]
  ];
  const devices=["Studio 1","Studio 2","Studio 3","Studio 4","Training 1","Training 2"];
  const tests=["Blocked","View sample report","Write records"];
  const outcomes=["Hold","Refurbish and reuse","Approved recycling"];
  const buyerTools=[
    ["labels","Labelled fields and text errors",2],["keyboard","Keyboard navigation",2],
    ["lite","Low-bandwidth pages",1],["phone","Assisted phone bookings",3],["video","Autoplay homepage video",3]
  ];

  const files=[
    {
      id:"results-export",title:"Edit the public results release",
      brief:"The organiser has permission to publish winners’ names and categories. Prepare the actual export to keep everything gathered for contact and event support out of the download.",
      initial:{name:true,award:true,email:true,address:true,access:true},
      artefact(v){
        const included=fields.filter(([id])=>v[id]);
        const preview=included.length?table(included.map(([,label])=>label),
          [2,3].map(index=>included.map(field=>h(field[index]))),"Public export preview"):"<p>The export has no fields.</p>";
        return panel("Columns in the downloadable file",
          "<p>Toggle fields to include or remove them. The preview shows every column the public would receive.</p>"+
          '<div class="controls">'+fields.map(([id,label])=>showToggle(id,label,v)).join("")+"</div>")+
          panel("Public export preview",preview);
      },
      review(v){
        const exposures=[v.email,v.address,v.access].filter(Boolean).length*2;
        return [[v.name&&v.award,"Useful results","Each result needs its permitted name and category."],
          [!exposures,"Data minimisation",exposures+" unnecessary personal data cells would be released."]];
      },
      ref:["ICO guidance on data minimisation",ico],
      debrief:"Explain why removing columns from the exported file is stronger than merely hiding them in the spreadsheet."
    },
    {
      id:"device-disposal",title:"Route the lab’s retired computers",
      brief:"All devices contain old storage. Clear and verify it before any transfer. Reuse at least 20 suitable machines, send unusable equipment to the approved recycler and keep the work within eight staff hours.",
      initial:Object.fromEntries(lots.flatMap(([id])=>[[id,0],[id+"wipe",false]])),
      artefact(v){
        const activities=lots.map(([id,name,count,works,hours])=>[
          h(name+" · "+count),works?"Suitable for reuse":"Unsafe to reuse",
          showToggle(id+"wipe",(v[id+"wipe"]?"Verified erase":"Erase and verify")+" · "+hours+" h",v),
          cycle(id,outcomes,v[id])
        ]);
        const reuse=lots.reduce((sum,[id,,count,works])=>sum+(v[id]===1&&v[id+"wipe"]&&works?count:0),0);
        return signals([["Ready for reuse",reuse],["Staff time",this.hours(v)+" / 8 hours"]])+
          panel("Asset transfer list",table(["Batch","Condition","Storage action","Destination"],activities,"Equipment batches"));
      },
      hours(v){ return lots.reduce((sum,[id,,,,hours])=>sum+(v[id+"wipe"]?hours:0)+(v[id]?1:0),0); },
      review(v){
        const leaks=lots.reduce((sum,[id,,count])=>sum+(v[id]&&!v[id+"wipe"]?count:0),0);
        const reuse=lots.reduce((sum,[id,,count,works])=>sum+(v[id]===1&&works?count:0),0);
        const routes=lots.every(([id,,,works])=>v[id]>0&&(works||v[id]===2));
        return [[!leaks,"Storage exposure",leaks+" devices would leave before storage was cleared."],
          [reuse>=20,"Reduce waste",reuse+" suitable computers routed for reuse."],
          [routes,"Complete transfers","The unusable units need approved recycling. Held lots are still outstanding."],
          [this.hours(v)<=8,"Staff time",this.hours(v)+" of 8 hours used."]];
      },
      debrief:"Explain one advantage of reusing working equipment and one data protection check the organisation should carry out before transfer."
    },
    {
      id:"licences",title:"Allocate studio software licences",
      brief:"Four studio workstations must open native project files in the commercial editor. Two training workstations only need to export standard images. One licence is already held. Each extra authorised installation costs £120 and the budget is £360.",
      initial:{seats:0,...Object.fromEntries(devices.map((_,i)=>["device"+i,0]))},
      artefact(v){
        const choices=["Unassigned","Commercial editor","Open-source editor"];
        return signals([["Commercial seats",1+v.seats],["Spend",pounds(v.seats*120)]])+
          panel("Install plan",table(["Workstation","Workload","Editor assigned"],devices.map((name,i)=>[
            h(name),i<4?"Native project files":"Standard image export",cycle("device"+i,choices,v["device"+i])
          ]),"Workstation allocations"))+
          panel("Licence quote",'<div class="controls">'+control("adjust","Add a seat",{id:"seats",delta:1},{disabled:v.seats>=5})+
            control("adjust","Remove a seat",{id:"seats",delta:-1},{disabled:!v.seats})+"</div>");
      },
      review(v){
        const editors=devices.map((_,i)=>v["device"+i]);
        const installed=editors.filter(editor=>editor===1).length;
        return [[editors.slice(0,4).every(editor=>editor===1)&&editors.slice(4).every(Boolean),"Workload support","Native project editing needs the commercial package. Training needs an editor."],
          [installed<=1+v.seats,"Licence compliance",installed+" commercial installs and "+(1+v.seats)+" licences."],
          [v.seats*120<=360,"Procurement budget",pounds(v.seats*120)+" of £360."]];
      },
      ref:["Copyright, Designs and Patents Act 1988",copyright],
      debrief:"Explain how software licence terms affect installation and how interoperability changes which product is suitable."
    },
    {
      id:"test-authorisation",title:"Issue a safe testing authorisation",
      brief:"A designer was asked to inspect the layout of an HR report. The data owner has authorised a fictional-data test environment. The designer needs temporary viewing access through their own account.",
      initial:{where:0,scope:0,own:false,expires:false,audit:false},
      artefact(v){
        const environments=["Production HR system","Sample environment"];
        return panel("Access request",table(["Property","Proposed setting"],[
          ["Environment",cycle("where",environments,v.where)],["Scope",cycle("scope",tests,v.scope)],
          ["Account",showToggle("own",v.own?"Named test account":"Borrowed account",v)],
          ["Expiry",showToggle("expires",v.expires?"Expires after the test":"No expiry",v)],
          ["Evidence",showToggle("audit",v.audit?"Log approval and access":"No approval log",v)]
        ],"Proposed permission"))+
        panel("Access preview",'<div class="document"><code>'+h((v.own?"Named designer":"Borrowed account")+" → "+environments[v.where]+" → "+tests[v.scope])+
          "</code><p>"+(v.expires?"Time-limited":"Open-ended")+" · "+(v.audit?"Approval recorded":"Approval unrecorded")+"</p></div>");
      },
      review(v){
        return [[v.where===1,"Authorised environment","The design brief authorises access to the sample report only."],
          [v.scope===1,"Permission scope","Previewing the report needs viewing access. No live records need to change."],
          [v.own&&v.expires&&v.audit,"Accountability","Use the named account and record the scope and expiry."]];
      },
      ref:["Computer Misuse Act 1990, section 1",cma],
      debrief:"Distinguish having a working account from having authorisation. Explain why fictional test data is suitable here."
    },
    {
      id:"access-for-all",title:"Keep appointment booking reachable",
      brief:"The centre is going online. Keep booking workable for a resident using a screen reader and keyboard, somebody with slow mobile data, and a resident with no usable internet connection. There are eight staff-hours to make changes.",
      initial:Object.fromEntries(buyerTools.map(([id])=>[id,false])),
      hours(v){return buyerTools.reduce((sum,[id,,cost])=>sum+(v[id]?cost:0),0);},
      artefact(v){
        const profiles=this.review(v).slice(0,3);
        return signals([["Time assigned",this.hours(v)+" / 8 hours"]])+
          panel("Booking options",'<div class="controls">'+buyerTools.map(([id,name,cost])=>showToggle(id,name+" · "+cost+" h",v)).join("")+"</div>")+
          panel("Visitor walkthroughs",table(["Visitor","Can they book?","What they need"],profiles.map(([ok,name,detail])=>
            [h(name),ok?"Yes":"Blocked",h(detail)]),"Accessibility walkthroughs"));
      },
      review(v){
        return [[v.labels&&v.keyboard,"Keyboard and screen reader","The caller needs field labels, readable errors and keyboard access for the whole task."],
          [v.lite&&!v.video,"Slow mobile connection","A light page is required. Autoplay would spend the user’s limited data allowance."],
          [v.phone,"No internet access","Keep a staffed phone route for someone who cannot reach the site."],
          [this.hours(v)<=8,"Work allocation",this.hours(v)+" of 8 hours scheduled."]];
      },
      debrief:"Explain the difference between providing an accessible website and providing access to an online service for people without connectivity."
    },
    {
      id:"screen-shift",title:"Fix a display-screen work shift",
      brief:"Staff spend most of the day at computers and report discomfort. Adjust the display-screen workstation plan and add a break or change of activity between long screen blocks. Carry out a proper assessment before signing it off.",
      initial:{seat:false,screen:false,assessed:false,break1:false,break2:false},
      artefact(v){
        return panel("Workstation plan",'<div class="controls">'+showToggle("assessed",v.assessed?"Workstations assessed":"Assess workstations",v)+
          showToggle("seat","Adjust seating and desk position",v)+showToggle("screen","Adjust display and input setup",v)+"</div>")+
          panel("Shift timeline",'<div class="timeline"><b>Calls and admin</b>'+
            showToggle("break1",v.break1?"Non-screen work":"Continuous screen work",v)+'<b>Customer records</b>'+
            showToggle("break2",v.break2?"Planned break":"Continuous screen work",v)+"<b>Dispatch updates</b></div>");
      },
      review(v){
        return [[v.assessed&&v.seat&&v.screen,"Workstation risk","Assess workstations and address the risks identified in their seating and equipment."],
          [v.break1&&v.break2,"Work pattern","The example shift needs planned changes of activity or breaks in both gaps."]];
      },
      ref:["HSE guidance on display screen equipment",hse],
      debrief:"Explain why the organisation should assess how people work, as well as which computers it buys."
    },
    {
      id:"chat-case",title:"Prepare a respectful workplace report",
      brief:"A placement student reported repeated insulting messages. Prepare a restricted incident record under the organisation’s acceptable use policy and give the student a route to further support.",
      initial:{recipient:0,extract:false,unrelated:true,publish:false,support:false},
      artefact(v){
        const recipients=["Entire department","Named supervisor"];
        return panel("Case pack",'<div class="controls">'+
          showToggle("extract","Attach relevant message excerpts",v)+showToggle("unrelated","Attach unrelated conversation",v)+
          showToggle("publish","Publish screenshots to the team",v)+showToggle("support","Schedule a private support check-in",v)+"</div>")+
          panel("Distribution",
            "<p>Case record recipient</p><div class=\"controls\">"+cycle("recipient",recipients,v.recipient)+"</div>"+
            '<div class="document"><p><b>'+h(recipients[v.recipient])+'</b></p><p>'+
            h([v.extract?"Relevant excerpts":null,v.unrelated?"Unrelated chat":null,v.publish?"Public team copy":null].filter(Boolean).join(" · ") || "No evidence attached")+
            "</p></div>");
      },
      review(v){
        return [[v.recipient===1&&v.extract&&!v.unrelated&&!v.publish,"Proportionate escalation","The named supervisor needs the relevant evidence. The policy does not require broadcasting messages or unrelated discussion."],
          [v.support,"Support the learner","Arrange a confidential follow-up with the affected student."]];
      },
      debrief:"Explain how acceptable use rules and netiquette help the organisation respond consistently without exposing more people’s data."
    }
  ];

  function start(file){return { values:structuredClone(file.initial), report:null, passed:false };}

  function view(file,draft) {
    return '<div class="case-material">'+file.artefact(draft.values)+"</div>"+
      '<div class="controls">'+control("review","Submit for review",{},{main:true})+"</div>"+
      (draft.report?panel("Review findings",checklist(draft.report)):"")+
      (file.ref?'<p class="source-line"><a href="'+h(file.ref[1])+'" target="_blank" rel="noopener">'+h(file.ref[0])+' ↗</a></p>':"");
  }

  function act(file,draft,action) {
    if(action.act==="review"){
      draft.report=file.review(draft.values);
      draft.passed=draft.report.every(([ok])=>ok);
      draft.message=draft.passed?"The proposal is ready. The review shows who retains access, what the organisation can do and what risks it has addressed.":
        "The proposed result fails one or more requirements. Revise the work product using the review.";
      return;
    }
    if(action.act==="toggle")draft.values[action.id]=!draft.values[action.id];
    else if(action.act==="cycle")draft.values[action.id]=(draft.values[action.id]+1)%Number(action.length);
    else if(action.act==="adjust")draft.values[action.id]+=Number(action.delta);
    else return false;
    draft.report=null;
    draft.passed=false;
    draft.message="";
  }

  stations.policy={
    title:"Policy Files",topic:"F1–F2 · Moral, ethical and legal issues",
    intro:"Edit an export, transfer plan or access record and submit the finished work for review.",
    missions:files,start,view,act
  };
})();
