import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DirectionalLight, PointLight } from 'three';
import { LAYER } from './consts/enum';
import { on } from 'events';

const loaders = {
    "obj": new OBJLoader(),
    "fbx":  new FBXLoader()
}

function getExtension(path) {
    let startIndexOfExtension = path.indexOf('.') + 1;
    return path.substring(startIndexOfExtension).toLowerCase();
}

// 모델로딩이 api 불러오는 것처럼 비동기로 일어나서 async await 을 사용했습니다. 
export async function loadModel( path, scale, isCharacter) {
    let extension = getExtension(path);
   
    let loader = loaders[extension];

    return new Promise((resolve) => {
        loader.load(
        // resource URL
        path,
        // called when resource is loaded
        function ( object ) {
            object = object.clone(true);
            object.scale.setScalar(scale);
            object.position.x -= 2;
    
            
            object.traverse(function (child) {
                // 캐릭터 빛 있는 상태로 전달..부탁..
                
                if( child instanceof PointLight) {
                    //object.remove(child)
                    child.intensity = 0;
                }
              
                else if(child instanceof DirectionalLight) {
                    child.intensity = 0.9
               
                } else {

                    
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
            console.log(error);
            console.log( 'An error happened' );
    
        }
        );
    })
}