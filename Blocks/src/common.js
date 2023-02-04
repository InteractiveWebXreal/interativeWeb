import {
	Scene,
	BoxGeometry,
	SphereGeometry,
	MeshPhongMaterial
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {
	World,
	Material
} from 'cannon-es';

export const cm1 = {
	scene: new Scene(),
	gltfLoader: new GLTFLoader(),
	mixer: undefined,

	// cannon
	world: new World(),
	defaultMaterial: new Material('default'),
	blockMaterial: new Material('block'),
	playerMaterial: new Material('player')
};

export const cm2 = {
	step: 1,
	mass: 0,
	backgroundColor: '#021F4B',
	lightColor: '#ffffff',
	lightOffColor: '#222',
	floorColor: '#000000',
	blockColor: '#115268'
};

export const geo = {
	floor: new BoxGeometry(200, 1, 300),
	block: new BoxGeometry(1.2, 0.6, 1.2)
};

export const mat = {
	floor: new MeshPhongMaterial({ color: cm2.floorColor }),
	block1: new MeshPhongMaterial({
		color: cm2.blockColor,
		transparent: true,
		opacity: 0.9
	}),
	block2: new MeshPhongMaterial({
		color: cm2.blockColor,
		transparent: true,
		opacity: 0.5
	})
};