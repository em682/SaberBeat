var myGamePiece;
var myObstacle;
var score = 0;
var streak = 0;
var multi = 1;

function startGame() {
    console.log('start')
    myGameArea.start();
    myGamePiece = new component(10, 200, "#1febfd", 10, 120,"#1febfd");
    myObstacle = new component(.5, .5, "#fd311f", 350, 150,"black");
    myObstacle2 = new component(.5, .5, "#fd311f", 20, 150,"black");
}

var myGameArea = {
    canvas : document.getElementById("canvas2"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        //setInterval(showBlock, 2000);
        
        var background = new Image();
        background.src = "/back.jpg";

        // Make sure the image is loaded first otherwise nothing will draw.
        background.onload = function(){
            this.context.drawImage(background,0,0);   
        }
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
}

function component(width, height, color, x, y,shadow) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.growth = 1+((Math.floor(Math.random() * 8) + 3)  /100);
    //var cx = x + 0.5 * width;   // x of shape center
    //var cy = y + 0.5 * height;  // y of shape center
    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        if (this.x<0){
            this.x = 300
        }
        if(this.width >90){
            ctx.fillStyle = "orange"
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 10;
        ctx.shadowColor = shadow;
        
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
          crash = false;
        }
        return crash;
      }
      this.clear = function() {
		this.height = .5;
		this.width = .5;
	};
}



function updateGameArea() {
    if (myGamePiece.crashWith(myObstacle) && myObstacle.width >90) {
        myObstacle.growth = 1+((Math.floor(Math.random() * 8) + 3)  /100);
        myObstacle.clear();
      } 
    else if (myGamePiece.crashWith(myObstacle2) && myObstacle2.width >90) {
        myObstacle2.growth = 1+((Math.floor(Math.random() * 8) + 3)  /100);
        myObstacle2.clear();
      } 
    else{
    
    myGameArea.clear();
    myObstacle.width*=myObstacle.growth;
    myObstacle.height*=myObstacle.growth;
    myObstacle2.width*=myObstacle2.growth;
    myObstacle2.height*=myObstacle2.growth;
    myObstacle.update();
    myObstacle2.update();
    
    
    if (myObstacle.width >110){
        myObstacle.growth = 1+((Math.floor(Math.random() * 8) + 3)  /100);
        myObstacle.clear();
    }
    
    if (myObstacle2.width >110){
        myObstacle2.growth = 1+((Math.floor(Math.random() * 8) + 3)  /100);
        myObstacle2.clear();
    }
    myGamePiece.update();
    }
}
function move(x,y){
    
    myGamePiece.x = (x-100)*.95
    myGamePiece.y = y*.95
    
}

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
            
            move(gameX,gameY);
        };
    });
}

  
handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
  
});

startGame();