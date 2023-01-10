import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loadModel } from './modelLoader'
import { MAX_DISTANCE_FOR_INTERSECT, PLAYER_SPEED } from './consts/constVariable'
import { applyForce } from './physics'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const sizes = {
    width: 800,
    height: 600
}

/*
lights
*/
var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

var pointLight = new THREE.PointLight( 0xffffff, 0.8 );

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.add(pointLight);
camera.position.z = 3
// camera.lookAt(new THREE.Vector3(0, - 1, 0))
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// object map
let objects = [];
let player = null;
const raycasterFromCharacter = new THREE.Raycaster();

async function addCharacter() {
    player = await loadModel(scene, "models/stickman.OBJ");
    scene.add(player);
    // 크기 너무 커서 작게 조절
    player.scale.multiplyScalar(0.03);
    raycasterFromCharacter.set(player.position, new THREE.Vector3(-1, 0, 0))
    //raycaster.ray.at(MAX_DISTANCE_FOR_INTERSECT);
}

addCharacter();

let blocks = [];

// temporary blocks
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const cube = new THREE.Mesh( geometry, material );
cube.position.x -= 1;
blocks.push(cube);
scene.add( cube );
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setClearColor(0xffffff, 1)
renderer.setSize(sizes.width, sizes.height)

/**
 * Animate
 */
const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

window.addEventListener("keydown",  function (event) {
    if(player == null || player == undefined) {
        return;
    }
    let directionVector = new THREE.Vector3(0, 0, 0);

    switch (event.code) {
        case "KeyA":
            console.log("key AAa");
            //player.position.set(player.position.x - PLAYER_SPEED, player.position.y, player.position.z)
            player.position.x -= PLAYER_SPEED;
            directionVector.x = -1;
            break;
        case "KeyD":
            player.position.x += PLAYER_SPEED;
            directionVector.x = 1;
            break;
        case "KeyW":
            player.position.z += PLAYER_SPEED;
            directionVector.z = 1;
            break;
        case "KeyS":
            player.position.z -= PLAYER_SPEED;
            directionVector.z = -1;
            break;    
    }

    raycasterFromCharacter.set(player.position, directionVector)
    let intersections = raycasterFromCharacter.intersectObjects(blocks);

    let distanceVector = directionVector.multiplyScalar(PLAYER_SPEED)
    intersections.forEach(intersection => {
        if(intersection.distance < MAX_DISTANCE_FOR_INTERSECT) {
            applyForce(distanceVector, intersection.object)
        }
    
    })
});

