import {EffectComposer} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/RenderPass.js';
import {BloomPass} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/BloomPass.js';
import {FilmPass} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/FilmPass.js';

// Define the standard global variables
var container,
	scene, 
	camera,
  renderer,
  composer,
	plane,
    mouseMesh,
    saber,
    road;

// Custom global variables
var mouse = {x: 0, y: 0};

init();
animate();

function init() {

	// Scene
    scene = new THREE.Scene();
    scene.position.set(0,0,0)

	// Camera
	var screenWidth = window.innerWidth,
			screenHeight = window.innerHeight,
			viewAngle = 75,
			nearDistance = 0.1,
			farDistance = 1000;
	camera = new THREE.PerspectiveCamera(viewAngle, screenWidth / 	screenHeight, nearDistance, farDistance);
	scene.add(camera);
	camera.position.set(0, 0, 5);
	camera.lookAt(scene.position);

	// Renderer engine together with the background
	renderer = new THREE.WebGLRenderer({
			antialias: true,
    	alpha: true
  });
	renderer.setSize(screenWidth, screenHeight);
	container = document.getElementById('container');
	container.appendChild(renderer.domElement); 

	// Define the lights for the scene
	var light = new THREE.HemisphereLight(0xffffff);
	light.position.set(0, 5, 5);
	scene.add(light);
	
  const color = 0xFFFFFF;
  const intensity = 1;
  const hlight = new THREE.DirectionalLight(color, intensity);
  hlight.position.set(0, 2, 10);
  scene.add(hlight);
    scene.background = "black"

	// Create a circle around the mouse and move it
    // The sphere has opacity 0
    

    var handleGeo = new THREE.CylinderGeometry(.13, .13,1, 10);
    var material = new THREE.MeshPhongMaterial({color: 0x052628}); 
    var handle = new THREE.Mesh(handleGeo, material);
    handle.position.y = -2
    var bladeGeo = new THREE.CylinderGeometry(.1, .1,4, 10);
    handle.updateMatrix();
    bladeGeo.merge(handle.geometry, handle.matrix,1);
    
    let materialArray = [
        new THREE.MeshBasicMaterial({color: 0x1febfd}),
        new THREE.MeshBasicMaterial({color: 0x052628}),
        
    ];

	//var mouseGeometry = new THREE.CylinderGeometry(.1, .1,4, 10);
	//var mouseMaterial = new THREE.MeshBasicMaterial({
		//color: 0x1febfd
    //});
    saber = new THREE.Mesh(bladeGeo, materialArray);
    saber.position.z = 0;
    saber.rotation.x = -Math.PI / 6;
    saber.castShadow = true;
    scene.add(saber);
    
    
  
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
  
    const bloomPass = new BloomPass(
        1,    // strength
        25,   // kernel size
        5,    // sigma ?
        
    );
    composer.addPass(bloomPass);
  
    const filmPass = new FilmPass(
        0.0,   // noise intensity
        0.0,  // scanline intensity
        0,    // scanline count
        false,  // grayscale
    );
    filmPass.renderToScreen = true;
    composer.addPass(filmPass);
    scene.background = "black"
	// When the mouse moves, call the given function
	document.addEventListener('mousemove', onMouseMove, false);
}

// Follows the mouse event
function onMouseMove(event) {

	// Update the mouse variable
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

 // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	saber.position.copy(pos);
  
	// Make the sphere follow the mouse
//	mouseMesh.position.set(event.clientX, event.clientY, 0);
};


const options = {
    length: 400,
    width: 20,
    roadWidth: 9,
    islandWidth: 2,
    nPairs: 50,
    roadSections: 3
  };

  const geometry = new THREE.PlaneBufferGeometry(
    options.width,
    options.length,
    20,
    200
  );


  const fragmentShader = `
    uniform vec3 uColor;
	void main(){
        gl_FragColor = vec4(uColor,1.);
    }
    `;
    const vertexShader = `
    uniform float uTravelLength;
    #include <getDistortion_vertex>
        void main(){
            vec3 transformed = position.xyz;
            
        float progress = (transformed.y + uTravelLength / 2.) / uTravelLength;
        vec3 distortion  = getDistortion(progress);
        transformed.x += distortion.x;
        transformed.z += distortion.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
        }
    `;
    const lfragmentShader = `
uniform vec3 uColor;
  void main() {
      vec3 color = vec3(uColor);
      gl_FragColor = vec4(color,1.);
  }
`;

const lvertexShader = `
attribute vec3 aOffset;
attribute vec2 aMetrics;
uniform float uTime;
uniform float uSpeed;
uniform float uTravelLength;
#include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    
    float radius = aMetrics.r;
    float len = aMetrics.g;
    transformed.xy *= radius; 
    transformed.z *= len;

    float zOffset = uTime * uSpeed + aOffset.z;
    zOffset = len - mod(zOffset, uTravelLength);

    // transformed.z +=uTime * uSpeed;


		// Keep them separated to make the next step easier!
	   transformed.z = transformed.z +zOffset ;
        transformed.xy += aOffset.xy;

        
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

	
        vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
        gl_Position = projectionMatrix * mvPosition;
	}
`;

