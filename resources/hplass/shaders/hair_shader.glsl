

\js
//define exported uniforms from the shader (name, uniform, widget)
  
  this.createProperty("haircolor", 			0, 		"separator"); 
  this.createProperty("Hair Color", 	0, 		"title");
		this.createUniform("HairColor","u_hair_color" 		  ,						LS.TYPES.COLOR, [0.478,0.337,0.212]);
		this.createUniform("HighlightFlat","u_highlightA_color"		    ,	LS.TYPES.COLOR, [0.831,0.604,0.388]);
		this.createUniform("HighlightCrisp","u_highlightB_color",				LS.TYPES.COLOR, [0.961,0.776,0.271]);
		this.createUniform("CoarseFactor","u_coarse_factor","number", 0.5);
	  this.createUniform("TranslucencyFactor","u_translucency_factor","number", 0.5);

this.createProperty("hairtextures", 	0, 		"separator");
  this.createProperty("Hair Textures",0, 		"title");
		this.createSampler("NormalTexture","u_normal_texture", {missing:"normal"});
		this.createSampler("TangentTexture","u_tangent_texture", {missing:"normal"});
    this.createSampler("DiffuseTexture","u_diffuse_texture");
    this.createSampler("GlitterTexture","u_glitter_texture", {missing:"white"});
    this.createSampler("ShiftTexture",  "u_shift_texture", {missing:"white"});
    this.createSampler("Cut",  "u_cut_texture", {missing:"white"});
		this.createSampler("AO",  "u_hairao_texture", {missing:"white"});
this.onPrepare = function(scene){
  //http://www.roxlu.com/2014/037/opengl-rim-shader
}

this.render_state.cull_face = false;
this.render_state.blend = true;
this.render_state.blendFunc0 = GL.SRC_ALPHA;
this.queue = LS.RenderQueue.TRANSPARENT;
this._light_mode = 1;

\color.vs
  
precision highp float;
attribute vec3 a_vertex;
attribute vec3 a_normal;
attribute vec2 a_coord;
attribute vec3 a_tangent;

//varyings
varying vec3 v_normal;
varying vec3 v_pos;
varying vec2 v_uvs;
varying vec3 v_tan;

//matrices
uniform mat4 u_model;
uniform mat4 u_normal_model;
uniform mat4 u_view;
uniform mat4 u_viewprojection;

//globals
uniform float u_time;
uniform vec4 u_viewport;
uniform float u_point_size;

//camera
uniform vec3 u_camera_eye;

#pragma shaderblock "light"
#pragma shaderblock "morphing"
#pragma shaderblock "skinning"

void main() {
	
  
  vec4 vertex4 = vec4(a_vertex,1.0);
  v_normal = a_normal;
  v_uvs = a_coord;
  v_tan = (u_model * vec4(a_tangent,0.0)).xyz;
  
	applyMorphing( vertex4, v_normal );
  applySkinning( vertex4, v_normal );  
  
  v_pos = (u_model * vertex4).xyz;
  
  applyLight(v_pos);
  
  v_normal = (u_normal_model * vec4(v_normal,0.0)).xyz;
	
	gl_Position = u_viewprojection * vec4(v_pos,1.0);	
}

\color.fs
#extension GL_OES_standard_derivatives : enable
precision highp float;
//varyings
varying vec3 v_normal;
varying vec3 v_pos;
varying vec3 v_tan;
varying vec2 v_uvs;
//globals
uniform mat4 u_view;
uniform float u_time;
uniform vec3 u_camera_eye;
uniform vec4 u_clipping_plane;
uniform vec3 u_background_color;
//material
uniform vec4 u_material_color;
uniform vec3 u_hair_color; //root
uniform vec3 u_highlightA_color; //hair
uniform vec3 u_highlightB_color;

uniform sampler2D u_cut_texture;
uniform sampler2D u_shift_texture;
uniform sampler2D u_glitter_texture;
uniform sampler2D u_diffuse_texture;
uniform sampler2D u_normal_texture;
uniform sampler2D u_tangent_texture;
uniform sampler2D u_hairao_texture;
uniform float u_coarse_factor;
uniform float u_translucency_factor;

vec3 shiftTangent(vec3 normal, vec3 tangent, float shift){
  normal *= shift;
  tangent += normal;
	return normalize(tangent);
}

float strandSpec(vec3 T, vec3 H, float power, float strength){
  float TdotH = dot(T,H);
  float ditAtten = smoothstep( -1.0, 0.0, TdotH);
  float sinTH = sqrt(1.0 - (TdotH * TdotH));
  float value = ditAtten * pow(sinTH,power) * strength;
	return value;
}

