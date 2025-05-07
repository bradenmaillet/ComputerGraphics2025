"use strict";

var numDivisions = 3;

var index = 0;

var points = [];
var normals = [];

var modelViewMatrix = [];
var projectionMatrix = [];

var nMatrix, nMatrixLoc;

// var axis =0;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);
var dTheta = 5.0;

var flag = false;

var program;
var canvas, render, gl;

var lightPosition = vec4(0.0, 0.0, 20.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 ); //0.2, 0.2, 0.2, 1.0
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 ); //1.0, 0.0, 1.0, 1.0 
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 1.0;

var ambientProduct = mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

var objectColor = vec4(1.0, 1.0, 1.0, 1.0); // Default object color (red)

var at = vec3(0.0, 0.0, 0.0); // Default "at" position
var up = vec3(0.0, 1.0, 0.0); // Default "up" direction
var eye = vec3(0.0, 0.0, 5.0); // Default camera position
var leftBound = -4.0;
var rightBound = 4.0;
var topBound = 4.0;
var bottomBound = -4.0;
var nearBound = -200.0;
var farBound = 200.0;

//transformations

var  angle = 0.0;
var  axis2 = vec3(0, 0, 1);

var trackingMouse = false;
var trackballMove = false;

var lastPos = [0, 0, 0];
var curPos = [0, 0, 0];
var translateVect = [0, 0, 0];
var scaleVect = [1, 1, 1];
var curx, cury;
var startX, startY;

var numTimesToSubdivide = 3;
var positionsArray = [];
var normalsArray = [];
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var mode = "wireframe"; // Default mode
var transformMode = "rotate" // Default transform mode
var shapeMode = "teapot"; // Default shape mode

init();

function bezier(u) {
    var b =new Array(4);
    var a = 1-u;
    b[3] = a*a*a;
    b[2] = 3*a*a*u;
    b[1] = 3*a*u*u;
    b[0] = u*u*u;
    return b;
}

function nbezier(u) {
    var b = [];
    b.push(3*u*u);
    b.push(3*u*(2-3*u));
    b.push(3*(1-4*u+3*u*u));
    b.push(-3*(1-u)*(1-u));
    return b;
}

function triangle(a, b, c) {

    points.push(a);
    points.push(b);
    points.push(c);

    // normals are vectors

    normals.push(vec4(a[0],a[1], a[2], 0.0));
    normals.push(vec4(b[0],b[1], b[2], 0.0));
    normals.push(vec4(c[0],c[1], c[2], 0.0));

    index += 3;
}


function divideTriangle(a, b, c, count) {
   if (count > 0) {

       var ab = mix( a, b, 0.5);
       var ac = mix( a, c, 0.5);
       var bc = mix( b, c, 0.5);

       ab = normalize(ab, true);
       ac = normalize(ac, true);
       bc = normalize(bc, true);

       divideTriangle(a, ab, ac, count - 1);
       divideTriangle(ab, b, bc, count - 1);
       divideTriangle(bc, c, ac, count - 1);
       divideTriangle(ab, bc, ac, count - 1);
   }
   else {
       triangle(a, b, c);
   }
}


function tetrahedron(a, b, c, d, n) {
   divideTriangle(a, b, c, n);
   divideTriangle(d, c, b, n);
   divideTriangle(a, d, b, n);
   divideTriangle(a, c, d, n);
}

