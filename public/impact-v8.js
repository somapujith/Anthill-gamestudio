(() => {
  'use strict';
  // Only Rana's explicit click has sound. There is no music player or jingle.
  const body=document.body;
  let context,bufferJob,ticket=0;
  const sources=new Set();
  body.dataset.sound='on-request';
  function stop(){++ticket;for(const source of sources){try{source.stop();}catch(_){}}sources.clear();}
  function prepare(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    context??=new Audio({latencyHint:'interactive'});
    context.resume().catch(()=>{});
    bufferJob??=fetch('/assets/audio/gada-impact.mp3').then(r=>{if(!r.ok)throw new Error('Impact unavailable');return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).catch(()=>{bufferJob=null;return null;});
    return bufferJob;
  }
  document.addEventListener('anthill:smash-prepare',()=>{stop();prepare();});
  document.addEventListener('anthill:smash-hit',async()=>{
    const current=ticket,buffer=await prepare();
    if(!buffer||current!==ticket||document.hidden||context.state!=='running')return;
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.75;source.connect(gain);gain.connect(context.destination);
    sources.add(source);source.onended=()=>sources.delete(source);source.start();
    body.dataset.impactPlayCount=String(Number(body.dataset.impactPlayCount||0)+1);
  });
  document.addEventListener('anthill:story-enter',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
