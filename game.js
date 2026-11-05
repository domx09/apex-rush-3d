import * as THREE from 'three';

const root = document.getElementById('game-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b7c4);
scene.fog = new THREE.Fog(0x91b7c4, 95, 260);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 600);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.insertBefore(renderer.domElement, root.firstChild);

scene.add(new THREE.HemisphereLight(0xd9efff, 0x52604b, 2.0));
const sun = new THREE.DirectionalLight(0xfff2d5, 2.4);
sun.position.set(-45, 80, 35); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-100; sun.shadow.camera.right=100; sun.shadow.camera.top=100; sun.shadow.camera.bottom=-100;
scene.add(sun);

const mat = (color, roughness=.75, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const grassMat=mat(0x526b45), roadMat=mat(0x292e35), lineMat=mat(0xe8e5d8), curbRed=mat(0xb8463b), curbWhite=mat(0xe8e3d7);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(700,700),grassMat); ground.rotation.x=-Math.PI/2; ground.position.y=-.16; ground.receiveShadow=true; scene.add(ground);

// Oval circuit made from a ribbon mesh, with curbs and broken centre guide.
const rx=48, rz=29, roadWidth=13, N=240;
function pathAt(t, offset=0){const a=t*Math.PI*2;const x=rx*Math.cos(a),z=rz*Math.sin(a);const dx=-rx*Math.sin(a),dz=rz*Math.cos(a);const len=Math.hypot(dx,dz);return new THREE.Vector3(x+dz/len*offset,0,z-dx/len*offset);}
function ribbon(offset,width,y,material){const verts=[],indices=[];for(let i=0;i<=N;i++){const p=pathAt(i/N,offset);const q=pathAt(i/N,offset+width);verts.push(p.x,y,p.z,q.x,y,q.z);if(i<N){let a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;}
ribbon(0,roadWidth,.015,roadMat);
ribbon(-.7,.65,.04,curbRed);ribbon(roadWidth-.0,.65,.04,curbRed);
for(let i=0;i<48;i++){const t=i/48;const p=pathAt(t,roadWidth/2);const p2=pathAt(t+.006,roadWidth/2);const dash=new THREE.Mesh(new THREE.BoxGeometry(.22,.035,1.05),lineMat);dash.position.set(p.x,.055,p.z);dash.rotation.y=Math.atan2(p2.x-p.x,p2.z-p.z);scene.add(dash);}

// Start/finish stripe across the road.
const start=pathAt(0,roadWidth/2);const next=pathAt(.001,roadWidth/2);
const startLine=new THREE.Mesh(new THREE.BoxGeometry(roadWidth,.06,.8),lineMat);startLine.position.set(start.x,.08,start.z);startLine.rotation.y=Math.atan2(next.x-start.x,next.z-start.z);scene.add(startLine);

// Simple low-poly hills and pines make the circuit feel like an outdoor venue.
const hillMat=mat(0x718568), trunkMat=mat(0x554333), pineMat=mat(0x294b38);
for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const h=new THREE.Mesh(new THREE.ConeGeometry(12+Math.random()*9,9+Math.random()*12,7),hillMat);h.position.set(Math.cos(a)*105,-1,Math.sin(a)*82);h.scale.z=.8;scene.add(h);}
for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,r=68+Math.random()*85,x=Math.cos(a)*r,z=Math.sin(a)*r*.72;if(Math.abs(x)<58&&Math.abs(z)<40)continue;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,2,5),trunkMat);trunk.position.set(x,1,z);scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.3+Math.random(),4+Math.random()*2,6),pineMat);crown.position.set(x,3.6,z);scene.add(crown);}