function teapot() {
        normals = [];
        points = [];
        var verticesCopy = [];
        for (var i = 0; i < vertices.length; i++) {
            verticesCopy.push(vertices[i].slice()); // Copy each inner array
        }
        var sum = [0, 0, 0];
        for(var i = 0; i<306; i++) for(j=0; j<3; j++)
        sum[j] += verticesCopy[i][j];
        for(j=0; j<3; j++) sum[j]/=306;
            for(var i = 0; i<306; i++) for(j=0; j<2; j++)
        verticesCopy[i][j] -= sum[j]/2
            for(var i = 0; i<306; i++) for(j=0; j<3; j++)
        verticesCopy[i][j] *= 2;


        var h = 1.0/numDivisions;

        var patch = new Array(numTeapotPatches);
        for(var i=0; i<numTeapotPatches; i++) patch[i] = new Array(16);
        for(var i=0; i<numTeapotPatches; i++)
            for(j=0; j<16; j++) {
                patch[i][j] = vec4([verticesCopy[indices[i][j]][0],
                verticesCopy[indices[i][j]][2],
                    verticesCopy[indices[i][j]][1], 1.0]);
        }


        for ( var n = 0; n < numTeapotPatches; n++ ) {


        var data = new Array(numDivisions+1);
        for(var j = 0; j<= numDivisions; j++) data[j] = new Array(numDivisions+1);
        for(var i=0; i<=numDivisions; i++) for(var j=0; j<= numDivisions; j++) {
            data[i][j] = vec4(0,0,0,1);
            var u = i*h;
            var v = j*h;
            var t = new Array(4);
            for(var ii=0; ii<4; ii++) t[ii]=new Array(4);
            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++)
                t[ii][jj] = bezier(u)[ii]*bezier(v)[jj];


            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
                temp = vec4(patch[n][4*ii+jj]);
                temp = mult( t[ii][jj], temp);
                data[i][j] = add(data[i][j], temp);
            }
        }

        var ndata = new Array(numDivisions+1);
        for(var j = 0; j<= numDivisions; j++) ndata[j] = new Array(numDivisions+1);
        var tdata = new Array(numDivisions+1);
        for(var j = 0; j<= numDivisions; j++) tdata[j] = new Array(numDivisions+1);
        var sdata = new Array(numDivisions+1);
        for(var j = 0; j<= numDivisions; j++) sdata[j] = new Array(numDivisions+1);
        for(var i=0; i<=numDivisions; i++) for(var j=0; j<= numDivisions; j++) {
            ndata[i][j] = vec4(0,0,0,0);
            sdata[i][j] = vec4(0,0,0,0);
            tdata[i][j] = vec4(0,0,0,0);
            var u = i*h;
            var v = j*h;
            var tt = new Array(4);
            for(var ii=0; ii<4; ii++) tt[ii]=new Array(4);
            var ss = new Array(4);
            for(var ii=0; ii<4; ii++) ss[ii]=new Array(4);

            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
                tt[ii][jj] = nbezier(u)[ii]*bezier(v)[jj];
                ss[ii][jj] = bezier(u)[ii]*nbezier(v)[jj];
            }

            for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
                var temp = vec4(patch[n][4*ii+jj]); ;
                temp = mult( tt[ii][jj], temp);
                tdata[i][j] = add(tdata[i][j], temp);

                var stemp = vec4(patch[n][4*ii+jj]); ;
                stemp = mult( ss[ii][jj], stemp);
                sdata[i][j] = add(sdata[i][j], stemp);

            }
            temp = cross(tdata[i][j], sdata[i][j])

            ndata[i][j] =  normalize(vec4(temp[0], temp[1], temp[2], 0));
        }


        for(var i=0; i<numDivisions; i++) for(var j =0; j<numDivisions; j++) {
            points.push(data[i][j]);
            normals.push(ndata[i][j]);

            points.push(data[i+1][j]);
            normals.push(ndata[i+1][j]);

            points.push(data[i+1][j+1]);
            normals.push(ndata[i+1][j+1]);

            points.push(data[i][j]);
            normals.push(ndata[i][j]);

            points.push(data[i+1][j+1]);
            normals.push(ndata[i+1][j+1]);

            points.push(data[i][j+1]);
            normals.push(ndata[i][j+1]);
            index+= 6;
            }
        }
}

