(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const body=document.body,canvas=document.querySelector('#aurora-sky');
  const stages=[...document.querySelectorAll('[data-layer-stage]')];
  let layerRAF=0;
  function scrollDepth(){
    layerRAF=0;
    for(const stage of stages){
      const r=stage.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)continue;
      const center=(r.top+r.height*.5-innerHeight*.5);
      stage.style.setProperty('--scroll-depth',`${reduced.matches?0:Math.max(-150,Math.min(150,center*.25)).toFixed(2)}px`);
      stage.dataset.depth=reduced.matches?'still':'layered';
    }
  }
  const queueDepth=()=>{if(!layerRAF)layerRAF=requestAnimationFrame(scrollDepth);};
  for(const stage of stages){
    let x=0,y=0,targetX=0,targetY=0,raf=0;
    function follow(){
      x+=(targetX-x)*.095;y+=(targetY-y)*.095;
      stage.style.setProperty('--pointer-x',`${x.toFixed(2)}px`);
      stage.style.setProperty('--pointer-y',`${y.toFixed(2)}px`);
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.02)raf=requestAnimationFrame(follow);else raf=0;
    }
    stage.addEventListener('pointermove',event=>{
      if(reduced.matches||!fine.matches)return;
      const r=stage.getBoundingClientRect();
      targetX=((event.clientX-r.left)/r.width-.5)*44;
      targetY=((event.clientY-r.top)/r.height-.5)*30;
      if(!raf)raf=requestAnimationFrame(follow);
    });
    stage.addEventListener('pointerleave',()=>{targetX=targetY=0;if(!raf)raf=requestAnimationFrame(follow);});
    reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;x=y=targetX=targetY=0;stage.style.setProperty('--pointer-x','0px');stage.style.setProperty('--pointer-y','0px');queueDepth();});
  }
  addEventListener('scroll',queueDepth,{passive:true});addEventListener('resize',queueDepth,{passive:true});queueDepth();

  // A small procedural light field. No video, music, or network dependency.
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  function canvasAurora(){
    const sky=document.createElement('canvas');sky.id='aurora-sky';canvas.replaceWith(sky);
    const ctx=sky.getContext('2d',{alpha:false});
    if(!ctx){body.dataset.auroraState='css-fallback';return;}
    let raf=0,last=0,elapsed=14,frame=0,paused=false;
    const palettes=[[[74,239,199],[153,69,240]],[[248,44,134],[92,51,216]],[[40,102,192],[114,198,126]]];
    function paint(){
      const w=sky.width,h=sky.height;
      ctx.fillStyle='#050507';ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation='screen';
      palettes.forEach((pair,j)=>{
        for(let x=-6;x<w+6;x+=5){
          const u=x/w,t=elapsed*.075,jiggle=Math.sin(u*41.3+j*2+t*.47)*.035;
          const base=h*(.52+j*.16+Math.sin(u*5.2+t+j*1.9)*.12+Math.sin(u*10.4-t*.6+j)*.035+Math.sin(scrollY/Math.max(1,innerHeight))*.035);
          const length=h*(.19+.12*(.5+.5*Math.sin(u*15+t*.6+j))+jiggle);
          const mix=.5+.5*Math.sin(u*3.7+t*.7+j),c=pair[0].map((v,i)=>Math.round(v*(1-mix)+pair[1][i]*mix));
          const streak=.62+.38*(.5+.5*Math.sin(x*.71+Math.sin(u*19+t)*3));
          const glow=ctx.createLinearGradient(0,base-length,0,base+12);
          const rgb=c.join(',');
          glow.addColorStop(0,`rgba(${rgb},0)`);glow.addColorStop(.33,`rgba(${rgb},${(.035*streak).toFixed(3)})`);
          glow.addColorStop(.76,`rgba(${rgb},${(.18*streak).toFixed(3)})`);glow.addColorStop(.94,`rgba(${rgb},${(.4*streak).toFixed(3)})`);glow.addColorStop(1,`rgba(${rgb},0)`);
          ctx.fillStyle=glow;ctx.fillRect(x,base-length,6,length+13);
        }
      });
      ctx.globalCompositeOperation='source-over';body.dataset.auroraFrame=String(++frame);
    }
    function size(){const scale=Math.min(1,900/innerWidth);sky.width=Math.round(innerWidth*scale);sky.height=Math.round(innerHeight*scale);paint();}
    function tick(now){if(paused)return;if(now-last>=33){elapsed+=last?Math.min((now-last)/1000,.1):0;last=now;paint();}raf=requestAnimationFrame(tick);}
    function update(){paused=reduced.matches||document.hidden||body.classList.contains('heading-static');cancelAnimationFrame(raf);last=0;body.dataset.auroraState=paused?'paused':'moving';body.dataset.auroraRenderer='canvas';body.style.setProperty('--ambient-play',paused?'paused':'running');if(paused)paint();else raf=requestAnimationFrame(tick);}
    const observer=new MutationObserver(update);observer.observe(body,{attributes:true,attributeFilter:['class']});
    reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);addEventListener('resize',size,{passive:true});addEventListener('scroll',()=>{if(paused)paint();},{passive:true});
    size();update();
  }
  if(!gl){canvasAurora();return;}
  const vertex='attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}';
  const fragment=`precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_scroll;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){return .53*noise(p)+.28*noise(p*2.03)+.13*noise(p*4.07);}
    vec3 curtain(vec2 uv,float seed,vec3 c1,vec3 c2){
      float t=u_time*.075;
      float bend=sin(uv.x*2.9+t+seed)*.23+sin(uv.x*6.1-t*.7+seed)*.075;
      float y=uv.y-(.09+seed*.19+bend);
      float fold=fbm(vec2(uv.x*5.+seed,t*.5))*1.1;
      float rib=noise(vec2(uv.x*36.+fold*5.,t*.5+seed));
      float core=exp(-abs(y)*19.);
      float tail=exp(-max(y,0.)*4.7)*smoothstep(-.11,.03,y);
      float intensity=(core*.64+tail*.41)*(.3+rib*.95);
      float drift=.5+.5*sin(uv.x*2.5+seed+t*.7);
      return mix(c1,c2,drift)*intensity;
    }
    void main(){
      vec2 st=gl_FragCoord.xy/u_resolution;
      vec2 uv=vec2((st.x-.5)*2.5,(st.y-.5)*1.7);
      uv.y+=sin(u_scroll*.7)*.095;
      uv.x+=sin(u_time*.04)*.045;
      vec3 col=vec3(.008,.007,.014);
      col+=curtain(uv,0.,vec3(.08,.72,.67),vec3(.39,.18,.92))*.88;
      col+=curtain(uv,1.55,vec3(.74,.035,.3),vec3(.38,.16,.65))*.71;
      col+=curtain(uv,-1.9,vec3(.1,.27,.65),vec3(.42,.72,.22))*.39;
      float vignette=1.-smoothstep(.13,.85,length((st-.5)*vec2(.9,.8)));
      col*=.48+vignette*.52;
      float grain=(hash(gl_FragCoord.xy+floor(u_time*5.))-.5)*.032;
      gl_FragColor=vec4(max(col+grain,vec3(.004)),1.);
    }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
  if(!vs||!fs){canvasAurora();return;}
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvasAurora();return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const resolution=gl.getUniformLocation(program,'u_resolution'),time=gl.getUniformLocation(program,'u_time'),scroll=gl.getUniformLocation(program,'u_scroll');
  let frame=0,last=0,elapsed=14,paused=false,raf=0,contextLost=false;
  function size(){
    const ratio=Math.min(devicePixelRatio||1,1.3),scale=Math.min(1,1600/(innerWidth*ratio));
    canvas.width=Math.round(innerWidth*ratio*scale);canvas.height=Math.round(innerHeight*ratio*scale);
    gl.viewport(0,0,canvas.width,canvas.height);draw();
  }
  function draw(){if(contextLost)return;gl.uniform2f(resolution,canvas.width,canvas.height);gl.uniform1f(time,elapsed);gl.uniform1f(scroll,scrollY/Math.max(1,innerHeight));gl.drawArrays(gl.TRIANGLES,0,6);body.dataset.auroraFrame=String(++frame);}
  function tick(now){
    if(paused||contextLost)return;
    if(now-last>=33){elapsed+=last?Math.min((now-last)/1000,.1):0;last=now;draw();}
    raf=requestAnimationFrame(tick);
  }
  function update(){
    paused=reduced.matches||document.hidden||body.classList.contains('heading-static');
    cancelAnimationFrame(raf);last=0;
    body.dataset.auroraState=paused?'paused':'moving';body.dataset.auroraRenderer='webgl';
    body.style.setProperty('--ambient-play',paused?'paused':'running');
    if(!paused)raf=requestAnimationFrame(tick);else draw();
  }
  const motionObserver=new MutationObserver(update);motionObserver.observe(body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
  addEventListener('resize',size,{passive:true});
  addEventListener('scroll',()=>{if(paused)draw();},{passive:true});
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();contextLost=true;cancelAnimationFrame(raf);motionObserver.disconnect();
    document.removeEventListener('visibilitychange',update);reduced.removeEventListener('change',update);removeEventListener('resize',size);
    canvasAurora();
  });
  size();update();
})();
