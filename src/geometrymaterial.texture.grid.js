import  "./three.js/three.min.js"

THREE.GridGeometryMaterial = GeometryMaterial;
function GeometryMaterial() {
    return new THREE.ShaderMaterial( {
    defines : {
        PHONG:true,
	CALCULATE_COSINE_MERGE:1,
	
    },
	uniforms: THREE.UniformsUtils.merge( [

        THREE.UniformsLib[ "ambient" ],
        THREE.UniformsLib[ "lights" ],
        {
	    textureMap3 : { type:"t", value:null },
            edge_only : { type: "f", value : 0 },
            //map : { type : "t", value : null },
            specular : {value : [0.02,0.02,0.02]},
            emissive : {value: new THREE.Color(0,0,0 )},
            diffuse : {value: new THREE.Color(0x909090 )},
            shininess : {value: 40},
            ambientLightColor : {value:new THREE.Color(0x404040)},
	    cursorIconTex      : { type:"t", value:null },
	    cursorRayNormal    : { value : new THREE.Vector3( 0, 0, 0 ) },
            cursorRayOrigin    : { value : new THREE.Vector3( 0, 0, 0 ) },
            cursorIconNormal   : { value : new THREE.Vector3( 0, 0, 0 ) },
            cursorIconUp       : { value : new THREE.Vector3( 0, 0, 0 ) },
            textureStackSize : { value : 6.0 }, // this should be like Textures.count.

        enableAberration : { value : 0 },
        enableLorentz : { value : 0 },
        enableContract : { value : 0 },

        velocity1 : { value: new THREE.Vector3(0,0,0) },
        velocity2 : { value: new THREE.Vector3(0,0,0) }		

        }
    ] ),
    // lights:true,  (soon!)
    transparent : true,
    lights: true,
     blending: THREE.NormalBlending,
	vertexShader: `

    // expected 'position' as an attribute.
// expected 'normal' as an attribute.

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    flat out float aspect;// = projectionMatrix [1][1] / projectionMatrix [0][0];

    attribute  vec4 in_Color;
    attribute  vec4 in_FaceColor;
    attribute  float in_Pow;

    attribute  float in_use_texture;
    attribute  float in_flat_color;
    attribute  float in_decal_texture;

	attribute vec3 types1;
	attribute vec3 types2;
	attribute vec3 typeDelta;
	attribute vec3 simplex;

	out vec3 v_types1;
	out vec3 v_types2;
	invariant  v_types1;
	invariant  v_types2;
	out vec3 v_typeDelta; 
	out vec3 v_simplex;
	
    uniform vec3 pointCursor_1; // this will probably be an array someday.

    attribute  vec3 in_Modulous;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    varying vec4 ex_Color;
    varying vec2 ex_texCoord;
    varying float ex_Dot;
    varying  float ex_Pow;
    varying float vDepth;
    varying float ex_use_texture;
    varying float ex_flat_color;
    varying float ex_decal_texture;
    varying vec4 ex_FaceColor;


    varying vec3 zzNormal;
    varying vec3 zrNormal;
    varying vec3 zzPos;
    varying vec4 zPosition;
#if !CALCULATE_COSINE_MERGE
	varying vec3 curDeltas;
#endif
    #define EPSILON 1e-6

    varying float T;

    uniform float time;
    uniform vec3 velocity1;
    uniform vec3 velocity2;
    uniform int enableAberration;
    uniform int enableLorentz;
    uniform int enableContract;
    const float C=1.0;

    vec3 aberration( vec3 X, vec3 Vo, vec3 Xo ){

        if( enableAberration == 0 || Vo.x == 1.0 ) {
            return X+Xo;
        }
        vec3 Xr;// = vec3();
        float delx = X.x-Xo.x;
        float dely = X.y-Xo.y;
        float delz = X.z-Xo.z;
        float len2 = delx*delx+dely*dely+delz*delz;
        float Vlen2 = Vo.x*Vo.x+Vo.y*Vo.y+Vo.z*Vo.z;
        float Vdot = delx * Vo.x + dely * Vo.y + delz * Vo.z;
        vec3 Vcrs = vec3(  delz*Vo.y-dely*Vo.z, delx*Vo.z-delz*Vo.x, dely*Vo.x-delx*Vo.y );
        if( len2 < 0.0000001 || Vlen2 < 0.000001) {
            // not far enough away to change...
            Xr =  Xo+X;
        } else {
            float len = sqrt(len2);
            float Vlen = sqrt(Vlen2);
            float norm = Vlen*len;
             //const vAng = acos( Vo.x/Vlen ) * (Vo.y<0?1:-1);
             //console.log( "velocity angle:", vAng, "from", Vlen );
            float CosVDot = Vdot/(norm);
            float baseAng = acos( CosVDot );
            float delAng = acos( ( CosVDot + Vlen/C ) 
                    / ( 1.0 + Vlen/C * CosVDot ) )-baseAng;
    
            if( abs(delAng) < 0.00000001 ) {
                Xr=Xo+X;
                return Xr;
            }
            float c = cos(delAng);
            float s = sin(delAng);
            float n = sqrt( Vcrs.x*Vcrs.x+Vcrs.y*Vcrs.y+Vcrs.z*Vcrs.z);
            if( n < 0.000000001 )
            {
                Xr=Xo+X;
                return Xr;
            }
            float qx = Vcrs.x/n;
            float qy = Vcrs.y/n;
            float qz = Vcrs.z/n;
    
            float vx = delx , vy = dely , vz = delz;
    
            float dot =  (1.0-c)*((qx * vx ) + (qy*vy)+(qz*vz));
            Xr.x = Xo.x + vx*c + s*(qy * vz - qz * vy) + qx * dot;
            Xr.y = Xo.y + vy*c + s*(qz * vx - qx * vz) + qy * dot;
            Xr.z = Xo.z + vz*c + s*(qx * vy - qy * vx) + qz * dot;
            
    /*
            const lnQ = new lnQuat( delAng, Vcrs ); // normalizes vector
            const delVec = {x:delx, y:dely, z:delz };
            const newDel = lnQ.apply( delVec )
    
            Xr.x = Xo.x + newDel.x;
            Xr.y = Xo.y + newDel.y;
            Xr.z = Xo.z + newDel.z;
    */
        }
        return Xr;
    }

    vec3 hsv2rgb(vec3 c)
    {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }


    varying  vec3 ex_Modulous;

    void main() {
        aspect = projectionMatrix [1][1] / projectionMatrix [0][0];

    	#include <uv_vertex>
    	#include <uv2_vertex>
    	#include <color_vertex>


    	#include <beginnormal_vertex>
    	#include <morphnormal_vertex>
    	#include <skinbase_vertex>
        #include <skinnormal_vertex>

        // this sets transformedNormal, transformdTrangent// uses a normal matrix
    	#include <defaultnormal_vertex>

        vNormal = normalize( transformedNormal );

        // sets transformed from 'position'
    	#include <begin_vertex>
    	#include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>

        mat3 rotmat = mat3( modelViewMatrix );
        vec3 realVel = (rotmat * (velocity2+ velocity1)/2.0 );
        vec3 startPos = (modelViewMatrix * vec4( position, 1.0 )).xyz;
		float g1= (1.0-sqrt(1.0-velocity1.x/(2.0-velocity1.x))); // goodish (best)
		//float g1= 1.0-sqrt(1.0-velocity1.x*velocity1.x);  // also goodish
		//float g1= sqrt( 1.0-(velocity1.x-1.0)*(velocity1.x-1.0) ); // bad (contracts too much. (forward circle)
		//float g1= sqrt(1.0-sqrt(1.0-velocity1.x*velocity1.x)); // 
		//float g1= velocity1.x; // bad (contracts too much at high V)
		//float g1= (1.0-(1.0-velocity1.x/(2.0-velocity1.x))); //bad(contracts too much at high V)
		//float g1= g0*g0;
		if( enableContract > 0 )
        startPos = startPos - realVel*(dot( startPos,realVel)*g1) ;
        T=0.0;
        if( enableLorentz > 0 ) {

            // move position to real position, camera is then at (0,0,0)
            vec3 realVel2 = (rotmat *  velocity2 );
            vec3 delpos = startPos;
            vec3 tmp = delpos - realVel2*time;
            float A = time*time*C*C - dot(tmp,tmp);
            float B = time*C*C + dot(realVel, tmp );
            float D = C*C-dot(realVel,realVel);
            if( abs(D) < 0.00000001 ) T = B/(2.0*A);
            else T = (sqrt( B*B - D*A ) + B)/D;
            vec3 real_position = startPos + T*realVel;
            //vec3 real_position = startPos;
            //gl_Position = projectionMatrix * vec4( real_position, 1.0 );
            vec3 abb_pos = aberration( real_position, -realVel2, vec3(0) );
            gl_Position = projectionMatrix * vec4( abb_pos, 1.0 );
	        vViewPosition = -abb_pos.xyz;
        } else if( enableAberration > 0 ) {
            mat3 rotmat = mat3( modelViewMatrix );
            vec3 realVel2 = (rotmat *  velocity2 );

            vec3 abb_pos = aberration( startPos, -realVel2, vec3(0) );
            gl_Position = projectionMatrix * vec4( abb_pos, 1.0 );
	        vViewPosition = -abb_pos.xyz;
        } else {
            #include <project_vertex>
	        vViewPosition = -mvPosition.xyz;
        }

        //#include <project_vertex>
    	#include <logdepthbuf_vertex>
    	#include <clipping_planes_vertex>


    	#include <worldpos_vertex>
    	#include <envmap_vertex>

        {
                ex_texCoord = uv;
                ex_Color = in_Color;
                ex_FaceColor = in_FaceColor;

                ex_Pow = in_Pow;

                ex_use_texture = in_use_texture;
                ex_flat_color = in_flat_color;
                ex_Modulous = in_Modulous*1.0;
        }
	v_types1 = types1;
	v_types2 = types2;
	v_simplex = simplex;
	v_typeDelta = typeDelta;//*simplex;
#if !CALCULATE_COSINE_MERGE
	curDeltas = typeDelta;// * simplex; // let opengl scale the whole thing... 
#endif
	zzPos = position;
	zPosition = gl_Position;
        zzNormal = normalize( abs(normal) );
    }
    `,
fragmentShader:`
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;
    varying vec3 zzNormal;
    varying vec3 zzPos;
    varying vec4 zPosition;

	uniform sampler2D cursorIconTex;
	uniform vec3 cursorRayNormal;
	uniform vec3 cursorRayOrigin;
	uniform vec3 cursorIconNormal;
	uniform vec3 cursorIconUp;
	uniform float textureStackSize;

//#define NUM_DIR_LIGHTS 3
    #ifndef FLAT_SHADED

        // supplied by bsdfs/phong_lighting
    	//varying vec3 vNormal;

    #endif

    #include <common>
    #include <packing>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <aomap_pars_fragment>
    #include <envmap_pars_fragment>
    #include <fog_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <lights_phong_pars_fragment>

    uniform highp sampler3D textureMap3;

    varying vec2 ex_texCoord;
    varying vec4 ex_Color;

    varying float ex_Pow;
    varying float ex_use_texture;
    varying float ex_flat_color;
    varying vec3 ex_Modulous;
    varying vec4 ex_FaceColor;
    //uniform sampler2D tex;
    uniform float edge_only;
#if !CALCULATE_COSINE_MERGE
	varying vec3 curDeltas;
#endif
    
    uniform float logDepthBufFC;
    varying float vFragDepth;
	flat in float aspect;
	 in vec3 v_types1;
	 in vec3 v_types2;
	
	in vec3 v_typeDelta;
	in vec3 v_simplex;


void IntersectLineWithPlane( vec3 Slope, vec3 Origin,  // line m, b
					 vec3 n, vec3 o,  // plane n, o
					inout vec2 r ) {
		float a,b,c,cosPhi, t; // time of intersection
		a = ( Slope.x * n.x + Slope.y * n.y + Slope.z * n.z );
		r.x = 0.0; r.y = 0.0;
	        
		if( a == 0.0 ) return;
	        
		b = length( Slope );
		c = length( n );
		if( b == 0.0 || c == 0.0 ) return; // bad vector choice - if near zero length...
	        
		cosPhi = a / ( b * c );
		t = ( n.x * ( o.x - Origin.x ) + n.y * ( o.y - Origin.y ) + n.z * ( o.z - Origin.z ) ) / a;
	        
		if( cosPhi > 0.0 || cosPhi < 0.0 ) { // at least some degree of insident angle
			r.x = cosPhi; r.y = t;
		} else
			return;
	}


    void main() {
        vec2 vUv;

        #include <clipping_planes_fragment>

    	vec4 diffuseColor = vec4( diffuse, opacity );

    	#include <logdepthbuf_fragment>
    	#include <map_fragment>
    	#include <color_fragment>
    	#include <alphamap_fragment>
    	#include <alphatest_fragment>
    	#include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>

	vec3 modulo = ex_Modulous/30.0 + 1.0;

#if CALCULATE_COSINE_MERGE
	vec3 curDeltas;
	curDeltas = v_typeDelta;

	// floor to one of the types.
	//curDeltas = vec3(0.0,0.0,0.0);

	// so this is the same result...

	// 0 becomes 1.0 as an output.. -1 cos is biased to 0 for a range of 0->1 from -1->1
	curDeltas = cos( curDeltas * 2.0*3.14159 )/2.0 + 0.5;
	curDeltas = normalize( curDeltas * curDeltas );

	// use sigmoid curve
//	curDeltas = 1.0 - (exp( curDeltas ) / ( exp( curDeltas) + 1.0 ) );

#endif


	vec3 surfaceBlend;
#if CALCULATE_COSINE_MERGE
	surfaceBlend = 1.0- (cos( v_simplex *1.0*3.14159 ) / 2.0 +0.5 );
	surfaceBlend =surfaceBlend* surfaceBlend;
	//surfaceBlend = v_simplex;
	//surfaceBlend =  (exp( v_simplex)/(exp(v_simplex)+1.0));
	// normalize coordinate.
	surfaceBlend = surfaceBlend / ( surfaceBlend.r+surfaceBlend.g+surfaceBlend.b);
#else
	surfaceBlend = v_simplex;
#endif
	//gl_FragColor.rgb = surfaceBlend;
	//gl_FragColor.a = 1.0;
	//return;

        //if(2.0 > 1.0)
        {
                   vec4 face = ex_FaceColor;
		vec4 edge = ex_Color;
                   vec4 white;
                if( 1.0 > 0.0 || ex_use_texture > 0.5 )
                {
			float fadeFrom;
			float fadeTo;
			float fadeBy;
			float tmp;

		tmp = v_types1.y;
		if( tmp == 0.0 ) 
			edge.rgb = vec3( 0.0, 0.7, 0.7 );
		else if( tmp == 1.0 ) 
			edge.rgb = vec3( 0.0, 0.5, 0.0 );
		else if( tmp == 2.0 ) 
			edge.rgb = vec3( 0.0, 0.0, 5.0 );
		else if( tmp == 3.0 ) 
			edge.rgb = vec3( 0.5, 0.0, 0.5 );
		else if( tmp == 4.0 ) 
			edge.rgb = vec3( 0.5, 0.5, 0.0 );
		else if( tmp == 5.0 ) 
			edge.rgb = vec3( 0.0, 0.5, 5.0 );
		else if( tmp == 6.0 ) 
			edge.rgb = vec3( 0.5, 0.5, 0.5 );


			float index;

#define TEXTURE_SCALAR 8.0
#define NUMBER_OF_TEXTURE_TYPES textureStackSize
// this is -0.08
#define _3D_TEXTURE_LAYER_CONVERSION ( -(1.0/NUMBER_OF_TEXTURE_TYPES) / 2.0 ) 

			// if type 1 isn't void; use type 1.
			if( v_types1.x > 0.0 ) 
				index = v_types1.x/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
			else // type 2 will not be void if 1 is void; use this.
				index = v_types1.y/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;

			const vec3 vec_2 = vec3(2.0,2.0,2.0); // to square things

			vec4 cxyz1, cxyz2, cxyz3; // texels at this point that are scaled by simplex
			// compute spacial coordinate index (should add more layers here to auto rotate uv lookups based on fractional values of curDeltas.
			vec4 cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			vec4 cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			vec4 cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			// okay so let's figure this out; the normal is a unit vector, but the sum of each thing is not itself 1.
			// but rather tus sum of the squares.
//#define MAGIC_FUNCTION ( pow(cxy1 * abs(zzNormal.z),vec_2) + pow(cyz1 * abs(zzNormal.x),vec_2) + pow(cxz1 * abs(zzNormal.y),vec_2) )
#define MAGIC_FUNCTION vec4( pow(cxy1.rgb * zzNormal.z,vec_2) + pow(cyz1.rgb * zzNormal.x,vec_2) + pow(cxz1.rgb * zzNormal.y,vec_2), \
				1.0-sqrt(pow( ( 1.0-cxy1.a )* zzNormal.z,2.0) + pow((1.0-cyz1.a) * zzNormal.x,2.0) + pow((1.0-cxz1.a) * zzNormal.y,2.0) ) )
			cxyz1 = MAGIC_FUNCTION;

			if( v_types1.x > 0.0 && v_types1.y > 0.0 ) {
				// if both are not void, then compute the other point, and the delta to the other texture
				index = v_types1.y/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
				// this calculates the position in a 3-plane repetition space; scaled by the normal.
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz2 = MAGIC_FUNCTION;
				// this is against a constant; current is the same everywhere.
				cxyz1 = cxyz1 * curDeltas.x + cxyz2 * (1.0-curDeltas.x);
			}
			

			if( v_types1.z > 0.0 ) {
				index = v_types1.z/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
			} else 
				index = v_types2.z/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;

			cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			cxyz2 = MAGIC_FUNCTION;

			if( v_types1.z >0.0 && v_types2.x >0.0 ) {
				index = v_types2.x/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz4 = MAGIC_FUNCTION;
				cxyz2 = cxyz2 * curDeltas.y + cxyz4 * (1.0-curDeltas.y);
			}

			if( v_types2.y > 0.0 ) {
				index = v_types2.y/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
			} else {
				index = v_types2.z/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
			}
			cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			cxyz3 = MAGIC_FUNCTION;

			if( v_types2.y > 0.0 && v_types2.z > 0.0 ) {
				index = v_types2.z/NUMBER_OF_TEXTURE_TYPES + _3D_TEXTURE_LAYER_CONVERSION;
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz6 = MAGIC_FUNCTION;
				cxyz3 = cxyz3 * curDeltas.z + cxyz6 * (1.0-curDeltas.z);
			}

			// compute the final composite color into cxzy2 using the barycentric simplex scalar. (always adds to 1)
			face = ( cxyz1 * surfaceBlend.x + cxyz2 * surfaceBlend.y + cxyz3 * surfaceBlend.z ) ;
                }
                //else if( ex_flat_color > 0.5 )
                //{
                //    diffuseColor =vec4(1,0,1,1);// edge;
                //}
                //else
                {
			face.a = 0.2;
			vec3 gridmod = mod( ex_Modulous/*+0.5*/, 1.0 ) - 0.5;

                    float g;
                    float h;
			gridmod = 4.0 * ( 0.25 - gridmod*gridmod);

                    float depthScalar;

			// depthScalar causes the grid lines to be 'thicker' in the distance...
                    depthScalar = 1.0/(zPosition.z+50.0)*50.0;
                    depthScalar = depthScalar*depthScalar;//*depthScalar*depthScalar;

			gridmod.x = (1.0-clamp( abs(zzNormal.x)*1.05, 0.0, 1.0 ) ) * pow( abs( gridmod.x ), ((7.0*depthScalar))*ex_Pow );
			gridmod.y = (1.0-clamp( abs(zzNormal.y)*1.05, 0.0, 1.0 ) ) * pow( abs( gridmod.y ), ((7.0*depthScalar))*ex_Pow );
			gridmod.z = (1.0-clamp( abs(zzNormal.z)*1.05, 0.0, 1.0 ) ) * pow( abs( gridmod.z ), ((7.0*depthScalar))*ex_Pow );

			         float gln = 1.0/sqrt(gridmod.z*gridmod.z+gridmod.y*gridmod.y+gridmod.x*gridmod.x);
						//gridmod.xyz *= gln;
                    g = min(1.0,(gridmod.x+gridmod.y+gridmod.z)*1.5);
                    h = max((gridmod.x+gridmod.y+gridmod.z)-1.5,0.0)/3.0;
                    //white = vec3(1.0,1.0,1.0) * max(edge.r,max(edge.g,edge.b));


      	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;

	diffuseColor = face;
        // accumulation
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
    
    	#include <aomap_fragment>

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        
    	#include <envmap_fragment>

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

    	#include <tonemapping_fragment>
    	#include <encodings_fragment>
    	#include <fog_fragment>
    	#include <premultiplied_alpha_fragment>
    	#include <dithering_fragment>

		// update to include grid computation (no shine on virtual lines)
		//if(  > 0.0 )

                    if( edge_only > 0.5 )
                         gl_FragColor += vec4( h* ( white.rgb - gl_FragColor.rgb )+ (g* edge.rgb), (g * edge.a) ) ;
                    else
                         gl_FragColor += vec4( gl_FragColor.a*(1.0-g)*gl_FragColor.rgb + h* ( white.rgb - gl_FragColor.rgb ) + (g* edge.rgb), (1.0-g)*gl_FragColor.a + (g * edge.a) ) ;
                }
            }

	//gl_FragColor.rgb += v_simplex/4.0;
	{
		// this can work in projected space. against 0 origin for camera.
				vec2 mouseAngle;
		IntersectLineWithPlane( cursorRayNormal, vec3(0.0), vNormal.xyz, zPosition.xyz, mouseAngle );

		// where the mouse intersects the plane of this pixel local position and local normal determine the plane.
		vec3 mouse_on_this = cursorRayNormal * mouseAngle.y + vec3(0.0);

		//if( distance( mouse_on_this, zPosition.xyz ) < 1.0 ) gl_FragColor.rgb = vec3(1.0,1.0,1.0);
		// detected intersection on plane.

		//vec2 planeUVAngle;
		//IntersectLineWithPlane( zzNormal.xyz, zPosition.xyz, cursorRayNormal, vec3(0.0,0.0,0.0), planeUVAngle );
		
		vec3 linePoint                = -( mouse_on_this - zPosition.xyz  );
		linePoint.y = linePoint.y / aspect;
		// since the space is already aligned to x,y,z normal; just use the resulting x,y.
		// cursorRayNormal 
		//vec3 cursorIconRightProjector = normalize(cross( cursorIconUp, vec3(0.0,0.0,1.0) ));
		// cursorIconRightProjector, cursorRayNormal 
		//vec3 cursorIconUpProjector = normalize(cross( cursorIconRightProjector, vec3(0.0,0.0,1.0) ));
		// project point on plane relative to 'here' scale from -1 to 1(around center) to 0 to 1 (uv)
		// //dot( cursorIconUpProjector, linePoint )
		float upProjection            = linePoint.x / 2.0 + 0.5;
		// //dot( cursorIconRightProjector, linePoint )
		// apply aspect correction here.
		float rightProjection         = (linePoint.y) / 2.0 + 0.5;
		
		
		// thing that are in the distance won't get splatted (beyond diagonal 1.0 cubed distance; sqrt(1+1+1) )
		if( length(linePoint) < 1.7320 ) 
		{
			// this shows what the UV map looks like...
			gl_FragColor.rgb +=( vec3(rightProjection, upProjection, 0.0) / 3.0 );
		
			//cursorRayPosition
			vec4 this_color = texture2D( cursorIconTex, vec2( rightProjection, upProjection ) );
		        if( this_color.a > 0.0 ) {
				gl_FragColor.rgb = ( gl_FragColor.rgb * (1.0-this_color.a)) + ( this_color.rgb * this_color.a );
			}
		}
	}

    }
    `
} );

/*
#if !MORE_ROUNDED
              g = sqrt((a*a+b*b+c*c)/3);
              h = pow(g,200.0) * 0.5;  // up to 600 even works...
              g = pow( ( max(a,b,c)),400);
              h = (g+h);
              gl_FragColor = vec4( h * in_Color.rgb, in_Color.a ) ;
#else
*/

}
export {GeometryMaterial}

