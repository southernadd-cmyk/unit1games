import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const browser = await chromium.launch({headless:true, args:["--no-sandbox"]});
const base = "http://127.0.0.1:8765";
const cases = [
  "systems", "network", "online", "security", "services", "policy"
];
const widths = [390,768,1024,1440];
const findings=[];
let failures=0;
fs.mkdirSync("test-results/screenshots",{recursive:true});

async function visit(context,route,width,label) {
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const response=await page.goto(base+route,{waitUntil:"networkidle",timeout:30000});
  assert.equal(response.status(),200,route+" should serve");
  const layout=await page.evaluate(()=>{
    const root=document.documentElement;
    const image=document.querySelector(".hero-visual img");
    return {
      pageWidth:root.scrollWidth,viewportWidth:window.innerWidth,
      bodyWidth:document.body.scrollWidth,heading:document.querySelector("h1")?.textContent?.trim(),
      font:getComputedStyle(document.body).fontFamily,
      image:!image||Boolean(image.complete&&image.naturalWidth>0),
      css:Array.from(document.styleSheets).some(s=>s.href&&s.href.includes("assets/")),
      interactive:document.querySelectorAll("button,a[href],input").length,
    };
  });
  assert.ok(layout.heading,"No heading "+route);
  assert.ok(layout.css,"Missing stylesheet "+route);
  assert.ok(layout.image,"Hero image failed "+route);
  assert.ok(layout.font.includes("Instrument Sans"),"Font mismatch "+route+" "+layout.font);
  assert.ok(layout.pageWidth<=layout.viewportWidth+2,"Document overflow "+route+" "+width+" : "+layout.pageWidth+" > "+layout.viewportWidth);
  assert.ok(layout.interactive>2,"Missing interactive elements "+route);
  assert.equal(errors.length,0,"JS page errors in "+route+": "+errors.join("; "));
  if(width===390||width===1440)await page.screenshot({path:"test-results/screenshots/"+label+"-"+width+".png",fullPage:true});
  findings.push({route,width,...layout,errors});
  return page;
}
try {
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:"reduce"});
  const index=await visit(context,"/index.html",width,"home");
  assert.equal(await index.locator(".activity-ledger > li a").count(),7,"Seven activities on home");
  assert.equal(await index.locator('.activity-ledger [href="games/device-division.html"]').count(),1);
  await index.close();
  const device=await visit(context,"/games/device-division.html",width,"device");
  assert.ok(await device.locator(".stagebtn").count()>=5,"No stage navigation");
  assert.ok(await device.locator(".device-icon").count()>=2,"SVG icons not present");
  assert.equal(await device.locator(".choice .emoji").first().evaluate(el=>el.getAttribute("aria-hidden")),"true");
  await device.locator(".choice").first().click();
  assert.ok((await device.locator(".feedback").count())>0,"No feedback after first choice");
  await device.close();
  for(const game of cases){
    const page=await visit(context,"/games/play.html?game="+game,width,game);
    assert.ok(await page.locator(".mission-tab").count()>=2,"No briefs for "+game);
    await page.locator(".mission-tab").nth(1).click();
    assert.ok((await page.locator("#current-brief").textContent()).trim(),"Cannot select brief "+game);
    await page.close();
  }
  await context.close();
 }
 const kb=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await kb.newPage();
 await page.goto(base+"/index.html");
 await page.keyboard.press("Tab");
 assert.equal(await page.evaluate(()=>document.activeElement.className),"skip","Skip link must be first in tab order");
 await kb.close();
 console.log("PASS design smoke: "+findings.length+" route×viewport checks; homepage, Device Division and six simulations.");
 console.log(JSON.stringify({sizes:widths,checked:findings.length,examples:findings.filter(x=>x.route.includes("device")&&x.width===390)},null,2));
}catch(e){failures++;console.error("FAIL design smoke:",e.stack||e);}
finally{await browser.close();}
if(failures)process.exit(1);
