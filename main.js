//
var skpos = [0,0,0]
var skr = 0;
var legs = 0;
var down = true;
var manJump = 0.021;
var j = 0;
var b = 0;
var boardJump = 0;
var landed = false;
var kickflip = 0;
var varial = 0;
var scene2 = false
var speed = 20

var frames = 0;
var campos = [0,0,0]
var theta = 0;
var z = 4;
let lastFps = performance.now();
var look = [42,-10,15]

//

var canvas;
var gl;

var program;

var near = 1;
var far = 300;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(-100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = true;
var controller;



// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.
var currentRotation = [0,0,0];
var bouncingCubePosition = [0,4,0];
var bouncyBallVelocity = 0;
var bouncyEnergyLoss = 0.9;
var gravity = -9.8;


var blendTextures = 0;
var useTex3 = 0;
var useTex4 = 0;
var useTex5 = 0;
var useTex6 = 0;


		
// For this example we are going to store a few different textures here
var textureArray = [] ;

// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

// We are going to asynchronously load actual image files this will check if that call if an async call is complete
// You can use this for debugging
function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

// Helper function to load an actual file as a texture
// NOTE: The image is going to be loaded asyncronously (lazy) which could be
// after the program continues to the next functions. OUCH!
function loadFileTexture(tex, filename)
{
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
}

// Once the above image file loaded with loadFileTexture is actually loaded,
// this funcion is the onload handler and will be called.
function handleTextureLoaded(textureObj) {
	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
	
	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

// Takes an array of textures and calls render if the textures are created/loaded
// This is useful if you have a bunch of textures, to ensure that those files are
// actually laoded from disk you can wait and delay the render function call
// Notice how we call this at the end of init instead of just calling requestAnimFrame like before
function waitForTextures(texs) {
    setTimeout(
		function() {
			   var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log(texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               		console.log(wtime + " not ready yet") ;
               		waitForTextures(texs) ;
               }
               else
               {
               		console.log("ready to render") ;
					render(0);
               }
		},
	5) ;
}

// This will use an array of existing image data to load and set parameters for a texture
// We'll use this function for procedural textures, since there is no async loading to deal with
function loadImageTexture(tex, image) {
	//create and initalize a webgl texture object.
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();

	//Binds a texture to a target. Target is then used in future calls.
		//Targets:
			// TEXTURE_2D           - A two-dimensional texture.
			// TEXTURE_CUBE_MAP     - A cube-mapped texture.
			// TEXTURE_3D           - A three-dimensional texture.
			// TEXTURE_2D_ARRAY     - A two-dimensional array texture.
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);

	//texImage2D(Target, internalformat, width, height, border, format, type, ImageData source)
    //Internal Format: What type of format is the data in? We are using a vec4 with format [r,g,b,a].
        //Other formats: RGB, LUMINANCE_ALPHA, LUMINANCE, ALPHA
    //Border: Width of image border. Adds padding.
    //Format: Similar to Internal format. But this responds to the texel data, or what kind of data the shader gets.
    //Type: Data type of the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	//Generates a set of mipmaps for the texture object.
        /*
            Mipmaps are used to create distance with objects. 
        A higher-resolution mipmap is used for objects that are closer, 
        and a lower-resolution mipmap is used for objects that are farther away. 
        It starts with the resolution of the texture image and halves the resolution 
        until a 1x1 dimension texture image is created.
        */
    gl.generateMipmap(gl.TEXTURE_2D);
	
	//Set texture parameters.
    //texParameteri(GLenum target, GLenum pname, GLint param);
    //pname: Texture parameter to set.
        // TEXTURE_MAG_FILTER : Texture Magnification Filter. What happens when you zoom into the texture
        // TEXTURE_MIN_FILTER : Texture minification filter. What happens when you zoom out of the texture
    //param: What to set it to.
        //For the Mag Filter: gl.LINEAR (default value), gl.NEAREST
        //For the Min Filter: 
            //gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (default value), gl.LINEAR_MIPMAP_LINEAR.
    //Full list at: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;
}

// This just calls the appropriate texture loads for this example adn puts the textures in an array
function initTextures() {
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"concrete.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"stones.png") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"metal.jpg");

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"cracked.jpg");

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"denim.png");

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"grip.jpg");
}

// Turn texture use on and off
function toggleTextureBlending() {
    blendTextures = (blendTextures + 1) % 2
	gl.uniform1i(gl.getUniformLocation(program, "blendTextures"), blendTextures);
}
function toggleTex3(){
    useTex3 = (useTex3 + 1) % 2
    gl.uniform1i(gl.getUniformLocation(program, 'useTex3'), useTex3)
}

