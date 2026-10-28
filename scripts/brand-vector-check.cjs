async page=>{
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const origin=new URL(page.url()).origin;
 const result=[];
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});
  await page.goto(origin,{waitUntil:'networkidle'});
  const logos=await page.locator('.brand-lockup img').evaluateAll(es=>es.map(e=>({source:e.getAttribute('src'),width:e.getBoundingClientRect().width,natural:e.naturalWidth,filter:getComputedStyle(e).filter})));
  assert(logos.every(e=>e.source.endsWith('.svg')&&e.natural>0&&e.filter==='none'),'Brand lockup is not a sharp loaded vector');
  await page.locator('.footer-signature').scrollIntoViewIfNeeded();
  await page.locator('.footer-signature').screenshot({path:`output/playwright/visual-pass/vector-logo-${width}.png`});
  result.push({width,logos});
 }
 const vectors=await page.evaluate(async()=>{
  const names=['studio-logo','studio-wordmark','studio-symbol'];
  return Promise.all(names.map(async name=>{
   const svg=await fetch(`/assets/${name}.svg`).then(r=>r.text());
   const source=new Image(),vector=new Image();source.src=`/assets/${name}.webp`;vector.src=`/assets/${name}.svg`;await Promise.all([source.decode(),vector.decode()]);
   const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const c=canvas.getContext('2d',{willReadFrequently:true});
   c.drawImage(source,0,0);const a=c.getImageData(0,0,canvas.width,canvas.height).data;c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(vector,0,0);const b=c.getImageData(0,0,canvas.width,canvas.height).data;
   let different=0,filled=0;for(let i=3;i<a.length;i+=4){const source=a[i]>=128,output=b[i]>=128;if(source)filled++;if(source!==output)different++;}
   return {name,hasRaster:/<image\b|data:image/i.test(svg),differentSilhouettePixels:different,filledPixels:filled};
  }));
 });
 assert(vectors.every(v=>!v.hasRaster&&v.differentSilhouettePixels===0),'Vector silhouette changed or contains raster data');
 return {logoUsage:result,vectors};
}
