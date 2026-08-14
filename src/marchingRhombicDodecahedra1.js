// The MIT License (MIT)
//
// Copyright (c) 2020 d3x0r
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Marching Tetrahedra in Javascript
 *
 * Based on Unique Research
 *  
 * (Several bug fixes were made to deal with oriented faces)
 *
 * Javascript port by d3x0r
 */


const dirDeltas = [];
const dirDirs = [[],[]];

const dirs =   { /* even Y*/
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:1,z:0},
		ur : { x:1, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:1, y:-1,z:0 },
		ll : { x:0, y:-1,z:0 },

		fd : { x:0, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},

		bu : { x:0, y:0,z:-1},
		bl : { x:0, y:-1,z:-1},
		br : { x:1, y:-1,z:-1},
	}
// indexed by [zmod][ymod]  (ymod is also yodd)
const dataDirOffsets = [

[{
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:1,z:0},
		ur : { x:1, y:1,z:0 },

		right:{x:1,y:0,z:0},
		lr : { x:1, y:-1,z:0 },
		ll : { x:0, y:-1,z:0 },

		/* checked */
		fd : { x:0, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},

		bu : { x:0, y:0,z:-1},
		bl : { x:0, y:-1,z:-1},
		br : { x:1, y:-1,z:-1},
	
	}, {
		left: {x:-1,y:0,z:0},
		ul : { x:-1, y:1,z:0},
		ur : { x:0, y:1,z:0 },

		right:{x:1,y:0,z:0},
		lr : { x:0, y:-1 ,z:0},
		ll : { x:-1, y:-1 ,z:0},

		/* checked */
		fd : { x:-1, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},

		bu : { x:0, y:0,z:-1},
		bl : { x:-1, y:-1,z:-1},
		br : { x:0, y:-1,z:-1},
	}
],
[{
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:1,z:0},
		ur : { x:1, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:1, y:-1,z:0 },
		ll : { x:0, y:-1,z:0 },

		/* checked */
		fd : { x:1, y:-1,z:1},
		fl : { x:0, y:0,z:1},
		fr : { x:1, y:0,z:1},

		bu : { x:1, y:1,z:-1},
		bl : { x:0, y:0,z:-1},
		br : { x:1, y:0,z:-1},
	
	}, {
		left: {x:-1,y:0,z:0},
		ul : { x:-1, y:1,z:0},
		ur : { x:0, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:0, y:-1 ,z:0},
		ll : { x:-1, y:-1 ,z:0},
		
		/* checked */
		fd : { x:0, y:-1,z:1},
		fl : { x:0, y:0,z:1},
		fr : { x:1, y:0,z:1},

		bu : { x:0, y:1,z:-1},
		bl : { x:0, y:0,z:-1},
		br : { x:1, y:0,z:-1},
	}
],
[{
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:1,z:0},
		ur : { x:1, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:1, y:-1,z:0 },
		ll : { x:0, y:-1,z:0 },
		/* checked */
		fd : { x:0, y:0,z:1},
		fl : { x:0, y:1,z:1},
		fr : { x:1, y:1,z:1},

		bu : { x:0, y:1,z:-1},
		bl : { x:-1, y:0,z:-1},
		br : { x:0, y:0,z:-1},
	
	}, {
		left: {x:-1,y:0,z:0},
		ul : { x:-1, y:1,z:0},
		ur : { x:0, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:0, y:-1 ,z:0},
		ll : { x:-1, y:-1 ,z:0},

		
		fd : { x:0, y:0,z:1},
		fl : { x:-1, y:1,z:1},
		fr : { x:0, y:1,z:1},

		bu : { x:-1, y:1,z:-1},
		bl : { x:-1, y:0,z:-1},
		br : { x:0, y:0,z:-1},
	}
]


];

const dirkeys = ["left","ul","ur","right","lr","ll" // 0,1,2,3,4,5
				,"fd","fr","fl"  // 6,7,8
				,"bu","bl","br"]; // 9,10,11