function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    if(shapeMode === "teapot") {
        normals = [];
        points = [];
        teapot();
    }else if(shapeMode === "sphere") {
        normals = [];
        points = [];
        tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    }

    shaderSetup("vertex-shader", "fragment-shader");

    // color event listeners(and shininess)

    document.getElementById("material-shininess").addEventListener("input", function () {
        materialShininess = parseFloat(this.value); // Get the current shininess value from the slider
        gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    });
    document.getElementById("object-color").addEventListener("input", function () {
        objectColor = hexToVec4(this.value); 
        gl.uniform4fv(gl.getUniformLocation(program, "objectColor"), objectColor);
    });
    document.getElementById("ambient-light-color").addEventListener("input", function () {
        const intensity = parseFloat(this.value);
        lightAmbient = vec4(intensity, intensity, intensity, 1.0);
        ambientProduct = mult(lightAmbient, materialAmbient);
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), ambientProduct);
    });
    document.getElementById("diffuse-light-color").addEventListener("input", function () {
        lightDiffuse = hexToVec4(this.value);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), diffuseProduct);
    });
    document.getElementById("specular-light-color").addEventListener("input", function () {
        lightSpecular = hexToVec4(this.value);
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), specularProduct);
    });
    document.getElementById("ambient-material-color").addEventListener("input", function () {
        materialAmbient = hexToVec4(this.value);
        ambientProduct = mult(lightAmbient, materialAmbient);
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), ambientProduct);
    });
    document.getElementById("diffuse-material-color").addEventListener("input", function () {
        materialDiffuse = hexToVec4(this.value);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), diffuseProduct);
    });
    document.getElementById("specular-material-color").addEventListener("input", function () {
        materialSpecular = hexToVec4(this.value);
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), specularProduct);
    });

    //color event listeners end

    //positional event listener

    document.getElementById("light-pos-x").addEventListener("input", function () {
        lightPosition[0] = this.value; // Set the light position based on the slider value
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), lightPosition);
    });
    document.getElementById("light-pos-y").addEventListener("input", function () {
        lightPosition[1] = this.value; // Set the light position based on the slider value
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), lightPosition);
    });
    document.getElementById("light-pos-z").addEventListener("input", function () {
        lightPosition[2] = this.value; // Set the light position based on the slider value
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), lightPosition);
    });

    document.getElementById("eye-pos-x").addEventListener("input", function () {
        eye[0] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
        //gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    });
    document.getElementById("eye-pos-y").addEventListener("input", function () {
        eye[1] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    document.getElementById("eye-pos-z").addEventListener("input", function () {
        eye[2] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });

    document.getElementById("at-dir-x").addEventListener("input", function () {
        at[0] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    document.getElementById("at-dir-y").addEventListener("input", function () {
        at[1] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    document.getElementById("at-dir-z").addEventListener("input", function () {
        at[2] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    
    document.getElementById("up-dir-x").addEventListener("input", function () {
        up[0] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    document.getElementById("up-dir-y").addEventListener("input", function () {
        up[1] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });
    document.getElementById("up-dir-z").addEventListener("input", function () {
        up[2] = this.value; // Set the light position based on the slider value
        modelViewMatrix = lookAt(eye, at, up);
    });

    //positional event listener end

    //projection event listener

    document.getElementById("left-pos").addEventListener("input", function () {
        leftBound = parseFloat(this.value);
    });
    document.getElementById("right-pos").addEventListener("input", function () {
        rightBound = parseFloat(this.value); 
    });
    document.getElementById("top-pos").addEventListener("input", function () {
        topBound = parseFloat(this.value);
    });
    document.getElementById("bottom-pos").addEventListener("input", function () {
        bottomBound = parseFloat(this.value);
    });

    //projection event listener end
    

    //transform event listeners

    document.getElementById("translate-mode").addEventListener("input", function () {
        transformMode = this.value;
    });

    //transform event listeners end


    //mouse event listeners
    canvas.addEventListener("mousedown", function(event){
        var x = 2*event.clientX/canvas.width-1;
        var y = 2*(canvas.height-event.clientY)/canvas.height-1;
        // console.log("Mouse Down: (x, y)", x, y);
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
        var x = 2*event.clientX/canvas.width-1;
        var y = 2*(canvas.height-event.clientY)/canvas.height-1;
        // console.log("Mouse Up: (x, y)", x, y);
        stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){
        var x = 2*event.clientX/canvas.width-1;
        var y = 2*(canvas.height-event.clientY)/canvas.height-1;
        // console.log("Mouse Move: (x, y)", x, y);
        mouseMotion(x, y);
    } );
    
    //mouse even listeners end

    document.getElementById("shape-mode").addEventListener("click", function () {
        shapeMode = this.value;
        if(shapeMode === "teapot") {
            normals = [];
            points = [];

            teapot();
        } else if(shapeMode === "sphere") {
            normals = [];
            points = [];
            tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
        }
        shaderSetup("vertex-shader", "fragment-shader");
    });

    document.getElementById("Help").addEventListener("click", function () {
        // Replace 'help.pdf' with the path to your PDF file
        window.open("help.pdf", "_blank");
    });

    document.getElementById("render-mode").addEventListener("change", function () {
        mode = this.value;
    
        if (mode === "wireframe" || mode === "gouraud") {
            shaderSetup("vertex-shader", "fragment-shader");
            if(mode === "wireframe") {
                renderWireframe();
            } else if(mode === "gouraud") {
                renderGouraud();
            }

        } else if (mode === "phong") {
            shaderSetup("vertex-shader-phong", "fragment-shader-phong");
            renderPhong();
        }
    });
    if(mode === "wireframe") {
        renderWireframe();
    } else if(mode === "gouraud") {
        renderGouraud();
    } else if(mode === "phong") {
        renderPhong();
    }
}

function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    curPos = trackballView(x, y);
    if(trackingMouse) {
        //use this to trans
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];
        if (transformMode === "translate") {
            translateVect[0] += dx;
            translateVect[1] += dy;
            translateVect[2] += dz;
        }
        if(transformMode === "scale") {
            scaleVect[0] += dx;
            scaleVect[1] += dy;
            scaleVect[2] += dz;
        }


      if (transformMode === "rotate") {
        if (dx || dy || dz) {
            angle = -10 * Math.sqrt(dx*dx + dy*dy + dz*dz);

            axis2[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
            axis2[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
            axis2[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

            // lastPos[0] = curPos[0];
            // lastPos[1] = curPos[1];
            // lastPos[2] = curPos[2];
        }

      }

    }
    if(mode === "wireframe") {
        renderWireframe();
    } else if(mode === "gouraud") {
        renderGouraud();
    } else if(mode === "phong") {
        renderPhong();
    }
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}

function shaderSetup(vshader, fshader){
    program = initShaders( gl, vshader, fshader);
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var normalLoc = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc);

    projectionMatrix = ortho(leftBound, rightBound, bottomBound, topBound, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    nMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "objectColor"), objectColor); // 
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), specularProduct);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), lightPosition );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );
}

function renderGouraud(){

            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            modelViewMatrix = mat4();

            modelViewMatrix = mult(modelViewMatrix, lookAt(eye, at, up));

            modelViewMatrix = mult(modelViewMatrix, translate(translateVect[0], translateVect[1], translateVect[2]));
            modelViewMatrix = mult(modelViewMatrix, scale(scaleVect[0], scaleVect[1], scaleVect[2]));

            if(trackballMove) {
                axis2 = normalize(axis2);
                modelViewMatrix = mult(modelViewMatrix, rotate(angle * 180.0 / Math.PI, axis2));
            }

            
            gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
            nMatrix = normalMatrix(modelViewMatrix, true);

            projectionMatrix = ortho(leftBound, rightBound, bottomBound, topBound, -10, 10);
                gl.uniformMatrix4fv(
                gl.getUniformLocation(program, "projectionMatrix"),
                false,
                flatten(projectionMatrix)
            );

            gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix) );

            gl.drawArrays( gl.TRIANGLES, 0, index);
            requestAnimationFrame(renderGouraud);
}

function hexToVec4(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255.0;
    const g = ((bigint >> 8) & 255) / 255.0;
    const b = (bigint & 255) / 255.0;
    return vec4(r, g, b, 1.0);
}

function renderWireframe() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // if (flag) theta[axis] += 0.5;

    modelViewMatrix = mat4();

    modelViewMatrix = mult(modelViewMatrix, lookAt(eye, at, up));

    modelViewMatrix = mult(modelViewMatrix, translate(translateVect[0], translateVect[1], translateVect[2]));
    modelViewMatrix = mult(modelViewMatrix, scale(scaleVect[0], scaleVect[1], scaleVect[2]));

    if(trackballMove) {
        axis2 = normalize(axis2);
        modelViewMatrix = mult(modelViewMatrix, rotate(angle * 180.0 / Math.PI, axis2));
    }

    //modelViewMatrix = mult(modelViewMatrix, translate(translateVect[0], translateVect[1], translateVect[2]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    nMatrix = normalMatrix(modelViewMatrix, true);
    projectionMatrix = ortho(leftBound, rightBound, bottomBound, topBound, -10, 10);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "projectionMatrix"),
        false,
        flatten(projectionMatrix)
    );

    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

    // Draw the wireframe using gl.LINES
    for (let i = 0; i < points.length; i += 3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3); // Draw each triangle as a wireframe
    }

    requestAnimationFrame(renderWireframe);
}

function renderPhong() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = mat4();

    modelViewMatrix = mult(modelViewMatrix, lookAt(eye, at, up));

    modelViewMatrix = mult(modelViewMatrix, translate(translateVect[0], translateVect[1], translateVect[2]));
    modelViewMatrix = mult(modelViewMatrix, scale(scaleVect[0], scaleVect[1], scaleVect[2]));

    if(trackballMove) {
        axis2 = normalize(axis2);
        modelViewMatrix = mult(modelViewMatrix, rotate(angle * 180.0 / Math.PI, axis2));
    }

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "modelViewMatrix"),
        false,
        flatten(modelViewMatrix)
    );
    nMatrix = normalMatrix(modelViewMatrix, true);
    projectionMatrix = ortho(leftBound, rightBound, bottomBound, topBound, -10, 10);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "projectionMatrix"),
        false,
        flatten(projectionMatrix)
    );

    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, index); // Render as filled triangles
    requestAnimationFrame(renderPhong);
}
