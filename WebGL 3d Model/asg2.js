// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_lightColor;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    void main() {
        vec3 lightDir = normalize(u_lightDirection);

        // Transfoming the normal vector to handle object transormations
        vec3 normal = normalize(u_NormalMatrix * vec4(a_Normal, 1.0)).xyz;

        // Calculates the diffuse light (flat shading)
        float nDotL = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_lightColor * u_Color * nDotL;

        v_Color = vec4(diffuse, 1.0);

        gl_Position = u_ModelMatrix * vec4(a_Position, 1.0);
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_Color = null;
let u_lightColor = null;
let u_lightDirection = null;

class cylinder {
    constructor(vertices,indices,normal) {
        this.Vertices = vertices;
        this.Normals = normal;
        this.Indices = indices;

        this.color = [];

        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];
    }

    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
    }

    setRotate(x, y, z) {
        this.rotate[0] = x;
        this.rotate[1] = y;
        this.rotate[2] = z;
    }

    setTranslate(x, y, z) {
        this.translate[0] = x;
        this.translate[1] = y;
        this.translate[2] = z;
    }
}

function generateCylinder(){

        var sides = parseInt(document.getElementById("sides").value);
        //var caps = document.getElementById("caps").value;
        angleSize = (2*Math.PI/sides).toFixed(5);
        var arrSize = sides*(2+sides)*3;

        /*
        vertices = [ top cap,
                     bottom cap,
                     side faces ]
        */
        
        var vertices;
            vertices = new Float32Array((sides+1)*6+(sides*4)*3);
            //add center vertex to the array
            vertices[0] = 0;
            vertices[1] = 0;
            vertices[2] = 0;

        //Calculate each vertex with radius of 1 and add to array
        var curr = 3;
        //bottom cap z = 0
        for(var i = 1; i<=sides; i++){
            var x = Math.cos(angleSize*i);
            vertices[curr] = x;
            curr++;
            var y = Math.sin(angleSize*i);
            vertices[curr] = y;
            curr++;
            var z = 0;
            vertices[curr] = z;
            curr++;
        }
        //top cap z = 1
        var count = 0;
        while(curr < sides*3*2+6){
            vertices[curr++] = vertices[count];
            count++;
            vertices[curr++] = vertices[count];
            count+=2;
            vertices[curr++] = 1;
        }

        //sides
        for(var i = 0; i < sides - 1; i++){
            count = 3 + i*3;
            //bottom 2 points
            for(var k = 0; k<6; k++){
                vertices[curr++] = vertices[count+k];
            }
            //top 2 points
            for(var k = 0; k<6; k++){
                vertices[curr++] = vertices[count+((sides+1)*3)+k];
            }
        }
        //connect last point to first
        //bottom
        count = sides*3
        vertices[curr++] = vertices[count];
        vertices[curr++] = vertices[count+1];
        vertices[curr++] = vertices[count+2];
        vertices[curr++] = vertices[3];
        vertices[curr++] = vertices[4];
        vertices[curr++] = vertices[5];

        //top
        vertices[curr++] = vertices[count+(sides+1)*3];
        vertices[curr++] = vertices[count+(sides+1)*3+1];
        vertices[curr++] = vertices[count+(sides+1)*3+2];
        vertices[curr++] = vertices[(sides+2)*3];
        vertices[curr++] = vertices[(sides+2)*3+1];
        vertices[curr++] = vertices[(sides+2)*3+2];
        
        //INDEX FORMAT
        //INDEX 0 = bottom cap center position
        //INDEX SIDES + 1 = top cap center position

        //DRAW WITH CAP
        //Specify indices for Caps and draw
        //Array[bottom cap, top cap, side faces]
        var indices;
            indices = new Uint16Array(sides*2*2*3); 
            //sides*2caps *2 triangles for each side face*3 points for each vertex
            //bottom cap
            var i;
            var indexCount = 1;
            for(i=0;i<sides-1; i++){
                var anchor = i*3;
                indices[anchor] = 0;
                indices[anchor + 1] = indexCount+1;
                indices[anchor + 2] = indexCount;
                indexCount++;
            }
            //last 3 indices connects last point and first point
            indices[i*3] = 0;
            indices[i*3+1] = 1;
            indices[i*3+2] = sides;

            //side faces
            var currIndex = sides*3;
            for(var n = sides*3*2+6; n < vertices.length; n+=12){
                indices[currIndex++] = (n)/3;
                indices[currIndex++] = (n+1*3)/3;
                indices[currIndex++] = (n+3*3)/3;
                indices[currIndex++] = (n)/3;
                indices[currIndex++] = (n+3*3)/3;
                indices[currIndex++] = (n+2*3)/3;
            }

            //top cap
            var indexCount = sides + 2;
            for(i=0;i<sides-1; i++){
                indices[currIndex++] = sides + 1;
                indices[currIndex++] = indexCount;
                indexCount++;
                indices[currIndex++] = indexCount;
            }

            //last 3 indices
            indices[currIndex++] = sides + 1;
            indices[currIndex++] = sides*2 + 1;
            indices[currIndex++] = sides + 2;

            //write indices to .poly file and download
            //downloadPoly(indices,sides);
            //Output Total Number of Triangles
            console.log("Total Number of Polygons: " + indices.length/3);
        
        //CALCULATE SURFACE NORMAL
        var normal = new Float32Array(vertices.length);
        //bottom cap
        b1 = new Vector3([vertices[0],vertices[1],vertices[2]])
        b2 = new Vector3([vertices[3],vertices[4],vertices[5]])
        b3 = new Vector3([vertices[6],vertices[7],vertices[8]])
        b1.sub(b2); // vector 1     /
        b3.sub(b2); // vector 2    /-------->

        Bnorm = Vector3.cross(b1,b3);
        Bnorm.normalize();

        for(var i = 0; i < sides+1; i++){
            normal[i*3] = Bnorm.elements[0];
            normal[i*3+1] = Bnorm.elements[1];
            normal[i*3+2] = Bnorm.elements[2];
        }
        //top cap
        topIndex = (sides+1)*3
        t1 = new Vector3([vertices[topIndex],vertices[topIndex+1],vertices[topIndex+2]])
        t2 = new Vector3([vertices[topIndex+3],vertices[topIndex+4],vertices[topIndex+5]])
        t3 = new Vector3([vertices[topIndex+6],vertices[topIndex+7],vertices[topIndex+8]])

        t1.sub(t2); // vector 1     /
        t3.sub(t2); // vector 2    /-------->

        Tnorm = Vector3.cross(t3,t1);
        Tnorm.normalize();

        for(var i = 0; i < sides+1; i++){
            normal[i*3+topIndex] = Tnorm.elements[0];
            normal[i*3+1+topIndex] = Tnorm.elements[1];
            normal[i*3+2+topIndex] = Tnorm.elements[2];
        }
        //sides
        index = (sides+1)*6
        for(var i=0; i<sides; i++){
            var factor = 12*i;
            s1 = new Vector3([vertices[index+factor],vertices[index+1+factor],vertices[index+2+factor]])
            s2 = new Vector3([vertices[index+3+factor],vertices[index+4+factor],vertices[index+5+factor]])
            s3 = new Vector3([vertices[index+6+factor],vertices[index+7+factor],vertices[index+8+factor]])

            s1.sub(s2); // vector 1     /
            s3.sub(s2); // vector 2    /-------->

            Snorm = Vector3.cross(s3,s1);
            Snorm.normalize();

            for(var k = 0; k < 4; k++){
                normal[index+(k*3)+factor] = Snorm.elements[0];
                normal[index+k*3+1+factor] = Snorm.elements[1];
                normal[index+k*3+2+factor] = Snorm.elements[2];
            }
        }

        //write coordinates to .coor file and download
        //downloadCoor(vertices,sides,caps);
        //Output Total Number of Points
        console.log("Total Number of Points: " + vertices.length/3);
        /*
        if(caps == "True"){
            console.log("Total Number of Points: " + vertices.length/3);
        }
        else{
            console.log("Total Number of Points: " + (vertices.length/3 - 2));
        }
        */
        return [vertices,indices,normal];
}

