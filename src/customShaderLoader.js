
import  "./three.js/three.min.js"
import "./three.js/TrackballControls.js"
import "./three.js/gameMouse.js"  // adds mouse to voxel world controller
import "./three.js/personalFill.js"  // adds pools, constants, and some matrix convenience methods

import {Textures,on as TextureDone} from "./textureLoader.js"
import {TextureStack} from "./textureStack.canvas.js"
import {GeometryBuffer} from "./geometrybuffer.js"
import {GeometryMaterial} from "./geometrymaterial.texture.js"


const common = {
	stack : null,
	cursorIcon : null
}

TextureDone( ()=>{
	common.stack = TextureStack();
	window.Textures = Textures;
	window.ttCommon = common;
	for( let image of Textures ) {
		console.log("?", image.width );
		if( image.width < 512 ) {
                        var texture = new THREE.Texture(image)
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.needsUpdate = true;
			common.cursorIcon = texture;
		}else 
			common.stack.add( image );
	}
	window.doInit();
})

import {createTestData} from "./testdata.js"

window.createTestData = createTestData;

export {TextureStack,common }
//THREE.GridGeometryBuffer 
