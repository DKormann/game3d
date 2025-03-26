

import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const infoscreen = document.createElement('div');
document.body.appendChild(infoscreen);
infoscreen.style.position = 'absolute';
infoscreen.style.top = '0';
infoscreen.style.left = '0';
infoscreen.style.color = 'white';
infoscreen.innerHTML = 'WASD to move, space to go down, a to turn left, d to turn right';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

function addgeometry(geometry:THREE.BufferGeometry, material= mat){
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}


class Plane {

  speed:number;
  rspeed:number;
  rotation:number;
  mesh:THREE.Mesh;
  z:number;

  constructor(){

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0,
      0.0, -0.5, 0.0,
      1.0, -1.0, 0.0,
      .0, 1.0, 0.0,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex([
      0, 1, 3,
      1, 2, 3,
    ]);
  
    this.speed = 0;
    this.rspeed = 0;
    this.rotation = 0;
    this.mesh = new THREE.Mesh(geometry, mat);
    this.z = 0;
    scene.add(this.mesh);
  }

  steer(direction:number){
    this.rspeed += direction * 0.01;
  }

  accelerate(amount:number = 0.01){
    this.speed += amount;
  }

  update(){

    this.rotation += this.rspeed;
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotation.z = this.rotation;
    this.rspeed = this.rspeed * 0.9;
    
    const dx = -Math.sin(this.mesh.rotation.z);
    const dy = Math.cos(this.mesh.rotation.z);

    this.mesh.position.x += dx * this.speed;
    this.mesh.position.y += dy * this.speed;
    this.speed = this.speed * 0.97;
  }

}


camera.position.z = 10;
const keymap = new Map<string, boolean>();

document.addEventListener('keydown', (event) => {

  keymap.set(event.key, true);
  if (event.key == ' ')
    plane.z -= 1;
});

document.addEventListener('keyup', (event) => {
    keymap.set(event.key, false);
});


function getrand(x:number, y:number, c:number){
  let k = 3;
  let r = (Math.floor((x * 100 + y + 34.5 + 3426) ** 2.3) % k) / (k-1);
  let rn = Math.min(c, 1-c);
  r = c + r * rn * 2 - rn;
  if (r < 0) throw new Error('r < 0: ' + r);
  if (r > 1) throw new Error('r > 1: ' + r);
  console.log(r);
  
  return r;
}


function color(t:number){
  t = Math.floor(t * 255);
  const a = 0x000001;
  const b = 0x010000;
  return a * t + b * (255-t);
}

const plane = new Plane();
plane.z = -2;

let c = 0.5;


class RecursiveCube{

  children:(RecursiveCube|null)[];
  mesh:THREE.Mesh|null;

  constructor(){
    this.children = [null, null, null, null];
    this.mesh = null;
  }

  render(x:number, y:number, s:number, c:number = 0.5){

    const r = (2 ** s);
    
    const k = 8;

    if (y + k + r * 2 < plane.mesh.position.y 
      || y - k > plane.mesh.position.y
      || x + k + r * 2 < plane.mesh.position.x
      || x - k > plane.mesh.position.x){
      this.destroy(s);
      return;
    }

    c = getrand(x, y, c);

    if (s < plane.z + 1 || c == 0){
      if (this.mesh == null){
        const sz = 2 ** (s + 1);
        this.mesh = new THREE.Mesh(
          new THREE.BoxGeometry(sz,sz, 1),
          new THREE.MeshBasicMaterial({ color: color(c) }));
        this.mesh.position.set(sz/2+ x, sz/2+y, -1);
        scene.add(this.mesh);
      }
      return;
    }else if (this.mesh){
      scene.remove(this.mesh);
      this.mesh = null;
    }

    for (const dx of [0,1]){
      for (const dy of [0, 1]){
        const i = dx + dy * 2;
        if (this.children[i] == null)
          this.children[i] = new RecursiveCube();      
        this.children[i]!.render(x+r*dx, y + r * dy, s-1, c);
      }
    }
    return;
  }

  destroy(n:number){    

    if (this.mesh){
      scene.remove(this.mesh);
      this.mesh = null;
    }

    this.children = this.children.map(c=>{
      if(c) c.destroy(n-1);
      return null
    })
  }

}

const cube = new RecursiveCube()
let lt = 0;

const animate = function (t:number) {
  requestAnimationFrame(animate);

  const dt = t - lt;
  if (dt < 1000 / 30) return 
  lt = t;

  cube.render(0, 0, 7);

  if (keymap.get('a')) plane.steer(1);
  if (keymap.get('d')) plane.steer(-1);
  if (keymap.get('w')) plane.accelerate();

  plane.update()

  camera.position.y = plane.mesh.position.y;
  camera.position.x = plane.mesh.position.x;

  renderer.render(scene, camera);

};

animate(0);

