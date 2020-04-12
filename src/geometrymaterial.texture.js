import  "./three.min.js"

THREE.GridGeometryMaterial = GeometryMaterial;
function GeometryMaterial() {
    return new THREE.ShaderMaterial( {
    defines : {
        PHONG:true,
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
            diffuse : {value: new THREE.Color(0xa0a0a0 )},
            shininess : {value: 40},
            ambientLightColor : {value:new THREE.Color(0x303030)}
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
    varying vec3 zzPos;
    varying vec4 zPosition;
	varying vec3 curDeltas;
    #define EPSILON 1e-6

    varying  vec3 ex_Modulous;

    void main() {

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
        #include <project_vertex>
    	#include <logdepthbuf_vertex>
    	#include <clipping_planes_vertex>

        vViewPosition = -mvPosition.xyz;

    	#include <worldpos_vertex>
    	#include <envmap_vertex>

        {
                ex_texCoord = uv;
                ex_Color = in_Color;
                ex_FaceColor = in_FaceColor;

                ex_Pow = in_Pow;

                ex_use_texture = in_use_texture;
                ex_flat_color = in_flat_color;
                ex_Modulous = in_Modulous*3.0;
        }
	v_types1 = types1;
	v_types2 = types2;
	v_simplex = simplex;
	v_typeDelta = typeDelta;//*simplex;
	curDeltas = typeDelta;// * simplex; // let opengl scale the whole thing... 
	zzPos = position;
	zPosition = gl_Position;
        zzNormal = normalize(normal);
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
	varying vec3 curDeltas;
    
    uniform float logDepthBufFC;
    varying float vFragDepth;
	 in vec3 v_types1;
	 in vec3 v_types2;
	
	in vec3 v_typeDelta;
	in vec3 v_simplex;
	//in vec3 v_curDelta;

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

	vec3 modulo = ex_Modulous/30.0 + 1.3;

	//vec3 curDeltas;
	//curDeltas = 1.0 - v_typeDelta;

	// so this is the same result...

	// 0 becomes 1.0 as an output.. -1 cos is biased to 0 for a range of 0->1 from -1->1
	//curDeltas = cos( curDeltas * 2.0*3.14159 )/2.0 + 0.5;


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
			edge.rgb = vec3( 0.5, 0.0, 0.0 );
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


			float index;
#define TEXTURE_SCALAR 8.0
			if( v_types1.x > 0.0 ) 
				index = v_types1.x/6.0-0.08;
			else
				index = v_types1.y/6.0-0.08;
			


			vec4 cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			vec4 cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			vec4 cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			vec4 cxyz1 = (cxy1 * abs(zzNormal.z)) + (cyz1 * abs(zzNormal.x)) + (cxz1 * abs(zzNormal.y));
			vec4 cxyz2 = cxyz1 = sqrt((cxyz1*cxyz1)/3.0);					

			if( v_types1.x > 0.0 && v_types1.y > 0.0 ) {
				index = v_types1.y/6.0-0.08;
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz2 = (cxy1 * abs(zzNormal.z)) + (cyz1 * abs(zzNormal.x)) + (cxz1 * abs(zzNormal.y));
				cxyz2 = sqrt((cxyz2*cxyz2)/3.0);
				
				cxyz1 = cxyz1 * curDeltas.x + cxyz2 * (1.0-curDeltas.x);
			}
			

			if( v_types1.z > 0.0 ) {
				index = v_types1.z/6.0-0.08;
			} else 
				index = v_types2.z/6.0-0.08;

			cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			cxyz2 = (cxy1.rgba * abs(zzNormal.z)) + (cyz1.rgba * abs(zzNormal.x)) + (cxz1.rgba * abs(zzNormal.y));
			cxyz2 = sqrt((cxyz2*cxyz2)/3.0);

			if( v_types1.z >0.0 && v_types2.x >0.0 ) {
				index = v_types2.x/6.0-0.08;
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz4 = (cxy1.rgba * abs(zzNormal.z)) + (cyz1.rgba * abs(zzNormal.x)) + (cxz1.rgba * abs(zzNormal.y));
				cxyz4 = sqrt((cxyz4*cxyz4)/3.0);
				cxyz2 = cxyz2 * curDeltas.y + cxyz4 * (1.0-curDeltas.y);
			}

			if( v_types2.y > 0.0 ) {
				// -- compute third point delta between it's types..
				index = v_types2.y/6.0-0.08 ;
			} else {
				index = v_types2.z/6.0 - 0.8;
			}
			cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
			cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
			cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
			vec4 cxyz3 = (cxy1.rgba * abs(zzNormal.z)) + (cyz1.rgba * abs(zzNormal.x)) + (cxz1.rgba * abs(zzNormal.y));
			cxyz3 = sqrt((cxyz3*cxyz3)/3.0);

			if( v_types2.y > 0.0 && v_types2.z > 0.0 ) {
				index = v_types2.z/6.0-0.08;
				cxy1 = texture( textureMap3, vec3(modulo.xy * TEXTURE_SCALAR,index) );
				cyz1 = texture( textureMap3, vec3(modulo.yz * TEXTURE_SCALAR,index) );
				cxz1 = texture( textureMap3, vec3(modulo.xz * TEXTURE_SCALAR,index) );
				vec4 cxyz6 = (cxy1.rgba * abs(zzNormal.z)) + (cyz1.rgba * abs(zzNormal.x)) + (cxz1.rgba * abs(zzNormal.y));
				cxyz6 = sqrt((cxyz6*cxyz6)/3.0);
				cxyz3 = cxyz3 * curDeltas.z + cxyz6 * (1.0-curDeltas.z);
			}

			// this double applies simplex... 
			cxyz1 = ( cxyz1 * v_simplex.x + cxyz2 * v_simplex.y + cxyz3 * v_simplex.z ) ;
			face = sqrt((cxyz1*cxyz1)/3.0);
	face.a = 1.0;

//	face.rgb = v_simplex;

		gl_FragColor =face;
	//	gl_FragColor.rgb = curDeltas;
//		gl_FragColor = cxyz1;
//		gl_FragColor.a = 1.0;

//gl_FragColor.r = (curDeltas.x + curDeltas.y + curDeltas.z)/2.0;
//gl_FragColor.g = (v_typeDelta.x+ v_typeDelta.y+v_typeDelta.z)/3.0;
//gl_FragColor.b = gl_FragColor.r;

//gl_FragColor.rgb = v_typeDelta;
//gl_FragColor.rgb = face.rgb;

//	return;


			//face.g += v_simplex.g/4.0;
			//face.b += v_simplex.b/4.0;
			//face.rgb = v_typeDelta/2.0;	
                }
                //else if( ex_flat_color > 0.5 )
                //{
                //    diffuseColor =vec4(1,0,1,1);// edge;
                //}
                //else
                {
			vec3 gridmod = mod( ex_Modulous+0.5, 1.0 ) - 0.5;

                    float g;
                    float h;
			gridmod = 4.0 * ( 0.25 - gridmod*gridmod);

                    float depthScalar;

                    depthScalar = 1.0/(zPosition.z+50.0)*50.0;
                    depthScalar = depthScalar*depthScalar*depthScalar*depthScalar;

			gridmod.x = pow( abs( gridmod.x ), ((7.0*depthScalar))*ex_Pow );
			gridmod.y = pow( abs( gridmod.y ), ((7.0*depthScalar))*ex_Pow );
			gridmod.z = pow( abs( gridmod.z ), ((7.0*depthScalar))*ex_Pow );

                    //g = pow( ( max(a,b)),in_Pow);
                    //h = pow( ( a*b),in_Pow/4.0);
                    g = min(1.0,gridmod.x+gridmod.y+gridmod.z);
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
        //vec3 yyNormal = vec3( (zzNormal.x+1.0)/2.0, (zzNormal.y+1.0)/2.0,(zzNormal.z+1.0)/2.0);
        //yyNormal += 0.5;
        //gl_FragColor = vec4( yyNormal, diffuseColor.a );

    	#include <tonemapping_fragment>
    	#include <encodings_fragment>
    	#include <fog_fragment>
    	#include <premultiplied_alpha_fragment>
    	#include <dithering_fragment>

		// update to include grid computation (no shine on virtual lines)
		if( 1.0 > 0.0 )

                    if( edge_only > 0.5 )
                         gl_FragColor += vec4( h* ( white.rgb - gl_FragColor.rgb )+ (g* edge.rgb), (g * edge.a) ) ;
                    else
                         gl_FragColor += 0.1 * vec4( gl_FragColor.a*(1.0-g)*gl_FragColor.rgb + h* ( white.rgb - gl_FragColor.rgb ) + (g* edge.rgb), (1.0-g)*gl_FragColor.a + (g * edge.a) ) ;
                }
            }

	//gl_FragColor.rgb += v_simplex/4.0;
	//gl_FragColor.r = float(v_type1)/6.0;

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

