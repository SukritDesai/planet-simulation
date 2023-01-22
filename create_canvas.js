/*
* Name: Sukrit and Kevin
* Date: Dec 19 - 23 2022
* Teacher: Mr Gugoiu
* IDE: IntelliJ IDEA
* Description: The source file for each layer of the simulation, the bottom half is helper functions for the Keplerian elements.
* */

// Class for all keplerian elements, the values below are all just attributes of the class.
// If the value is set to null that means that it will be edited accordingly later

const Elements = {
    //Define background canvas
    background: document.getElementById('background_layer'), //Grab the HTML5 Background Canvas (will only be drawn once)
    context_background: null,
    //Define foreground canvas
    foreground: document.getElementById('foreground_layer'), //Grab the HTML5 Foreground Canvas (elements on this canvas will be rendered every frame; moving objects)
    context_foreground: null,
    width: null,
    height: null,
    //Define framerate variables
    fps: 20, //Set desired framerate
    now: null,
    then: Date.now(),
    interval: null,
    delta: null,
    //FPS
    nowFPS:null,
    thenFPS:Date.now(),
    avgFPSCount:0,
    FPSCount:0,
    deltaFPS:0,

    julianCenturyInJulianDays:36525,
    julianEpochJ2000:2451545.0,
    julianDate:null,
    current:null,
    newDate:null,
    DAY:null,
    MONTH:null,
    YEAR:null,

//ELEMENTS @ J2000: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
    planetElements: [
        //MERCURY (0)
        [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
        //VENUS (1)
        [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
        //EARTH (2)
        [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
        //MARS (3)
        [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
        //JUPITER (4)
        [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
        //SATURN (5)
        [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
        //URANUS (6)
        [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
        //NEPTUNE (7)
        [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574]
    ],

//RATES: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
    planetRates: [
        //MERCURY (0)
        [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689,-0.1253408],
        //VENUS (1)
        [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
        //EARTH (2)
        [0.00000562,-0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
        //MARS (3)
        [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
        //JUPITER (4)
        [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
        //SATURN (5)
        [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
        //URANUS (6)
        [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
        //NEPTUNE (7)
        [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]
    ],

    orbitalElements: null,

    xMercury: null,
    yMercury: null,
    xVenus: null,
    yVenus: null,
    xEarth: null,
    yEarth: null,
    xMars: null,
    yMars: null,
    xJupiter: null,
    yJupiter: null,
    xSaturn: null,
    ySaturn: null,
    xUranus: null,
    yUranus: null,
    xNeptune: null,
    yNeptune: null,

    scale: 75,

    //Divide AU multiplier by this number to fit it into  "orrery" style solar system (compressed scale)
    jupiterScaleDivider: 2.5,
    saturnScaleDivider: 3.5,
    uranusScaleDivider: 6.2,
    neptuneScaleDivider: 8.7
}

init_Elements();

function init_Elements(){
    Elements.contextbackground = Elements.background.getContext('2d'); //Need the context to be able to draw on the canvas
    Elements.context_foreground = Elements.foreground.getContext('2d'); //Need the context to be able to draw on the canvas

    Elements.width = Elements.foreground.width;
    Elements.height = Elements.foreground.height;

    // sets the animation interval
    Elements.interval = 1000 / Elements.fps;

    // Sets Gregorian Date (makes the simulation start at January 1, 2000, at 12:00 am)
    Elements.current = new Date(Date.UTC(2000, 1, 1,0,0,0));

    Elements.DAY = Elements.current.getDate(); // the getDate method returns the day of the month for the specified time
    Elements.MONTH = Elements.current.getMonth() + 1; // Gets the month set above, adds one because its 1 indexed (January starts at 0)
    Elements.YEAR = Elements.current.getFullYear(); // Gets the year set above

    Elements.julianDate = getJulianDate_Elements(Elements.YEAR, Elements.MONTH, Elements.DAY); // converts the gregorian date to the julian date
    // 3. Get Julian Centuries since Epoch (J2000)
    Elements.T = (Elements.julianDate - Elements.julianEpochJ2000) / Elements.julianCenturyInJulianDays; // gets the amount of julian centuries

    // Render background once (render the Sun at center)
    renderBackground_Elements();
    // Starts the main loop
    run_Elements();
}

//Loop Function that runs as fast as possible (logic speed)
function run_Elements(){
    Elements.now = Date.now();
    // The difference in the time since the Elements object is instantiated and now
    Elements.delta = Elements.now - Elements.then;

    //Run this code based on desired rendering rate
    if (Elements.delta > Elements.interval) {
        Elements.then = Elements.now - (Elements.delta % Elements.interval);

        // Keep track of FPS
        Elements.FPSCount++;
        Elements.nowFPS = Date.now();
        Elements.deltaFPS = Elements.nowFPS - Elements.thenFPS;
        if (Elements.deltaFPS > 1000) { //Update frame rate every second
            Elements.avgFPSCount = Elements.FPSCount;
            Elements.FPSCount = 0;
            Elements.thenFPS = Elements.nowFPS - (Elements.deltaFPS % 1000);
        }

        //Increase date by 1 day each frame
        updateDate_Elements(1);

        //Get Mercury Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,0);Elements.xMercury = Elements.orbitalElements[0];Elements.yMercury = Elements.orbitalElements[1];
        //Get Venus Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,1);Elements.xVenus = Elements.orbitalElements[0];Elements.yVenus = Elements.orbitalElements[1];
        //Get Earth Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,2);Elements.xEarth = Elements.orbitalElements[0];Elements.yEarth = Elements.orbitalElements[1];
        //Get Mars Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,3);Elements.xMars = Elements.orbitalElements[0];Elements.yMars = Elements.orbitalElements[1];
        //Get Jupiter Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,4);Elements.xJupiter = Elements.orbitalElements[0];Elements.yJupiter = Elements.orbitalElements[1];
        //Get Saturn Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,5);Elements.xSaturn = Elements.orbitalElements[0];Elements.ySaturn = Elements.orbitalElements[1];
        //Get Uranus Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,6);Elements.xUranus = Elements.orbitalElements[0];Elements.yUranus = Elements.orbitalElements[1];
        //Get Neptune Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet_Elements(Elements.T,7);Elements.xNeptune = Elements.orbitalElements[0];Elements.yNeptune = Elements.orbitalElements[1];
    }

    //schedules a callback invocation before the next repaint. The number of callbacks performed is usually 60 times per second
    requestAnimationFrame(renderForeground_Elements); // Call requestAnimationFrame to draw to the screen (native way for browsers to handle animation) --> This does not affect the FPS, but dramatically improves TPS

    //Loop as fast as we can
    setTimeout(run_Elements,0);
}

//RENDER BACKGROUND. ONLY INCLUDES STATIC ELEMENTS ON SCREEN.
function renderBackground_Elements(){
    // Sets the background color of the canvas
    Elements.contextbackground.fillStyle='#090909';
    Elements.contextbackground.fillRect(0,0,Elements.width,Elements.height); // "ClearRect" by re-painting the background color

    // Makes the sun
    Elements.contextbackground.beginPath();
    Elements.contextbackground.arc(Elements.width/2, Elements.height/2, 10, 0, 2*Math.PI, true);
    Elements.contextbackground.fillStyle = 'yellow';
    Elements.contextbackground.fill();
    Elements.contextbackground.closePath();
}

//RENDER FOREGROUND. INCLUDES ALL DYNAMIC ELEMENTS ON SCREEN.
function renderForeground_Elements(){
    //Clear the canvas (otherwise there will be "ghosting" on foreground layer)
    Elements.context_foreground.clearRect(0, 0, Elements.width, Elements.height);

    //INNER PLANETS
    //Render planet Mercury
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xMercury * Elements.scale), (Elements.height / 2) - (Elements.yMercury * Elements.scale), (3 + (0.5 * (4879/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'Chocolate';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Venus
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xVenus * Elements.scale), (Elements.height/2)-(Elements.yVenus*Elements.scale),(3 + (0.5 * (12104/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'BurlyWood';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Earth
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xEarth*Elements.scale), (Elements.height/2)-(Elements.yEarth*Elements.scale),  (3+(0.5*(12756/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'SteelBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Mars
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xMars*Elements.scale), (Elements.height/2)-(Elements.yMars*Elements.scale), (3+(0.5*(6792/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'red';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();

    //OUTER PLANETS
    //Render planet Jupiter
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xJupiter*Elements.scale/Elements.jupiterScaleDivider), (Elements.height/2)-(Elements.yJupiter*Elements.scale/Elements.jupiterScaleDivider), (4+(0.5*(142984/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'Peru';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Saturn
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xSaturn*Elements.scale/Elements.saturnScaleDivider), (Elements.height/2)-(Elements.ySaturn*Elements.scale/Elements.saturnScaleDivider), (4+(0.5*(120536/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'AliceBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Uranus
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xUranus*Elements.scale/Elements.uranusScaleDivider), (Elements.height/2)-(Elements.yUranus*Elements.scale/Elements.uranusScaleDivider), (4+(0.5*(51118/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'LightSkyBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    //Render planet Neptune
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xNeptune*Elements.scale/Elements.neptuneScaleDivider), (Elements.height/2)-(Elements.yNeptune*Elements.scale/Elements.neptuneScaleDivider), (4+(0.5*(49528/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'MidnightBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();

    //Render Gregorian Date for Today
    Elements.context_foreground.font = "20px Times New Roman";
    Elements.context_foreground.textAlign = "left";
    Elements.context_foreground.fillStyle = "";
    Elements.context_foreground.fillText("Date = "+Elements.YEAR+"."+Elements.MONTH+"."+Elements.DAY,10,340);
}

function getJulianDate_Elements(Year,Month,Day){
    let inputDate = new Date(Year, Month, Math.floor(Day));
    let switchDate = new Date(1582, 10, 15);

    let isGregorianDate = inputDate >= switchDate;

    //Adjust if B.C.
    if(Year<0){
        Year++;
    }

    //Adjust if JAN or FEB
    if(Month === 1||Month === 2){
        Year = Year - 1;
        Month = Month + 12;
    }

    //Calculate A & B; ONLY if date is equal or after 1582-Oct-15
    let A = Math.floor(Year/100); //A
    let B = 2-A+Math.floor(A/4); //B

    //Ignore B if date is before 1582-Oct-15
    if(!isGregorianDate){B=0;}

    return ((Math.floor(365.25*Year)) + (Math.floor(30.6001*(Month+1))) + Day + 1720994.5 + B);
}

function updateDate_Elements(increment){
    Elements.newDate = new Date(Elements.current.getFullYear(), Elements.current.getMonth(), Elements.current.getDate()+increment); //Set to today +1 day
    Elements.current = Elements.newDate;

    newdd = Elements.newDate.getDate();
    newmm = Elements.newDate.getMonth()+1; //January is 0!
    newyyyy = Elements.newDate.getFullYear();

    Elements.YEAR = newyyyy;
    Elements.MONTH = newmm;
    Elements.DAY = newdd;

    Elements.julianDate = getJulianDate_Elements(Elements.YEAR,Elements.MONTH,Elements.DAY);
    Elements.T = (Elements.julianDate-Elements.julianEpochJ2000)/Elements.julianCenturyInJulianDays;
}

function plotPlanet_Elements(TGen,planetNumber){
    //--------------------------------------------------------------------------------------------
    //1.
    //ORBIT SIZE
    //AU (CONSTANT = DOESN'T CHANGE)
    let aGen = Elements.planetElements[planetNumber][0] + (Elements.planetRates[planetNumber][0] * TGen);
    //2.
    //ORBIT SHAPE
    //ECCENTRICITY (CONSTANT = DOESN'T CHANGE)
    let eGen = Elements.planetElements[planetNumber][1] + (Elements.planetRates[planetNumber][1] * TGen);
    //--------------------------------------------------------------------------------------------
    //3.
    //ORBIT ORIENTATION
    //ORBITAL INCLINATION (CONSTANT = DOESN'T CHANGE)
    let iGen = Elements.planetElements[planetNumber][2] + (Elements.planetRates[planetNumber][2] * TGen);
    iGen = iGen % 360;
    //4.
    //ORBIT ORIENTATION
    //LONG OF ASCENDING NODE (CONSTANT = DOESN'T CHANGE)
    let WGen = Elements.planetElements[planetNumber][5] + (Elements.planetRates[planetNumber][5] * TGen);
    WGen = WGen%360;
    //5.
    //ORBIT ORIENTATION
    //LONGITUDE OF THE PERIHELION
    let wGen = Elements.planetElements[planetNumber][4] + (Elements.planetRates[planetNumber][4] * TGen);
    wGen = wGen%360;
    if (wGen < 0) {wGen = 360 + wGen;}
    //--------------------------------------------------------------------------------------------
    //6.
    //ORBIT POSITION
    //MEAN LONGITUDE (DYNAMIC = CHANGES OVER TIME)
    let LGen = Elements.planetElements[planetNumber][3] + (Elements.planetRates[planetNumber][3] * TGen);
    LGen = LGen % 360;
    if (LGen < 0) {LGen = 360 + LGen;}


    //MEAN ANOMALY --> Use this to determine Perihelion (0 degrees = Perihelion of planet)
    let MGen = LGen - (wGen);
    if(MGen < 0) {MGen = 360 + MGen;}

    //ECCENTRIC ANOMALY
    let EGen = EccAnom_Elements(eGen,MGen,6);

    //ARGUMENT OF TRUE ANOMALY
    let trueAnomalyArgGen = (Math.sqrt((1+eGen) / (1-eGen)))*(Math.tan(toRadians_Elements(EGen)/2));

    // TRUE ANOMALY (DYNAMIC = CHANGES OVER TIME)
    let K = Math.PI/180.0; // Radian converter variable
    let nGen;
    if (trueAnomalyArgGen < 0) {
        nGen = 2 * (Math.atan(trueAnomalyArgGen)/ K + 180);
    }
    else {
        nGen = 2 * (Math.atan(trueAnomalyArgGen)/K)
    }

    //CALCULATE RADIUS VECTOR
    let rGen = aGen * (1 - (eGen * (Math.cos(toRadians_Elements(EGen)))));

    //TAKEN FROM: http://www.stargazing.net/kepler/ellipse.html
    //CREDIT: Keith Burnett
    //Used to determine Heliocentric Ecliptic Coordinates
    let xGen = rGen * (Math.cos(toRadians_Elements(WGen)) * Math.cos(toRadians_Elements(nGen + wGen - WGen)) - Math.sin(toRadians_Elements(WGen)) * Math.sin(toRadians_Elements(nGen + wGen - WGen)) * Math.cos(toRadians_Elements(iGen)));
    let yGen = rGen * (Math.sin(toRadians_Elements(WGen)) * Math.cos(toRadians_Elements(nGen + wGen - WGen)) + Math.cos(toRadians_Elements(WGen)) * Math.sin(toRadians_Elements(nGen + wGen - WGen)) * Math.cos(toRadians_Elements(iGen)));

    return [xGen, yGen];
}

//TAKEN FROM: http://www.jgiesen.de/kepler/kepler.html
//Used to solve for E
function EccAnom_Elements(ec,m,dp) {
    // arguments:
    // ec=eccentricity, m=mean anomaly,
    // dp=number of decimal places

    let pi = Math.PI, K = pi / 180.0;
    let maxIter = 30, i = 0;
    let delta=Math.pow(10,-dp);
    let E, F;

    m = m / 360.0;
    m = 2.0 * pi * (m - Math.floor(m));

    if (ec<0.8) E=m; else E=pi;

    F = E - ec*Math.sin(m) - m;

    while ((Math.abs(F)>delta) && (i<maxIter)) {
        E = E - F/(1.0-ec*Math.cos(E));
        F = E - ec*Math.sin(E) - m;
        i = i + 1;
    }
    E = E / K;
    return Math.round(E*Math.pow(10,dp))/Math.pow(10,dp);
}

function toRadians_Elements(deg){
    return deg * (Math.PI / 180);
}

function round_Elements(value, decimals) {
    return Number(Math.round(value + 'e' + decimals)+ 'e- ' + decimals);
}