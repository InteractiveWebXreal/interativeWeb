import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { PointLight } from 'three';

const loaders = {
    "obj": new OBJLoader(),
    "fbx":  new FBXLoader()
}

function getExtension(path) {
    let startIndexOfExtension = path.indexOf('.') + 1;
    return path.substring(startIndexOfExtension).toLowerCase();
}

// 모델로딩이 api 불러오는 것처럼 비동기로 일어나서 async await 을 사용했습니다. 
export async function loadModel(scene, path, scale) {
    let extension = getExtension(path);
   
    let loader = loaders[extension];

    return new Promise((resolve) => {
        loader.load(
        // resource URL
        path,
        // called when resource is loaded
        function ( object ) {
            object.scale.setScalar(scale);
            object.position.x -= 2;
    
            object.traverse(function (child) {
                console.log(child)
                if(child instanceof PointLight) {
                    if(child.name === "Light" || child.name === "영역") {
                 
                    object.remove(child)
                    }
                    if(child.name === "태양") {
                       child.intensity = 0
                        //child.intensity = 10
                    }
                }
               
            });
            resolve(object);
        },
        // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
    
        }
        );
    })
}