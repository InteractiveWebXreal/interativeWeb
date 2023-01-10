import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

const loaders = {
    "obj": new OBJLoader(),
    "fbx":  new FBXLoader()
}

function getExtension(path) {
    let startIndexOfExtension = path.indexOf('.') + 1;
    return path.substring(startIndexOfExtension).toLowerCase();
}

export function addModel(scene, path, scale) {
    let extension = getExtension(path);
   
    let loader = loaders[extension]
    loader.load(
        // resource URL
        path,
        // called when resource is loaded
        function ( object ) { 
            object.scale.multiplyScalar(scale);
            scene.add( object );
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
}