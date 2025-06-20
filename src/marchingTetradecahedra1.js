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


const dirkeys = ["left","ul","ur","right","lr","ll" // 0,1,2,3,4,5
				,"fu","fr","fl"  // 6,7,8
				,"bd","bl","br"]; // 9,10,11

const to_faces = [[6,7,8]
			  ,[1,2,6]
			  ,[7,3,4]
			  ,[8,5,0]
			  ,[9,10,11]
			  ,[9,5,4]
			  ,[11,1,0]
			  ,[10,3,2]
];

const to_faces_4 = [ [6,2,3,7] 
			  ,[7,4,5,8]
			  ,[0,1,6,8]
			  ,[9,11,0,5]
			  ,[11,10,2,1]
			  ,[9,4,3,10]
];

function getPart3( a,b,c,d ){
	return ((a<0)?8:0) + ((b<0)?4:0) + ((c<0)?2:0) + ((d<0)?1:0);
}

function getPart4( a,b,c,d,e ) {
	return (a<0?16:0) + (b<0?8:0) + (c<0?4:0) + (d<0?2:0) + (e<0?1:0);
}

const partFaces3 = [
	// >, >, >, >
	null,
	// >, >, >, <
	[ [0,3], [1,3],[2,3] ],
	// >, >, <, >
	[ [0,2], [3,2],[1,2] ],
	// >, >, <, <
	[ [0,2], [0,3], [1,3], [1,2] ],
	// >, <, >, >
	[ [0,1], [2,1],[3,1] ],
	// >, <, >, <
	[ [0,1], [2,1], [2,3], [0,3] ],
	// >, <, <, >
	[ [0,1], [0,2], [2,3], [1,3] ],
	// >, <, <, <
	[ [0,1], [0,2], [0,3] ],

	// <, >, >, >
	[ [2,0], [1,0], [3,0] ],
	// <, >, >, <
	[ [1,0], [1,3], [2,3], [2,0] ],
	// <, >, <, >
	[ [1,0], [1,2], [3,2], [3,0] ],
	// <, >, <, <
	[ [1,0], [1,2], [1,3] ],
	// <, <, >, >
	[ [3,0], [2,0], [3,1], [2,1] ],
	// <, <, >, <
	[ [2,0],[2,1],[2,3] ],
	// <, <, <, >
	[ [3,0], [3,2], [3,1] ],
	// <, <, <, <
	null,
]

const partFaces4 = [
	// >, >, >, >, >
	null,
	// >, >, >, >, <
	[ [0,4], [1,4], [3,4] ],
	// >, >, >, <, >
	[ [0,3], [2,3], [4,3] ],
	// >, >, >, <, <
	[ [0,3], [0,4], [1,4], [2,3] ],
	// >, >, <, >, >
	[ [0,2], [3,2], [1,2] ],
	// >, >, <, >, <
	[ [0,2], [3,2], [1,2], [0,4], [1,4], [3,4] ],  
	// >, >, <, <, >
	[ [0,2], [0,3], [2,3], [1,3], [1,2] ],
	// >, >, <, <, <
	[ [0,2], [0,3], [1,3], [1,4], [0,4], [2,3] ],
	// >, <, >, >, >
	[ [0,1], [2,1], [4,1] ],
	// >, <, >, >, <
	[ [0,1], [2,1], [4,1], [0,4], [2,3], [0,3] ],
	// >, <, >, <, >
	[ [0,1], [3,1], [1,2], [3,2] ],
	// >, <, >, <, <
	[ [0,1], [0,2], [1,2], [1,3], [0,3], [3,1] ],
	// >, <, <, >, >
	[ [0,1], [0,2], [2,3], [2,1], [4,1] ],
	// >, <, <, >, <
	[ [0,1], [0,2], [2,3], [2,1], [4,1], [0,4] ],
	// >, <, <, <, >
	[ [0,1], [0,2], [2,3], [2,1], [3,1], [1,3] ],
	// >, <, <, <, <
	[ [0,1], [0,2], [0,3], [0,4] ],
	// <, >, >, >, >
	[ [1,0], [2,0], [3,0], [4,0] ],
	// <, >, >, >, <
	[ [1,0], [2,0], [3,0], [4,0], [1,4], [3,4] ],
	// <, >, >, <, >
	[ [1,0], [3,0], [1,2], [3,2], [1,4], [2,3] ],
	// <, >, >, <, <
	[ [1,0], [1,2], [1,3], [1,4], [2,3], [3,4] ],
	// <, >, <, >, >
	[ [1,0], [2,0], [4,0], [1,2], [2,1] ],
	// <, >, <, >, <
	[ [1,0], [2,0], [4,0], [1,2], [2,1], [1,4], [2,3], [1,3] ],
	// <, >, <, <, >
	[ [1,0], [2,0], [3,0], [1,2], [2,3], [1,3] ],
	// <, >, <, <, <
	[ [1,0], [2,0], [3,0], [1,2], [2,3], [1,3] ],
	// <, <, >, >, >
	[ [3,0], [2,0], [4,0], [3,1], [2,1] ],
	// <, <, >, >, <
	[ [2,0], [3,0], [4,0], [2,1], [3,1], [2,3], [3,4] ],
	// <, <, >, <, >
	[ [3,0], [2,0], [1,0], [3,1], [2,1], [1,2] ],
	// <, <, >, <, <
	[ [2,0], [3,0], [1,0], [2,1], [3,1], [1,3], [2,3] ],
	// <, <, <, >, >
	[ [3,0], [2,0], [1,0], [3,1], [2,1], [4,1] ],
	// <, <, <, >, <
	[ [2,0], [3,0], [1,0], [2,1], [3,1], [4,1], [2,3], [3,4] ],
	// <, <, <, <, >
	[ [0,4], [3,4], [2,4], [1,4] ],
	// <, <, <, <, <
	null,
];