function toggleTex4(){
    useTex4 = (useTex4 + 1) % 2
    gl.uniform1i(gl.getUniformLocation(program, 'useTex4'), useTex4)
}

function toggleTex5(){
    useTex5 = (useTex5 + 1) % 2
    gl.uniform1i(gl.getUniformLocation(program, 'useTex5'), useTex5)
}

function toggleTex6(){
    useTex6 = (useTex6 + 1) % 2
    gl.uniform1i(gl.getUniformLocation(program, 'useTex6'), useTex6)
}




window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
	
	// Helper function just for this example to load the set of textures
    initTextures() ;

    waitForTextures(textureArray);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Draw a Bezier patch
function drawB3(b) {
	setMV() ;
	b.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

function pop(time,a,m){
	const x = m*Math.sin((time/a))-1
	return x;
}

function jump(time, velocity){
    t = time;
    const x = (velocity - 9.8*t); // gravity
    return x;
}


function wheel(){
        gPush()
            toggleTex3() // metal shader for trucks
            // Truck
            gPush()
                gTranslate(0,-0.325,0.05)
                gScale(0.1,0.2,-0.2)
                drawCone()
            gPop()

            gRotate(90,1,0,0)
            
            // Axel
            gPush()
                gTranslate(0,0,0.3)
                gScale(0.05,0.05,0.8)
                drawCylinder()
            gPop()
            toggleTex3()

            gPush()
                setColor(vec4(1,0,0,1)) // wheel color
                gScale(0.15,0.15,0.125)
                drawCylinder()
            gPop()
            gPush()
                setColor(vec4(1,0,0,1)) // wheel color
                gTranslate(0,0,0.6)
                gScale(0.15,0.15,0.125)
                drawCylinder()
            gPop()

            
            

        gPop()

}

function skateboard(time, flip=0, fall=0, grind=0){
    gPush()
    if (time == 0){ // initalize variables for subsequent calls
        kickflip = 0
        varial = 0
    }
    if (flip){
        if (time<350 && time>=100){
            if (kickflip<360){ // ensures full rotation on both axis
                if (flip==1){
                    kickflip += 5; // kickflip
                }
                if (flip==2){
                    kickflip += 5
                    varial += 5; // 360 spin with kickflip
                }
            }
        }

        if (time>=94){
            if (boardJump>fall){
                if (grind){
                    boardJump += jump(time, 1400)/5000; // olly a little higher for rail
                }else{
                    boardJump += jump(time, 1350)/5000; // jump with gavity
                }
            }
            if (boardJump<fall){ // check if ground has been reached
                boardJump=fall 
            }
        }

    }


    gPush()
        setColor(vec4(0.5,0.2,0.8))
        gTranslate(0,0,boardJump);

        // board spins on its orgin
        gRotate(varial,0,0,1);
        gRotate(kickflip,1,0,0); // kickflip
        
        toggleTex6() // grip tape texture

        // Tail
        gPush()
            gTranslate(-1.175,0,0.075)
            gRotate(20,0,1,0)

            gScale(0.2, 0.4, 0.02)
            drawCube()
            
        gPop()

        // Deck
        gPush()
            gScale(1, 0.4, 0.02)
            drawCube()
        gPop()

        // Nose
        gPush()
            gTranslate(1.175,0,0.075)
            gRotate(-20,0,1,0)
            gScale(0.2, 0.4, 0.02)
            drawCube()
        gPop()
        toggleTex6()

        // Wheels
        gPush()
            gTranslate(-0.75,0.325,-0.15)
            wheel()
        gPop()

        gPush()
            gTranslate(0.75,0.325,-0.15)
            wheel()
        gPop()
        
        

    gPop()
    gPop()
}


function skater(time, flip=false, fall=0, grind=0){
    if (time == 0){
        legs = 0
        down = true
        slide = 0 // initialize variables back on subsequent calls
    }
    if (flip && scene2 == false){
        // set up
        if (time<100){
            if (down==true){
                legs -= 110*dt; // bend knees
            } else{
                if (legs<-12){
                    legs += (time**2)/3000; // pop knees with force
                }
            }
            if (legs<-70){
                down = false; // leg bend threshold
            }
        }  

        // jump
        if (skpos[1]<1 && grind && time>120 && time<300){ // if grinding get onto rail
            skpos[1]-=0.02 // move back onto rail
        }
        if (time==100){
            down=true
        }
        if (time>=90){

            if (manJump>fall){
                if (grind){
                    j = jump(time, 1400)/5000; // jump a little higher for grind
                }else{
                    j = jump(time, 1350)/5000; // jump
                }
                manJump += j// jump with gavity
                landed=false

                // bend knees in air to catch board
                if (time>100 && time<200){
                    if (down==true){
                        legs -= 2; // bend forward
                        manJump+=0.01
                        if (flip==1){
                        }
                    } else{
                        if (legs<-5){
                            legs += 1; // bend back
                            manJump-=0.01 // catch board mid air
                        }
                    }
                    if (legs<-70){
                        down = false;
                    }
                }

            }
            if (manJump<fall){ // check if landed
                manJump=fall
                landed=true
            }
        }

        if (grind && manJump == fall){ // grind logic
            if (time<300){
                slide -= 0.05; // slide on rail
            } else{
                if (time<310){
                    slide -=0.05 
                }
                else {
                    if (slide>grind){
                        slide -= 0.1
                    }
                    if (slide<=grind+0.5 && time<355){ 
                        legs-=2 // bend legs for landing
                    }
                    if (time>355 && legs<0){ 
                        legs+=0.5 // bend back
                    }
                    if (time>400){
                        if (skr<90){
                            skr+=1
                            speed=15 // slow down and power slide
                        }
                        if (time>580){ // stop skater
                            speed=0
                        }

                    }
                }
            }
        }
        else{
            // land from tre flip
            if (time==210){
                down = true;
            }
            else if (time>220){
                if (down==true){
                    legs -= (1/time)*500; // legs brace impact
                    if (time>220 && flip == 2){ // powerslide after big drop
                        skr+=1
                    }
                    
                } else{
                    if (legs<0){
                        down=false
                        legs += 1;
                        if (skr>0 && flip== 2){ // powerslide correction
                            skr-=0.5;
                        }
                    }
                }
                if (legs<-75){
                    down = false;
                }
            }
        }

        

    }
    gPush()
        if (scene2==false){
            gRotate(skr,0,0,1)
            gTranslate(0,0,slide) // grind rail
            skateboard(time, flip, fall, grind)
        }
    
    //

    gPush()
        setColor(vec4(1,1,0))
        if (scene2 == false){
            gTranslate(0,0,manJump) // move vertically
        }

        //gRotate(180,0,0,1)
        gTranslate(0.9,-0.1,0.06) // position on board

        // Feet stay planted on board while knees bend to set up for tricks

        // R + Body + Head
        gPush()
            gTranslate(0.3,0,0)
            gPush()
                setColor(vec4(1,0.2,0.2,1))
                gScale(0.15,0.3,0.07)
                drawCube()
            gPop()

            toggleTex5() // pants
            // Shin
            gRotate(90,1,0,0) // make perpendicular to foot
            gRotate(legs,1,0,0) // ankle joint

            gTranslate(0,0.5,0.2)
            gPush()
                gScale(0.12,0.5,0.07)
                drawCube()
            gPop()

            // Thigh
            gTranslate(0,0.5,0.035)
            gRotate(-2*legs+15,1,0,0) // knee joint
            gTranslate(0,0.5,-0.035)
            
            gPush()
                gScale(0.12,0.5,0.07)
                drawCube()
            gPop()
            toggleTex5()

            // Torsoe
            gTranslate(0,0.5,0)
            gRotate(legs-20,1,0,0) // hip joint
            gTranslate(-0.46,0.75,0)
            gPush()
                setColor(vec4(1,1,0.5,1))
                gScale(0.6,0.8,0.1)
                drawCube()
            gPop()
            
            //Head
            gTranslate(0,1,0)
            gPush()
                setColor(vec4(1,0.7,0.5,1))
                gScale(0.3,0.3,0.3)
                drawSphere()
            gPop()


        gPop()

        // L
        gPush()
            // Foot
            gTranslate(-0.6,0,0)
            gPush()
                setColor(vec4(1,0.2,0.2,1))
                gScale(0.15,0.3,0.07)
                drawCube()
            gPop()

            toggleTex5() // pants

            // Shin
            gRotate(90,1,0,0) // make perpendicular to foot
            gRotate(legs,1,0,0) // ankle joint

            gTranslate(0,0.5,0.2)
            gPush()
                gScale(0.12,0.5,0.07)
                drawCube()
            gPop()

            // Thigh
            gTranslate(0,0.5,0.035)
            gRotate(-2*legs+15,1,0,0) // knee joint
            gTranslate(0,0.5,-0.035)
            
            gPush()
                gScale(0.12,0.5,0.07)
                drawCube() 
            gPop()

            toggleTex5()
        gPop()
    gPop()
    gPop()

}

function park(){
    // GROUND

    // level 1
    gPush()
        gTranslate(10,-6,-10)
        gScale(60,5,10)

        toggleTextureBlending()
        drawCube()
        toggleTextureBlending()
    gPop()

    // level 2
    gPush()
        gTranslate(-90,-12,-10)
        gScale(25,5,10)
        setColor(vec4(1,1,1,1))
        toggleTex4()

        drawCube()
        toggleTex4()
    gPop()
    
    // RAIL
    // bar
    toggleTex3()
    gPush()
        gTranslate(-130,-8,-4.5)
        gRotate(19,0,0,1)
        gRotate(9,0,1,0)
        gTranslate(-2, 0, 0)
        gScale(16,0.1,0.15)
        drawCube()
    gPop()

    // top stand
    gPush()
        gTranslate(-116,-5,-6)
        gRotate(90,0,0,1)
        gScale(1.5,0.1,0.15)
        drawCube()

    gPop()

    // bottom stand
    gPush()
        gTranslate(-147,-15,-1.95)
        gRotate(90,0,0,1)
        gScale(1.3,0.1,0.15)
        drawCube()

    gPop()
    toggleTex3()

    // level 3
    gPush()
        gTranslate(-150,-21.02,-6)
        gScale(80,5,10)
        toggleTex4()
        drawCube()
        toggleTex4()

    gPop()

    // // manny pad
    // gPush()
    //     setColor(vec4(0,1,0.5,0))
    //     gTranslate(-115,-7,-7)
    //     gScale(10,1,2)
    //     drawCube()
    // gPop()



}

function fly(eye, at, up, x, y, z, theta){ //  moves camera with skater
    setMV()
    viewMatrix = mult(lookAt(eye, at, up), rotate(theta, [0,1,0]))
    viewMatrix = mult(viewMatrix, translate([x,y,z]))
    
    
}
function spin(eye, at, up, theta){ // spins camera around origin 
    setMV()
    neweye  = vec3(-150,100,0)
    v = lookAt(neweye, at, up)
    viewMatrix = mult(v, rotate(theta, [0,1,0]))
    
}
function zoom(z){
    y = vec3(eye[0]*z, eye[1]*z, eye[2]*z)
    return y
}


function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(-10,2,-20);
    at = vec3(look[0],look[1], look[2])
    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);


    eye = zoom(2) //  zoom in


    // Camera Movement

    if (frames<80){
        campos[0]+=speed*dt;
        campos[1]-=5*dt;
    }

    // tre flip drop camera movement
    else if (frames>400 && frames<520){
        campos[1]+=3*dt;
    }

    // rail camera movement
    else if (frames>650 && frames<=1100){
        campos[1]+=2*dt;
        campos[0]-=2*dt;
        if (frames > 800){
            theta-=0.1 
            campos[0]+=30*dt;
            campos[1]-=7*dt;
            look[1]-=7*dt;
            look[0]-=3*dt;
        }
    }
    // move skater and cam
    if (frames<= 800){
        campos[0]+=speed*dt;
    }
    if (scene2==false){
        skpos[0] -= speed*dt;
        fly(eye, at, up, campos[0], campos[1], campos[2], theta)
    }
    if (scene2==true){
        theta+=50*dt;
        spin(eye, vec3(0,5,0), up, theta) // 360 degree spin around origin
    }


    // set all the matrices
    setAllMatrices();
    
	if( animFlag )
    {
		// dt is the change in time or delta time from the last frame to this one
		// in animation typically we have some property or degree of freedom we want to evolve over time
		// For example imagine x is the position of a thing.
		// To get the new position of a thing we do something called integration
		// the simpelst form of this looks like:
		// x_new = x + v*dt
		// That is the new position equals the current position + the rate of of change of that position (often a velocity or speed), times the change in time
		// We can do this with angles or positions, the whole x,y,z position or just one dimension. It is up to us!
		dt = (timestamp - prevTime) / 1000.0;
		prevTime = timestamp;
        
        fps = 1/dt;
        document.getElementById('fps').textContent = `FPS: ${Math.round(fps)}`;
	}
	
	// We need to bind our textures, ensure the right one is active before we draw
	//Activate a specified "texture unit".
    //Texture units are of form gl.TEXTUREi | where i is an integer.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);

    gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture3"), 2);

    gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture4"), 3);

    gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture5"), 4);

    gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
	gl.uniform1i(gl.getUniformLocation(program, "texture6"), 5);
	
		
        // SKATER
    // arg 1 = start time
    // arg 2:
    // kickflip = 1
    // treflip = 2
    gPush()
        gRotate(-90,1,0,0)
        gTranslate(6,7,-0.75)
        gTranslate(skpos[0],skpos[1],skpos[2])
        if (frames<230){
            skater(frames, false);
            start = frames;
        }else if (frames<600){
            skater(frames-230, 2,-6)
        }
        else{
            skater(frames-620, 1, -7, -8)
        }
        if (frames>1300){
            scene2=true;
        }
    gPop()
    
    
    // Creates environment
    park()


    
    
    if( animFlag )
        frames+=1
        window.requestAnimFrame(render);
}
