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
    // Define background canvas
    background: document.getElementById('background_layer'), //Grab the HTML5 Background Canvas (will only be drawn once)
    //Define foreground canvas
    foreground: document.getElementById('foreground_layer'), //Grab the HTML5 Foreground Canvas (elements on this canvas will be rendered every frame; moving objects)
    context_foreground: null, // Used to get the context of the foreground layer so that drawing can be done
    width: null, // width of screen
    height: null, // height of screen
    fps: 60, // Framerate of the animation
    now: null, // used for updating the animation
    then: Date.now(), // time when object is instantiated, called "then" because when it is used, some time would have passed
    interval: null, // sets how often to update the animation
    delta: null, //
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

    // ELEMENTS @ J2000: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
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

    // RATES: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
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

init();
// Initializes all the required basics and calls the animation function
function init() {
    Elements.contextbackground = Elements.background.getContext('2d'); // Gets the context to start drawing
    Elements.context_foreground = Elements.foreground.getContext('2d');

    Elements.width = Elements.foreground.width; // sets the width
    Elements.height = Elements.foreground.height; // sets the height

    // sets the animation interval
    Elements.interval = 1000 / Elements.fps;

    // Sets Gregorian Date (makes the simulation start at January 1, 2000, at 12:00 am)
    Elements.current = new Date(Date.UTC(2000, 1, 1,0,0,0));

    Elements.DAY = Elements.current.getDate(); // the getDate method returns the day of the month for the specified time
    Elements.MONTH = Elements.current.getMonth() + 1; // Gets the month set above, adds one because its 1 indexed (January starts at 0)
    Elements.YEAR = Elements.current.getFullYear(); // Gets the year set above

    Elements.julianDate = getJulianDate(Elements.YEAR, Elements.MONTH, Elements.DAY); // converts the gregorian date to the julian date

    Elements.T = (Elements.julianDate - Elements.julianEpochJ2000) / Elements.julianCenturyInJulianDays; // gets the amount of julian centuries

    // Renders background once (render the Sun at center)
    renderBackground();
    // Starts the main loop
    run();
}

// The function that runs the animation
function run() {
    Elements.now = Date.now(); // Gets the current time
    // The difference in the time since the Elements object is instantiated and now
    Elements.delta = Elements.now - Elements.then;


    // Run this code based on desired rendering rate
    if (Elements.delta > Elements.interval) { // checks if time difference is greater than the desired interval between animations
        Elements.then = Elements.now - (Elements.delta % Elements.interval); // changes the time since the object is instantiated in order to be able to call this function many times without it breaking

        // Increase date by 1 day each frame
        updateDate(1);

        // Gets Mercury Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,0);Elements.xMercury = Elements.orbitalElements[0];Elements.yMercury = Elements.orbitalElements[1];
        // Gets Venus Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,1);Elements.xVenus = Elements.orbitalElements[0];Elements.yVenus = Elements.orbitalElements[1];
        // Gets Earth Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,2);Elements.xEarth = Elements.orbitalElements[0];Elements.yEarth = Elements.orbitalElements[1];
        // Gets Mars Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,3);Elements.xMars = Elements.orbitalElements[0];Elements.yMars = Elements.orbitalElements[1];
        // Gets Jupiter Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,4);Elements.xJupiter = Elements.orbitalElements[0];Elements.yJupiter = Elements.orbitalElements[1];
        // Gets Saturn Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,5);Elements.xSaturn = Elements.orbitalElements[0];Elements.ySaturn = Elements.orbitalElements[1];
        // Gets Uranus Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,6);Elements.xUranus = Elements.orbitalElements[0];Elements.yUranus = Elements.orbitalElements[1];
        // Gets Neptune Heliocentric Ecliptic Coordinates
        Elements.orbitalElements = plotPlanet(Elements.T,7);Elements.xNeptune = Elements.orbitalElements[0];Elements.yNeptune = Elements.orbitalElements[1];
    }

    // this is required so that the browser animates
    requestAnimationFrame(renderForeground);

    // Loops as fast as possible (required so that the animation doesn't break)
    setTimeout(run,0);
}

