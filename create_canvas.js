const Sun = {
    // Define background canvas
    canvas_background: document.getElementById('background_layer'), //Grab the HTML5 Background Canvas (will only be drawn once)
    context_background: null,
    // Define foreground canvas
    canvas_foreground: document.getElementById('foreground_layer'), //Grab the HTML5 Foreground Canvas (elements on this canvas will be rendered every frame; moving objects)
    context_foreground: null,
    width: null,
    height: null,
    // Define framerate variables
    fps: 20, //Set desired framerate
    now: null,
    then: Date.now(),
    interval: null,
    delta: null,
    // TPS
    nowTPS: null,
    thenTPS: Date.now(),
    avgTPSCount: 0,
    TPSCount: 0,
    deltaTPS: 0,
    // FPS
    nowFPS: null,
    thenFPS: Date.now(),
    avgFPSCount: 0,
    FPSCount: 0,
    deltaFPS: 0
}

init_sun();

function init_sun(){
    Sun.contextbackground = Sun.canvas_background.getContext('2d'); //Need the context to be able to draw on the canvas
    Sun.contextforeground = Sun.canvas_foreground.getContext('2d'); //Need the context to be able to draw on the canvas

    Sun.width = Sun.canvas_foreground.width;
    Sun.height = Sun.canvas_foreground.height;

    Sun.interval = 1000/Sun.fps;

    //Render background once (render the Sun at center)
    renderBackground_Sun();
    //Start the main loop
    run_Sun();
}

//Loop Function that runs as fast as possible (logic speed)
function run_Sun(){
    Sun.now = Date.now();
    Sun.delta = Sun.now - Sun.then;

    // Run this code based on desired rendering rate
    if (Sun.delta > Sun.interval){
        Sun.then = Sun.now - (Sun.delta % Sun.interval);

        // Keep track of FPS
        Sun.FPSCount++;
        Sun.nowFPS = Date.now();
        Sun.deltaFPS = Sun.nowFPS - Sun.thenFPS;
        if(Sun.deltaFPS > 1000){ //Update frame rate every second
            Sun.avgFPSCount = Sun.FPSCount;
            Sun.FPSCount = 0;
            Sun.thenFPS = Sun.nowFPS - (Sun.deltaFPS % 1000);
        }
    }

    //Keep track of TPS
    Sun.TPSCount++;
    Sun.nowTPS = Date.now();
    Sun.deltaTPS = Sun.nowTPS - Sun.thenTPS;
    if(Sun.deltaTPS > 1000){ //Update frame rate every second
        Sun.avgTPSCount = Sun.TPSCount;
        Sun.TPSCount = 0;
        Sun.thenTPS = Sun.nowTPS - (Sun.deltaTPS % 1000);
    }

    //schedules a callback invocation before the next repaint. The number of callbacks performed is usually 60 times per second
    requestAnimationFrame(renderForeground_Sun); //Call requestAnimationFrame to draw to the screen (native way for browsers to handle animation) --> This does not affect the FPS, but dramatically improves TPS

    //Loop as fast as we can
    setTimeout(run_Sun,0);
}

//RENDER BACKGROUND. ONLY INCLUDES STATIC ELEMENTS ON SCREEN.
function renderBackground_Sun(){
    //Set background color of canvas
    Sun.contextbackground.fillStyle='#090909';
    Sun.contextbackground.fillRect(0,0,Sun.width,Sun.height); // "ClearRect" by painting background color

    // render Sun at center
    Sun.contextbackground.beginPath();
    Sun.contextbackground.arc(Sun.width/2, Sun.height/2, 10, 0, 2*Math.PI, true);
    Sun.contextbackground.fillStyle = 'yellow';
    Sun.contextbackground.fill();
    Sun.contextbackground.closePath();
}

// RENDER FOREGROUND. INCLUDES ALL DYNAMIC ELEMENTS ON SCREEN.
function renderForeground_Sun(){
    // Clear the canvas (otherwise there will be "ghosting" on foreground layer)
    Sun.contextforeground.clearRect(0, 0, Sun.width, Sun.height);

    // Render Frames Per Second (using desired framerate)
    Sun.contextforeground.font = "20px Arial";
    Sun.contextforeground.textAlign = "left";
    Sun.contextforeground.fillStyle = "white";
    Sun.contextforeground.fillText("FPS = "+Sun.avgFPSCount,10,20);

    // Render Ticks Per Second (how many loops are executed per second)
    Sun.contextforeground.font = "20px Arial";
    Sun.contextforeground.textAlign = "right";
    Sun.contextforeground.fillStyle = "white";
    Sun.contextforeground.fillText("TPS = "+ Sun.avgTPSCount,Sun.width-10,20);
}