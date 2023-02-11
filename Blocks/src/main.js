import { cm1, cm2 } from './common';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { PreventDragClick } from './PreventDragClick';
import { Floor } from './Floor';
import { Block } from './Block';
import { Player } from './Player';

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true,
	alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene은 common.js에서 생성
cm1.scene.background = new THREE.Color(cm2.backgroundColor);

// Camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const camera2 = camera.clone();
//카메라 위치 세팅
camera.position.x = 3;
camera.position.y = 17;
camera.position.z = -10;

cm1.scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight(cm2.lightColor, 0.8);
cm1.scene.add(ambientLight);

//SpotLight를 각 모퉁이에 배치
const spotLightDistance = 50;
const spotLight1 = new THREE.SpotLight(cm2.lightColor, 1);
spotLight1.castShadow = true;
spotLight1.shadow.mapSize.width = 2048;
spotLight1.shadow.mapSize.height = 2048;
const spotLight2 = spotLight1.clone();
const spotLight3 = spotLight1.clone();
const spotLight4 = spotLight1.clone();
spotLight1.position.set(-spotLightDistance, spotLightDistance, spotLightDistance);
spotLight2.position.set(spotLightDistance, spotLightDistance, spotLightDistance);
spotLight3.position.set(-spotLightDistance, spotLightDistance, -spotLightDistance);
spotLight4.position.set(spotLightDistance, spotLightDistance, -spotLightDistance);
cm1.scene.add(spotLight1, spotLight2, spotLight3, spotLight4);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 물리 엔진
cm1.world.gravity.set(0, -10, 0);

const defaultContactMaterial = new CANNON.ContactMaterial(
	cm1.defaultMaterial,
	cm1.defaultMaterial,
	{
		friction: 0.3,
		restitution: 0.2
	}
);
const blockDefaultContactMaterial = new CANNON.ContactMaterial(
	cm1.blockMaterial,
	cm1.defaultMaterial,
	{
		//마찰은 1로!
		friction: 1,
		//튕기지 않게!
		restitution: 0
	}
);
const playerBlockContactMaterial = new CANNON.ContactMaterial(
	cm1.playerMaterial,
	cm1.blockMaterial,
	{
		friction: 1,
		restitution: 0
	}
);
cm1.world.defaultContactMaterial = defaultContactMaterial;
cm1.world.addContactMaterial(blockDefaultContactMaterial);
cm1.world.addContactMaterial(playerBlockContactMaterial);

// 물체 만들기 - 유리판 크기
const blockUnitSize = 1.5; 
// 유리판 개수
const numberOfBlock = 8; 
const objects = [];

// 바닥
/*
const floor = new Floor({
	name: 'floor'
});
*/
// 유리판
let blockTypeNumber = 0;
let blockTypes = [];
const blockZ = [];

for (let i = 0; i < numberOfBlock; i++) {
	//block의 z값 저장
	blockZ.push(-(i * blockUnitSize));
	//i * blockUnitSize * 2 - blockUnitSize * 9
}

