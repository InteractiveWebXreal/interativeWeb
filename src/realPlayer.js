import * as THREE from 'three'
import { LAYER } from './consts/enum';

export class RealPlayer {
    constructor(object) {
        this.group = new THREE.Object3D();

        let characterLight = new THREE.DirectionalLight(0xffffff, 0.1);
        characterLight.castShadow = true;
        console.log(characterLight.position)
    
        this.player = object;

        this.player.scale.multiplyScalar(0.02);
         this.player.position.x = 0;
         this.player.position.y = -1;
         this.player.position.z = 0.8;
       // this.player.rotateOnAxis(axis, -1);
        this.group.add(this.player);
        this.group.add(characterLight)
         // 크기 너무 커서 작게 조절
        this.isHavingBox = false;
        this.box = null;
    }
    getPosition() {
        return this.group.position;
    }

    move(value) {
        console.log("move")
        this.group.position.x += value.x; 
        this.group.position.y += value.y; 
        this.group.position.z += value.z; 
        if(this.box != null) {
            this.box.position.x += value.x; 
            this.box.position.y += value.y; 
            this.box.position.z += value.z; 
        }
    }

    getObject() {
        return this.group
    }

    tryHoldObject(box) {
        // 박스 이미 들고 있으면 다른 박스 못 옮기게 하기
        if(this.isHavingBox) {
            return false;
        }
        box.position.x = this.group.position.x + 0.5;
        box.position.y += 2.1;
        this.box = box;
        this.isHavingBox = true;
        return true;
    }

    tryPutDown(plane) {
        if(!this.isHavingBox)  {
            return;
        }
        let playerPosition = this.group.position.clone();
        playerPosition.y = plane.position.y

        if(plane.position.distanceTo(playerPosition) < 0.1 && plane.material.color.equals(this.box.material.color)) {

            this.box.position.x = plane.position.x;
            this.box.position.y = plane.position.y + 0.4;
            this.box.position.z = plane.position.z;
            this.player.box = null
            this.isHavingBox = false;
        }
    }
}