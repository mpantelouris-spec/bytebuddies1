import * as THREE from 'three';

/** Low-poly, code-native props: no network assets or per-prop lights. */
export function createPrimaryProp(kind, accent = 0x29a6d2) {
  const root = new THREE.Group();
  root.name = `ArenaProp:${kind}`;
  const materials = new Map();
  const material = (color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({color, roughness:.65, metalness:.08}));
    return materials.get(color);
  };
  const mesh = (geo, color, x=0,y=0,z=0) => {
    const m = new THREE.Mesh(geo, material(color));
    m.position.set(x,y,z); m.receiveShadow = true; root.add(m); return m;
  };
  const box = (w,h,d,c,x=0,y=h/2,z=0) => mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
  const ball = (r,c,x=0,y=r,z=0) => mesh(new THREE.SphereGeometry(r,12,8),c,x,y,z);
  const cyl = (r,h,c,x=0,y=h/2,z=0) => mesh(new THREE.CylinderGeometry(r,r,h,12),c,x,y,z);
  const ring = (r,c,x=0,y=r+.3,z=0) => mesh(new THREE.TorusGeometry(r,.2,6,24),c,x,y,z);
  const roof = (c=accent,y=3) => { const m=mesh(new THREE.ConeGeometry(2.4,1.7,4),c,0,y,0);m.rotation.y=Math.PI/4;return m; };
  const table = () => { box(4,.35,2.6,0xe6b66e,0,2);[-1.6,1.6].forEach(x=>[-.9,.9].forEach(z=>box(.22,1.85,.22,0x24465d,x,.93,z))); };
  const arch = (color=accent) => {[-2.8,2.8].forEach(x=>box(.55,4,.7,color,x));box(6.2,.6,.7,color,0,4);};
  const leaves = (c=0x36a766) => {cyl(.3,2.5,0x906342);ball(1.5,c,0,3);};
  const floor = (color=accent) => box(4,.15,3,color);
  switch(kind) {
    case 'greenhouse':
    case 'cabin':
    case 'shop':
      box(3.4,2.5,2.8,kind==='greenhouse'?0xb9ede4:0xf2d6a5);roof();
      box(.8,1.7,.1,0x24465d,0,.85,1.46);
      [-1.05,1.05].forEach(x=>box(.65,.65,.12,0x81d7ed,x,1.65,1.46));break;
    case 'hedge': box(4,1.6,1.2,0x368956);ball(.8,0x4aa968,-1,1.5);ball(.8,0x4aa968,1,1.5);break;
    case 'flower':
      cyl(.8,.7,0xc87546);cyl(.12,2,0x328750,0,1.4);
      for(let i=0;i<6;i++) ball(.35,accent,Math.cos(i*Math.PI/3)*.5,2.5+Math.sin(i*Math.PI/3)*.5);
      ball(.35,0xffd04f,0,2.5,.12);break;
    case 'desk': table();box(.9,.15,.65,accent,.8,2.28);break;
    case 'shelf':
      [-1.8,1.8].forEach(x=>box(.2,3.6,1.2,0x906342,x));
      [0,1.2,2.4,3.6].forEach(y=>box(3.8,.16,1.3,0xe6b66e,0,y+.1));
      [-1.2,0,1.2].forEach((x,i)=>box(.6,.8,.8,[accent,0xffbd4a,0x59bc92][i],x,1.7));break;
    case 'books': for(let i=0;i<5;i++){const m=box(2,.3,1.3,i%2?accent:0xffbd4a,0,.15+i*.3);m.rotation.y=i*.13;}break;
    case 'umbrella': cyl(.1,3,0xf5eee1);mesh(new THREE.ConeGeometry(2,.8,12),accent,0,3.2);floor(0xffd06b);break;
    case 'shell': {const m=ball(1,0xffdfc3);m.scale.set(1,.4,.7);break;}
    case 'bin': cyl(.8,1.8,0x258aca);ring(.65,0xf6f8ed,0,1.1,.81);box(1.8,.2,1.8,0x1b4565,0,1.9);break;
    case 'traffic': cyl(.12,2.8,0x234157);box(.9,2,.55,0x234157,0,3.2);[0xf07956,0xffd04f,0x59bc92].forEach((c,i)=>ball(.22,c,0,3.8-i*.6,.35));break;
    case 'crossing': for(let i=0;i<5;i++)box(.45,.05,2,0xffffff,-1.4+i*.7);break;
    case 'bridge':
    case 'beam': box(2.6,.5,7,0xdeaf76,0,.35);[-1.5,1.5].forEach(x=>{box(.16,.2,7,accent,x,1.5);[-3,0,3].forEach(z=>box(.18,1.5,.18,accent,x,.75,z));});break;
    case 'hoop': ring(2.2,accent,0,3);[-1,1].forEach(x=>cyl(.12,1,0xffffff,x));break;
    case 'cone':mesh(new THREE.ConeGeometry(.7,1.7,12),0xf29942,0,.85);box(1.6,.12,1.6,0xffffff);break;
    case 'solar': {cyl(.15,1.5,0xe8eff4);const panel=box(4,.14,2.8,0x24558a,0,1.9);panel.rotation.x=.3;for(let i=0;i<4;i++)box(.04,.08,2.8,0x9cd6ec,-1.5+i,2.08);break;}
    case 'beacon': cyl(.4,.4,0x24465d);cyl(.12,2.5,0xffffff);ball(.35,0xffd04f,0,2.7);break;
    case 'tunnel': for(let i=0;i<4;i++)ring(3,accent,0,2.8,-i*1.3);break;
    case 'pine': cyl(.2,2,0x906342);[1.5,2.5,3.4].forEach((y,i)=>mesh(new THREE.ConeGeometry(1.5-i*.3,2,8),0x31816b,0,y));break;
    case 'crystal': [-1,0,1].forEach((x,i)=>mesh(new THREE.OctahedronGeometry(.8),i===1?0x68dbe9:accent,x,1+(i%2),0).scale.y=2);break;
    case 'exhibit': box(3,.6,2,0xe6eaf0);for(let i=0;i<5;i++)ring(.65,0xf6dfb4,-1.2+i*.6,1.5);ball(.65,0xf6dfb4,1.7,2.1);break;
    case 'frame':box(3,3,.25,accent,0,1.8);box(2.5,2.5,.1,0xc5e3eb,0,1.8,.18);break;
    case 'planet': cyl(.5,.6,0x24465d);ball(1.3,accent,0,2);ring(1.9,0xffd04f,0,2).rotation.x=.6;break;
    case 'dome':mesh(new THREE.SphereGeometry(2.4,16,10,0,Math.PI*2,0,Math.PI/2),0xcce9ed,0,0);box(1.4,1.6,1,0x24558a,0,.8,2);break;
    case 'crater':ring(2,0x889eac,0,.12).rotation.x=-Math.PI/2;break;
    case 'satellite':box(1.4,2,1.4,0xf5eee1,0,2);[-1,1].forEach(x=>box(3,.15,2,0x24558a,x*2.4,2));ring(.8,accent,0,3.5).rotation.x=.5;break;
    case 'arch': arch();break;
    case 'flag': cyl(.1,3,0xf5eee1);box(1.4,.8,.08,accent,.7,2.5);break;
    case 'ramp': {const m=box(3,.4,5,accent,0,.65);m.rotation.x=.2;break;}
    case 'cloud':[-1,0,1].forEach((x,i)=>ball(1.2,0xffffff,x,2+(i%2)*.4));break;
    case 'balloon':ball(2,accent,0,5);box(1.5,.8,1.3,0xbb864d,0,1.3);[-.6,.6].forEach(x=>cyl(.04,2.7,0xffffff,x,2.7));break;
    case 'parcel':box(1.6,1.2,1.4,0xddb174);box(.2,1.24,1.43,accent);break;
    case 'island':mesh(new THREE.ConeGeometry(3,2.2,8),0xaa7e52,0,-1).rotation.x=Math.PI;box(5,.3,4,0x63b773);leaves();break;
    case 'tree': leaves();break;
    case 'camera':cyl(.12,2,0x24465d);box(1.5,1,1,0x24465d,0,2.2);ring(.4,accent,0,2.2,.6);break;
    case 'fan':cyl(.15,2,0x24465d);ring(1.6,accent,0,3);for(let i=0;i<3;i++){const b=box(.5,2.4,.2,0xe6eff4,0,3);b.rotation.z=i*Math.PI/3;}break;
    case 'lantern':arch(0x24465d);cyl(.8,1.2,0xffd04f,0,2.6);break;
    case 'stage':cyl(3,.6,accent);[-2.5,2.5].forEach(x=>{cyl(.12,4,0x24465d,x);ball(.4,0xffd04f,x,4);});break;
    case 'bell':mesh(new THREE.ConeGeometry(.85,1.5,12),0xffd04f,0,1.5);ball(.2,0x24465d,0,.7);box(3,.2,1,accent);break;
    case 'mat': floor();break;
    case 'tile':for(let x=0;x<3;x++)for(let z=0;z<3;z++)box(.9,.12,.9,(x+z)%2?accent:0xffffff,x-1,.08,z-1);break;
    case 'teddy':ball(.9,0xd4a575,0,1.1);ball(.65,0xd4a575,0,2.2);[-1,1].forEach(x=>{ball(.3,0xc38d5e,x*.5,2.7);ball(.35,0xc38d5e,x*.9,1.3);ball(.35,0xc38d5e,x*.5,.3);ball(.08,0x24465d,x*.23,2.3,.6);});break;
    case 'stone':ball(1.1,0x8faaa8).scale.set(1.3,.4,1);break;
    case 'reeds':
    case 'kelp':for(let i=0;i<5;i++)box(.2,2+i*.35,.2,0x328750,(i-2)*.4);break;
    case 'hurdle':arch();root.scale.set(.7,.4,.7);break;
    case 'coral':for(let i=0;i<5;i++){cyl(.25,1.2+i*.45,accent,(i-2)*.5);ball(.4,accent,(i-2)*.5,1.2+i*.45);}break;
    case 'fish':ball(.8,accent,0,2).scale.set(1.5,.65,.5);mesh(new THREE.ConeGeometry(.6,1,3),0xffd04f,-1.3,2).rotation.z=Math.PI/2;break;
    case 'turtle':ball(1.1,0x479b73,0,.6).scale.y=.5;ball(.4,0x8fcb77,1.2,.6);[-1,1].forEach(x=>[-1,1].forEach(z=>ball(.3,0x8fcb77,x*.7,.3,z*.7)));break;
    case 'boat':box(4,.8,2,0x966b47);box(3,.25,1.7,0xd8b887,0,.95);cyl(.1,3,0xe9dfcd);break;
    case 'chest':box(2,1.2,1.3,0xbb864d);box(.3,1.25,1.35,0xffd04f);break;
    case 'vent':cyl(1.1,1.2,0x547781);[1,2,3].forEach(y=>ring(.35,0x9be8ec,.2,y));break;
    case 'tray':box(3,.15,2,0xe6b66e);[-1.5,1.5].forEach(x=>box(.15,.4,2,accent,x));[-1,1].forEach(z=>box(3,.4,.15,accent,0,.2,z));break;
    case 'tower':for(let i=0;i<4;i++)box(2-i*.3,.7,2-i*.3,i%2?accent:0xffd04f,0,.35+i*.7);break;
    case 'canvas':table();box(3,.06,2,0xffffff,0,2.22);ring(.6,accent,0,2.26).rotation.x=-Math.PI/2;break;
    case 'pencil':cyl(.3,3,accent);mesh(new THREE.ConeGeometry(.3,.7,8),0xd8b887,0,3.35);break;
    case 'cake':cyl(1.5,1,0xd4a575);cyl(1.55,.25,0xf5c3d7,0,1.1);[0,1,2,3,4].forEach(i=>ball(.15,accent,Math.cos(i)*.8,1.35,Math.sin(i)*.8));break;
    case 'marble':ball(.7,accent);break;
    case 'car':box(2.6,.8,1.5,accent,0,.8);box(1.3,.7,1.3,0xb1e5f1,0,1.5);[-1,1].forEach(x=>[-1,1].forEach(z=>ball(.4,0x24465d,x*.8,.4,z*.8)));break;
    case 'bench':box(4,.2,1.4,0xe6b66e,0,1);box(4,1,.2,0xe6b66e,0,1.6,-.7);[-1.5,1.5].forEach(x=>box(.2,1,.9,0x24465d,x));break;
    case 'sink':box(3,1.8,1.5,0xffffff);ring(.8,0x8faaa8,0,1.85).rotation.x=-Math.PI/2;cyl(.12,1,0x7895a5,0,2.2,-.5);break;
    case 'button':cyl(1,.4,0x24465d);cyl(.75,.35,accent,0,.6);break;
    case 'hydrant':cyl(.5,1.7,accent);ball(.55,accent,0,1.7);box(1.5,.35,.4,0xffffff,0,1.1);break;
    case 'paint':cyl(.7,1.1,accent);ring(.6,0xffffff,0,1.2).rotation.x=-Math.PI/2;break;
    case 'door':arch();box(4,3.7,.2,0xb1e5f1,0,1.85);ball(.15,0xffd04f,1,1.7,.25);break;
    case 'goal':arch(0xffffff);for(let i=-2;i<=2;i++)box(.04,4,.04,0xc4e6df,i,2,-1);break;
    case 'target':ring(1.5,accent,0,2);ring(.8,0xffd04f,0,2);break;
    case 'ball':ball(.8,0xffffff);ring(.79,0x24465d,0,.8);break;
    default:box(1.7,1.7,1.7,accent);
  }
  return root;
}