vec3 Fresnel_Schlick(vec3 F0, float LdotH){
    return F0 + (1.0 - F0) * pow(1.0 - LdotH,3.0);
}

float rimlight(vec3 N, float LdotH){
  
  vec3 n = normalize(u_view * vec4(N,0.0)).xyz;
  vec3 p = (u_view * vec4(v_pos,1.0)).xyz;
  vec3 v = normalize(-p);
  float vdn = 1.0 - max(dot(v, n), 0.0);
  vdn = smoothstep(0.75, 1.0, vdn);
  vdn = vdn * Fresnel_Schlick(vec3(0.001),LdotH).x;//Fresnel_Schlick(vec3(0.1), dot(N,L)).z;
  
	return vdn;
}

#pragma shaderblock "light"
#pragma snippet "perturbNormal"

void main() {
	
  float cut = texture2D(u_cut_texture,v_uvs).w;
  if( cut < 0.25) discard;
  
  Input IN = getInput();
  SurfaceOutput o = getSurfaceOutput();
	
  vec4 final_color = vec4(0.0);
  Light LIGHT = getLight();
  FinalLight fLight;
  final_color.xyz = computeLight( o, IN, LIGHT, fLight);
  

  
  vec3 L = normalize(LIGHT.Position - v_pos);
  vec3 V = normalize(u_camera_eye - v_pos);
  vec3 H = normalize(V + L);
  vec3 vN =  normalize( v_normal );
  vec3 N = perturbNormal( vN , v_pos, v_uvs, texture2D(u_normal_texture,v_uvs).xyz );
	
  float LdotH = max(0.0,dot(L,H));
  
  vec3 B = normalize(v_tan);
  mat3 TBN = mat3(cross(B,N),B,N);
  vec3 T = TBN * (texture2D(u_tangent_texture,v_uvs).xyz * 255./127. - 128./127.);
  
  
  float shift		=	pow(texture2D(u_shift_texture, v_uvs).x,1.0) ;
  float glitter = texture2D(u_glitter_texture, v_uvs*vec2(3.0,1.0)).x * 8.0;
  vec3 	rim 		= rimlight(N,LdotH) * u_highlightB_color;
  float hlMask  = 1.25;
  H = normalize(V - L);
  
  
  //shift tangents
  vec3 t1 = shiftTangent(N,T,shift + 0.05);
  vec3 t2 = shiftTangent(N,T,shift + -0.15);
  
  //diff lighting
  vec3 diff = shift * u_hair_color * clamp(mix(0.25,1.0,dot(N,L)),0.0,1.0);
  
  //spec lighting
  vec3 pri_high = max(u_highlightA_color * strandSpec(t1 ,H, 1500.0, 1.0) * hlMask,0.0);
  vec3 sec_high = max(u_highlightB_color * strandSpec(t2 ,H,  250.0, 1.0) * glitter,0.0);
  vec3 spec = (pri_high + sec_high) * max(0.0,u_coarse_factor);
  
  float trans_fac = u_translucency_factor * max(0.0,dot(mix(vN,N,0.5),L)*0.5+0.5);
  
  
  
  vec4 fColor = vec4(0.0);
  vec3 ambient = fLight.Ambient * texture2D(u_hairao_texture, v_uvs).xyz;
  fColor.xyz += diff + spec + (ambient + LIGHT.Color*trans_fac)* u_hair_color;
  //fColor.xyz += diff + spec + ( LIGHT.Color*trans_fac)* u_hair_color;
  fColor.xyz += rim * fLight.Shadow;
  fColor.a   = cut;
  
  fColor.xyz /=  u_light_info.x;
  
 

  /*
  float rim = rimlight(N,LdotH);
  
  vec3 diff = texture2D(u_diffuse_texture, v_uvs).xyz;
  diff = pow(diff,vec3(4.4));// vec3(u_hair_color.xyz) *
  vec3 spec = vec3(0.0);
  
  float priHighLight = max(strandSpec(shiftTangent(N,T,shift + 0.05),H, 1500.0, 1.0) * hlMask , 0.0);
  float secHighLight = max(strandSpec(shiftTangent(N,T,shift + 0.1),H, 100.00, 1.0) * glitter, 0.0);
  		 
  vec3 color =  diff  + (secHighLight + priHighLight) * u_highlight_color * max(0.0,u_coarse_factor);
  color *= hairColorGradient() * final_color.xyz * fLight.Shadow * fLight.Attenuation;*/
  gl_FragColor = fColor;
}

