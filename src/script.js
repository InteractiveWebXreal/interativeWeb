import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loadModel } from './modelLoader'
import { KeyController } from './KeyController'

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

async function addCharacter() {
    const character = await loadModel(scene, "models/stickman.OBJ")
    scene.add(character);
    character.scale.multiplyScalar(0.03);
    console.log(character)
}

addCharacter();
// temporary cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const cube = new THREE.Mesh( geometry, material );
cube.position.x -= 1;
scene.add( cube );
const keyController = new KeyController();

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
    characterMove();
}

tick()


function characterMove() {
    
    if(keyController.keys['keyA']) {
        
        /*const newPos = new THREE.Vector3(
            targetpos.x + (-dir.z * CAMERA_SPEED)
            , targetpos.y
            , targetpos.z
        );*/

    }
}