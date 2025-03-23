

import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


// scene.background = new THREE.Color(0xffffff);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mat = new THREE.MeshBasicMaterial({ color: 0x0055ff });

function addgeometry(geometry:THREE.BufferGeometry, material= mat){

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}


class movableObject {

  speed:number;
  rspeed:number;
  rotation:number;
  mesh:THREE.Mesh;



  constructor(public newmesh:THREE.Mesh){
    this.speed = 0;
    this.rspeed = 0;
    this.rotation = 0;
    this.mesh = newmesh;
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

function addPlane(){
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

  return new movableObject(addgeometry(geometry));
}



camera.position.z = 10;
const keymap = new Map<string, boolean>();

document.addEventListener('keydown', (event) => {
    keymap.set(event.key, true);
});

document.addEventListener('keyup', (event) => {
    keymap.set(event.key, false);
});


function getcolor(x:number, y:number){
  const c = Math.floor(x*34.7 + y*73.63 * y) % 2;
  const b = 0x004aa
  return b + c * (0x448800 - b);
}



const plane = addPlane();


class RecursiveCube{

  children:(RecursiveCube|null)[];
  mesh:THREE.Mesh|null;

  constructor(){
    this.children = [null, null, null, null];
    this.mesh = null;
  }

  render(x:number, y:number, s:number){

    const r = (2 ** s);
    console.log(r);
    
    const k = 10;

    if (y + k + r * 2 < plane.mesh.position.y 
      || y - k > plane.mesh.position.y
      || x + k + r * 2 < plane.mesh.position.x 
      || x - k > plane.mesh.position.x){
      this.destroy(s);
      return;
    }

    if (s < 0){
      if (this.mesh == null){
        this.mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, .1),
          new THREE.MeshBasicMaterial({ color: getcolor(x, y) }));
        this.mesh.position.set(x, y, -1);
        scene.add(this.mesh);
      }
      return;
    }

    for (const dx of [0,1]){
      for (const dy of [0, 1]){
        const i = dx + dy * 2;
        if (this.children[i] == null)
          this.children[i] = new RecursiveCube();      
        this.children[i]!.render(x+r*dx, y + r * dy, s-1);
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

  cube.render(0, 0, 5);

  if (keymap.get('a')) plane.steer(1);
  if (keymap.get('d')) plane.steer(-1);
  if (keymap.get('w')) plane.accelerate();

  plane.update()

  camera.position.y = plane.mesh.position.y;
  camera.position.x = plane.mesh.position.x;

  renderer.render(scene, camera);
};

animate(0);
