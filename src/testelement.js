function createTestElementData() {
	var result = {};
	
	function memoize(f) {
		var cached = null;
		return function(a) {
			if(cached === null) { 
				cached = f(a);
			}
			return cached;
		}
	}
	
	function makeVolume(dims, f) {
		return memoize( function(field, fill) {
			var res = field.dims;// = new Array(3);
			//for(var i=0; i<3; ++i) {
			//	res[i] = 2 + Math.ceil((dims[i][1] - dims[i][0]) / dims[i][2]);
			//}

			var volume = new Float32Array((res[0]) * (res[1]) * (res[2]))
				, n = 0;

			

			for(var k=0 ; k<res[2]; ++k )
			for(var j=0 ; j<res[1]; ++j)
			for(var i=0 ; i<res[0]; ++i, ++n) {
				if( fill ) {
					if( (k===0 ) || ( j === 0 ) || ( i ===  0 ) || ( i  === (res[0]-1) ) || ( j === (res[1]-1) ) || ( k === (res[2]-1) ) ) {
						if( fill < 0 )
							volume[n] = 0; 
						else
							volume[n] = 1 + ( (7 * Math.random())|0 );
						continue;
					}
				} 
				if( j > 6 )
					if( field.data[n] >= 0 )
						volume[n] = 0;
					else
						volume[n] = 1 + (((j-7) / 3 )|0);
				else if( j > 3 )
					if( field.data[n] >= 0 )
						volume[n] = 0;
					else
						volume[n] = 1;
				else
					if( field.data[n] >= 0 )
						volume[n] = 0;
					else
						volume[n] = 1 + (7 * Math.random())|0;
			}

			return {data: volume, dims:res};
		});
	}

	result['Sphere'] = makeVolume(
		[[-1.0, 1.0, 0.25],
		 [-1.0, 1.0, 0.25],
		 [-1.0, 1.0, 0.25]],
		function(x,y,z) {
			return x*x + y*y + z*z - 1.0;
		}
	);

	result['testdots'] = makeVolume(
		[[-1.0, 1.0, 1],
		 [-1.0, 1.0, 1],
		 [-1.0, 1.0, 1]],
		function(x,y,z) {
			if( x=== 0 && y ===0 && z === 0 ) 
				return -1;
			if( x=== 0 && y === 1 && z === 0 ) 
				return -1;
			return 1;
		}
	);

	result['dots'] = makeVolume(
		[[-4.0, 4.0, 1],
		 [-4.0, 4.0, 1],
		 [-4.0, 6.0, 1]],
		function(x,y,z) {
			//console.log( "duh? ", x, y, z );
			if( ( Math.abs(x) % 2 == 1 )
			&& ( (z < 0 ) ? ( Math.abs(y) % 2 == 1 ) : ( Math.abs(y) % 2 == 0 ) )
			&& ( ( Math.abs(x) % 2 == 0 ) ? ( Math.abs(z) % 2 == 1 ) : ( Math.abs(z) % 2 == 1 ) ))
				return -2.3 * Math.random();
			else
				return 2.3 * Math.random();
		}
	);


	result['Torus'] = makeVolume(
		[[-2.0, 2.0, 0.2],
		 [-2.0, 2.0, 0.2],
		 [-1.0, 1.0, 0.2]],
		function(x,y,z) {
			return Math.pow(1.0 - Math.sqrt(x*x + y*y), 2) + z*z - 0.25;
		}
	);

	result['Big Sphere'] = makeVolume(
		[[-1.0, 1.0, 0.05],
		 [-1.0, 1.0, 0.05],
		 [-1.0, 1.0, 0.05]],
		function(x,y,z) {
			return x*x + y*y + z*z - 1.0;
		}
	);
	
	result['Hyperelliptic'] = makeVolume(
		[[-1.0, 1.0, 0.05],
		 [-1.0, 1.0, 0.05],
		 [-1.0, 1.0, 0.05]],
		function(x,y,z) {
			return Math.pow( Math.pow(x, 6) + Math.pow(y, 6) + Math.pow(z, 6), 1.0/6.0 ) - 1.0;
		}  
	);
	
	result['Nodal Cubic'] = makeVolume(
		[[-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05]],
		function(x,y,z) {
			return x*y + y*z + z*x + x*y*z;
		}
	);
	
	result["Goursat's Surface"] = makeVolume(
		[[-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05]],
		function(x,y,z) {
			return Math.pow(x,4) + Math.pow(y,4) + Math.pow(z,4) - 1.5 * (x*x  + y*y + z*z) + 1;
		}
	);
	
	result["Heart"] = makeVolume(
		[[-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05],
		 [-2.0, 2.0, 0.05]],
		function(x,y,z) {
			y *= 1.5;
			z *= 1.5;
			return Math.pow(2*x*x+y*y+2*z*z-1, 3) - 0.1 * z*z*y*y*y - y*y*y*x*x;
		}
	);
	
	result["Nordstrand's Weird Surface"] = makeVolume(
		[[-0.8, 0.8, 0.01],
		 [-0.8, 0.8, 0.01],
		 [-0.8, 0.8, 0.01]],
		function(x,y,z) {
			return 25 * (Math.pow(x,3)*(y+z) + Math.pow(y,3)*(x+z) + Math.pow(z,3)*(x+y)) +
				50 * (x*x*y*y + x*x*z*z + y*y*z*z) -
				125 * (x*x*y*z + y*y*x*z+z*z*x*y) +
				60*x*y*z -
				4*(x*y+x*z+y*z);
		}
	);
	
	result['Sine Waves'] = makeVolume(
		[[-Math.PI*2, Math.PI*2, Math.PI/8],
		 [-Math.PI*2, Math.PI*2, Math.PI/8],
		 [-Math.PI*2, Math.PI*2, Math.PI/8]],
		function(x,y,z) {
			return Math.sin(x) + Math.sin(y) + Math.sin(z);
		}
	);
	result['Sine^2 Waves'] = makeVolume(
		[[-Math.PI*0.75, Math.PI*0.75, Math.PI/32],
		 [-Math.PI*0.75, Math.PI*0.75, Math.PI/32],
		 [-Math.PI*0.75, Math.PI*0.75, Math.PI/32]],
		function(x,y,z) {
			return Math.sin(x)*Math.sin(x) + Math.sin(y)*Math.sin(y) + Math.sin(z)*Math.sin(z)+2;
		}
	);
	
	result['Perlin Noise'] = makeVolume(
		[[-5, 5, 0.25],
		 [-5, 5, 0.25],
		 [-5, 5, 0.25]],
		function(x,y,z) {
			return PerlinNoise.noise(x,y,z) - 0.5;
		}
	);
		
	result['Asteroid'] = makeVolume(
		[[-1, 1, 0.08],
		 [-1, 1, 0.08],
		 [-1, 1, 0.08]],
		function(x,y,z) {
			return (x*x + y*y + z*z) - PerlinNoise.noise(x*2,y*2,z*2);
		}
	);
	
	result['Terrain 2'] = makeVolume(
		[[-1, 1, 0.05],
		 [-1, 1, 0.05],
		 [-1, 1, 0.05]],
		function(x,y,z) {
			return  y + PerlinNoise.noise(x*2+5,y*2+3,z*2+0.6);
		}
	);
	result['Terrain 3'] = makeVolume(
		[[-1, 1, 0.05],
		 [-1, 1, 0.05],
		 [-1, 1, 0.05]],
		function(x,y,z) {
			return  y + PerlinNoise.noise(x*2+5,y*2+3,z*2+0.6);
		}
	);
	result['Terrain'] = makeVolume(
		[[-1, 1, 0.05],
		 [-1, 1, 0.05],
		 [-1, 1, 0.05]],
		function(x,y,z) {
			return  y + PerlinNoise.noise(x*2+5,y*2+3,z*2+0.6);
		}
	);

	function distanceFromConvexPlanes(planes, planeOffsets, x, y, z) {
		var maxDistance = -Infinity;
		for(var i = 0; i < planes.length; i++) {
			var x_ = x - planeOffsets[i][0];
			var y_ = y - planeOffsets[i][1];
			var z_ = z - planeOffsets[i][2];

			var dotProduct = planes[i][0] * x_ + planes[i][1] * y_ + planes[i][2] * z_;

			maxDistance = Math.max(maxDistance, dotProduct);
		}

		return maxDistance;
	}

	result['Pyramid'] = makeVolume(
		[[-1, 1, 0.125],
		 [-1, 1, 0.125],
		 [-1, 1, 0.125]],
		function(x,y,z) {
			var ROOT_3 = Math.sqrt(3);

			var planes = [[-ROOT_3, ROOT_3, -ROOT_3],
							      [-ROOT_3, ROOT_3,  ROOT_3],
							      [ ROOT_3, ROOT_3, -ROOT_3],
							      [ ROOT_3, ROOT_3,  ROOT_3]];
			var planeOffsets = [[0,0,0],[0,0,0],[0,0,0],[0,0,0]];

			return distanceFromConvexPlanes(planes, planeOffsets, x, y, z);
		}
	);

	result['1/2 Offset Pyramid'] = makeVolume(
		[[-1, 1, 0.125],
		 [-1, 1, 0.125],
		 [-1, 1, 0.125]],
		function(x,y,z) {
			var ROOT_3 = Math.sqrt(3);

			var planes = [[-ROOT_3, ROOT_3, -ROOT_3],
							      [-ROOT_3, ROOT_3,  ROOT_3],
							      [ ROOT_3, ROOT_3, -ROOT_3],
							      [ ROOT_3, ROOT_3,  ROOT_3]];
			var planeOffsets = [[0.0625, 0.0625, 0.0625],
							            [0.0625, 0.0625, 0.0625],
							            [0.0625, 0.0625, 0.0625],
							            [0.0625,0.0625,0.0625]];

			return distanceFromConvexPlanes(planes, planeOffsets, x, y, z);
		}
	);

	result['Tetrahedron'] = makeVolume(
		[[-1, 1, 0.125],
		 [-1, 1, 0.125],
		 [-1, 1, 0.125]],
		function(x,y,z) {
			var INV_ROOT_3 = Math.sqrt(3)/3;

			var planes = [[ INV_ROOT_3,  INV_ROOT_3,  INV_ROOT_3],
							      [-INV_ROOT_3, -INV_ROOT_3,  INV_ROOT_3],
							      [ INV_ROOT_3, -INV_ROOT_3, -INV_ROOT_3],
							      [-INV_ROOT_3,  INV_ROOT_3, -INV_ROOT_3]];
			var planeOffsets = [[ 0.25,  0.25,  0.25],
							            [-0.25, -0.25,  0.25],
							            [ 0.25, -0.25, -0.25],
							            [-0.25,  0.25, -0.25]];

			return distanceFromConvexPlanes(planes, planeOffsets, x, y, z);
		}
	);

	result['1/2 Offset Tetrahedron'] = makeVolume(
		[[-1, 1, 0.125],
		 [-1, 1, 0.125],
		 [-1, 1, 0.125]],
		function(x,y,z) {
			var INV_ROOT_3 = Math.sqrt(3)/3;

			var planes = [[ INV_ROOT_3,  INV_ROOT_3,  INV_ROOT_3],
							      [-INV_ROOT_3, -INV_ROOT_3,  INV_ROOT_3],
							      [ INV_ROOT_3, -INV_ROOT_3, -INV_ROOT_3],
							      [-INV_ROOT_3,  INV_ROOT_3, -INV_ROOT_3]];
			var planeOffsets = [[ 0.3125,  0.3125,  0.3125],
							            [-0.3125, -0.3125,  0.3125],
							            [ 0.3125, -0.3125, -0.3125],
							            [-0.3125,  0.3125, -0.3125]];

			return distanceFromConvexPlanes(planes, planeOffsets, x, y, z);
		}
	);
	
	result['Empty'] = function(){ return { data: new Float32Array(32*32*32), dims:[32,32,32] } };
	
	return result;
}
