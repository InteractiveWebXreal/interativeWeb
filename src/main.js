import { cm1, cm2 } from './common';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { PreventDragClick } from './PreventDragClick';
import { Floor } from './Floor';
import { Block } from './Block';
import { Player } from './player';
import { loadModel } from './_modelLoader';
import { RealPlayer } from './_realPlayer'
import { LAYER } from './consts/enum';


const CAMERA_SPEED = 5; //해보면서 조정하자.
const yfinalpos=-300;
//let isfall=true;//임의로 테스트.

// Renderer
const canvas = document.querySelector('canvas.webgl');

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
	80,
	window.innerWidth / window.innerHeight,
	0.2,
	1000
);
const camera2 = camera.clone();
//카메라 위치 세팅
camera.position.x = 3;
camera.position.y = 8;
camera.position.z = -10;

cm1.scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight(cm2.lightColor, 0);
cm1.scene.add(ambientLight);

//SpotLight를 각 모퉁이에 배치
const spotLightDistance = 150;
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
		name: ` block-${ blockTypes[0] }`,
		x: -2.6,
		y: 5.5,
		z:  blockZ[i],
		type:  blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	let block2 = new Block({
		step: 5*i+1,
		name: ` block-${ blockTypes[1] }`,
		x: -1.3,
		y: 5.5,
		z: blockZ[i],
		type: blockTypes[1],
		cannonMaterial: cm1.blockMaterial,
	});
	let block3 = new Block({
		step: 5*i+2,
		name: ` block-${ blockTypes[1] }`,
		x: 0,
		y: 5.5,
		z: blockZ[i],
		type: blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	let block4 = new Block({
		step: 5*i+3,
		name: ` block-${ blockTypes[1]}`,
		x: 1.3,
		y: 5.5,
		z: blockZ[i],
		type: blockTypes[1],
		cannonMaterial: cm1.blockMaterial,
	});
	let block5 = new Block({
		step: 5*i+4,
		name: ` block-${ blockTypes[1]}`,
		x: 2.6,
		y: 5.5,
		z: blockZ[i],
		type: blockTypes[0],
		cannonMaterial: cm1.blockMaterial,
	});
	objects.push(block1, block2, block3, block4, block5);
}

// 플레이어
/*const player = new Player({
	name: 'player',
	x: 0,
	y: 10.9,
	z: 0,
	rotationY: Math.PI,
	cannonMaterial: cm1.playerMaterial,
	mass: 3
});
objects.push(player);
*/
let player = null;
// Raycaster
const raycaster = new THREE.Raycaster();

async function addCharacter() {
    const scale = 0.3
    let object = await loadModel("models/rabbit_0302.fbx", scale)
    player = new RealPlayer(object);
	
    
    cm1.scene.add(player.getObject());
    raycaster.set(player.getPosition, new THREE.Vector3(-6, 0, 0))

	//objects.push(player);
	


}

addCharacter();

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

async function draw() {
	const delta = clock.getDelta();

	if (cm1.mixer) cm1.mixer.update(delta);
	//시간차, 보정
	cm1.world.step(1/60, delta, 3);
	// 화면 주사율에 따라 다르게 처리
	let cannonStepTime = 1/60;
	if (delta < 0.012) cannonStepTime = 1/120;
	cm1.world.step(cannonStepTime, delta, 3);

	//await addCharacter();
	//console.log(player)
	if(player != null) {
    console.log("last one? position:", player.getPosition())
	console.log("complete?: ",complete)

	if(complete){
		fall(camera,player,controls)

	}



	}

	objects.forEach(item => {
		//console.log("foreach: ",item)
		if(item.name===RealPlayer){
			console.log("rp",RealPlayer.getPosition)
			console.log("rp",RealPlayer.getPosition)
			console.log("rp",RealPlayer.getPosition)
			console.log("rp",RealPlayer.getPosition)
			console.log("rp",RealPlayer.getPosition)
		}
		if(item.name==="RealPlayer"){
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
			console.log("rp!!!!!!!!!!!!",RealPlayer.getPosition)
		}


		
	
		if (item.cannonBody) {
			if (item === 'Player') {
				 console.log("hello!!")
				 console.log("hello!!")
				 console.log("hello!!")
				 console.log("hello!!")

				if (item.modelMesh) {
					//cannonBody의 위치를 Mesh가 따라가도록
					item.modelMesh.position.copy(item.cannonBody.position);
					fall(camera,item,controls)
				}
				//item.modelMesh.position.y += 0.15;
			} 
			
			else {

			///	if(complete){
					//읽을 수만 player.getPosition()
					//3차원 벡터로 받아와서 - 그 벡터.x는 .y는 .z는 getPosition().x
				//	player.getPosition().y-=3;
				//}
				
				drop_step = 5 * (click_num -1)+ 2;
				//console.log("prev-dropstep?",drop_step)
				if(drop_step > -1)//블록 5*10  떨어져야 할 블록
					objects[drop_step].cannonBody.position.y -= 0.03;
					//console.log("last one?:",objects[objects.length-1])
					//console.log(objects.length)
					//console.log(objects[objects.length-1])
					
				//	await addCharacter();
					//console.log("last one? position:", player.getPosition())

					//let objpos=objects[objects.length-1].getPosition
					//console.log("what is obj pos?",objpos)

					//fall(camera,objects[objects.length-1],controls)
				//	objects[-1].cannonBody.position.y -= 0.03;
				//objects[-1].position.y -= 0.03;
				//console.log("dropstep?",drop_step)

				item.mesh.position.copy(item.cannonBody.position);			
				item.mesh.quaternion.copy(item.cannonBody.quaternion);

				if (item.modelMesh) {
					item.modelMesh.position.copy(item.cannonBody.position);
					item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
				}
			}
			//fall(camera,item,controls)
			//console.log("item.cannonBody: ",item)
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
    renderer.render(scene, camera);
	}*/

	renderer.setAnimationLoop(draw);
}

function setSize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(cm1.scene, camera);
}


//fall function 

function fall(camera,target,controls) {

	console.log("target",target)

        
	if(target != null) {

		//카메라 position
		const origpos = new THREE.Vector3().copy(camera.position);

		//타겟 position
		//const targetpos = new THREE.Vector3().copy(target.modelMesh.position);
		const targetpos = new THREE.Vector3().copy(target.getPosition());
		console.log("orig",origpos,"targpos",targetpos)
		//const targetpos =target.getPosition();

		//-----------------------------------------------------------------------------------------------------------------------------
		
		//방향 벡터(x2-x1, y2-y1, z2-z1)를 구하고 normalize

		//타겟모델 - 카메라 : 방향벡터
		const dir = new THREE.Vector3(origpos.x - targetpos.x, origpos.y - targetpos.y, origpos.z - targetpos.z).normalize();
		console.log(dir)
	   
	  
		if(target.getPosition().y >yfinalpos) {

			//캐릭터 추락
			//이건 일단 좌로 이동할 때인데, 
		
			const newpos = new THREE.Vector3(
				targetpos.x  
				, targetpos.y +(-dir.y * CAMERA_SPEED)//모르겠음 추락시 방향벡터 어케 적용할지.
				, targetpos.z 
			);
			
			//카메라도 캐릭터 따라 추락

			const camnewpos = new THREE.Vector3(
				origpos.x  
				, origpos.y+(-dir.y * CAMERA_SPEED)//모르겠음 추락시 방향벡터 어케 적용할지.
				, origpos.z 
			);
			
			//타겟 지점 변경
			controls.target.set(newpos.x, newpos.y, newpos.z);//이거 때문에, 안나오는듯?
			target.getPosition().x=newpos.x;
			target.getPosition().y=newpos.y;
			target.getPosition().z=newpos.z;

			//카메라 위치 변경
			camera.position.set(camnewpos.x, camnewpos.y, camnewpos.z);
			console.log(target.getPosition())
			
		}
		
		//컨트롤 업데이트
		//controls.update();
		//카메라 업데이트
		camera.updateProjectionMatrix();
		
	}
	
}




// 이벤트
const preventDragClick = new PreventDragClick(canvas);
window.addEventListener('resize', setSize);
/*
canvas.addEventListener('click', e => {
	if (preventDragClick.mouseMoved) return;
	//clientX 사용자가 실제로 클릭한 값의 좌표
	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
	//해당 함수 기능에 대한 체크 다시
	checkIntersects();
});
*/
let click_num = 0;
let complete = false;
canvas.addEventListener("click",  function (event) {

	console.log(event);
    
    let directionVector = new THREE.Vector3(0, 0, 0);

	let x = 0;
	let y = 0;
	let z = -1.5;

	console.log(directionVector)
		
	click_num = click_num + 1;
	if(click_num >= 8){
		z = 0;
		complete = true;
	}
	console.log(click_num);

	directionVector.x = x;
	console.log("x" + x);
	console.log("y" + y);
	directionVector.y = y;
	directionVector.z = z;
	player.move(directionVector);


});

draw();
