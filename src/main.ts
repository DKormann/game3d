

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
    this.rspeed += direction * 0.001;
  }

  accelerate(amount:number = 0.002){
    this.speed += amount;
  }

  update(){

    this.rotation += this.rspeed;
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotation.z = this.rotation;
    this.rspeed = this.rspeed * 0.95;
    
    const dx = -Math.sin(this.mesh.rotation.z);
    const dy = Math.cos(this.mesh.rotation.z);

    this.mesh.position.x += dx * this.speed;
    this.mesh.position.y += dy * this.speed;
    this.speed = this.speed * 0.99;
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

function ground(nx:number, ny:number){
  for (let x = 0; x < nx; x++){
    for (let y = 0; y < ny; y++){

      const color = 0x55ff33 + (x + y) % 2 * 0x440000;

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, .1),
        new THREE.MeshBasicMaterial({ color: color }));
      cube.position.x = x;
      cube.position.y = y;
      cube.position.z = -1;
      scene.add(cube);
    }
  }
}


ground(20, 20);

const plane = addPlane();

camera.position.z = 10;

const keymap = new Map<string, boolean>();

document.addEventListener('keydown', (event) => {
    keymap.set(event.key, true);
});

document.addEventListener('keyup', (event) => {
    keymap.set(event.key, false);
});



const animate = function () {
  requestAnimationFrame(animate);

  if (keymap.get('a')){
    plane.steer(1);
  }
  if (keymap.get('d')){
    plane.steer(-1);
  }

  if (keymap.get('w')){
    plane.accelerate();
  }

  plane.update()

  camera.position.y = plane.mesh.position.y;
  camera.position.x = plane.mesh.position.x;

  renderer.render(scene, camera);
};

animate();

