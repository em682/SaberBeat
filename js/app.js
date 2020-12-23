// Define the standard global variables
var container,
	scene, 
	camera,
	renderer,
	plane,
    mouseMesh,
    saber;

// Custom global variables
var mouse = {x: 0, y: 0};

init();
animate();

function init() {

	// Scene
    scene = new THREE.Scene();
    

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
	var light = new THREE.PointLight(0xffffff);
	light.position.set(20, 0, 20);
	scene.add(light);
	var lightAmb = new THREE.AmbientLight(0x777777);
	scene.add(lightAmb);

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
    saber.rotation.x = -Math.PI / 4;
    scene.add(saber);
	//mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
    
	//scene.add(mouseMesh);

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

// Animate the elements
function animate() {
    requestAnimationFrame(animate);
		render();	
}
	
// Rendering function
function render() {

	// For rendering
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(scene, camera);
};