for( let o = 0; o < 2; o++ ) for( let n = 0; n < 12; n++ ) {
		const r= toReal( dirs[dirkeys[n]].x, dirs[dirkeys[n]].y, dirs[dirkeys[n]].z );
		dirDirs[o].push( [r.x,r.y,r.z] );
	}

for( let m = 0; m < 3; m++ ) {
	dirDeltas.push( [] );
	for( let o = 0; o < 2; o++ )  {
		dirDeltas[m].push([]);
		for( let n = 0; n < 12; n++ ) {
			dirDeltas[m][o].push( {x:dataDirOffsets[m][o][dirkeys[n]].x
								, y:dataDirOffsets[m][o][dirkeys[n]].y
								, z:dataDirOffsets[m][o][dirkeys[n]].z } );
		}
	}
}



const groupDirs =   [] /* even Y*/

// these are the 14 meta vertices used to 
// form the faces of the rhombic dodecahedron
// 3 point groups
const _3pointGroups = [ [0,1,8]  // l,ul,fl
							, [ 1, 2, 9] // ul, ur, bu
							, [ 2, 3, 7] // ur, r, fr
							, [ 3, 4, 11] // r, lr, br
							, [ 4, 5, 6] // lr, ll, fd
							, [ 5, 0, 10 ] // ll, l, bl
							, [ 6, 7, 8 ]   // fd, fr, fl
							, [ 9, 10, 11]  // bu, bl, br
							];
const _4pointGroups = [ [ 0, 1, 10, 9 ] // l, ul, bl, bd
							, [ 1, 2, 7, 8 ] // ul, ur, fr, fl
							, [ 2, 3, 9, 11 ] // ur, r, bu, br
							, [ 3, 4, 6, 7 ] // r, lr fd, fr 
							, [ 4, 5, 10, 11 ] // lr, ll, bl, br
							, [ 5, 0, 8, 6 ]  // ll, l, fl, fd
							] ;
const sqrt3_2 = Math.sqrt(3);
for( let p = 0; p < _3pointGroups.length; p++ ) {
	const v = {x:0,y:0,z:0};
	for( let d = 0; d < 3; d++ ) {
		v.x += dirDirs[0][ _3pointGroups[p][d] ][0];
		v.y += dirDirs[0][ _3pointGroups[p][d] ][1];
		v.z += dirDirs[0][ _3pointGroups[p][d] ][2];
	}
	const vsq = v.x*v.x + v.y*v.y + v.z*v.z;
	v.x = v.x /  Math.sqrt(vsq)*sqrt3_2;
	v.y = v.y /  Math.sqrt(vsq)*sqrt3_2;
	v.z = v.z /  Math.sqrt(vsq)*sqrt3_2;
	groupDirs.push( v );
}

for( let p = 0; p < _4pointGroups.length; p++ ) {
	const v = {x:0,y:0,z:0};
	for( let d = 0; d < 4; d++ ) {
		v.x += dirDirs[0][ _4pointGroups[p][d] ][0];
		v.y += dirDirs[0][ _4pointGroups[p][d] ][1];
		v.z += dirDirs[0][ _4pointGroups[p][d] ][2];
	}
	const vsq = v.x*v.x + v.y*v.y + v.z*v.z;
	v.x = v.x /  Math.sqrt(vsq);
	v.y = v.y /  Math.sqrt(vsq);
	v.z = v.z /  Math.sqrt(vsq);
	groupDirs.push( v );
}


