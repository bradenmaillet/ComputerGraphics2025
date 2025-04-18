"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 0.5, 0.0, 1.0 ),  // orange (for contrast)
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 2.5;
var UPPER_ARM_WIDTH  = 0.5;

var UPPER_UPPER_ARM_HEIGHT = 2.5;
var UPPER_UPPER_ARM_WIDTH  = 0.5;


// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var BaseX = 0;
var BaseY = 1;
var BaseZ = 2;

var LowerArmX = 3;
var LowerArmY = 4;
var LowerArmZ = 5;

var UpperArmX = 6;
var UpperArmY = 7;
var UpperArmZ = 8;

var UpperUpperArmX1 = 9;
var UpperUpperArmY1 = 10;
var UpperUpperArmZ1 = 11;

var UpperUpperArmX2 = 12;
var UpperUpperArmY2 = 13;
var UpperUpperArmZ2 = 14;

var UpperUpperArmX3 = 15;
var UpperUpperArmY3 = 16;
var UpperUpperArmZ3 = 17;


var theta= [ 0, 0, 0,
             0, 0, 0,
             0, 0, 0,
             0, 0, 0,
             0, 0, 0,
             0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

init();

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


//--------------------------------------------------


function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );


    document.getElementById("BRX").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("BRY").onchange = function(event) {
        theta[1] = event.target.value;
    };
    document.getElementById("BRZ").onchange = function(event) {
        theta[2] = event.target.value;
    };

    document.getElementById("LaRX").onchange = function(event) {
        theta[3] = event.target.value;
    };
    document.getElementById("LaRY").onchange = function(event) {
        theta[4] = event.target.value;
    };
    document.getElementById("LaRZ").onchange = function(event) {
        theta[5] = event.target.value;
    };

    document.getElementById("UaRX").onchange = function(event) {
         theta[6] = event.target.value;
    };
    document.getElementById("UaRY").onchange = function(event) {
         theta[7] =  event.target.value;
    };
    document.getElementById("UaRZ").onchange = function(event) {
         theta[8] =  event.target.value;
    };

    document.getElementById("UuRX1").onchange = function(event) {
        theta[9] =  event.target.value;
    };
    document.getElementById("UuRY1").onchange = function(event) {
        theta[10] =  event.target.value;
    };
    document.getElementById("UuRZ1").onchange = function(event) {
        theta[11] =  event.target.value;
    };

    document.getElementById("UuRX2").onchange = function(event) {
        theta[12] =  event.target.value;
    };
    document.getElementById("UuRY2").onchange = function(event) {
        theta[13] =  event.target.value;
    };
    document.getElementById("UuRZ2").onchange = function(event) {
        theta[14] =  event.target.value;
    };

    document.getElementById("UuRX3").onchange = function(event) {
        theta[15] =  event.target.value;
    };
    document.getElementById("UuRY3").onchange = function(event) {
        theta[16] =  event.target.value;
    };
    document.getElementById("UuRZ3").onchange = function(event) {
        theta[17] =  event.target.value;
    };


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    //console.log("s", s);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    //var instanceMatrix = mult(s,  translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ));

    //console.log("instanceMatrix", instanceMatrix);

    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //console.log("base", t);
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    //console.log("s", s);

    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    //var instanceMatrix = mult(s, translate(  0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ));

    //console.log("instanceMatrix", instanceMatrix);

    var t = mult(modelViewMatrix, instanceMatrix);

    //console.log("upper arm mv", modelViewMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //console.log("upper arm t", t);

}

function upperupperArm() {
    var s = scale(UPPER_UPPER_ARM_WIDTH, UPPER_UPPER_ARM_HEIGHT, UPPER_UPPER_ARM_WIDTH);
    //console.log("s", s);

    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_UPPER_ARM_HEIGHT, 0.0 ),s);
    //var instanceMatrix = mult(s, translate(  0.0, 0.5 * UPPER_UPPER_ARM_HEIGHT, 0.0 ));

    //console.log("instanceMatrix", instanceMatrix);

    var t = mult(modelViewMatrix, instanceMatrix);

    //console.log("upper arm mv", modelViewMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //console.log("upper arm t", t);

}

//----------------------------------------------------------------------------


function lowerArm()
{
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);


    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//----------------------------------------------------------------------------


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = mat4(); 

    // modelViewMatrix = rotate(theta[BaseX], vec3(1, 0, 0 ));
    // modelViewMatrix = rotate(theta[BaseY], vec3(0, 1, 0 ));
    // modelViewMatrix = rotate(theta[BaseZ], vec3(0, 0, 1 ));

    modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseZ], vec3(0, 0, 1))); // Rotate around Z-axis
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseY], vec3(0, 1, 0))); // Rotate around Y-axis
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[BaseX], vec3(1, 0, 0))); // Rotate around X-axis
    base();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArmX], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArmY], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArmZ], vec3(0, 0, 1)));
    lowerArm();

    printm( translate(0.0, BASE_HEIGHT, 0.0));
    printm(modelViewMatrix);

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArmX], vec3(1, 0, 0)) );
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArmY], vec3(0, 1, 0)) );
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArmZ], vec3(0, 0, 1)) );
    upperArm();

    const upperArmMatrix = modelViewMatrix;

    modelViewMatrix  = mult(upperArmMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmX1], vec3(1, 0, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmY1], vec3(0, 1, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmZ1], vec3(0, 0, 1)));
    upperupperArm();

    modelViewMatrix = upperArmMatrix;

    modelViewMatrix  = mult(upperArmMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmX2], vec3(1, 0, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmY2], vec3(0, 1, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmZ2], vec3(0, 0, 1)));
    upperupperArm();

    modelViewMatrix = upperArmMatrix;

    modelViewMatrix  = mult(upperArmMatrix, translate(0.0, UPPER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmX3], vec3(1, 0, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmY3], vec3(0, 1, 0)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperUpperArmZ3], vec3(0, 0, 1)));
    upperupperArm();
//printm(modelViewMatrix);

    requestAnimationFrame(render);
}
