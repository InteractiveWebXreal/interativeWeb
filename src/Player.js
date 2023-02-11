import { cm1 } from './common';
import {
	Mesh,
	AnimationMixer,
	BoxGeometry,
	MeshBasicMaterial
} from 'three';
import { Stuff } from './Stuff';
import {PointLight} from 'three'

export class Player extends Stuff {
	constructor(info) {
		super(info);

		this.width = 0.5;
		this.height = 0.5;
		this.depth = 0.5;
/*
		cm1.gltfLoader.load(
			'/models/ilbuni.glb',
			glb => {
				// shadow
				glb.scene.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});

				this.modelMesh = glb.scene.children[0];
				this.modelMesh.position.set(this.x, this.y, this.z);
				this.modelMesh.rotation.set(
					this.rotationX,
					this.rotationY,
					this.rotationZ
				);
				this.modelMesh.castShadow = true;
				cm1.scene.add(this.modelMesh);

				this.modelMesh.animations = glb.animations;
				cm1.mixer = new AnimationMixer(this.modelMesh);
				this.actions = [];
				this.actions[0] = cm1.mixer.clipAction(this.modelMesh.animations[0]); // default
				this.actions[1] = cm1.mixer.clipAction(this.modelMesh.animations[1]); // fall
				this.actions[2] = cm1.mixer.clipAction(this.modelMesh.animations[2]); // jump
				this.actions[2].repetitions = 1;
				
				this.actions[0].play();

				this.setCannonBody();
			}
		);
*/
		cm1.fbxLoader.load(
			'/models/0128_test.fbx',
			fbx => {
				// shadow
				fbx.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true;
					}

					if(child instanceof PointLight) {
						if(child.name === "Light" || child.name === "영역"){
							fbx.remove(child)
						}
						if(child.name === "태양") {
							child.intensity = 0
						}
					}
					
				});
				
				console.log(fbx);
				for (let i = 0; i < 2; i++){
					this.modelMesh = fbx.children[i];
					
					this.modelMesh.position.set(this.x, this.y=11.3, this.z);
					this.modelMesh.rotation.set(
						this.rotationX = 1.5,
						this.rotationY,
						this.rotationZ
					);
					
					this.modelMesh.castShadow = true;
					this.modelMesh.scale.x = this.modelMesh.scale.x * 0.006;
					this.modelMesh.scale.y = this.modelMesh.scale.y * 0.006;
					this.modelMesh.scale.z = this.modelMesh.scale.z * 0.006;
					
					cm1.scene.add(this.modelMesh);

					this.setCannonBody();
				}
				//
				
			}
		);
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.position.set(this.x, this.y, this.z);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		cm1.scene.add(this.mesh);
		
	}
}