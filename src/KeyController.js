export class KeyController {
    constructor() {
        this.keys = [];
        
        window.addEventListener('keydown', e => {
            //example  : this.keys['KeyW'] = true;
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', e => {
            delete this.keys[e.code];
        });
    }
}