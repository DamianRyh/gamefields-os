import assert from "node:assert/strict";
import { chromium } from "playwright";

const base=process.env.STUDIO_TEST_URL||"http://127.0.0.1:4017";
const browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"]});
const errors=[];
try{
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:950},acceptDownloads:true});
    page.on("pageerror",error=>errors.push(error.message));
    const response=await page.goto(base+"/makeover-perspective-lab",{waitUntil:"domcontentloaded",timeout:45000});
    assert.equal(response.status(),200,"route unavailable");
    await page.getByText("Konstrukcja 3D w perspektywie zdjęcia").waitFor();
    assert.ok(await page.getByRole("link",{name:/Makeover/}).count(),"missing main navigation");
    const png=await page.evaluate(()=>{
      const c=document.createElement("canvas");c.width=1280;c.height=800;
      const ctx=c.getContext("2d");ctx.fillStyle="#c8c6be";ctx.fillRect(0,0,1280,800);
      ctx.fillStyle="#939188";ctx.fillRect(0,300,1280,500);
      return c.toDataURL("image/png").split(",")[1];
    });
    await page.locator('input[type="file"]').setInputFiles({name:"courtyard.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
    await page.getByText("Zdjęcie gotowe.",{exact:false}).waitFor();
    const canvas=page.locator("canvas");
    const rect=await canvas.boundingBox();
    assert.ok(rect);
    for(const [x,y] of [[.2,.7],[.8,.7],[.7,.35],[.3,.35]]){
      await canvas.click({position:{x:rect.width*x,y:rect.height*y}});
    }
    await page.waitForTimeout(3500);
    const text=await page.locator('[role="status"]').innerText();
    assert.ok(!/WebGL jest niedostępny|Brak poprawnej geometrii/.test(text),text);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,"horizontal overflow");
    console.log(JSON.stringify({width,status:text,exportEnabled:await page.getByRole("button",{name:/Pobierz PNG/}).isEnabled()}));
    await page.close();
  }
  assert.deepEqual(errors,[],"page errors");
  console.log("makeover-browser PASS");
}finally{await browser.close();}