const x=[
   ];


const dirDeltas = [[],[]];
const dirDirs = [[],[]];

const dirs =  [
	{ /* even Y*/
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:-1,z:0},
		ur : { x:1, y:-1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:1, y:1 ,z:0},
		ll : { x:0, y:1 ,z:0},

		fu : { x:0, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},
		bd : { x:0, y:1,z:-1},
		bl : { x:1, y:0,z:-1},
		br : { x:0, y:0,z:-1},
	}

	, { /* odd Y*/
		left: {x:-1,y:0,z:0},
		ul : { x:-1, y:-1,z:0},
		ur : { x:0, y:-1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:0, y:1,z:0 },
		ll : { x:-1, y:1,z:0 },

		fu : { x:-1, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},

		bd : { x:0, y:1,z:-1},
		bl : { x:0, y:0,z:-1},
		br : { x:-1, y:0,z:-1},
		
	}

]

for( let o = 0; o < 2; o++ )
	for( let n = 0; n < 12; n++ ) {
		const r= toReal( dirs[o][dirkeys[n]].x, dirs[o][dirkeys[n]].y+o, dirs[o][dirkeys[n]].z );
		dirDirs[o].push( [r.x,r.y-o*0.75,r.z] );
		dirDeltas[o].push( dirs[o][dirkeys[n]] );
	}

console.log( "Stuff:", dirDeltas, dirDirs );

const o_z0 = toReal( 0, 0, 0 );
const o_z1 = toReal( 0, 0, 1 );
const o_z2 = toReal( 0, 0, 2 );

	function toReal(hx,hy,hz) {
		// hx=0, hy=0 == rx=0, ry=0;
		 // rx = hx + (((hy%2)-1)/2
		 // hx + 1 = rx + 1;
		 // rx += (((hy%2)-1)/2;
	 
		 const z = Math.floor( hz + 0.5 );

		 const oddrow = Math.abs(hy)&1;
		 const alt = mod(z,3) === 2;//(((-z)%3)==2);
		 const alt1 = mod(z,3) === 1;//(((-z)%3)==2);
	 
		 if( alt )
		 {
			 const x = hx + (oddrow?0.625:0 ) + (alt?-0.5:0) ;
			 const y = hy * 0.75 + ( ( alt )?-0.25:0);
			 const z = hz * 0.75;
	 
			 return {x, y, z };	
		 }else{
			 //	let ty = ry; while( ty < 0 ) ty += 2;
			 const x = hx + (oddrow?-0.375:0) + ( ( alt1)?0.5:0) ;
			 const y = hy * 0.75 + (( alt1 )?+0.3125:0);
			 const z = hz * 0.75;
				  
			 return {x, y, z };	
		 }
	 
	 
	 }
	 
	 function mod(x,y) {
		const r = x%y;
		if( r < 0 ) return y+r;
		return r;	
	}


	
