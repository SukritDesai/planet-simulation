/*
* Name: Sukrit and Kevin
* Date: Dec 19 - 23 2022
* Teacher: Mr Gugoiu
* IDE: IntelliJ IDEA
* Description: The necessary functions to determine the positions of a celestial body*/

// Helpers

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function rad2deg(rad) {
    return rad * (Math.PI / 180);
}

class Body {
    year_length = 365.256898326;

    perihelion_distance(a, e) {
        return a * (1 - e);
    }

    aphelion_distance(a, e) {
        return a * (1 + e);
    }

    orbital_period(a, m) {
        return this.year_length * a ** 1.5 / Math.sqrt(1 + m);
    }

    daily_motion(P) {
        return 360 / P;
    }

    days() {

    }

    ptime() {

    }

    mean_anomaly(t, T, P) {
        return (t - T) * 360 / P;
    }

    mean_longitude(M, w, N) {
        return M + w + N;
    }

    ecc_anomaly() {

    }

    true_anomaly() {

    }

    hel_distance() {

    }
}
