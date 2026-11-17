"use strict";

(() => {
  const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const rules = {
    required:{name:"Required", note:"Reject a blank value.", verify:value=>Boolean(value.trim())},
    integer:{name:"Whole number", note:"Reject decimals and non-numeric text.", verify:value=>!value.trim() || /^\d+$/.test(value.trim())},
    seats:{name:"Range 1–6", note:"Check a supplied number against the seat limits.",verify:value=>!value.trim() || (Number(value)>=1 && Number(value)<=6)},
    rating:{name:"Range 1–5", note:"Check a supplied number against the rating scale.",verify:value=>!value.trim() || (Number(value)>=1 && Number(value)<=5)},
    email:{name:"Email format",note:"Check syntax when an address is supplied.",verify:value=>!value.trim() || isEmail(value)},
    matching:{name:"Compare with order email",note:"Verify that both typed values match.",verify:(value,record)=>value.trim()===record.email.trim()},
    kit:{name:"Equipment list",note:"Check the code against the current inventory.",verify:value=>!value.trim() || ["KIT-041","KIT-207","KIT-318"].includes(value.trim())},
    kitFormat:{name:"KIT-000 pattern",note:"Check the shape of a code. It may still refer to unavailable stock.",verify:value=>!value.trim() || /^KIT-\d{3}$/.test(value.trim())},
    length4:{name:"Four characters",note:"Check length without checking the characters.",verify:value=>!value.trim() || value.trim().length===4},
    digits:{name:"Digits only",note:"Treat a supplied PIN as text to preserve its leading zeroes.",verify:value=>!value.trim() || /^\d+$/.test(value.trim())},
    yesNo:{name:"Yes or No",note:"Reject other supplied answers.",verify:value=>!value.trim() || ["Yes","No"].includes(value.trim())},
    comment:{name:"80-character limit",note:"Keep the optional note short.",verify:value=>value.length<=80},
    role:{name:"Staff or student",note:"Use the study’s defined respondent groups.",verify:value=>!value.trim() || ["Staff","Student"].includes(value.trim())}
  };

  const briefs=[
    {
      id:"bookings",title:"Release the museum booking form",
      brief:"Visitors can book 1–6 whole seats. They must provide a receipt email and repeat it to catch a mistyped address. Test boundary cases and both types of email error.",
      fields:[["seats","Seats","numeric",["required","integer","seats","length4"]],["email","Order email","email",["required","email","length4"]],["again","Repeat email","email",["required","email","matching"]]],
      testData:[
        ["One seat",{seats:"1",email:"visitor@example.org",again:"visitor@example.org"},true],
        ["Six seats",{seats:"6",email:"visitor@example.org",again:"visitor@example.org"},true],
        ["No seats",{seats:"0",email:"visitor@example.org",again:"visitor@example.org"},false],
        ["Seven seats",{seats:"7",email:"visitor@example.org",again:"visitor@example.org"},false],
        ["Decimal",{seats:"2.5",email:"visitor@example.org",again:"visitor@example.org"},false],
        ["Blank seat count",{seats:"",email:"visitor@example.org",again:"visitor@example.org"},false],
        ["Two matching typos",{seats:"2",email:"visitor.example.org",again:"visitor.example.org"},false],
        ["Two different addresses",{seats:"2",email:"visitor@example.org",again:"vistior@example.org"},false],
        ["Empty email pair",{seats:"2",email:"",again:""},false]
      ],
      debrief:"Write a test that shows why a verification check does not establish that an email address is valid."
    },
    {
      id:"hire",title:"Equipment hire collection",
      brief:"Only items still in the hire inventory may be reserved. Pickup codes are exactly four digits and may start with zero. Visitors can leave a collection note of up to 80 characters.",
      fields:[["code","Equipment code","text",["required","kitFormat","kit"]],["pin","Collection PIN","numeric",["required","digits","length4"]],["note","Collection note","text",["required","comment","email"]]],
      testData:[
        ["Leading zero",{code:"KIT-041",pin:"0145",note:""},true],
        ["Ordinary booking",{code:"KIT-207",pin:"9172",note:"Collect from reception."},true],
        ["Well-formed out-of-stock code",{code:"KIT-999",pin:"1399",note:""},false],
        ["No item selected",{code:"",pin:"4920",note:""},false],
        ["Short PIN",{code:"KIT-318",pin:"123",note:""},false],
        ["Letters in a PIN",{code:"KIT-041",pin:"C123",note:""},false],
        ["Blank PIN",{code:"KIT-041",pin:"",note:""},false],
        ["Note too long",{code:"KIT-041",pin:"4821",note:"Please leave the equipment at the front desk because the side gate will be locked after six."},false]
      ],
      debrief:"Compare lookup validation with format validation. Explain why the PIN should be kept as text."
    },
    {
      id:"offers",title:"Publish a shop’s offers settings",
      brief:"Customers can keep the offers email blank. A supplied address must have a plausible format. Everyone must explicitly choose Yes or No for personalised offers. There is no preselected response.",
      fields:[["email","Offers email","email",["required","email","length4"]],["offers","Personalised offers","text",["required","yesNo","comment"]]],
      testData:[
        ["No offers or email",{email:"",offers:"No"},true],
        ["Offer signup",{email:"buyer@example.org",offers:"Yes"},true],
        ["Incorrect email format",{email:"buyer.example.org",offers:"Yes"},false],
        ["Unclear response",{email:"buyer@example.org",offers:"Maybe"},false],
        ["No active choice",{email:"buyer@example.org",offers:""},false]
      ],
      debrief:"Explain how transactional data could be used for targeted marketing and why the service asks customers to make an explicit choice."
    },
    {
      id:"survey",title:"Collect current support feedback",
      brief:"The IT team wants first-hand views from this term’s students and staff. Use an accessible form with visible field labels and inline error text. Ratings must be whole numbers from 1 to 5. Names are outside the brief.",
      fields:[["role","Respondent group","text",["required","role","comment"]],["rating","Support rating","numeric",["required","integer","rating"]],["note","Optional explanation","text",["comment","required","email"]]],
      formats:true,
      testData:[
        ["Staff low rating",{role:"Staff",rating:"1",note:""},true],
        ["Student high rating",{role:"Student",rating:"5",note:"Faster account resets helped."},true],
        ["No respondent group",{role:"",rating:"2",note:""},false],
        ["Outside scope",{role:"Supplier",rating:"3",note:""},false],
        ["No rating",{role:"Student",rating:"",note:""},false],
        ["Out-of-range rating",{role:"Staff",rating:"6",note:""},false],
        ["Fractional rating",{role:"Student",rating:"3.5",note:""},false]
      ],
      debrief:"Explain why this survey provides primary data for the question. Identify one way to check whether its results represent the wider population."
    }
  ];

  function start(mission) {
    return {active:0, rules:mission.fields.map(()=>[]), entries:Object.fromEntries(mission.fields.map(([key])=>[key,""])),
      preview:null, report:null, format:{labels:false,errors:false,source:false}, passed:false};
  }

  function errors(mission,draft,record) {
    return mission.fields.flatMap(([key,label],index)=>draft.rules[index].filter(id=>!rules[id].verify(record[key],record))
      .map(id=>[key,label+" · "+rules[id].name]));
  }

  function runCases(mission,draft) {
    return mission.testData.map(([title,record,expected])=>{
      const reasons=errors(mission,draft,record);
      const accepted=reasons.length===0;
      return {title,record,expected,accepted,ok:accepted===expected,reasons};
    });
  }

  const readyFormat = draft => draft.format.labels && draft.format.errors && draft.format.source;

  function view(mission,draft) {
    const [,title,,pool]=mission.fields[draft.active];
    const fitted=draft.rules[draft.active];
    const slots=mission.fields.map(([key,label],i)=>'<div class="bay '+(i===draft.active?"active":"")+'" data-drop="'+key+
      '"><b>'+h(label)+'</b><p>'+h(draft.rules[i].map(id=>rules[id].name).join(" + ") || "No validation rules")+'</p>'+
      control("field","Edit rules",{index:i},{accessibleLabel:"Edit rules for "+label})+'</div>').join("");
    const rulePanel=pool.map(id=>'<div class="stock"><b>'+h(rules[id].name)+'</b><p>'+h(rules[id].note)+'</p>'+
      control("rule",fitted.includes(id)?"Remove":"Attach",{id},{pressed:fitted.includes(id),drag:true,accessibleLabel:(fitted.includes(id)?"Remove ":"Attach ")+rules[id].name})+'</div>').join("");
    const preview=mission.fields.map(([key,label,mode],index)=>{
      const unmatched = draft.preview?.some(([field]) => field === key);
      const input='<input type="text" id="live-'+index+'" data-edit="'+key+'" data-focus="input:'+key+'" inputmode="'+mode+
        '" value="'+h(draft.entries[key])+'"'+(unmatched?' aria-invalid="true"':'')+'>';
      const displayed = mission.formats && !draft.format.labels ? "Field " + (index + 1) : label;
      return '<label class="field"><span>'+h(displayed)+'</span>'+input+"</label>";
    }).join("");
    const format=mission.formats?panel("Data and interface settings",
      '<p>Apply the settings that are actually included in this release.</p><div class="controls">'+
      control("format","Labels "+(draft.format.labels?"on":"off"),{id:"labels"},{pressed:draft.format.labels})+
      control("format","Written error feedback "+(draft.format.errors?"on":"off"),{id:"errors"},{pressed:draft.format.errors})+
      control("format",draft.format.source?"New survey data":"Historical report",{id:"source"},{pressed:draft.format.source})+"</div>"):"";
    const report=draft.report?panel("Release test log",table(["Test case","Input","Expected","Actual","Result"],
      draft.report.map(test=>[
        h(test.title),'<span class="test-data">'+Object.values(test.record).map(value=>h(value || "∅")).join(" · ")+"</span>",
        test.expected?"Accept":"Reject",test.accepted?"Accept":"Reject",
        '<b class="'+(test.ok?"good-text":"bad-text")+'">'+(test.ok?"Pass":"Fail")+'</b>'
      ]),"Form tests")+(mission.formats?checklist([[readyFormat(draft),"Data and interface review",
        "The survey needs fresh primary data, labels and written error prompts."]]):"")):"";
    return '<div class="validation-layout"><div class="validation-builder">'+
      panel("Form builder",'<div class="bay-grid">'+slots+"</div>","field-board")+
      panel("Rule tray · "+title,'<div class="stock-grid">'+rulePanel+'</div>',"rule-tray")+format+"</div>"+
      panel("Live form preview",'<p>Try your own values using the rules you fitted.</p><div class="fields">'+preview+
        '</div><div class="controls">'+control("attempt","Try submission")+'</div>'+
        (draft.preview?checklist([[!draft.preview.length,draft.preview.length?"Record withheld":"Record accepted",
          draft.preview.length?(mission.formats&&!draft.format.errors?"The form marks fields without saying what to change.":draft.preview.map(error=>error[1]).join(" · ")):"The entered record passed every fitted rule."]]):""),"form-proof")+"</div>"+
      '<div class="controls">'+control("suite","Run release tests",{},{main:true})+'</div>'+report;
  }

  function act(mission,draft,action) {
    if(action.act==="field"){draft.active=Number(action.index);return;}
    if(action.act==="attempt"){draft.preview=errors(mission,draft,draft.entries);return;}
    if(action.act==="suite"){
      draft.report=runCases(mission,draft);
      const passed=draft.report.filter(test=>test.ok).length;
      draft.passed=passed===draft.report.length&&(!mission.formats||readyFormat(draft));
      draft.message=draft.passed?"Release approved. All checks behaved as the client expected.":
        passed+"/"+draft.report.length+" examples passed. Review failed cases and release settings.";
      return;
    }
    if(action.act==="rule"){
      const index=action.drop?mission.fields.findIndex(([key])=>key===action.drop):draft.active;
      if(index<0||!mission.fields[index][3].includes(action.id))return false;
      const fitted=draft.rules[index];
      if (fitted.includes(action.id)) {
        if (action.drop) return false;
        draft.rules[index] = fitted.filter(id=>id!==action.id);
      } else draft.rules[index] = [...fitted,action.id];
      draft.active=index;
    }else if(action.act==="format")draft.format[action.id]=!draft.format[action.id];
    else return false;
    draft.preview=null;
    draft.report=null;
    draft.passed=false;
    draft.message="";
  }

  stations.services={
    title:"Service Launch",topic:"E1–E2 · Impact of IT systems",
    intro:"Build an online form by stacking validation and verification rules. Enter test data yourself before running the client’s release suite.",
    missions:briefs,start,view,act,
    edit:(_mission,draft,input)=>{draft.entries[input.dataset.edit]=input.value;},
    drop:(source,slot)=>({...source,drop:slot})
  };
})();
