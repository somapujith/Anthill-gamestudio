(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const stages = [...document.querySelectorAll('[data-layer-stage]')];
  stages.forEach(stage => {
    let raf=0, x=0, y=0;
    function paint(){raf=0;stage.style.setProperty('--pointer-x',`${x.toFixed(2)}px`);stage.style.setProperty('--pointer-y',`${y.toFixed(2)}px`);}
    stage.addEventListener('pointermove',event=>{
      if(reduced.matches||!fine.matches)return;
      const box=stage.getBoundingClientRect();
      x=((event.clientX-box.left)/box.width-.5)*28;y=((event.clientY-box.top)/box.height-.5)*20;
      if(!raf)raf=requestAnimationFrame(paint);
    });
    stage.addEventListener('pointerleave',()=>{x=0;y=0;if(!raf)raf=requestAnimationFrame(paint);});
  });
  let scrollRAF=0;
  function scrollLayers(){scrollRAF=0;if(reduced.matches)return;stages.forEach(stage=>{const r=stage.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)stage.style.setProperty('--scroll-depth',`${Math.max(-90,Math.min(90,r.top*.14)).toFixed(2)}px`);});}
  addEventListener('scroll',()=>{if(!scrollRAF)scrollRAF=requestAnimationFrame(scrollLayers);},{passive:true});

  // A little living emblem. Pixel positions, colours and size interpolate;
  // the retained Anthill wordmark stays black throughout every transformation.
  const canvas=document.querySelector('#brand-morph'), ctx=canvas.getContext('2d');
  const source=document.createElement('canvas');source.width=24;source.height=24;
  const ink=source.getContext('2d',{willReadFrequently:true});
  const black='#11120f', white='#f7f7f2', blue='#003580',red='#df1434';
  function polygon(points,colour=black){ink.fillStyle=colour;ink.beginPath();points.forEach(([x,y],i)=>i?ink.lineTo(x,y):ink.moveTo(x,y));ink.closePath();ink.fill();}
  function rect(x,y,w,h,c=black){ink.fillStyle=c;ink.fillRect(x,y,w,h);}
  function circle(x,y,r,c=black){ink.fillStyle=c;ink.beginPath();ink.arc(x,y,r,0,Math.PI*2);ink.fill();}
  function mark(which){
    ink.clearRect(0,0,24,24);
    if(which===0){polygon([[1,23],[1,19],[3,19],[3,15],[5,15],[5,11],[7,11],[7,7],[9,7],[9,3],[11,3],[11,1],[14,1],[14,5],[16,5],[16,9],[18,9],[18,13],[20,13],[20,17],[22,17],[22,21],[24,21],[24,24],[19,24],[19,20],[17,20],[17,16],[15,16],[15,12],[13,12],[13,9],[11,9],[11,13],[9,13],[9,17],[7,17],[7,21],[5,21],[5,24]]);}
    if(which===1){polygon([[2,11],[6,6],[17,6],[21,11],[22,18],[2,18]]);rect(5,9,6,5,white);polygon([[13,9],[17,9],[19,13],[13,13]],white);rect(3,16,17,2,red);circle(6,20,3);circle(18,20,3);circle(6,20,1,white);circle(18,20,1,white);rect(7,4,9,2);}
    if(which===2){rect(1,4,22,16);rect(2,5,20,14,white);rect(8,5,4,14,blue);rect(2,10,20,4,blue);}
    if(which===3){ink.fillStyle=black;ink.beginPath();ink.moveTo(12,4);ink.bezierCurveTo(3,10,5,17,12,20);ink.bezierCurveTo(19,17,21,10,12,4);ink.fill();ink.beginPath();ink.moveTo(1,9);ink.bezierCurveTo(9,9,11,15,12,21);ink.bezierCurveTo(4,21,1,16,1,9);ink.fill();ink.beginPath();ink.moveTo(23,9);ink.bezierCurveTo(15,9,13,15,12,21);ink.bezierCurveTo(20,21,23,16,23,9);ink.fill();polygon([[12,8],[9,13],[12,18],[15,13]],red);rect(6,22,12,1);}
    if(which===4){polygon([[1,13],[4,12],[8,7],[16,7],[20,12],[23,14],[23,19],[1,19]]);polygon([[9,9],[15,9],[18,12],[6,12]],white);rect(4,14,3,1,red);rect(19,14,3,1,white);circle(6,20,3);circle(18,20,3);circle(6,20,1,white);circle(18,20,1,white);}
    const data=ink.getImageData(0,0,24,24).data,points=[];
    for(let y=0;y<24;y++)for(let x=0;x<24;x++){const i=(y*24+x)*4;if(data[i+3]>100)points.push({x,y,r:data[i],g:data[i+1],b:data[i+2],a:data[i+3]/255});}
    return points;
  }
  const marks=Array.from({length:5},(_,i)=>mark(i));
  const labels=['Anthill','Auto','Finland','Lotus','Drive'];
  const count=Math.max(...marks.map(m=>m.length));let current=0,timer=0,raf=0,started=0,from=[],to=[],particles=[];
  function expanded(points){return Array.from({length:count},(_,i)=>points[i]?{...points[i]}:{x:12,y:12,r:17,g:18,b:15,a:0});}
  function draw(points){ctx.clearRect(0,0,112,112);points.forEach(p=>{if(p.a<.02)return;ctx.fillStyle=`rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},${p.a.toFixed(3)})`;ctx.fillRect(8+p.x*4,8+p.y*4,4.07,4.07);});}
  function schedule(){clearTimeout(timer);if(!reduced.matches&&!document.hidden)timer=setTimeout(advance,2900);}
  function frame(now){
    const age=Math.min(1,(now-started)/820);
    particles=from.map((a,i)=>{const b=to[i],t=Math.max(0,Math.min(1,(age-i/count*.13)/.87)),e=t*t*(3-2*t);return{x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e,r:a.r+(b.r-a.r)*e,g:a.g+(b.g-a.g)*e,b:a.b+(b.b-a.b)*e,a:a.a+(b.a-a.a)*e};});
    draw(particles);
    if(age<1)raf=requestAnimationFrame(frame);else{raf=0;canvas.dataset.mark=labels[current];schedule();}
  }
  function advance(){
    clearTimeout(timer);cancelAnimationFrame(raf);current=(current+1)%marks.length;
    from=particles.map(p=>({...p}));to=expanded(marks[current]);
    if(reduced.matches){particles=to;draw(particles);canvas.dataset.mark=labels[current];return;}
    started=performance.now();raf=requestAnimationFrame(frame);
  }
  particles=expanded(marks[0]);draw(particles);canvas.dataset.mark=labels[0];schedule();
  canvas.closest('a').addEventListener('pointerenter',advance);
  canvas.closest('a').addEventListener('focus',advance);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);cancelAnimationFrame(raf);raf=0;}else{particles=expanded(marks[current]);draw(particles);schedule();}});
  reduced.addEventListener('change',()=>{clearTimeout(timer);cancelAnimationFrame(raf);raf=0;particles=expanded(marks[current]);draw(particles);schedule();});
})();
