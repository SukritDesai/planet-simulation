/*
* Name: Sukrit and Kevin
* Date: Dec 19 - 23 2022
* Teacher: Mr Gugoiu
* IDE: IntelliJ IDEA
* Description: The necessary functions to determine the positions of a celestial body*/

const year_length = 365.256898326;

// Helpers
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function rad2deg(rad) {
    return rad * (Math.PI / 180);
}

function rev(x) {
    return x - Math.floor(x / 360) * 360;
}

function perihelion_distance(a, e) {
    return a * (1 - e);
}

function aphelion_distance(a, e) {
    return a * (1 + e);
}

function orbital_period(a, m) {
    return this.year_length * a ** 1.5 / Math.sqrt(1 + m);
}

function daily_motion(P) {
    return 360 / P;
}

function days(y, m, D) {
    return 367 * y - 7 * (y + (m+9) /12 ) / 4 - 3 * ((y + (m-9)/7 ) / 100 + 1) / 4 + 275 * m/9 + D - 730515
}

function ptime() {

}

function mean_anomaly(t, T, P) {
    return (t - T) * 360 / P;
}

function mean_longitude(M, w, N) {
    return M + w + N;
}

function ecc_anomaly() {

}

function true_anomaly() {

}

function hel_distance() {

}
