
import  "./three.min.js"

import {Textures,on as TextureDone} from "./textureLoader.js"
import {TextureStack} from "./textureStack.canvas.js"
import {GeometryBuffer} from "./geometrybuffer.js"
import {GeometryMaterial} from "./geometrymaterial.texture.js"


const common = {
	stack : null
}

TextureDone( ()=>{
	common.stack = TextureStack();
	window.Textures = Textures;
	window.ttCommon = common;
	for( let texture of Textures ) common.stack.add( texture );
})


export {TextureStack,common }
//THREE.GridGeometryBuffer 