const distortion_uniforms = {
    uDistortionX: new THREE.Uniform(new THREE.Vector2(40, 3)),
    uDistortionY: new THREE.Uniform(new THREE.Vector2(-10, 2.5))
  };
  
const distortion_vertex = `
#define PI 3.14159265358979
uniform vec2 uDistortionX;
uniform vec2 uDistortionY;

    float nsin(float val){
    return sin(val) * 0.5+0.5;
    }
vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`;

const myCustomDistortion = {
    uniforms: distortion_uniforms,
    getDistortion: distortion_vertex,
}

const material = new THREE.ShaderMaterial({
    opacity: 0.5,
    transparent: true,
fragmentShader:fragmentShader,
vertexShader:vertexShader,
uniforms: Object.assign(
    {
      uColor: new THREE.Uniform(new THREE.Color(0x080808)),
      uTime: new THREE.Uniform(0),
      uTravelLength: new THREE.Uniform(options.length)
    },
    myCustomDistortion.uniforms
  )
});

material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <getDistortion_vertex>",
      myCustomDistortion.getDistortion
    );
  };

road = new THREE.Mesh(geometry, material);

road.rotation.x = -Math.PI/2;
road.position.z = -options.length / 2;
road.position.y =-5;
scene.add(road);


let curve = new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
);
let baseGeometry = new THREE.TubeBufferGeometry(curve, 50, 1, 8, false);
let instanced = new THREE.InstancedBufferGeometry().copy(baseGeometry);
instanced.instanceCount = options.nPairs * 2;

let aOffset = [];
let aMetrics = [];

let sectionWidth = options.roadWidth / options.roadSections;

for (let i = 0; i < options.nPairs; i++) {
    let radius = Math.random() * 0.1 + 0.1;
    let length =
        Math.random() * options.length * 0.08 + options.length * 0.02;
    // 1a. Get it's lane index
    // Instead of random, keep lights per lane consistent
    let section = i % 3;

    // 1b. Get its lane's centered position
    let sectionX =
    section * sectionWidth - options.roadWidth / 2 + sectionWidth / 2;
    let carWidth = 0.5 * sectionWidth;
    let offsetX = 0.5 * Math.random();

    let offsetY = radius * 1.3;

    let offsetZ = Math.random() * options.length;

    aOffset.push(sectionX - carWidth / 2 + offsetX);
    aOffset.push(offsetY);
    aOffset.push(-offsetZ);

    aOffset.push(sectionX + carWidth / 2 + offsetX);
    aOffset.push(offsetY);
    aOffset.push(-offsetZ);

    aMetrics.push(radius);
    aMetrics.push(length);

    aMetrics.push(radius);
    aMetrics.push(length);
}
// Add the offset to the instanced geometry.
instanced.setAttribute(
    "aOffset",
    new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
);
instanced.setAttribute(
    "aMetrics",
    new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
  );
const rightLightMaterial = new THREE.ShaderMaterial({
    fragmentShader:lfragmentShader,
    vertexShader:lvertexShader,
    uniforms: Object.assign(
        {
          uColor: new THREE.Uniform(new THREE.Color(0x53C2C6)),
          uTravelLength: new THREE.Uniform(options.length),
          uTime: new THREE.Uniform(0),
          uSpeed: new THREE.Uniform(10)
        },
        myCustomDistortion.uniforms
      )
});

const leftLightMaterial = new THREE.ShaderMaterial({
    opacity: 0.5,
    transparent: true,
    fragmentShader:lfragmentShader,
    vertexShader:lvertexShader,
    uniforms: Object.assign(
        {
          uColor: new THREE.Uniform(new THREE.Color(0xFF5F73)),
          uTravelLength: new THREE.Uniform(options.length),
          uTime: new THREE.Uniform(0),
          uSpeed: new THREE.Uniform(-10)
        },
        myCustomDistortion.uniforms
      )
});

leftLightMaterial.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <getDistortion_vertex>",
      myCustomDistortion.getDistortion
    );
  };
rightLightMaterial.onBeforeCompile = shader => {
shader.vertexShader = shader.vertexShader.replace(
    "#include <getDistortion_vertex>",
    myCustomDistortion.getDistortion
);
};



let rightLights = new THREE.Mesh(instanced, rightLightMaterial);
rightLights.frustumCulled = false;
rightLights.position.y =-5.2;
rightLights.position.x = options.roadWidth / 2 + options.islandWidth / 2
let leftLights = new THREE.Mesh(instanced, leftLightMaterial);
leftLights.frustumCulled = false;
leftLights.position.y =-5.2;
leftLights.position.x =-options.roadWidth / 2 - options.islandWidth / 2
scene.add(rightLights);
scene.add(leftLights);

var time = 0;
setInterval(function () {
  time++;
  rightLights.material.uniforms.uTime.value = time;
leftLights.material.uniforms.uTime.value = time;
}, 50);








// Animate the elements
function animate() {
  requestAnimationFrame( animate );
  renderer.autoClear = false
  composer.autoClear = false;
	composer.render( scene, camera );
}
//render();
// Rendering function
function render() {
    //composer.render();
    //requestAnimationFrame(animate);
	// For rendering
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(scene, camera);
};