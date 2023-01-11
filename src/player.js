import * as THREE from 'three'
import { MAX_DISTANCE_FOR_INTERSECT } from './consts/constVariable';
export class Player {
    constructor(object) {
        this.group = new THREE.Group();
        this.player = object;
        this.player.scale.multiplyScalar(0.03);
        this.group.add(this.player);
         // 크기 너무 커서 작게 조절
        this.isHavingBox = false;
    }

    getPosition() {
        return this.group.position;
    }

    move(value) {
        this.group.position.x += value.x; 
        this.group.position.y += value.y; 
        this.group.position.z += value.z; 
    }

    getObject() {
        return this.group
    }

    tryHoldObject(box) {
        // 박스 이미 들고 있으면 다른 박스 못 옮기게 하기
        if(this.isHavingBox) {
            return false;
        }

        box.position.x += (MAX_DISTANCE_FOR_INTERSECT + 0.6);
        box.position.z += 0.3;
        this.group.add(box);
        return true;


    }

}