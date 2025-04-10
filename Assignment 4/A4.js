"use strict";

var ortho2 = function() {

var canvas;
var gl;

var numPositions = 48;

var positionsArray = [];
var colorsArray = [];

var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0),
    ];
var HouseVertices = [
        vec4(0, 0, 30, 1.0),   // 0
        vec4(16, 0, 30, 1.0),  // 1
        vec4(16, 10, 30, 1.0), // 2
        vec4(8, 16, 30, 1.0),  // 3 (roof peak)
        vec4(0, 10, 30, 1.0),  // 4
        vec4(0, 0, 54, 1.0),   // 5
        vec4(16, 0, 54, 1.0),  // 6
        vec4(16, 10, 54, 1.0), // 7
        vec4(8, 16, 54, 1.0),  // 8 (roof peak)
        vec4(0, 10, 54, 1.0)   // 9
    ];

var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),   // cyan
        vec4(1.0, .5, .5, 1.0),  // white to ?
    ];

var near = -100; // -1
var far = 100;  // 1
var radius = 1;
var theta = 0.0;
var phi = 0.0;
var dr =  5.0 * Math.PI/180.0;

var left = -100.0;  // -1.0
var right = 100.0;  // 1.0
var top = 100.0; // 1.0
var bottom = -100.0;  // -1.0

var i = true;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var Circle = false;
var line = false;

var circleCenter;
var circleRadius;

var lineStart;
var lineEnd;

var t = 0;
var step = 0.001; // Step size for line animation


init();

function quad(a, b, c, d) {
     positionsArray.push(HouseVertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(HouseVertices[b]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(HouseVertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(HouseVertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(HouseVertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(HouseVertices[d]);
     colorsArray.push(vertexColors[a]);
}
function triangle(a, b, c) {
    positionsArray.push(HouseVertices[a]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(HouseVertices[b]);
    colorsArray.push(vertexColors[a]);
    positionsArray.push(HouseVertices[c]);
    colorsArray.push(vertexColors[a]);
}

function colorHouse() {
    // Front face
    quad(0,1 , 2, 4);
    triangle(2, 3, 4); // Front roof

    // Back face
    quad(5, 6 , 7, 9);
    triangle(7, 8, 9); // Back roof

    // Left face
    quad(4, 0, 5, 9);

    // Right face
    quad(6, 1, 2, 7);

    // Bottom face
    quad(1, 0, 5, 6);

    // Roof sides
    quad(3, 2, 7, 8); // Right roof
    quad(4, 3, 8, 9); // Left roof
}

// 2   4
//   3
// 7   9
//   8

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorHouse(); // colorCube();

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");


    document.getElementById("animateButton").addEventListener("click", () => {
        var lineStartInput = document.getElementById("lineStart").value.split(",").map(Number);
        var lineEndInput = document.getElementById("lineEnd").value.split(",").map(Number);
        var circleCenterInput = document.getElementById("circleCenter").value.split(",").map(Number);
        var circleRadiusInput = parseFloat(document.getElementById("circleRadius").value);

        circleCenter = vec3(circleCenterInput[0], circleCenterInput[1], circleCenterInput[2]);
        circleRadius = circleRadiusInput;
        lineStart = vec3(lineStartInput[0], lineStartInput[1], lineStartInput[2]);
        lineEnd = vec3(lineEndInput[0], lineEndInput[1], lineEndInput[2]);

        var PCircle = vec3(  circleCenter[0] + circleRadius * Math.cos(phi), // x(t)
                            circleCenter[1],                               // y(t) (constant)
                            circleCenter[2] + circleRadius * Math.sin(phi)); // z(t));

        if (lineStartInput.length === 3 && lineEndInput.length === 3) {
            
            Circle = false;
            line = true;
            t = 0;

        } else if (circleCenterInput.length === 3 && !isNaN(circleRadiusInput)) {

            Circle = true;
            line = false;

        } else {
            alert("Please provide valid inputs for either a line or a circle.");
        }
        
    });

    console.log(positionsArray);
    console.log(colorsArray);
    render();
}

function render() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(Circle == true) {
            dr = 5.0 * Math.PI/180.0;
            phi += dr;
            eye = vec3(circleCenter[0] + circleRadius * Math.cos(phi), circleCenter[1],
            circleCenter[2] + circleRadius * Math.sin(phi));
        }else if(line == true) {
            const x = lineStart[0] + t * (lineEnd[0] - lineStart[0]);
            const y = lineStart[1] + t * (lineEnd[1] - lineStart[1]);
            const z = lineStart[2] + t * (lineEnd[2] - lineStart[2]);

            if (x === 0 && y === 0 && z === 0) {
                eye = vec3(0, 0, 1); // Put the camera in front of the origin
            } else {
                // Interpolate in Cartesian coordinate

                const radius = Math.sqrt(x * x + y * y + z * z);
                const theta = Math.acos(y / radius); // vertical angle from Y axis
                const phi = Math.atan2(z, x); // horizontal angle in XZ plane
                
                eye = vec3(
                    radius * Math.sin(theta) * Math.cos(phi), // x
                    radius * Math.cos(theta),                // y
                    radius * Math.sin(theta) * Math.sin(phi) // z
                );

                console.log("r:", radius, "theta:", theta, "phi:", phi);
                console.log("Eye:", eye);

                t += step;
                console.log("t:", t);
                if (t >= 1) {
                    t = 1;
                    line = false;
                }
            }
        }else if(line == false && Circle == false) {
            dr = 0.0;
            eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta),
            radius*Math.cos(phi));
        }

        console.log("Eye Position:", eye); // Debugging log

        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = ortho(left, right, bottom, top, near, far);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        if(i == true) {
            i = false;
            console.log(positionsArray);
            console.log(colorsArray);
            console.log("ModelViewMatrix:", modelViewMatrix);
            console.log("ProjectionMatrix:", projectionMatrix); 
        }

        requestAnimationFrame(render);
    }

}

ortho2();