//draw Cylinder
function drawCylinder(cylinder,wireframe){
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(cylinder.translate[0], cylinder.translate[1], cylinder.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(cylinder.rotate[0], 1, 0, 0);
    modelMatrix.rotate(cylinder.rotate[1], 0, 1, 0);
    modelMatrix.rotate(cylinder.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(cylinder.scale[0], cylinder.scale[1], cylinder.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, cylinder.color[0], cylinder.color[1], cylinder.color[2]);

    // Send vertices and indices from cylinder to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cylinder.Vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cylinder.Normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cylinder.Indices, gl.STATIC_DRAW);

    // Draw cylinder
    console.log(wireframe)
    if(wireframe == false){
        gl.drawElements(gl.TRIANGLES, cylinder.Indices.length, gl.UNSIGNED_SHORT, 0);
    }
    else{
        gl.drawElements(gl.LINE_LOOP, cylinder.Indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

//uses download function and writes-to/download coor file
function downloadCoor(vertices, sides, caps){
    var filename = sides + "-Sided_Cylinder.coor";
    var content = "";
    if(caps == "True"){
        content += vertices.length/3 + "\n";
        vertices.length/3 + "\n";
        for(var i=0; i<vertices.length/3; i++){
            var slicecurr = i*3;
            content += (i+1).toString() + "," + vertices.slice(slicecurr, slicecurr + 3).toString() + "\n";
        }
    }
    else{
        content += vertices.length/3 - 2 + "\n";

        //first half of array
        var lineCount = 1;
        for(var i=1; i<=sides; i++){
            var slicecurr = i*3;
            content += lineCount.toString() + "," + vertices.slice(slicecurr, slicecurr + 3).toString() + "\n";
            lineCount++;
        }
        //second half of array
        for(var i=sides+2; i<(sides+1)*2; i++){
            var slicecurr = i*3;
            content += lineCount.toString() + "," + vertices.slice(slicecurr, slicecurr + 3).toString() + "\n";
            lineCount++;
        }
    }
    download(filename,content);
}

//uses download function and writes-to/download poly file
function downloadPoly(indices, sides){
    var filename = sides + "-Sided_Cylinder.poly";
    var content = indices.length/3 + "\n";
    for(var i = 0; i<indices.length/3; i++){
        content += "Triangle" + (i+1);
        for(var n = i*3; n<i*3+3 ; n++){
            content += " " + indices[n].toString();
        }
        content += "\n";
    }
    download(filename,content);
}

//download function
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

function main() {
    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

   // Clear screen
   gl.enable(gl.DEPTH_TEST);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // Compiling both shaders and sending them to the GPU
   if(!initShaders(gl, VSHADER, FSHADER)) {
       console.log("Failed to initialize shaders.");
       return -1;
   }

   // Retrieve uniforms from shaders
   u_Color = gl.getUniformLocation(gl.program, "u_Color");
   u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
   u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");

   document.getElementById("draw").addEventListener("click", function(){
        var wireFrame = document.getElementById("wireframe").checked;
        console.log(wireFrame);
        var unitCylinder = generateCylinder();
        console.log(unitCylinder);

        let malletHandle = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        malletHandle.color = [139/255,69/255,19/255]
        malletHandle.setTranslate(-0.5, 0, 0);
        malletHandle.setRotate(90, 0, 20);
        malletHandle.setScale(0.1, 0.1, 0.5);
        console.log(malletHandle);
        console.log(unitCylinder)

        let malletHead = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        malletHead.color = [0.66,0.66,0.66]
        malletHead.setTranslate(-0.63, 0.22, -0.1);
        malletHead.setRotate(0, 20, 0);
        malletHead.setScale(0.25, 0.25, 0.7);

        //bottle
        let bottleBody = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        bottleBody.color = [51/255,0.0,0.0]
        bottleBody.setTranslate(0.4, 0.0, 0.0);
        bottleBody.setRotate(70, 0, 0);
        bottleBody.setScale(0.20, 0.20, 0.7);

        let wrapper = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        wrapper.color = [1.0,0.0,0.0]
        wrapper.setTranslate(0.4, -0.05, 0.0);
        wrapper.setRotate(70, 0, 0);
        wrapper.setScale(0.201, 0.201, 0.20);

        let cone1 = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cone1.color = [51/255,0.0,0.0]
        cone1.setTranslate(0.4, 0.04, 0.0);
        cone1.setRotate(70, 0, 0);
        cone1.setScale(0.18, 0.18, 0.05);
        
        let cone2 = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cone2.color = [51/255,0.0,0.0]
        cone2.setTranslate(0.4, 0.08, 0.0);
        cone2.setRotate(70, 0, 0);
        cone2.setScale(0.16, 0.16, 0.05); 

        let cone3 = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cone3.color = [1,1,1]
        cone3.setTranslate(0.4, 0.12, 0.0);
        cone3.setRotate(70, 0, 0);
        cone3.setScale(0.14, 0.14, 0.05);
        
        let cone4 = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cone4.color = [1,1,1]
        cone4.setTranslate(0.4, 0.16, 0.0);
        cone4.setRotate(70, 0, 0);
        cone4.setScale(0.10, 0.10, 0.05);

        let cone5 = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cone5.color = [1,1,1]
        cone5.setTranslate(0.4, 0.22, 0.0);
        cone5.setRotate(70, 0, 0);
        cone5.setScale(0.07, 0.07, 0.2);

        let cap = new cylinder(unitCylinder[0],unitCylinder[1],unitCylinder[2]);
        cap.color = [1,0,0]
        cap.setTranslate(0.4, 0.27, 0.0);
        cap.setRotate(70, 0, 0);
        cap.setScale(0.07, 0.07, 0.2);


        let cyls = [];
        cyls.push(malletHandle);
        cyls.push(malletHead);
        cyls.push(bottleBody);
        cyls.push(wrapper);
        cyls.push(cone1);
        cyls.push(cone2);
        cyls.push(cone3);
        cyls.push(cone4);
        cyls.push(cone5);
        cyls.push(cap);

        vertexBuffer = initBuffer("a_Position", 3);
        normalBuffer = initBuffer("a_Normal", 3);

        indexBuffer = gl.createBuffer();
        if(!indexBuffer) {
            console.log("Can't create buffer.")
            return -1;
        }

        // Set light data
        gl.uniform3f(u_lightColor, 1.0, 1.0, 1.0);
        //gl.uniform3f(u_lightDirection, 0.5, 3.0, -4.0);
        gl.uniform3f(u_lightDirection, -1, 1, -1);

        for(let cyl of cyls) {
            drawCylinder(cyl,wireFrame);
        }

        var test1 = new Vector3([1,1,1])
        var test2 = new Vector3([1,-1,1])
        var test3 = new Vector3([1,-1,-1])

        test1.sub(test2);
        test3.sub(test2);
        var vek = Vector3.cross(test3,test1);
        vek.normalize();
        console.log(vek)
    })
}
