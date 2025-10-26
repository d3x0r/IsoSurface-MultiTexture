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


const dirDeltas = [[],[]];
const dirDirs = [[],[]];

const dirs =  [ { /* even Y*/
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
	},	{ /* odd Y*/
		left: {x:-1,y:0,z:0},
		ul : { x:0, y:1,z:0},
		ur : { x:1, y:1,z:0 },
		right:{x:1,y:0,z:0},
		lr : { x:1, y:-1 ,z:0},
		ll : { x:0, y:-1 ,z:0},

		fd : { x:0, y:-1,z:1},
		fl : { x:-1, y:0,z:1},
		fr : { x:0, y:0,z:1},

		bu : { x:0, y:0,z:-1},
		bl : { x:0, y:-1,z:-1},
		br : { x:1, y:-1,z:-1},
	}
]

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
		const r= toReal( dirs[o][dirkeys[n]].x, dirs[o][dirkeys[n]].y, dirs[o][dirkeys[n]].z );
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


const to_faces = [[6,7,8]
			  ,[1,0,8]
			  ,[3,2,7]
			  ,[5,4,6]
			  ,[10,9,11]
			  ,[1,2,9]
			  ,[5,0,10]
			  ,[3,4,11]
];

const to_faces_4 = [ [7,2,1,8]     // fr, ur, ul, fl
			  ,[6,4,3,7]  // fd, lr, right, fr
			  ,[5,6,8,0]  // ll, fd, fl, left
			  ,[9,2,3,11]
			  ,[11,4,5,10]       // 3=0 2=3 1=2 0=1
//			  , [4,5,10,11]
			  ,[10,0,1,9]   // bl, left, ul, bu
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
	[ [[0,3], [1,3], [2,3]] ],
	// >, >, <, >
	[ [[0,2], [3,2], [1,2]] ],
	// >, >, <, <
	[ [[0,2], [0,3], [1,3]], [[0,2], [1,3], [1,2]] ], // checked
	// >, <, >, >
	[ [[0,1], [2,1], [3,1] ]],
	// >, <, >, <
	[ [[0,1], [2,1], [2,3]], [[0,1], [2,3], [0,3] ]], // (duplicate of 3) checked
	// >, <, <, >
	[ [[0,1], [0,2], [2,3]], [[0,1], [2,3], [1,3]] ], // duplicate of 3 also
	// >, <, <, <
	[ [[0,1], [0,2], [0,3] ]], // checked

	// <, >, >, >
	[ [[2,0], [1,0], [3,0]] ],
	// <, >, >, <
	null, //[ [1,0], [1,3], [2,3], [2,0] ],  // 9
	// <, >, <, >
	null, //[ [1,0], [1,2], [3,2], [3,0] ],  // 10
	// <, >, <, <
	[ [[1,0], [1,3], [1,2]] ],           // 11
	// <, <, >, >
	null, //[ [3,0], [2,0], [3,1], [2,1] ],    // 12
	// <, <, >, <
	[ [[2,0],[2,1],[2,3]] ],              // 13
	// <, <, <, >
	null, //[ [3,0], [3,2], [3,1] ],          /14
	// <, <, <, <
	null,  // 15
]