// Car model: procedural body, glass, lights, wheels and brake lights.
function makeCar(color=0xe7e9ed){
 const group=new THREE.Group(), bodyMat=mat(color,.28,.65), glass= new THREE.MeshStandardMaterial({color:0x172b3c,roughness:.18,metalness:.4}), black=mat(0x11151b,.85), rubber=mat(0x090b0e,1), rim=mat(0x9da6ae,.25,.8);
 const body=new THREE.Mesh(new THREE.BoxGeometry(2.15,.68,4.35),bodyMat);body.position.y=.78;body.castShadow=true;group.add(body);
 const hood=new THREE.Mesh(new THREE.BoxGeometry(2.02,.18,1.1),bodyMat);hood.position.set(0,1.13,-1.35);group.add(hood);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.65,.72,1.95),glass);cabin.position.set(0,1.38,.25);cabin.castShadow=true;group.add(cabin);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(1.62,.12,1.65),bodyMat);roof.position.set(0,1.78,.27);group.add(roof);
 for(const x of [-.78,.78])for(const z of [-1.42,1.42]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.28,16),rubber);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.48,z);wheel.castShadow=true;group.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.295,12),rim);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);group.add(hub);}
 for(const x of [-.72,.72]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,.06),mat(0xf6f2d6,.2));lamp.position.set(x,.88,-2.19);group.add(lamp);const tail=new THREE.Mesh(new THREE.BoxGeometry(.4,.15,.06),mat(0xc32d24,.25));tail.position.set(x,.88,2.19);group.add(tail);}
 const spoiler=new THREE.Mesh(new THREE.BoxGeometry(2.05,.1,.25),black);spoiler.position.set(0,1.43,1.92);group.add(spoiler);
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(group);return group;
}
const player=makeCar(0xe4e8ed);
const rival=makeCar(0xe64c36);rival.scale.setScalar(.92);
let mode='race', running=false, paused=false, finished=false, elapsed=0, lap=1, lastProgress=0, cameraMode=0, speed=0, heading=0, lateral=0, offRoad=false;
const keys={},touch={left:false,right:false,accelerate:false,brake:false,handbrake:false};
let toastTimer=0, collisionCooldown=0;
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1700);}
function startSession(nextMode){mode=nextMode;running=true;paused=false;finished=false;elapsed=0;lap=1;lastProgress=0;speed=0;heading=0;lateral=0;const gridStart=pathAt(0,roadWidth/2);player.position.set(gridStart.x,0,gridStart.z);heading=Math.PI;player.rotation.y=heading;document.getElementById('menu').classList.add('hidden');document.getElementById('hud').classList.remove('hidden');document.getElementById('pause-panel').classList.add('hidden');document.getElementById('finish-panel').classList.add('hidden');document.getElementById('race-mode').textContent=mode==='race'?'CIRCUIT RACE':'FREE DRIVE';document.getElementById('lap-display').innerHTML=mode==='race'?'LAP 1 <i>/ 3</i>':'FREE DRIVE';toast(mode==='race'?'3 LAPS · GET TO THE FINISH':'FREE DRIVE · EXPLORE THE CIRCUIT');}
document.getElementById('start-race').onclick=()=>startSession('race');
document.getElementById('free-drive').onclick=()=>startSession('free');
document.getElementById('pause').onclick=()=>{if(!running)return;paused=true;document.getElementById('pause-panel').classList.remove('hidden');};
document.getElementById('resume').onclick=()=>{paused=false;document.getElementById('pause-panel').classList.add('hidden');};
document.getElementById('restart').onclick=()=>startSession(mode);
function backToMenu(){running=false;paused=false;document.getElementById('hud').classList.add('hidden');document.getElementById('pause-panel').classList.add('hidden');document.getElementById('finish-panel').classList.add('hidden');document.getElementById('menu').classList.remove('hidden');speed=0;}
document.getElementById('exit-menu').onclick=backToMenu;document.getElementById('finish-menu').onclick=backToMenu;document.getElementById('race-again').onclick=()=>startSession('race');
document.getElementById('camera').onclick=()=>{cameraMode=(cameraMode+1)%3;document.querySelector('#camera b').textContent=cameraMode+1;toast(['CHASE CAMERA','FRONT CAMERA','COCKPIT CAMERA'][cameraMode]);};
let soundOn=false;document.getElementById('sound-toggle').onclick=()=>{soundOn=!soundOn;document.getElementById('sound-toggle').style.color=soundOn?'#d6ff3f':'white';toast(soundOn?'SOUND ENABLED':'SOUND MUTED');};

// Keyboard + touch input.
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'&&running&&!paused)document.getElementById('pause').click();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-control]').forEach(btn=>{const name=btn.dataset.control;const down=e=>{e.preventDefault();touch[name]=true;};const up=e=>{e.preventDefault();touch[name]=false;};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up);});

