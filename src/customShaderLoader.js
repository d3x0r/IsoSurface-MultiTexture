
import  "./three.min.js"

import {Textures,on as TextureDone} from "./textureLoader.js"
import {TextureStack} from "./textureStack.canvas.js"
import {GeometryBuffer} from "./geometrybuffer.js"
import {GeometryMaterial} from "./geometrymaterial.texture.js"

import "./TrackballControls.js"

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
