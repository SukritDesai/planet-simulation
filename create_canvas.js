/*
========================================
THE JAVASCRIPT SOLAR SYSTEM SIMULATION
========================================
PART I: CREATE LAYERED HTML CANVAS
----------------------------------------
Please visit the URL to learn more:
http://www.planetaryorbits.com/tutorial-javascript-orbit-simulation.html
----------------------------------------
*/

var T2 = {
    //Define background canvas
    canvasbackground:document.getElementById('LAYER_BACKGROUND_T2'), //Grab the HTML5 Background Canvas (will only be drawn once)
    contextbackground:null,
    //Define foreground canvas
    canvasforeground:document.getElementById('LAYER_FOREGROUND_T2'), //Grab the HTML5 Foreground Canvas (elements on this canvas will be rendered every frame; moving objects)
    contextforeground:null,
    width:null,
    height:null,
    //Define framerate variables
    fps:20, //Set desired framerate
    now:null,
    then:Date.now(),
    interval:null,
    delta:null,
    //TPS
    nowTPS:null,
    thenTPS:Date.now(),
    avgTPSCount:0,
    TPSCount:0,
    deltaTPS:0,
    //FPS
    nowFPS:null,
    thenFPS:Date.now(),
    avgFPSCount:0,
    FPSCount:0,
    deltaFPS:0
}

init_T2();

function init_T2(){
    T2.contextbackground = T2.canvasbackground.getContext('2d'); //Need the context to be able to draw on the canvas
    T2.contextforeground = T2.canvasforeground.getContext('2d'); //Need the context to be able to draw on the canvas

    T2.width = T2.canvasforeground.width;
    T2.height = T2.canvasforeground.height;

    T2.interval = 1000/T2.fps;

    //Render background once (render the Sun at center)
    renderBackground_T2();
    //Start the main loop
    run_T2();
}

//Loop Function that runs as fast as possible (logic speed)
function run_T2(){
    T2.now = Date.now();
    T2.delta = T2.now - T2.then;

    //Run this code based on desired rendering rate
    if (T2.delta > T2.interval){
        T2.then = T2.now - (T2.delta % T2.interval);

        //Keep track of FPS
        T2.FPSCount++;
        T2.nowFPS = Date.now();
        T2.deltaFPS = T2.nowFPS - T2.thenFPS;
        if(T2.deltaFPS > 1000){ //Update frame rate every second
            T2.avgFPSCount = T2.FPSCount;
            T2.FPSCount = 0;
            T2.thenFPS = T2.nowFPS - (T2.deltaFPS % 1000);
        }
    }

    //Keep track of TPS
    T2.TPSCount++;
    T2.nowTPS = Date.now();
    T2.deltaTPS = T2.nowTPS - T2.thenTPS;
    if(T2.deltaTPS > 1000){ //Update frame rate every second
        T2.avgTPSCount = T2.TPSCount;
        T2.TPSCount = 0;
        T2.thenTPS = T2.nowTPS - (T2.deltaTPS % 1000);
    }

    //schedules a callback invocation before the next repaint. The number of callbacks performed is usually 60 times per second
    requestAnimationFrame(renderForeground_T2); //Call requestAnimationFrame to draw to the screen (native way for browsers to handle animation) --> This does not affect the FPS, but dramatically improves TPS

    //Loop as fast as we can
    setTimeout(run_T2,0);
}

//RENDER BACKGROUND. ONLY INCLUDES STATIC ELEMENTS ON SCREEN.
function renderBackground_T2(){
    //Set background color of canvas
    T2.contextbackground.fillStyle='#090909';
    T2.contextbackground.fillRect(0,0,T2.width,T2.height); //"ClearRect" by painting background color

    //render Sun at center
    T2.contextbackground.beginPath();
    T2.contextbackground.arc(T2.width/2, T2.height/2, 10, 0, 2*Math.PI, true);
    T2.contextbackground.fillStyle = 'yellow';
    T2.contextbackground.fill();
    T2.contextbackground.closePath();
}

//RENDER FOREGROUND. INCLUDES ALL DYNAMIC ELEMENTS ON SCREEN.
function renderForeground_T2(){
    //Clear the canvas (otherwise there will be "ghosting" on foreground layer)
    T2.contextforeground.clearRect(0, 0, T2.width, T2.height);

    //Render Frames Per Second (using desired framerate)
    T2.contextforeground.font = "20px Arial";
    T2.contextforeground.textAlign = "left";
    T2.contextforeground.fillStyle = "white";
    T2.contextforeground.fillText("FPS = "+T2.avgFPSCount,10,20);

    //Render Ticks Per Second (how many loops are executed per second)
    T2.contextforeground.font = "20px Arial";
    T2.contextforeground.textAlign = "right";
    T2.contextforeground.fillStyle = "white";
    T2.contextforeground.fillText("TPS = "+T2.avgTPSCount,T2.width-10,20);
}