const line_normals_index = [ 
							  [ [ 3, 0 ], [ 4, 5], [ 3, 5], [4, 0] ]
							, [ [ 3, 1 ], [ 4, 1], [ 3, 0], [4, 0] ]
							, [ [ 3, 2 ], [ 4, 1], [ 3, 1], [4, 2] ]
							, [ [ 3, 3 ], [ 4, 3], [ 3, 2], [4, 2] ]
							, [ [ 3, 4 ], [ 4, 3], [ 3, 3], [4, 4] ]
							, [ [ 3, 5 ], [ 4, 5], [ 3, 4], [4, 4] ]

							, [ [ 3, 6 ], [4,3], [3, 4], [4, 5] ]
							, [ [ 3, 6 ], [4,1], [3, 2], [4, 3] ] 
							, [ [ 3, 6 ], [4,5], [3, 0], [ 4, 1 ] ]
							, [ [ 3, 7 ], [4,2], [3, 1], [4, 0] ]
							, [ [ 3, 7 ], [4,0], [3, 5], [4, 4] ]
							, [ [ 3, 7 ], [4,4], [3, 3], [4, 2] ]

							];

// line Normals are the indices into the groupDirs array
//const dirkeys = ["left","ul","ur","right","lr","ll" // 0,1,2,3,4,5
//				,"fd","fr","fl"  // 6,7,8
//				,"bu","bl","br"]; // 9,10,11

//
const line_normals = []; // this aligns with groupDirs

for( let l = 0; l < line_normals_index.length; l++ ) {
	const seg = [];
	line_normals.push( seg );
	for( let s = 0; s < 4; s++ ) {
		const rhom = line_normals_index[l][s];
		if( rhom[0] === 3 ) {
			seg.push( rhom[1] );
		} else if( rhom[0] === 4 ) {
			seg.push( rhom[1]+8 );

		}
	}
}


console.log( "Stuff:", dirDeltas, dirDirs );

function toReal(hx,hy,hz) {
	 const z = Math.floor( hz + 0.5 );
	 const oddrow = Math.abs(hy)&1;
	 const alt = mod(z,3) === 2;//(((-z)%3)==2);
	 const alt1 = mod(z,3) === 1;//(((-z)%3)==2);
	 if( alt )
	 {
		 const x = hx + (oddrow?-0.5:0 );
		 const y = hy * 0.75 + 0.5;
		 const z = hz * 0.75;
		 return {x, y, z };	
	 }else{
		 //	let ty = ry; while( ty < 0 ) ty += 2;
		 const x = hx + (oddrow?-0.5:0) + ( ( alt1)?0.5:0) ;
		 const y = hy * 0.75 + (( alt1 )?+0.25:0);
		 const z = hz * 0.75;
		 return {x, y, z };	
	 }
 
	 
 }
 
 function mod(x,y) {
	 const r = x%y;
	 if( r < 0 ) return y+r;
	 return r;	
 }
 