var MarchingTetradecahedra1 = (function () {

	const _debug = false;
	const zero_is_outside = true;
	const cx = new THREE.Color( 192,192,0,255 );
	const cy = new THREE.Color( 128,128,128,255 );
	const cz = new THREE.Color( 0,192,192,255 );
	const cx1 = new THREE.Color( 192,0,0,255 );
	const cy1 = new THREE.Color( 0,128,0,255 );
	const cz1 = new THREE.Color( 0,0,192,255 );


	return function (data, dims, opts) {
		opts = opts || { maximize: false, minimize: false, inflation: 0 };
		var vertices = []
			, out_faces = [];


		const zero = [0,0,0];
		const cellOrigin = [0, 0, 0];
		const current = [0, 0, 0];

		function e2(p) {
			out_faces.push(p);
		}

		function emit(p) {
			if( isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2]) || Math.abs(p[0]) > 1000 || Math.abs(p[1]) > 1000 || Math.abs(p[2]) > 1000 ) {
				throw new Error( "BLAH" )
			}
			vertices.push(p);
			return vertices.length - 1;
		}
		function emitv(p) {
			vertices.push([p.x,p.y,p.z]);
			return vertices.length - 1;
		}

		function lerp(p1, p2, del) {
			return [cellOrigin[0] + p1[0] + (p2[0] - p1[0]) * del
				, cellOrigin[1] + p1[1] + (p2[1] - p1[1]) * del
				, cellOrigin[2] + p1[2] + (p2[2] - p1[2]) * del];
		}

		function tetCompute(values, geometry, invert) {
			_debug && console.log("tet: v:", values, "g:", geometry);
			{
				// 0 is outside ( >0 is inside (density or volume of cell), <0 is outside (vacuum))
					for( let n = 0; n < to_faces.length; n++ ) {
						//if( n > 1 ) continue;
						const face = to_faces[n]; 
						const f1 = face[0], f2 = face[1], f3 = face[2];
						const v1 = values[f1+1], v2 = values[f2+1], v3 = values[f3+1];
						const index = getPart3( values[0], v1, v2, v3 );
						const faceList = partFaces3[index];
						if( !faceList ) continue;
						//console.log( "somethings:", index, current )
						if( current[0] == 1 && current[1] == 0 && current[2] == 1 )
						drawCellVerts( cellOrigin[0], cellOrigin[1], cellOrigin[2], geometry==dirDirs[0]?0:1 );
						switch( faceList.length ) {
						case 3: {
							const f10 = faceList[0][0]?face[faceList[0][0]-1]+1:0;
							const f20 = faceList[1][0]?face[faceList[1][0]-1]+1:0;
							const f30 = faceList[2][0]?face[faceList[2][0]-1]+1:0;
							const f11 = faceList[0][1]?face[faceList[0][1]-1]+1:0;
							const f21 = faceList[1][1]?face[faceList[1][1]-1]+1:0;
							const f31 = faceList[2][1]?face[faceList[2][1]-1]+1:0;
							const del1 = (values[f10]-values[f11]);
							const del2 = (values[f20]-values[f21]);
							const del3 = (values[f30]-values[f31]);


							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , del1?-values[f11]/(del1):0)),
								emit(lerp( faceList[1][0]==0?zero:geometry[face[faceList[1][0]-1]]
								         , faceList[1][1]==0?zero:geometry[face[faceList[1][1]-1]]
								         , del2?-values[f21]/(del2):0)),
								emit(lerp(faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , del3?-values[f31]/(del3):0))
							]);

							}
							break;

						case 4: 
						{
							const f10 = faceList[0][0]?face[faceList[0][0]-1]+1:0;
							const f20 = faceList[1][0]?face[faceList[1][0]-1]+1:0;
							const f30 = faceList[2][0]?face[faceList[2][0]-1]+1:0;
							const f40 = faceList[3][0]?face[faceList[3][0]-1]+1:0;
							const f11 = faceList[0][1]?face[faceList[0][1]-1]+1:0;
							const f21 = faceList[1][1]?face[faceList[1][1]-1]+1:0;
							const f31 = faceList[2][1]?face[faceList[2][1]-1]+1:0;
							const f41 = faceList[3][1]?face[faceList[3][1]-1]+1:0;

							const del1 = (values[f10]-values[f11]);
							const del2 = (values[f20]-values[f21]);
							const del3 = (values[f30]-values[f31]);
							const del4 = (values[f40]-values[f41]);
							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , (!del1)?0:values[f11]/(del1))),
								emit(lerp( faceList[1][0]==0?zero:geometry[face[faceList[1][0]-1]]
								         , faceList[1][1]==0?zero:geometry[face[faceList[1][1]-1]]
								         , (!del2)?0:values[f21]/(del2))),
								emit(lerp(faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , (!del3)?0:values[f31]/(del3)))
							]);
							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , (!del1)?0:values[f11]/(del1))),
								emit(lerp( faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , (!del3)?0:values[f31]/(del3))),
								emit(lerp(faceList[3][0]==0?zero:geometry[face[faceList[3][0]-1]]
								         , faceList[3][1]==0?zero:geometry[face[faceList[3][1]-1]]
								         , (!del4)?0:values[f41]/(del4)))
							]);
						}
						break;
						}
					}

					for( let n = 0; n < to_faces_4.length; n++ ) {
						const face = to_faces_4[n]; 
						const f1 = face[0], f2 = face[1], f3 = face[2], f4 = face[3];
						const v1 = values[f1+1], v2 = values[f2+1], v3 = values[f3+1], v4 = values[f4+1];
						const index = getPart4( values[0], v1, v2, v3, v4 );
						const faceList = partFaces4[index];
						if( !faceList ) continue;
						switch( faceList.length ) {
						case 3: {
							const f10 = faceList[0][0]?face[faceList[0][0]-1]+1:0;
							const f20 = faceList[1][0]?face[faceList[1][0]-1]+1:0;
							const f30 = faceList[2][0]?face[faceList[2][0]-1]+1:0;
							const f11 = faceList[0][1]?face[faceList[0][1]-1]+1:0;
							const f21 = faceList[1][1]?face[faceList[1][1]-1]+1:0;
							const f31 = faceList[2][1]?face[faceList[2][1]-1]+1:0;
							const del1 = (values[f10]-values[f11]);
							const del2 = (values[f20]-values[f21]);
							const del3 = (values[f30]-values[f31]);
							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , del1?values[f11]/(del1):0)),
								emit(lerp( faceList[1][0]==0?zero:geometry[face[faceList[1][0]-1]]
								         , faceList[1][1]==0?zero:geometry[face[faceList[1][1]-1]]
								         , del2?values[f21]/(del2):0)),
								emit(lerp(faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , del3?values[f31]/(del3):0))
							]);
							break;
						}
						case 4: {
							const f10 = faceList[0][0]?face[faceList[0][0]-1]+1:0;
							const f20 = faceList[1][0]?face[faceList[1][0]-1]+1:0;
							const f30 = faceList[2][0]?face[faceList[2][0]-1]+1:0;
							const f40 = faceList[3][0]?face[faceList[3][0]-1]+1:0;
							const f11 = faceList[0][1]?face[faceList[0][1]-1]+1:0;
							const f21 = faceList[1][1]?face[faceList[1][1]-1]+1:0;
							const f31 = faceList[2][1]?face[faceList[2][1]-1]+1:0;
							const f41 = faceList[3][1]?face[faceList[3][1]-1]+1:0;

							const del1 = (values[f10]-values[f11]);
							const del2 = (values[f20]-values[f21]);
							const del3 = (values[f30]-values[f31]);
							const del4 = (values[f40]-values[f41]);


							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , (!del1)?0:-values[f11]/(del1))),
								emit(lerp( faceList[1][0]==0?zero:geometry[face[faceList[1][0]-1]]
								         , faceList[1][1]==0?zero:geometry[face[faceList[1][1]-1]]
								         , (!del2)?0:-values[f21]/(del2))),
								emit(lerp(faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , (!del3)?0:-values[f31]/(del3)))
							]);

							e2([emit(lerp( faceList[0][0]==0?zero:geometry[face[faceList[0][0]-1]]
							             , faceList[0][1]==0?zero:geometry[face[faceList[0][1]-1]]
							             , (!del1)?0:-values[f11]/(del1))),
								emit(lerp( faceList[2][0]==0?zero:geometry[face[faceList[2][0]-1]]
								         , faceList[2][1]==0?zero:geometry[face[faceList[2][1]-1]]
								         , (!del3)?0:-values[f31]/(del3))),
								emit(lerp(faceList[3][0]==0?zero:geometry[face[faceList[3][0]-1]]
								         , faceList[3][1]==0?zero:geometry[face[faceList[3][1]-1]]
								         , (!del4)?0:-values[f41]/(del4)))
							]);

							break;
						}
						}
					}
			}
		}

		function cellCompute(alt, values, geom) {

			_debug && showValues(values);
			_debug && console.log("Our local state:", values, tets);

			tetCompute(values, geom, false);
		}

		return meshCloud;

		function drawCellVerts(x,y,z,o) {
			if( opts.normalVertices) {
				//for( let o = 0; o < 2; o++ ) 
				{
					const verts = [];
					for( let n = 0; n < 12; n++ ) {
						opts.normalVertices.push( new THREE.Vector3( x+0,y+0, z+0 ))
						const v = new THREE.Vector3( x+dirDirs[o][n][0], y+dirDirs[o][n][1], z+dirDirs[o][n][2] );
						verts.push(v);
						opts.normalVertices.push(v )
						if( n < 6 )	 {
							opts.normalColors.push( cx);
							opts.normalColors.push( cx);
						}else if( n < 9 ) {
							if( n == 8 ) {
								opts.normalColors.push( cx1);
								opts.normalColors.push( cx1);
							}else if ( n == 7 ) {
								opts.normalColors.push( cy1);
								opts.normalColors.push( cy1);
							}else {
							opts.normalColors.push( cy);
							opts.normalColors.push( cy);
							}
						}else if( n < 12 ) {
							if( n == 11 ) {
								opts.normalColors.push( cz1);
								opts.normalColors.push( cz1);
							}else if ( n == 10 ) {
								opts.normalColors.push( cy);
								opts.normalColors.push( cy);
							}else {
							opts.normalColors.push( cz);
							opts.normalColors.push( cz);
							}
						}
					}
				}
	if(0)
				for( let x = -2; x <= 2; x++ ) {
					for( let y = -2; y <= 2; y++ ) {
						for( let z = -5; z < 4; z++ ) {//-5; z <= 5; z++ ) {

							const verts = [];
							const here = toReal(x,y,z);
							const yodd =  Math.abs(y)&1;
			
							opts.normalVertices.push( new THREE.Vector3( here.x+0.1, here.y, here.z ));
							const v = new THREE.Vector3( here.x-0.1,here.y,here.z );
							opts.normalVertices.push(v )
							opts.normalColors.push( cx);
							opts.normalColors.push( cx);

							for( let n = 0; n < 12; n++ ) {
								verts.push( [here.x + 0.25* dirDirs[yodd][n][0], here.y +0.25* dirDirs[yodd][n][1], here.z +0.25* dirDirs[yodd][n][2]]);
							}


							cellOrigin[0] = here.x;
							cellOrigin[1] = here.y;
							cellOrigin[2] = here.z;
			
							for( let n = 0; n < to_faces.length; n++ ) {
								const face = to_faces[n];
								e2([emit(verts[face[0]] ),
									emit(verts[face[1]]),
									emit(verts[face[2]])]);
							}
							for( let n = 0; n < to_faces_4.length; n++ ) {
								const face = to_faces_4[n];
								e2([emit(verts[face[0]] ),
									emit(verts[face[1]]),
									emit(verts[face[2]])]);
								e2([emit(verts[face[0]] ),
									emit(verts[face[2]]),
									emit(verts[face[3]])]);
							}
						}
					}
				}
			}
		}


		function meshCloud() {
		vertices.length = 0;
		out_faces.length = 0;


		//drawCellVerts(0,0,0,0);

		
		var values = [0, 0,0,0, 0,0,0, 0,0,0, 0,0,0];
		for (var x = -1; x < dims[0]; x++) {
			cellOrigin[0] = x;
			for (var y = -1; y < dims[1]; y++) {
				cellOrigin[1] = y;
				//if( /*y == 1 && */ x == 6)
				for (var z = 0; z < dims[2]; z++) {
					//cellOrigin[2] = z;
					current[0] = x; current[1] = y; current[2] = z;
					const here = toReal(x,y,z);
					const yodd =  Math.abs(y)&1;

					//(o?-0.5:0)+(o?1:0)+0,(o?0.75:0)+0, 0

					cellOrigin[0] = here.x;
					cellOrigin[1] = here.y;
					cellOrigin[2] = here.z;
					if( x < 0 || y < 0 || z < 0 || x >= dims[0] || y >= dims[1] || z >= dims[2] )
						values[0] = -1;
					else
						values[0] = -data[x + y * dims[0] + z * dims[0] * dims[1]];
					{
						for( let n = 0; n < 12; n++ ) {
							const del = dirDeltas[yodd][n];
							const gx = x + del.x;
							const gy = y + del.y;
							const gz = z + del.z;

							if( gx < 0 || gy < 0 || gz < 0 || gx >= dims[0] || gy >= dims[1] || gz >= dims[2] ) 
								values[n+1] = -1;
							else 
								values[n+1] = -data[gx + (gy)*dims[0] + (gz)*dims[0]*dims[1]];
						}
					}
					if( values[0] < 0 ) continue;
					cellCompute(yodd, values, dirDirs[yodd]);
				}
			}
		}
		return { vertices: vertices, faces: out_faces };
		}




	}



	 


})();


if ("undefined" != typeof exports) {
	exports.mesher = MarchingTetradecahedra1;
}
