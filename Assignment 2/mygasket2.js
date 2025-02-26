"use strict";

var gl;
var positions =[];

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var vertices = [
    vec2(-1, -1),
    vec2(0,  1),
    vec2( 1, -1)
];

//last value is the important one
//< 1 the object gets big, >1 the object gets small
var scale = [1, 1, 1, 1];

//I'm aware global variables are bad news
//it's a small project

var numPositions = 500;
const NUMPOSMAX = 5000;
const NUMPOSMIN = 500;
const STEPAMOUNT = 100; // must be a factor of NUMPOSMAX AND NUMPOSMIN
const SCALEMAX = 5;
const SCALEMIN = .8;
const SCALESTEPAMOUNT = 0.1;
const RUNNING = "Status: Currently running";
const STOPPED = "Status: Currently stopped";
var currentScale = 1;
var posFlag = 1;
var scaleFlag = 0;
var ToggleRender = 0;

var PointSlide = document.getElementById("npoints");
var PointIn = document.getElementById("npoints-text");

var SpeedSlide = document.getElementById("speed");
var SpeedIn = document.getElementById("aspeed-text");

var PortSizeSlide = document.getElementById("PortSize");
var Height = document.getElementById("vport-height-text");
var Width = document.getElementById("vport-width-text");

var Rin = document.getElementById("rbutton");
var Gin = document.getElementById("gbutton");
var Bin = document.getElementById("bbutton");
var RGBBox = document.getElementById("rgbbutton-picker");

var RunStatus = document.getElementById("RunStatus");


init()

function init()
{
    //get HTML elements

    var canvas = document.getElementById("gl-canvas");
    //add_event_handlers(canvas);
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    
    //HTML UI
    var AnimateButton = document.getElementById("AnimateButton");
    var StopButton = document.getElementById("StopButton");
    

    //initial setup of triangle

    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = mult(0.25, add( u, v ));
    positions.push(p);

    for ( var i = 0; positions.length < numPositions; ++i ) {
        var j = Math.floor(3*Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }

    //  Configure WebGL

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    //getting locations of attributes and uniforms is something
    //that should be done during initialization(ie here) not during
    //render loop
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var uColor = gl.getUniformLocation(program, "uColor" );
    gl.uniform4fv(uColor, colors[Math.floor(7*Math.random())]);

    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform4fv(uScale, scale);

    AnimateButton.addEventListener("click", function() { Start(uColor, uScale, gl) } );
    StopButton.addEventListener("click", function() { Stop(gl) } );

    //render(uColor, uScale);
};
function Start(uColor, uScale, window){
    var Color = GetColor();
    var Points = GetPoints();
    var Speed = GetSpeed();
    var StartHeight = GetHeight();
    var StartWidth = GetWidth();
    console.log(Color);
    console.log(Points);
    console.log("Speed: %f", Speed);
    console.log(StartHeight);
    console.log(StartWidth);
    
    RunStatus.textContent = RUNNING;
    console.log("Animate clicked");
    if(!ToggleRender){
        ToggleRender = ToggleRender ^ 1;
        gl.viewport(0, 0, StartWidth, StartHeight);
        NewArray(Points);
        render(uColor, uScale, Color, Points, Speed);
    }
}
function Stop(window){
    console.log("Stop clicked");
    RunStatus.textContent = STOPPED;
    if(ToggleRender){  // set color white and redraw
        ToggleRender = ToggleRender ^ 1;
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}
function GetColor(){
    var Color = [0,0,0,1];
    var hex = (RGBBox.value).substring(1);
    console.log(hex);
    if(Rin.value == "" || Gin.value == "" || Bin.value == ""){
        Color[0] = parseInt(hex.substring(0, 2), 16); //R
        Color[1] = parseInt(hex.substring(2, 4), 16); //G
        Color[2] = parseInt(hex.substring(4, 6), 16); //B
    }else{
        Color[0] = Rin.value;
        Color[1] = Gin.value;
        Color[2] = Bin.value;
    }
    return Color;
}
function GetPoints(){
    if(PointIn.value == ""){
        return PointSlide.value;
    }else{
        return PointIn.value;
    }
}
function GetSpeed(){
    if(SpeedIn.value == ""){
        return SpeedSlide.value;
    }else{
        return SpeedIn.value;
    }
}
function GetHeight(){
    if(Height.value == ""){
        return PortSizeSlide.value;
    }else{
        return Height.value;
    }
}
function GetWidth(){
    if(Width.value == ""){
        return PortSizeSlide.value;
    }else{
        return Width.value;
    }
}
//right now it creates a new array every iteration
//may be beneficial to set it up so it shaves of array entries
//on the downhill
//and adds array entries on the uphill
function UpdateArray(amount) {
    positions = [];
    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = mult(0.25, add( u, v ));
    positions.push(p);

    if(posFlag) {numPositions += amount;
    } else {numPositions -= amount;}

    for ( var i = 0; positions.length < numPositions; ++i ) {
        var j = Math.floor(3*Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }

    if(numPositions == NUMPOSMAX) {posFlag = 0;}
    if(numPositions == NUMPOSMIN) {posFlag = 1;}
}
function NewArray(amount) {
    positions = [];
    var u = add(vertices[0], vertices[1]);
    var v = add(vertices[0], vertices[2]);
    var p = mult(0.25, add( u, v ));
    positions.push(p);

    for ( var i = 0; positions.length < amount; ++i ) {
        var j = Math.floor(3*Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }
}


function IncrementScale(amount) {
    if(scaleFlag) {
        currentScale += amount;
    } else {
        currentScale -= amount;
    }
    scale = [1,1,1,currentScale];
    if(currentScale >= SCALEMAX) {scaleFlag = 0;}
    if(currentScale <= SCALEMIN) {scaleFlag = 1;}
}
function SetScale(amount) {
    scale = [1,1,1,amount];
}

function render(UniformColor, UniformScale, Color, Points, Speed) {
    if(ToggleRender){
        gl.clear( gl.COLOR_BUFFER_BIT );
        gl.drawArrays(gl.POINTS, 0, positions.length);
        //change speed by changing scale step amount
        IncrementScale(parseFloat(Speed)); //speed?
        //console.log(scale);
        gl.uniform4fv(UniformScale, scale);
        gl.uniform4fv(UniformColor, Color);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.DYNAMIC_DRAW);
        requestAnimationFrame(() => render(UniformColor, UniformScale, Color, Points, Speed));
    }
}