export const MarchingRhombicDodecaheda1 = (function () {

	const _debug = false;
	const zero_is_outside = true;
	const cx = new THREE.Color( 192,192,0,255 );
	const cxz1 = new THREE.Color( 81,81,0,255 );
	const cxz2 = new THREE.Color( 40,40,0,255 );
	const cy = new THREE.Color( 128,128,128,255 );
	const cz = new THREE.Color( 0,192,192,255 );
	const cx1 = new THREE.Color( 192,0,0,255 );
	const cy1 = new THREE.Color( 0,128,0,255 );
	const cz1 = new THREE.Color( 0,0,192,255 );

	const red = new THREE.Color( 192,0,0,255 );
	const green = new THREE.Color( 0,128,0,255 );
	const blue = new THREE.Color( 0,0,192,255 );

	const white = new THREE.Color( 255,255,255,255 );
	const black = new THREE.Color( 0,0,0,255 );

	return function (data, dims, opts) {
		opts = opts || { maximize: false, minimize: false, inflation: 0 };
		var vertices = []
			, out_faces = [];

		const avgValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		const verts = [];
		const values = [0, 0,0,0, 0,0,0, 0,0,0, 0,0,0];

		const zero = [0,0,0];
		const cellOrigin = [0, 0, 0];
		const current = [0, 0, 0];

		for( let v = 0; v < 14; v++ ) verts.push( [0,0,0]);

		function e2(p) {
			out_faces.push(p);
		}

		function emit(p) {
			if( isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2]) ){// || Math.abs(p[0]) > 20000 || Math.abs(p[1]) > 20000 || Math.abs(p[2]) > 20000 ) {
				throw new Error( "BLAH" )
			}
			vertices.push(p);
			return vertices.length - 1;
		}


		return meshCloud;


		function meshCloud() {
		vertices.length = 0;
		out_faces.length = 0;


		//drawCellVerts(0,0,0,0);

		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalVertices.push( new THREE.Vector3(10,0,0 ) )
		opts.normalColors.push( cx1);
		opts.normalColors.push( cx1);

		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalVertices.push( new THREE.Vector3(0,10,0 ) )
		opts.normalColors.push( cy1);
		opts.normalColors.push( cy1);

		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalVertices.push( new THREE.Vector3(0,0,10 ) )
		opts.normalColors.push( cz1);
		opts.normalColors.push( cz1);
/*
		for( let fc = 9; fc < 12; fc++ ) 
		{
		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalColors.push( cx1);
		const v1 = groupDirs[line_normals[fc][0]];
		opts.normalVertices.push( new THREE.Vector3( v1.x*10,v1.y*10,v1.z*10 ) )
		opts.normalColors.push( cx1);

		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalColors.push( cx1);
		const v2 = groupDirs[line_normals[fc][1]];
		opts.normalVertices.push( new THREE.Vector3( v2.x*10,v2.y*10,v2.z*10 ) )
		opts.normalColors.push( cx1);

		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalColors.push( cx1);
		const v3 = groupDirs[line_normals[fc][2]];
		opts.normalVertices.push( new THREE.Vector3( v3.x*10,v3.y*10,v3.z*10 ) )
		opts.normalColors.push( cx1);
		opts.normalVertices.push( new THREE.Vector3( 0,0, 0 ))
		opts.normalColors.push( cx1);
		const v4 = groupDirs[line_normals[fc][3]];
		opts.normalVertices.push( new THREE.Vector3( v4.x*10,v4.y*10,v4.z *10 ) )
		opts.normalColors.push( cx1);
		}
*/
		while(opts.surfacemesh.children.length ) 
			opts.surfacemesh.remove( opts.surfacemesh.children[0] ); 

		for (var x = -1; x < dims[0]; x++) {
			cellOrigin[0] = x;
			for (var y = -1; y < dims[1]; y++) {
				cellOrigin[1] = y;
				//if( /*y == 1 && */ x == 6)
				const yodd =  Math.abs(y)&1;
				for (var z = 0; z < dims[2]; z++) {

					//cellOrigin[2] = z;
					current[0] = x; current[1] = y; current[2] = z;
					const here = toReal(x,y,z);
					const zm = mod( z, 3 );

					//(o?-0.5:0)+(o?1:0)+0,(o?0.75:0)+0, 0

					cellOrigin[0] = here.x;
					cellOrigin[1] = here.y;
					cellOrigin[2] = here.z;


					if( x < 0 || y < 0 || z < 0 || x >= dims[0] || y >= dims[1] || z >= dims[2] )
						values[0] = -1;
					else
						values[0] = -data[x + y * dims[0] + z * dims[0] * dims[1]];

					// calculate the other 12 near points from the data to a values array.
					{
						for( let n = 0; n < 12; n++ ) {
							const del = dirDeltas[zm][yodd][n];
							const gx = x + del.x;
							const gy = y + del.y;
							const gz = z + del.z;

							if( gx < 0 || gy < 0 || gz < 0 || gx >= dims[0] || gy >= dims[1] || gz >= dims[2] ) 
								values[n+1] = -1;
							else  {
								values[n+1] = -data[gx + (gy)*dims[0] + (gz)*dims[0]*dims[1]];
								if( values[n+1] > 1 ) values[n+1] = 1;
								if( values[n+1] < -1 ) values[n+1] = -1;
							}
						}
					}

					/* output the centers of points - scaled larger if it is 'inside' */
					if(1)
						if(values[0] > 0)
						{
							opts.normalVertices.push( new THREE.Vector3( here.x,here.y, here.z ))
							opts.normalVertices.push( new THREE.Vector3(here.x+(values[0]>0?0.25:0.1),here.y,here.z ) )
							opts.normalColors.push( cx1);
							opts.normalColors.push( cx1);

							opts.normalVertices.push( new THREE.Vector3( here.x,here.y, here.z ))
							opts.normalVertices.push( new THREE.Vector3(here.x,here.y+(values[0]>0?0.25:0.1),here.z ) )
							opts.normalColors.push( cy1);
							opts.normalColors.push( cy1);

							opts.normalVertices.push( new THREE.Vector3( here.x,here.y, here.z ))
							opts.normalVertices.push( new THREE.Vector3(here.x,here.y,here.z+(values[0]>0?0.25:0.1) ) )
							opts.normalColors.push( cz1);
							opts.normalColors.push( cz1);
						}


					// calculate average values for each of the 14 group directions
					// this calculation keeps the points aligned on their strict
					// direction vectors; could also multiply each vertex first and average that.
					verts.length = 0;
					for( let v = 0; v < 14; v++ ) {
						if( v < 8 ) {
							const g = _3pointGroups[v];
							let t = 0;
							let tick = false;
							const tst=[0,0,0]
							for( let p = 0; p < 3; p++ ) {
								if( values[0] > 0 && values[ g[p] ] < 0 ) {
									const del = -values[0]/(values[g[p]] - values[0]);
									console.log( "del:", del, values[0], values[g[p]]);
									tick = true;
									t += del;
								} else if(  (values[0] > 0 && values[ g[p] ] > 0) 
										||  (values[0] < 0 && values[ g[p] ] < 0 ) ) {
									t += 1;
								}
							}
							if( tick )
							console.log( "3 group averge:", x, y, z, v, t );
							avgValues[v] = t/4;
						}else {
							const g = _4pointGroups[v-8];
							let t = 0;
							let tick = 0;
							for( let p = 0; p < 4; p++ ) {
								if( values[0] > 0 && values[ g[p] ] < 0 ) {
									const del = -values[0]/(values[g[p]] - values[0]);
									console.log( "del:", del, values[0], values[g[p]]);
									t += del;
									tick = true;
								} else if(  (values[0] > 0 && values[ g[p] ] > 0) 
										||  (values[0] < 0 && values[ g[p] ] < 0 ) ) {
									t += 1;
								}
							}
							if( tick )
							console.log( "4 group averge:", x, y, z, v, t );
							avgValues[v] = t/4;
						}
						verts.push( [here.x + groupDirs[v].x * avgValues[v]
									, here.y + groupDirs[v].y * avgValues[v]
									, here.z + groupDirs[v].z * avgValues[v]
								] );
					}
					
					// this can mesh from inside to out or outside to in
					_debug && console.log("tet: v:", values, "g:", geometry);
					for( let f = 1; f <= 12; f++ ) {
						//if( f != 4 ) continue;
						//if( f > 8 || f < 8 ) continue;
						if( values[0] > 0 && values[f] < 0 ) {
							const segs = line_normals[f-1];
							e2([emit(verts[segs[0]].slice()),
								emit(verts[segs[2]].slice()),
								emit(verts[segs[1]].slice()),
							]);
							e2([emit(verts[segs[0]].slice()),
								emit(verts[segs[3]].slice()),
								emit(verts[segs[2]].slice()),
							]);
						}
					}
				}
			}
		}
		return { vertices: vertices, faces: out_faces };
		}




	}



	 


})();


  function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;
		canvas.width = textWidth + 2 + 2*borderThickness;
		canvas.height = metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent + 2*borderThickness;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        //roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize/2 + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.1*0.5 * fontsize, 0.1*0.25 * fontsize, 0.2*0.75 * fontsize);
        return sprite;  
    }

if ("undefined" != typeof exports) {
	exports.mesher = MarchingTetradecahedra1;
}