const partFaces4 = [
	// >, >, >, >, >
	null,
	// >, >, >, >, <
	[ [[0,4], [1,4], [3,4]], [[0,4], [3,4], [0,3]] ],
	// >, >, >, <, >
	[ [[0,3], [4,3], [2,3]] ],    //here > , ll >, fd >, fl <, left <
	// >, >, >, <, <
	[ [[0,3], [0,4], [1,4]], [[0,3], [1,4], [2,3]] ],  // 3
	// >, >, <, >, >
	[ [[0,2], [3,2], [1,2]] ],
	// >, >, <, >, <
	[ [[0,2], [3,2], [1,2]], [[0,4], [1,4], [3,4] ], [[1,2], [3,2], [3,4]], [[3,4], [1,4], [1,2] ] ],  // 5
	// >, >, <, <, >
	[ [[0,2], [0,3], [3,4]], [[1,2], [0,2],[3,4]] ], // 6 (had) 5
	// >, >, <, <, <
	[ [[0,2], [0,3], [0,4]], [[0,4], [4,1], [1,2]], [[0,4], [2,1], [0,2]] ], // 7

	// >, <, >, >, >
	[ [[0,1], [2,1], [4,1]] ],
	// >, <, >, >, <
	[ [[0,1], [2,1], [0,4]], [[0,4], [2,1], [3,4]] ], // 9   6
	// >, <, >, <, >
	[ [[0,1], [2,1],[4,1]], [[0,3], [4,3], [2,3]], [[1,2], [2,3], [4,1]], [[4,1], [2,3], [3,4]] ], // 10
	// >, <, >, <, <
	[ [[0,1], [0,3], [0,4]], [[0,1], [2,3], [0,3]] , [[2,3],[0,1],[2,1]]], // 11  6  (this could still be turned 90 degrees)
	// >, <, <, >, >
	[ [[0,1], [0,2], [3,2]], [[0,1], [3,2], [4,1] ]], // 12    5
	// >, <, <, >, <
	[ [[0,1], [0,2], [0,4]], [[3,4], [0,4], [0,2]], [[3,4],[0,2],[3,2]] ], // 13  had 6
	// >, <, <, <, >
	[ [[0,1], [0,2], [0,3]], [[0,1], [0,3], [4,1]], [[0,3], [3,4], [4,1]] ], // 6  square duplicates with other half...

	// >, <, <, <, < // normal output for inside and all 4 outside
	[ [[0,1], [0,2], [0,3]] , [[0,1], [0,3], [0,4]] ], // checked


	// <, >, >, >, >
	null, //[ [[1,0], [2,0], [3,0]],[ [1,0], [2,0],[4,0]] ],
	// <, >, >, >, <
	null, //[ [1,0], [2,0], [3,0], [4,0], [1,4], [3,4] ],
	// <, >, >, <, >
	null, //[ [1,0], [3,0], [1,2], [3,2], [1,4], [2,3] ],
	// <, >, >, <, <
	[ [[1,0], [2,0], [1,2]],[ [1,4], [2,3], [2,0]] ],  // 19
	// <, >, <, >, >
	null, //[ [1,0], [2,0], [4,0], [1,2], [2,1] ],   //20
	// <, >, <, >, <
	//[ [[1,2], [4,1], [1,0]], [[0,3], [2,3], [3,4]] ],  // 21
	null, //[ [[1,2], [4,1], [2,3]], [[4,1], [3,4], [2,3]] ],  // 21
	// <, >, <, <, >
	[ [[1,0], [4,0], [4,3]],[ [4,3], [1,2], [1,0] ]],
	// <, >, <, <, <
	null, //[ [[1,0], [2,0], [3,0]], [[1,2], [2,3], [1,3]] ],


	// <, <, >, >, >
	null, //[ [[3,0], [2,0], [4,0]],[ [3,1], [2,1], [4,0]] ],    // 24
	// <, <, >, >, <
	[ [[2,0], [3,4], [3,0]], [[3,4], [2,0], [2,1]] ],   //25
	// <, <, >, <, >
	null, //[ [3,0], [2,0], [1,0], [3,1], [2,1], [1,2] ],               // 26
	// <, <, >, <, <
	null, //[ [[2,0], [3,0], [1,0]], [[2,1], [3,1], [1,3]] ], //, [2,3] ],   // 27
	// <, <, <, >, >
	[ [[4,0], [3,0], [3,2]], [[3,2], [4,1], [4,0]] ],      // 28
	// <, <, <, >, <
	null, //null,//[ [2,0], [3,0], [1,0], [2,1], [3,1], [4,1], [2,3], [3,4] ],   //29
	// <, <, <, <, >
	null, //null,//[ [0,4], [3,4], [2,4], [1,4] ],   //30
	// <, <, <, <, <
	null,
];


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
 


	
var MarchingTetradecahedra1 = (function () {

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


		const zero = [0,0,0];
		const cellOrigin = [0, 0, 0];
		const oridinal = [0,0,0];
		const current = [0, 0, 0];

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
			//if( !( current[0] ===1  && current[1] == 0 && current[2] === 0 ) )
			//return;
			 
			_debug && console.log("tet: v:", values, "g:", geometry);
			{
				// 0 is outside ( >0 is inside (density or volume of cell), <0 is outside (vacuum))
				const zm = mod( current[2], 3 );
				const ym = mod( current[1], 2 );
				let outputHere = false;
if(1)
				for( let n = 0; n < to_faces.length; n++ ) {
//					if( n != 5 ) continue;
						//if( n > 1 ) continue;
						const face = to_faces[n]; 
						const f1 = face[0], f2 = face[1], f3 = face[2];
						const v1 = values[f1+1], v2 = values[f2+1], v3 = values[f3+1];
						const index = getPart3( values[0], v1, v2, v3 );
//			if( index != 6 ) continue;
						const faceList = partFaces3[index];

						if( index != 0 && index != 15  && values[0] < 0 ) 
						{
							//drawCellVerts( cellOrigin[0], cellOrigin[1], cellOrigin[2], ym, zm, values, outputHere );
							outputHere = true; 
						}
						if( !faceList ) {
							//console.log( "Skipping:", index );
							continue;
						}

						//console.log( "Emitting a face:", n, index );

						for( let f = 0; f < faceList.length; f++ ) {
							const fl = faceList[f];
							const f10 = fl[0][0]?face[fl[0][0]-1]+1:0;
							const f20 = fl[1][0]?face[fl[1][0]-1]+1:0;
							const f30 = fl[2][0]?face[fl[2][0]-1]+1:0;
							const f11 = fl[0][1]?face[fl[0][1]-1]+1:0;
							const f21 = fl[1][1]?face[fl[1][1]-1]+1:0;
							const f31 = fl[2][1]?face[fl[2][1]-1]+1:0;
							const del1 = -(values[f10]-values[f11]);
							const del2 = -(values[f20]-values[f21]);
							const del3 = -(values[f30]-values[f31]);

							e2([emit(lerp( fl[0][0]==0?zero:geometry[face[fl[0][0]-1]]
							             , fl[0][1]==0?zero:geometry[face[fl[0][1]-1]]
							             , del1?-values[f10]/(del1):0)),
								emit(lerp( fl[1][0]==0?zero:geometry[face[fl[1][0]-1]]
								         , fl[1][1]==0?zero:geometry[face[fl[1][1]-1]]
								         , del2?-values[f20]/(del2):0)),
								emit(lerp(fl[2][0]==0?zero:geometry[face[fl[2][0]-1]]
								         , fl[2][1]==0?zero:geometry[face[fl[2][1]-1]]
								         , del3?-values[f30]/(del3):0))
							]);
				
						}
					}
		outputHere = false;
if(1)
					for( let n = 0; n < to_faces_4.length; n++ ) {
//						if( n != 4) continue;
						const face = to_faces_4[n]; 
						const f1 = face[0], f2 = face[1], f3 = face[2], f4 = face[3];
						const v1 = values[f1+1], v2 = values[f2+1], v3 = values[f3+1], v4 = values[f4+1];
						const index = getPart4( values[0], v1, v2, v3, v4 );
	//		if( index != 2  ) continue;
//	      if( index != 22 ) continue;
						if( index != 0 && index != 31 ) 
						{
						//if( partFaces4[index] ) {
							drawCellVerts( cellOrigin[0], cellOrigin[1], cellOrigin[2], ym, zm, values, outputHere );

							//console.log( "Could output a face here...:", index );
						//}
						}
						const faceList = partFaces4[index];
						if( !faceList ) {
							//console.log( "Skipping4:", index );
							continue;
						}
					//	console.log( "doing 4face:", n, face, index, faceList );
						//if( !faceList || faceList.length < 3 ) continue;
						//.console.log( "partfaces:", current, index, faceList );
					//	if( !outputHere )
	//					if( index != 2  ) continue;
					//if( values[0] > 0 ) 
				//if( faceList.length !== 1 ) continue;
						for( let f = 0; f < faceList.length; f++ ) {
							const fl = faceList[f];
							const f10 = fl[0][0]?face[fl[0][0]-1]+1:0;
							const f20 = fl[1][0]?face[fl[1][0]-1]+1:0;
							const f30 = fl[2][0]?face[fl[2][0]-1]+1:0;
							const f11 = fl[0][1]?face[fl[0][1]-1]+1:0;
							const f21 = fl[1][1]?face[fl[1][1]-1]+1:0;
							const f31 = fl[2][1]?face[fl[2][1]-1]+1:0;
							const del1 = -(values[f10]-values[f11]);
							const del2 = -(values[f20]-values[f21]);
							const del3 = -(values[f30]-values[f31]);
						//	console.log( "output:", face[fl[0][0]-1], face[fl[0][1]-1], face[fl[1][0]-1]
						//			, face[fl[1][1]-1], face[fl[2][0]-1], face[fl[2][1]-1] );
							e2([emit(lerp( fl[0][0]==0?zero:geometry[face[fl[0][0]-1]]
							             , fl[0][1]==0?zero:geometry[face[fl[0][1]-1]]
							             , del1?-values[f10]/(del1):0)),
								emit(lerp( fl[1][0]==0?zero:geometry[face[fl[1][0]-1]]
								         , fl[1][1]==0?zero:geometry[face[fl[1][1]-1]]
								         , del2?-values[f20]/(del2):0)),
								emit(lerp(fl[2][0]==0?zero:geometry[face[fl[2][0]-1]]
								         , fl[2][1]==0?zero:geometry[face[fl[2][1]-1]]
								         , del3?-values[f30]/(del3):0))
							]);
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

		function drawCellVerts(x,y,z,o,zm, values, skip) {
			return;
			//if( zm !== 2 ) return;
			//if( !o ) return;
							const verts = [];
							current[0] = x; current[1] = y; current[2] = z;
							const yodd =  Math.abs(y)&1;
							const v0 = new THREE.Vector3( x, y, z );

		if(0)
			for( let n = 0; n < to_faces.length; n++ ) {
	//			if( n != 5 ) continue;
				const face = to_faces[n]; 

				const v1 = new THREE.Vector3( x+dirDirs[yodd][face[0]][0], y+dirDirs[yodd][face[0]][1], z+dirDirs[yodd][face[0]][2] );
				opts.normalVertices.push(v0 )
				opts.normalVertices.push(v1 )
				opts.normalColors.push( black);
				opts.normalColors.push( red);
				
				const v2 = new THREE.Vector3( x+dirDirs[yodd][face[1]][0], y+dirDirs[yodd][face[1]][1], z+dirDirs[yodd][face[1]][2] );
				opts.normalVertices.push(v0 )
				opts.normalVertices.push(v2 )
				opts.normalColors.push( black);
				opts.normalColors.push( green);
				const v3 = new THREE.Vector3( x+dirDirs[yodd][face[2]][0], y+dirDirs[yodd][face[2]][1], z+dirDirs[yodd][face[2]][2] );
				opts.normalVertices.push(v0 )
				opts.normalVertices.push(v3 )
				opts.normalColors.push( black);
				opts.normalColors.push( blue);
			}

if(1)
			for( let n = 0; n < to_faces_4.length; n++ ) {
//				if( n != 4 ) continue;
					
						const face4 = to_faces_4[n]; 

						const f1 = face4[0], f2 = face4[1], f3 = face4[2], f4 = face4[3];

						const v1 = values[f1+1], v2 = values[f2+1], v3 = values[f3+1], v4 = values[f4+1];

						const index4 = getPart4( values[0], v1, v2, v3, v4 );
			//	if( index4 != 2 ) continue;
//			                    if( index4 != 22 ) continue;
//			if( index4 === 0 || index4 === 31 ) continue; // all inside/outside
//		if( index4 != 13 ) continue;
	//	console.log( "emitting 4 indexes for...", index4 );
						//if( !partFaces4[index4] ) 
						{

							//console.log( "one list...", f );
								const v1 = new THREE.Vector3( x+0.05+(dirDirs[yodd][face4[0]][0]), y+(dirDirs[yodd][face4[0]][1]), z+(dirDirs[yodd][face4[0]][2]) );
								opts.normalVertices.push(v0 )
								opts.normalVertices.push(v1 )
								opts.normalColors.push( black);
								opts.normalColors.push( cx1);
							
								const v2 = new THREE.Vector3( x+(dirDirs[yodd][face4[1]][0]), y+0.05+(dirDirs[yodd][face4[1]][1]), z+(dirDirs[yodd][face4[1]][2]) );
								opts.normalVertices.push(v0 )
								opts.normalVertices.push(v2 )
								opts.normalColors.push( black);
								opts.normalColors.push( cy1);
								const v3 = new THREE.Vector3( x+(dirDirs[yodd][face4[2]][0]), y+(dirDirs[yodd][face4[2]][1]), z+(dirDirs[yodd][face4[2]][2]) );
								opts.normalVertices.push(v0 )
								opts.normalVertices.push(v3 )
								opts.normalColors.push( black);
								opts.normalColors.push( cz1);
								const v4 = new THREE.Vector3( x+(dirDirs[yodd][face4[3]][0]), y+(dirDirs[yodd][face4[3]][1]), z+(dirDirs[yodd][face4[3]][2]) );
								opts.normalVertices.push(v0 )
								opts.normalVertices.push(v4 )
								opts.normalColors.push( black);
								opts.normalColors.push( white);
						}

			}
	if( skip ) return;
			if( opts.normalVertices) {
				//for( let o = 0; o < 2; o++ ) 
				{
					const verts = [];
					for( let n = 0; n < 12; n++ ) {
						opts.normalVertices.push( new THREE.Vector3( x+0,y+0, z+0 ))
						const v = new THREE.Vector3( x+dirDirs[o][n][0]*0.2, y+dirDirs[o][n][1]*0.2, z+dirDirs[o][n][2]*0.2 );

						verts.push(v);
						opts.normalVertices.push(v )
						if( n < 6 )	 {
							if( zm == 0 ) {
							opts.normalColors.push( cx);
							opts.normalColors.push( cx);
							} else if ( zm == 1 ) {
								opts.normalColors.push( cxz1);
								opts.normalColors.push( cxz1);
							} else {
								opts.normalColors.push( cxz2);
								opts.normalColors.push( cxz2);
							}
						}else if( n < 9 ) {
							if( n == 8 ) {
								opts.normalColors.push( cx1); // red
								opts.normalColors.push( cx1);
							}else if ( n == 7 ) {
								opts.normalColors.push( cy1); // green
								opts.normalColors.push( cy1);
							}else {
							opts.normalColors.push( cy); // white
							opts.normalColors.push( cy);
							}
						}else if( n < 12 ) {
							if( n == 11 ) {
								opts.normalColors.push( cz1); // blue 
								opts.normalColors.push( cz1);
							}else if ( n == 10 ) {
								opts.normalColors.push( cy); // white
								opts.normalColors.push( cy); 
							}else {
							opts.normalColors.push( cz);  // cyan
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
							current[0] = x; current[1] = y; current[2] = z;
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


let first = false;
let skips = 0;
		var values = [0, 0,0,0, 0,0,0, 0,0,0, 0,0,0];
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
					here = toReal(x,y,z);
					const zm = mod( z, 3 );

					//(o?-0.5:0)+(o?1:0)+0,(o?0.75:0)+0, 0

					cellOrigin[0] = here.x;
					cellOrigin[1] = here.y;
					cellOrigin[2] = here.z;


					if( x < 0 || y < 0 || z < 0 || x >= dims[0] || y >= dims[1] || z >= dims[2] )
						values[0] = -1;
					else
						values[0] = -data[x + y * dims[0] + z * dims[0] * dims[1]];

				//if( values[0] > 0 )
				//	console.log( "zero is:", x, y, z, x+y*dims[0]+z*dims[0]*dims[1], "(",here.x, here.y, here.z,")" );	

	/* output the centers of points - scaled larger if it is 'inside' */
	if(0)
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
//if( y != 5 ) continue;
//if( x != 4 ) continue;
//if( z != 10 ) continue;
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
							}
						}
					}

//			if( first ) continue;
	if(0)
		for( let n = 1; n <= 12; n++ ) {
			if( values[0] > 0 && values[n] < 0 ) {
			//if( yodd && values[0] < 0 && values[n] > 0 ) {
			//	if( skips++ < 3 ) break;
//if(x!=2)break;
//		first = true;
		//continue;
//	if( n < 10 ) continue;
		//	console.log( "index:", x,y,z, yodd, dirkeys[n-1] );
/*    
			opts.normalVertices.push( new THREE.Vector3( here.x,here.y+0.03, here.z+0.05 ))
			//opts.normalVertices.push( new THREE.Vector3(here.x + dirDirs[yodd][n][0],here.y+0.05 + dirDirs[yodd][n][1],here.z +0.05+ dirDirs[yodd][n][2] ) )
			opts.normalVertices.push( new THREE.Vector3(here.x + dirDeltas[zm][yodd][n-1].x
						,here.y + 0.05 + dirDeltas[zm][yodd][n-1].y
						,here.z + 0.05 + dirDeltas[zm][yodd][n-1].z ) )
			opts.normalColors.push( white);
			opts.normalColors.push( white);
*/
			opts.normalVertices.push( new THREE.Vector3( here.x-0.03,here.y-0.03, here.z+0.05 ))
			opts.normalVertices.push( new THREE.Vector3(here.x + dirDirs[yodd][n-1][0],here.y-0.05 + dirDirs[yodd][n-1][1],here.z +0.05+ dirDirs[yodd][n-1][2] ) )
			opts.normalColors.push( white);
			opts.normalColors.push( white);

		first = true;
			}
		}
		//if( !first ) skips--;
//if( values[0] > 0 )
if( false ) {
	const sprite = makeTextSprite(`(${x},${y},${z})` );
	sprite.position.set( here.x,here.y,here.z);
	sprite.center.x = 0.25;
	opts.surfacemesh.add( sprite );
}

					// this can mesh from inside to out or outside to in
					//if( values[0] < 0 ) continue;
//				if( first )
					tetCompute(values, dirDirs[yodd], false);
					//cellCompute(yodd, values, dirDirs[yodd]);
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
