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
import { TextGeometry } from '/node_modules/three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from '/node_modules/three/examples/jsm/loaders/FontLoader'
import { BLOOM_SCENE, ENTIRE_SCENE } from './consts/camera'
import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'


var ambientLight = new THREE.AmbientLight( 0x888888, 0.6 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;

directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// camera.lookAt(new THREE.Vector3(0, - 1, 0))
scene.add(camera)

const canvas = document.querySelector('canvas.webgl')
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// object map
let objects = [];

let player = null;
const raycasterFromCharacter = new THREE.Raycaster();

async function addCharacter() {
    const scale = 0.3
    let object = await loadModel(scene, "models/0128_test.fbx", scale)
    player = new Player(object);
    
    scene.add(player.getObject());
    raycasterFromCharacter.set(player.getPosition, new THREE.Vector3(-1, 0, -2))
}

addCharacter();

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

let blocks = [];
function makeAndAddBlock(color, xOffset) {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x += xOffset;

    blocks.push(cube);
    scene.add( cube );
    //cube.layers.enable(BLOOM_SCENE);
}

async function addSpecialBlock() {
    const scale = 0.005;
    let object = await loadModel(scene, "models/rabbit_0213.fbx", scale)
    object.position.x -= 3;
    scene.add(object)
}

addSpecialBlock();

makeAndAddBlock(0x00ff00, -1);
makeAndAddBlock(0xff00ff, 2);
makeAndAddBlock(0x0000ff, -3);

let blockDestinations = [];

function makeAndAddBlockDestination(color,  xOffset, zOffset) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = -0.4*Math.PI;
    plane.position.x +=xOffset;
    plane.position.y -= 1;
    plane.position.z += zOffset;

    let loader = new FontLoader();

    const textGeometry = new TextGeometry( '블록에 가까이 가서 스페이스를 눌러 블록을 바닥위에 놓으세요!', {
		size: 20,
		height: 5,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	})
    
    const fillMaterial = new THREE.MeshPhongMaterial({color});
    const text = new THREE.Mesh(geometry, fillMaterial);
    text.position.x += xOffset;
    text.position.y -= 1;
    text.position.z += zOffset;

    blockDestinations.push(plane);
    scene.add( plane );


}

makeAndAddBlockDestination(0x00ff00, -6, 0)

// temporary blocks

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
            //bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {}
    } ), 'baseTexture'
);

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );


const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    bloomComposer.renderToScreen = false;
    scene.traverse( darkenNonBloomed );
	//bloomComposer.render();
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

    raycasterFromCharacter.set(player.getPosition(), directionVector)
    let blockIntersections = raycasterFromCharacter.intersectObjects(blocks);
    let planeIntersections = raycasterFromCharacter.intersectObjects(blockDestinations);

    blockIntersections.forEach(intersection => {
        if(intersection.distance < MAX_DISTANCE_FOR_INTERSECT && event.code == "Space") {
            player.tryHoldObject(intersection.object)
        }
    })

    blockDestinations.forEach((blockDestination) => {
        console.log(event.code)
        if(event.code == "Space") {
            player.tryPutDown(blockDestination)
        }
    })
});

