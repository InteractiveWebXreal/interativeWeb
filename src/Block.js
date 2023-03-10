import { cm1, geo, mat } from './common';
import { Mesh } from 'three';
import { Stuff } from './Stuff';

export class Block extends Stuff {
	constructor(info) {
		super(info);

		this.type = info.type;
		this.step = info.step;
		this.mass = info.mass || 0;

		this.geometry = geo.block;
		switch (this.type) {
			case 'normal':
				this.material = mat.block1;
				break; 
			case 'strong':
				this.material = mat.block2;
				break;
		}

		this.width = this.geometry.parameters.width;
		this.height = this.geometry.parameters.height;
		this.depth = this.geometry.parameters.depth;

		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.position.set(this.x, this.y, this.z);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.mesh.name = this.name;
		this.mesh.step = this.step;
		this.mesh.type = this.type;
		cm1.scene.add(this.mesh);

		this.setCannonBody();		
	}
}