// Draws the static elements to the screen
function renderBackground() {
    // Sets the background color of the canvas
    Elements.contextbackground.fillStyle='#090909';
    Elements.contextbackground.fillRect(0,0, Elements.width, Elements.height); // It repaints the background to "clear" the screen

    // Makes the sun
    Elements.contextbackground.beginPath();
    Elements.contextbackground.arc(Elements.width/2, Elements.height/2, 10, 0, 2*Math.PI, true);
    Elements.contextbackground.fillStyle = 'yellow';
    Elements.contextbackground.fill();
    Elements.contextbackground.closePath();
}

// used to label the planets
function planetText(name, x, y) {
    Elements.context_foreground.font = "15pt Times New Roman";
    Elements.context_foreground.fillStyle = "pink";
    Elements.context_foreground.textAlign = "center";
    Elements.context_foreground.fillText(name, x, y);
}

// makes all the moving parts in the animation
function renderForeground(){
    //C lear the canvas (otherwise there will be "ghosting" on foreground layer)
    Elements.context_foreground.clearRect(0, 0, Elements.width, Elements.height);

    // Render planet Mercury
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xMercury * Elements.scale), (Elements.height / 2) - (Elements.yMercury * Elements.scale), (3 + (0.5 * (4879/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'Chocolate';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("M", (Elements.width / 2) + (Elements.xMercury * Elements.scale), (Elements.height / 2) - (Elements.yMercury * Elements.scale));

    // Render planet Venus
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xVenus * Elements.scale), (Elements.height / 2)-(Elements.yVenus * Elements.scale),( 3 + (0.5 *(12104/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'BurlyWood';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("V", (Elements.width / 2) + (Elements.xVenus * Elements.scale), (Elements.height / 2)-(Elements.yVenus * Elements.scale));
    // Render planet Earth
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xEarth*Elements.scale), (Elements.height/2)-(Elements.yEarth*Elements.scale),  (3+(0.5*(12756/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'SteelBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("E", (Elements.width/2)+(Elements.xEarth*Elements.scale), (Elements.height/2)-(Elements.yEarth*Elements.scale));
    // Render planet Mars
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xMars*Elements.scale), (Elements.height/2)-(Elements.yMars*Elements.scale), (3+(0.5*(6792/10000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'red';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("Ma", (Elements.width/2)+(Elements.xMars*Elements.scale), (Elements.height/2)-(Elements.yMars*Elements.scale));

    // Render planet Jupiter
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width/2)+(Elements.xJupiter*Elements.scale/Elements.jupiterScaleDivider), (Elements.height/2)-(Elements.yJupiter*Elements.scale/Elements.jupiterScaleDivider), (4+(0.5*(142984/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'Peru';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("J", (Elements.width/2) + (Elements.xJupiter*Elements.scale/Elements.jupiterScaleDivider), (Elements.height/2) - (Elements.yJupiter*Elements.scale/Elements.jupiterScaleDivider));
    // Render planet Saturn
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xSaturn * Elements.scale / Elements.saturnScaleDivider), (Elements.height/2) - (Elements.ySaturn*Elements.scale / Elements.saturnScaleDivider), (4+(0.5*(120536/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'AliceBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("S", (Elements.width / 2) + (Elements.xSaturn * Elements.scale / Elements.saturnScaleDivider), (Elements.height / 2) - (Elements.ySaturn * Elements.scale / Elements.saturnScaleDivider));
    // Render planet Uranus
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xUranus * Elements.scale / Elements.uranusScaleDivider), (Elements.height / 2) - (Elements.yUranus * Elements.scale / Elements.uranusScaleDivider), (4+(0.5*(51118/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'LightSkyBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("U", (Elements.width / 2) + (Elements.xUranus * Elements.scale / Elements.uranusScaleDivider), (Elements.height / 2) - (Elements.yUranus * Elements.scale / Elements.uranusScaleDivider));
    // Render planet Neptune
    Elements.context_foreground.beginPath();
    Elements.context_foreground.arc((Elements.width / 2) + (Elements.xNeptune * Elements.scale / Elements.neptuneScaleDivider), (Elements.height / 2) - (Elements.yNeptune * Elements.scale / Elements.neptuneScaleDivider), (4+(0.5*(49528/13000))), 0, 2*Math.PI, true);
    Elements.context_foreground.fillStyle = 'MidnightBlue';
    Elements.context_foreground.fill();
    Elements.context_foreground.closePath();
    planetText("N", (Elements.width / 2) + (Elements.xNeptune * Elements.scale / Elements.neptuneScaleDivider), (Elements.height / 2) - (Elements.yNeptune * Elements.scale / Elements.neptuneScaleDivider));

    // Render Gregorian Date for Today
    Elements.context_foreground.font = "20px Times New Roman";
    Elements.context_foreground.textAlign = "left";
    Elements.context_foreground.fillStyle = "dimgrey";
    Elements.context_foreground.fillText("Date = "+Elements.YEAR+"."+Elements.MONTH+"."+Elements.DAY,10,340);
}

// Used for calculations because a lot of the formulas require the julian calendar date and not the gregorian which is what we use
function getJulianDate(Year, Month, Day) {
    let inputDate = new Date(Year, Month, Math.floor(Day)); // makes the date object so that calculations are easier
    let switchDate = new Date(1582, 10, 15); // The date when the world switched between the julian calendar to the gregorian, needed because 10 days are missing

    let isGregorianDate = inputDate >= switchDate; // checks if the date is indeed gregorian

    // Adjust if JAN or FEB
    if(Month === 1||Month === 2){
        Year = Year - 1;
        Month = Month + 12;
    }

    // Calculate A & B; ONLY if date is equal or after 1582-Oct-15
    let A = Math.floor(Year / 100);
    let B = 2 - A + Math.floor(A / 4);

    // Ignore B if date is before 1582-Oct-15
    if (!isGregorianDate) {B = 0;}

    return ((Math.floor(365.25 * Year)) + (Math.floor(30.6001*(Month + 1))) + Day + 1720994.5 + B); // Formula to convert between the dates
}

function updateDate(increment){
    Elements.newDate = new Date(Elements.current.getFullYear(), Elements.current.getMonth(), Elements.current.getDate() + increment); //Set to today +1 day

    // changes the current time
    Elements.current = Elements.newDate;
    let newDay = Elements.newDate.getDate();
    let newMonth = Elements.newDate.getMonth() + 1; //January is 0!
    Elements.YEAR = Elements.newDate.getFullYear();
    Elements.MONTH = newMonth;
    Elements.DAY = newDay;
    Elements.julianDate = getJulianDate(Elements.YEAR,Elements.MONTH,Elements.DAY);
    Elements.T = (Elements.julianDate - Elements.julianEpochJ2000) / Elements.julianCenturyInJulianDays;
}

// some functions use degrees, but javascript trig functions need radians, this converts them
function radians(deg) {
    return deg * (Math.PI / 180);
}

function plotPlanet(TGen, planetNumber) { // TGen == the time in julian centuries
    // Calculates the AU (Astronomical Unit), it is needed because it is the orbit size, this value is constant
    let aGen = Elements.planetElements[planetNumber][0] + (Elements.planetRates[planetNumber][0] * TGen);

    // The eccentricity of the ellipse that makes the orbit, this is also constant
    let eGen = Elements.planetElements[planetNumber][1] + (Elements.planetRates[planetNumber][1] * TGen);

    // the inclination of the orbit because all orbits are tilted slightly, this is also constant
    let iGen = Elements.planetElements[planetNumber][2] + (Elements.planetRates[planetNumber][2] * TGen);
    iGen = iGen % 360;

    // Longitude of the ascending node of the orbit. Required for the formula for the coordinates. Learn more here: https://en.wikipedia.org/wiki/Longitude_of_the_ascending_node
    let WGen = Elements.planetElements[planetNumber][5] + (Elements.planetRates[planetNumber][5] * TGen);
    WGen = WGen % 360; // makes sure that the angle is between 0 and 360

    // longitude of the perihelion of the orbit, also required for the formula, learn more here: https://en.wikipedia.org/wiki/Longitude_of_the_periapsis
    let wGen = Elements.planetElements[planetNumber][4] + (Elements.planetRates[planetNumber][4] * TGen);
    wGen = wGen % 360; // Makes sure that the angle is between 0 and 360
    if (wGen < 0) {wGen = 360 + wGen;} // Makes sure that the angle is between 0 and 360

    // MEAN LONGITUDE, changes over time
    let LGen = Elements.planetElements[planetNumber][3] + (Elements.planetRates[planetNumber][3] * TGen);
    LGen = LGen % 360;
    if (LGen < 0) {LGen = 360 + LGen;}

    // MEAN ANOMALY --> Use this to determine Perihelion (0 degrees = Perihelion of planet)
    let MGen = LGen - (wGen);
    if(MGen < 0) {MGen = 360 + MGen;}

    // the eccentric anomaly
    let EGen = eccentricAnomaly(eGen,MGen,6);

    // ARGUMENT OF TRUE ANOMALY
    let trueAnomalyArgGen = (Math.sqrt((1+eGen) / (1-eGen))) * (Math.tan(radians(EGen) / 2));

    // TRUE ANOMALY, also dynamic
    let K = Math.PI/180.0; // Radian converter variable
    let nGen;
    if (trueAnomalyArgGen < 0) {
        nGen = 2 * (Math.atan(trueAnomalyArgGen)/ K + 180);
    }
    else {
        nGen = 2 * (Math.atan(trueAnomalyArgGen)/K)
    }

    //CALCULATE RADIUS VECTOR
    let rGen = aGen * (1 - (eGen * (Math.cos(radians(EGen)))));

    // Used to determine Heliocentric Ecliptic Coordinates
    let xGen = rGen * (Math.cos(radians(WGen)) * Math.cos(radians(nGen + wGen - WGen)) - Math.sin(radians(WGen)) * Math.sin(radians(nGen + wGen - WGen)) * Math.cos(radians(iGen)));
    let yGen = rGen * (Math.sin(radians(WGen)) * Math.cos(radians(nGen + wGen - WGen)) + Math.cos(radians(WGen)) * Math.sin(radians(nGen + wGen - WGen)) * Math.cos(radians(iGen)));

    return [xGen, yGen]; // returns the coordinates
}

// This function calculates the eccentric anomaly which is used to calculate the position of the planet on its orbit
// it returns an angle which is used in the plotPlanets function to calculate the x and y coordinates
// go here to learn more: https://www.johndcook.com/blog/2022/10/22/orbital-anomalies/
function eccentricAnomaly(ec,m,dp) {
    // arguments:
    // ec = eccentricity, m = mean anomaly,
    // dp = number of decimal places

    let pi = Math.PI, K = pi / 180.0; // defines pi and one degree (K)
    let maxIter = 30, i = 0; // max iter is set to limit the number of iterations for the calculation of E
    let delta = Math.pow(10, -dp);
    let E, F; // E means the eccentric anomaly and F is the true anomaly

    // all part of a weird formula
    m = m / 360.0;
    m = 2.0 * pi * (m - Math.floor(m));

    if (ec < 0.8) E = m; else E = pi;

    F = E - ec * Math.sin(m) - m;

    // iterates until the approximation of the eccentric anomaly is good
    while ((Math.abs(F) > delta) && (i < maxIter)) {
        E = E - F / (1.0-ec*Math.cos(E));
        F = E - ec * Math.sin(E) - m;
        i = i + 1;
    }
    E /= K; // divides by K to get degrees
    return Math.round(E * Math.pow(10, dp)) / Math.pow(10, dp); // more weird formula
}
