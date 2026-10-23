(() => {
  'use strict';
  const body=document.body,reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const mark=document.querySelector('.brand-mark'),brand=mark.closest('a');
  const canvas=document.createElement('canvas');canvas.className='metal-mark';canvas.setAttribute('aria-hidden','true');mark.append(canvas);
  const ctx=canvas.getContext('2d');
  if(ctx){
    // The studio's existing pixel aperture, extruded into a real solid silhouette.
    const outline=[[1,23],[1,19],[3,19],[3,15],[5,15],[5,11],[7,11],[7,7],[9,7],[9,3],[11,3],[11,1],[14,1],[14,5],[16,5],[16,9],[18,9],[18,13],[20,13],[20,17],[22,17],[22,21],[24,21],[24,24],[19,24],[19,20],[17,20],[17,16],[15,16],[15,12],[13,12],[13,9],[11,9],[11,13],[9,13],[9,17],[7,17],[7,21],[5,21],[5,24]];
    const points=outline.map(([x,y])=>[(x-12.5)/12,(12.5-y)/12]);
    const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0),depth=.19;
    const front=points.map(([x,y])=>[x,y,depth]),back=points.map(([x,y])=>[x,y,-depth]);
    const faces=[{vertices:front,normal:[0,0,1]},{vertices:back,normal:[0,0,-1]}];
    points.forEach((a,i)=>{const j=(i+1)%points.length,b=points[j],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),sign=area>0?1:-1;faces.push({vertices:[front[i],front[j],back[j],back[i]],normal:[dy/length*sign,-dx/length*sign,0]});});
    let raf=0,last=0,time=0,frames=0,paused=false,hover=false;
    const rotate=(p,yaw)=>{
      const cx=Math.cos(-.13),sx=Math.sin(-.13),cy=Math.cos(yaw),sy=Math.sin(yaw),cz=Math.cos(.035),sz=Math.sin(.035);
      const y=p[1]*cx-p[2]*sx,z=p[1]*sx+p[2]*cx,x=p[0]*cy+z*sy,zz=-p[0]*sy+z*cy;
      return [x*cz-y*sz,x*sz+y*cz,zz];
    };
    function paint(){
      const ratio=canvas.width/112;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,112,112);
      const yaw=reduced.matches?-.33:-.33+time*.265;
      const project=p=>{const f=4.7/(4.7-p[2]);return[56+p[0]*f*43,55-p[1]*f*43];};
      const view=faces.map(face=>({vertices:face.vertices.map(v=>rotate(v,yaw)),normal:rotate(face.normal,yaw)})).filter(face=>face.normal[2]>.005).sort((a,b)=>a.vertices.reduce((s,p)=>s+p[2],0)/a.vertices.length-b.vertices.reduce((s,p)=>s+p[2],0)/b.vertices.length);
      const halo=ctx.createRadialGradient(56,60,10,56,60,52);halo.addColorStop(0,'#ff341b15');halo.addColorStop(1,'#ff341b00');ctx.fillStyle=halo;ctx.fillRect(0,0,112,112);
      view.forEach(face=>{
        const p=face.vertices.map(project),n=face.normal,light=Math.max(0,n[0]*-.4+n[1]*.55+n[2]*.73),spec=Math.pow(Math.max(0,n[0]*-.32+n[1]*.3+n[2]*.9),18);
        ctx.beginPath();p.forEach((a,i)=>i?ctx.lineTo(...a):ctx.moveTo(...a));ctx.closePath();
        const gradient=ctx.createLinearGradient(12,13,94,99);
        const colour=(r,g,b)=>`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        gradient.addColorStop(0,colour(172+light*76,19+light*43,14+light*22));
        gradient.addColorStop(.38,colour(153+light*97,12+light*30,14+light*9));
        gradient.addColorStop(.52,colour(155+light*88+spec*9,15+light*35+spec*55,15+light*18+spec*37));
        gradient.addColorStop(1,colour(87+light*82,4+light*15,12+light*7));
        ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle=`rgba(255,181,137,${(.14+light*.38).toFixed(3)})`;ctx.lineWidth=.65;ctx.stroke();
        ctx.save();ctx.clip();
        const shift=(Math.sin(time*.55+yaw*.42)*.5+.5)*190-90;
        const shine=ctx.createLinearGradient(shift-23,0,shift+42,112);shine.addColorStop(0,'#fff0');shine.addColorStop(.4,'#fff0');shine.addColorStop(.49,`rgba(255,235,215,${Math.min(.96,.3+spec*.55+(hover?.16:0)).toFixed(3)})`);shine.addColorStop(.55,'#ffc3a22e');shine.addColorStop(.67,'#fff0');shine.addColorStop(1,'#fff0');
        ctx.fillStyle=shine;ctx.fillRect(0,0,112,112);ctx.restore();
      });
      canvas.dataset.angle=String(Math.round((yaw*180/Math.PI%360+360)%360));canvas.dataset.frame=String(++frames);
    }
    function size(){const width=mark.getBoundingClientRect().width+12;canvas.width=canvas.height=Math.round(width*Math.min(devicePixelRatio||1,2.5));paint();}
    function tick(now){if(paused)return;if(!last||now-last>=32){time+=last?Math.min((now-last)/1000,.09):0;last=now;paint();}raf=requestAnimationFrame(tick);}
    function update(){paused=reduced.matches||document.hidden||body.classList.contains('heading-static');cancelAnimationFrame(raf);last=0;canvas.dataset.state=paused?'paused':'rotating';if(paused)paint();else raf=requestAnimationFrame(tick);}
    const motionObserver=new MutationObserver(update);motionObserver.observe(body,{attributes:true,attributeFilter:['class']});
    brand.addEventListener('pointerenter',()=>{hover=true;});brand.addEventListener('pointerleave',()=>{hover=false;});brand.addEventListener('focus',()=>{hover=true;});brand.addEventListener('blur',()=>{hover=false;});
    document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);addEventListener('resize',size,{passive:true});
    size();mark.classList.add('has-metal-model');update();
  }

  const reflective=[...document.querySelectorAll('.world-poster,.party-member')];
  reflective.forEach(card=>{
    const light=document.createElement('span');light.className='surface-light';light.setAttribute('aria-hidden','true');(card.querySelector('.poster-art')||card).append(light);
    let raf=0,x=50,y=35;
    card.addEventListener('pointermove',event=>{
      if(!fine.matches||reduced.matches)return;
      const r=card.getBoundingClientRect();x=(event.clientX-r.left)/r.width*100;y=(event.clientY-r.top)/r.height*100;
      if(!raf)raf=requestAnimationFrame(()=>{raf=0;card.style.setProperty('--surface-x',`${x.toFixed(1)}%`);card.style.setProperty('--surface-y',`${y.toFixed(1)}%`);});
    });
  });

  const acts=[...document.querySelectorAll('.act')],scene=document.querySelector('#action-scene');
  let chapterRAF=0,chapter=0;
  function atmosphere(){
    chapterRAF=0;let nearest=0,distance=Infinity;
    acts.forEach((act,i)=>{const d=Math.abs(act.getBoundingClientRect().top);if(d<distance){distance=d;nearest=i;}});
    chapter=nearest;body.dataset.chapter=acts[chapter].id;
    const hue=chapter===0?-8:chapter===1?24:chapter===2?[-14,-43,19][Number(scene.dataset.phase)||0]:7;
    body.style.setProperty('--aura-hue',`${hue}deg`);
    body.dataset.visualPhase=`${chapter}:${scene.dataset.phase}`;
  }
  const queueAtmosphere=()=>{if(!chapterRAF)chapterRAF=requestAnimationFrame(atmosphere);};
  addEventListener('scroll',queueAtmosphere,{passive:true});addEventListener('resize',queueAtmosphere,{passive:true});
  const phaseObserver=new MutationObserver(queueAtmosphere);phaseObserver.observe(scene,{attributes:true,attributeFilter:['data-phase']});atmosphere();
  let lightRAF=0,lightX=50,lightY=45;
  addEventListener('pointermove',event=>{
    if(!fine.matches||reduced.matches)return;
    lightX=event.clientX/innerWidth*100;lightY=event.clientY/innerHeight*100;
    if(!lightRAF)lightRAF=requestAnimationFrame(()=>{lightRAF=0;body.style.setProperty('--cursor-light-x',`${lightX.toFixed(1)}%`);body.style.setProperty('--cursor-light-y',`${lightY.toFixed(1)}%`);});
  },{passive:true});
})();
