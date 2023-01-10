
export class Player {
    constructor(object) {
        this.object = object;
         // 크기 너무 커서 작게 조절
        object.scale.multiplyScalar(0.03);
        this.isHavingBox = false;
    }

    getPosition() {
        return this.object.position;
    }

    move(value) {
        this.object.position.x += value.x; 
        this.object.position.y += value.y; 
        this.object.position.z += value.z; 
    }

    getObject() {
        return this.object;
    }

}