// Track progress is measured by angle around the oval.
function nearestProgress(pos){let best=0,bestD=Infinity;for(let i=0;i<120;i++){const t=i/120,p=pathAt(t,roadWidth/2);const d=(p.x-pos.x)**2+(p.z-pos.z)**2;if(d<bestD){bestD=d;best=t;}}return {t:best,d:Math.sqrt(bestD)};}
function formatTime(t){const m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.floor((t%1)*1000);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;}
let rivalProgress=.13;
function finish(){finished=true;running=false;document.getElementById('hud').classList.add('hidden');document.getElementById('finish-panel').classList.remove('hidden');document.getElementById('result-time').textContent=formatTime(elapsed);}
function update(dt){
 if(!running||paused)return;
 elapsed+=dt;collisionCooldown=Math.max(0,collisionCooldown-dt);
 const forward=keys.w||keys.arrowup||touch.accelerate, reverse=keys.s||keys.arrowdown||touch.brake, left=keys.a||keys.arrowleft||touch.left, right=keys.d||keys.arrowright||touch.right, drift=keys[' ']||touch.handbrake;
 const accel=forward?24:0, braking=reverse?38:0;
 speed+=accel*dt;speed-=braking*dt;speed-=speed*dt*(drift?1.5:.72);speed=THREE.MathUtils.clamp(speed,-10,58);
 const steer=(left?1:0)-(right?1:0);
 const grip=drift?.62:1;
 heading+=steer*dt*(.55+Math.abs(speed)*.026)*grip*(speed>=0?1:-1);
 // Integrate car motion; car's local forward points toward negative Z.
 player.position.x-=Math.sin(heading)*speed*dt;
 player.position.z-=Math.cos(heading)*speed*dt;
 player.rotation.y=heading;
 const prog=nearestProgress(player.position);
 offRoad=prog.d>roadWidth*.5-1.5;
 if(offRoad){speed*=Math.max(0,1-1.6*dt);document.getElementById('status-text').textContent='OFF TRACK · FIND ASPHALT';}
 else document.getElementById('status-text').textContent=drift?'POWER SLIDE':speed>38?'FULL THROTTLE':'FIND YOUR LINE';
 // Gentle collision boundary response.
 if(prog.d>roadWidth*.5+5){speed*=.82;toast('TRACK LIMIT · SLOW DOWN');}
 // Lap crossing: progress wraps from final sector to start.
 const t=prog.t;if(lastProgress>.88&&t<.12&&speed>5){if(mode==='race'){lap++;if(lap>3){finish();return;}document.getElementById('lap-display').innerHTML=`LAP ${lap} <i>/ 3</i>`;toast(`LAP ${lap} · KEEP PUSHING`);}else toast('CLEAN LAP');}
 lastProgress=t;
 // Rival follows a slightly faster racing line.
 if(mode==='race'){rivalProgress=(rivalProgress+dt*.035)%1;const rp=pathAt(rivalProgress,roadWidth/2);const rn=pathAt(rivalProgress+.002,roadWidth/2);rival.position.set(rp.x,0,rp.z);rival.rotation.y=Math.atan2(-(rn.x-rp.x),-(rn.z-rp.z));const separation=player.position.distanceTo(rival.position);if(separation<3.4&&collisionCooldown<=0){speed*=.35;collisionCooldown=1.2;toast('CONTACT · SPEED REDUCED');}}
 const kmh=Math.round(Math.abs(speed)*3.6);document.getElementById('speed').textContent=String(kmh).padStart(3,'0');document.getElementById('speed-bar').style.width=Math.min(100,kmh/210*100)+'%';document.getElementById('rpm').textContent=String(Math.round(900+Math.abs(speed)*95)).padStart(4,'0');document.getElementById('gear').textContent=speed<1?'N':Math.min(6,Math.max(1,Math.ceil(Math.abs(speed)/9)));
 document.getElementById('timer').textContent=formatTime(elapsed);
}
const camTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3();
function updateCamera(dt){
 const forward=new THREE.Vector3(-Math.sin(heading),0,-Math.cos(heading));
 if(cameraMode===0){camTarget.copy(player.position).addScaledVector(forward,-10).add(new THREE.Vector3(0,5.3,0));lookTarget.copy(player.position).addScaledVector(forward,4).add(new THREE.Vector3(0,1.2,0));}
 else if(cameraMode===1){camTarget.copy(player.position).addScaledVector(forward,5).add(new THREE.Vector3(0,2.1,0));lookTarget.copy(player.position).addScaledVector(forward,18);}
 else{camTarget.copy(player.position).addScaledVector(forward,-.2).add(new THREE.Vector3(0,2.15,0));lookTarget.copy(player.position).addScaledVector(forward,12).add(new THREE.Vector3(0,1.8,0));}
 camera.position.lerp(camTarget,1-Math.exp(-dt*4.5));camera.lookAt(lookTarget);
}
let prev=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-prev)/1000,.04);prev=now;update(dt);updateCamera(dt);renderer.render(scene,camera);}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});
camera.position.set(0,12,18);camera.lookAt(0,0,0);
document.getElementById('loading').classList.add('done');
setTimeout(()=>document.getElementById('loading').remove(),500);
