// Define the standard global variables
var container,
	scene, 
	camera,
	renderer,
	plane,
	mouseMesh;

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
	var mouseGeometry = new THREE.SphereGeometry(1, 0, 0);
	var mouseMaterial = new THREE.MeshBasicMaterial({
		color: 0x0000ff
	});
	mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
	mouseMesh.position.z = -5;
	scene.add(mouseMesh);

	// When the mouse moves, call the given function
	//document.addEventListener('mousemove', onMouseMove, false);
}

// Follows the mouse event
function onMouseMove(x,y) {

	// Update the mouse variable
	//event.preventDefault();
	mouse.x =  (x / window.innerWidth) * 2 - 1;
	mouse.y = - (y / window.innerHeight) * 2 + 1;


 // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	mouseMesh.position.copy(pos);
  
	// Make the sphere follow the mouse
//	mouseMesh.position.set(event.clientX, event.clientY, 0);
};


const modelParams = {
    flipHorizontal: true,   // flip e.g for video 
    imageScaleFactor: 0.7,  // reduce input image size for gains in speed.
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.8,    // confidence threshold for predictions.
  }
  
const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas1');
const context = canvas.getContext('2d');

let model;

handTrack.startVideo(video)
    .then(status =>{
        if(status){
            console.log('yes')
            navigator.getUserMedia({video:{}}, stream =>{
                video.srcObject = stream;
                setInterval(runDetection,20);

            },
            err => console.log(err)
            );
        }
    });

function runDetection(){
    model.detect(video).then(predictions =>{
        
        //model.renderPredictions(predictions,canvas,context,video)
        if (predictions[0]) {
            let gameX = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
            let gameY = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
            
            onMouseMove(gameX,gameY)
        };
    });
}

  
handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
  
});


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

