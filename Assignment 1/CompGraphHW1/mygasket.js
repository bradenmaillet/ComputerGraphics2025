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
var currentScale = 1;
var posFlag = 1;
var scaleFlag = 0;
init();


function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

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


    render(uColor, uScale);
};

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


function UpdateScale(amount) {
    if(scaleFlag) {
        currentScale += amount;
    } else {
        currentScale -= amount;
    }
    scale = [1,1,1,currentScale];
    if(currentScale >= SCALEMAX) {scaleFlag = 0;}
    if(currentScale <= SCALEMIN) {scaleFlag = 1;}
}


function render(UniformColor, UniformScale) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.POINTS, 0, positions.length);
    UpdateArray(STEPAMOUNT);
    UpdateScale(SCALESTEPAMOUNT);
    gl.uniform4fv(UniformScale, scale);
    gl.uniform4fv(UniformColor, colors[Math.floor(7*Math.random())]);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.DYNAMIC_DRAW);
    requestAnimationFrame(() => render(UniformColor, UniformScale));
}
