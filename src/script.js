import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loadModel } from './modelLoader'
import { MAX_DISTANCE_FOR_INTERSECT, PLAYER_SPEED } from './consts/physicalQuantity'
import { Player } from './player'
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass} from "/node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import { BLOOM_SCENE, ENTIRE_SCENE } from './consts/camera'
import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'

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
    let object = await loadModel(scene, "models/stickman.OBJ")
    player = new Player(object);
    scene.add(player.getObject());
    raycasterFromCharacter.set(player.getPosition, new THREE.Vector3(-1, 0, 0))
}

addCharacter();

let blocks = [];

const renderScene = new RenderPass(scene, camera);

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1; //intensity of glow
bloomPass.radius = 0;

function makeAndAddBlock(color, xOffset) {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x += xOffset;

    blocks.push(cube);
    scene.add( cube );
    cube.layers.enable(BLOOM_SCENE);
}

makeAndAddBlock(0x00ff00, -1);
makeAndAddBlock(0xff00ff, 2);
makeAndAddBlock(0x0000ff, -3);

const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = -0.4*Math.PI;
plane.position.x -=6;
plane.position.y -= 1;
scene.add( plane );

// temporary blocks

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setClearColor(0x000000, 1)
renderer.setSize(sizes.width, sizes.height)

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const materials = {};
const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );

function darkenNonBloomed( obj ) {

    if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;

    }
}

function restoreMaterial( obj ) {

    if ( materials[ obj.uuid ] ) {

        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];

    }

}

const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {}
    } ), 'baseTexture'
);

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

/**
 * Animate
 */
const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    bloomComposer.renderToScreen = false;
    scene.traverse( darkenNonBloomed );
	bloomComposer.render();
	scene.traverse( restoreMaterial );
    finalComposer.render();

}

tick()

window.addEventListener("keydown",  function (event) {
    if(player == null || player == undefined) {
        return;
    }
    let directionVector = new THREE.Vector3(0, 0, 0);

    switch (event.code) {
        case "KeyA":
            directionVector.x = -1;
            break;
        case "KeyD":
            directionVector.x = 1;
            break;
        case "KeyW":
            directionVector.z = 1;
            break;
        case "KeyS":
            directionVector.z = -1;
            break;    
    }

    let distanceVector = directionVector.multiplyScalar(PLAYER_SPEED)
    player.move(distanceVector);

    console.log(player.getPosition())
    raycasterFromCharacter.set(player.getPosition(), directionVector)
    let intersections = raycasterFromCharacter.intersectObjects(blocks);


    intersections.forEach(intersection => {
     
        if(intersection.distance < MAX_DISTANCE_FOR_INTERSECT) {
            player.tryHoldObject(intersection.object)
        }
    })
});