for (let i = 0; i < numberOfBlock; i++) {
	blockTypeNumber = Math.round(Math.random());
	switch (blockTypeNumber) {
		case 0:
			blockTypes = ['normal', 'strong'];
			break;
		case 1:
			blockTypes = ['strong', 'normal'];
			break;
	}
	let block1 = new Block({
		step: 5*i,
		name: ` block-${ blockTypes[0]}`,
		x: -2.6,
		y: 10.5,
		z:  blockZ[i],
		type:  blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	let block2 = new Block({
		step: 5*i+1,
		name: ` block-${ blockTypes[1]}`,
		x: -1.3,
		y: 10.5,
		z: blockZ[i],
		type: blockTypes[1],
		cannonMaterial: cm1.blockMaterial,
	});
	let block3 = new Block({
		step: 5*i+2,
		name: ` block-${ blockTypes[1]}`,
		x: 0,
		y: 10.5,
		z: blockZ[i],
		type: blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	let block4 = new Block({
		step: 5*i+3,
		name: ` block-${ blockTypes[1]}`,
		x: 1.3,
		y: 10.5,
		z: blockZ[i],
		type: blockTypes[1],
		cannonMaterial: cm1.blockMaterial,
	});
	let block5 = new Block({
		step: 5*i+4,
		name: ` block-${ blockTypes[1]}`,
		x: 2.6,
		y: 10.5,
		z: blockZ[i],
		type: blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	objects.push(block1, block2, block3, block4, block5);
}

// 플레이어
const player = new Player({
	name: 'player',
	x: 0,
	y: 10.9,
	z: 0,
	rotationY: Math.PI,
	cannonMaterial: cm1.playerMaterial,
	mass: 3
});
objects.push(player);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function checkIntersects() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(cm1.scene.children);
	for (const item of intersects) {
		checkClickedObject(item.object);
		break;
	}
}

let jumping = false;
let onReplay = false;
//player 시작 block 값
let prev_steps = [2];
//drop될 block의 값
let drop_step = -1;
function checkClickedObject(mesh) {
	if (mesh.name.indexOf('block') >= 0) {
		
		console.log("block value");
		console.log("mesh.step" + mesh.step);
		console.log("cm2.step" + cm2.step);
		console.log("prev_step" + prev_steps[0]);
		
		if (prev_steps[0] + 5 === mesh.step || prev_steps[0] + 6 === mesh.step || prev_steps[0] + 4 === mesh.step) {
			//player.actions[2].stop();
			//player.actions[2].play();
			console.log(player)
			player.mesh.position.x = player.mesh.position.x+2;
			jumping = true;
			cm2.step++;

			prev_steps.push(mesh.step);
			drop_step = prev_steps.shift();

			setTimeout(() => {
				jumping = false;
			}, 100);

			gsap.to(
				player.cannonBody.position,
				{
					duration: 1,
					x: mesh.position.x,
					z: blockZ[cm2.step -1]
					//cm2.step - 1
				},
			);
			gsap.to(
				player.cannonBody.position,
				{
					duration: 0.4,
					y: 12
				}
			)
		}
		if (prev_steps[0] + 1 === mesh.step || prev_steps[0] - 1 === mesh.step) {
			//player.actions[2].stop();
			//player.actions[2].play();
			player.mesh.position.x = player.mesh.position.x+2;
			jumping = true;

			prev_steps.push(mesh.step);
			drop_step = prev_steps.shift();

			setTimeout(() => {
				jumping = false;
			}, 100);

			gsap.to(
				player.cannonBody.position,
				{
					duration: 1,
					x: mesh.position.x,
					z: blockZ[cm2.step -1]
					//cm2.step - 1
				},
			);
			gsap.to(
				player.cannonBody.position,
				{
					duration: 0.4,
					y: 12
				}
			)
		}
		if (prev_steps[0] - 5 === mesh.step || prev_steps[0] - 6 === mesh.step || prev_steps[0] - 4 === mesh.step) {
			//player.actions[2].stop();
			//player.actions[2].play();
			player.mesh.position.x = player.mesh.position.x+2;
			jumping = true;
			cm2.step--;

			prev_steps.push(mesh.step);
			drop_step = prev_steps.shift();

			setTimeout(() => {
				jumping = false;
			}, 100);

			gsap.to(
				player.cannonBody.position,
				{
					duration: 1,
					x: mesh.position.x,
					z: blockZ[cm2.step -1]
					//cm2.step - 1
				},
			);
			gsap.to(
				player.cannonBody.position,
				{
					duration: 0.4,
					y: 12
				}
			)
		}
	}
}


// 그리기
const clock = new THREE.Clock();

function draw() {
	const delta = clock.getDelta();

	if (cm1.mixer) cm1.mixer.update(delta);
	//시간차, 보정
	cm1.world.step(1/60, delta, 3);
	// 화면 주사율에 따라 다르게 처리
	let cannonStepTime = 1/60;
	if (delta < 0.012) cannonStepTime = 1/120;
	cm1.world.step(cannonStepTime, delta, 3);

	objects.forEach(item => {
		if (item.cannonBody) {
			if (item.name === 'player') {
				if (item.modelMesh) {
					//cannonBody의 위치를 Mesh가 따라가도록
					item.modelMesh.position.copy(item.cannonBody.position);
				}
				item.modelMesh.position.y += 0.15;
			} else {
				if(drop_step > -1)
					objects[drop_step].cannonBody.position.y -= 0.03;
				item.mesh.position.copy(item.cannonBody.position);			item.mesh.quaternion.copy(item.cannonBody.quaternion);

				if (item.modelMesh) {
					item.modelMesh.position.copy(item.cannonBody.position);
					item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
				}
			}
		}
	});

	controls.update();

	if (!onReplay) {
		renderer.render(cm1.scene, camera);
	} /*else {
		renderer.render(cm1.scene, camera2);
		camera2.position.x = player.cannonBody.position.x;
		camera2.position.z = player.cannonBody.position.z;
	}
*/
	renderer.setAnimationLoop(draw);
}

function setSize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(cm1.scene, camera);
}

// 이벤트
const preventDragClick = new PreventDragClick(canvas);
window.addEventListener('resize', setSize);
canvas.addEventListener('click', e => {
	if (preventDragClick.mouseMoved) return;
	//clientX 사용자가 실제로 클릭한 값의 좌표
	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
	//해당 함수 기능에 대한 체크 다시
	checkIntersects();
});

draw();
