// Sunset/Sunrise Calculation Module
// Based on NOAA Solar Calculator algorithms
// https://gml.noaa.gov/grad/solcalc/calcdetails.html

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calculate Julian Day from a Date object
 * @param {Date} date
 * @returns {number} Julian Day
 */
function toJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
           - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * Calculate Julian Century from Julian Day
 * @param {number} jd - Julian Day
 * @returns {number} Julian Century
 */
function toJulianCentury(jd) {
    return (jd - 2451545) / 36525;
}

/**
 * Calculate geometric mean longitude of the sun (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunGeomMeanLon(t) {
    let lon = 280.46646 + t * (36000.76983 + 0.0003032 * t);
    while (lon > 360) lon -= 360;
    while (lon < 0) lon += 360;
    return lon;
}

/**
 * Calculate geometric mean anomaly of the sun (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunGeomMeanAnomaly(t) {
    return 357.52911 + t * (35999.05029 - 0.0001537 * t);
}

/**
 * Calculate eccentricity of Earth's orbit
 * @param {number} t - Julian Century
 * @returns {number}
 */
function earthOrbitEccentricity(t) {
    return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

/**
 * Calculate sun equation of center (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunEqOfCenter(t) {
    const m = sunGeomMeanAnomaly(t);
    const mRad = m * DEG_TO_RAD;
    const sinm = Math.sin(mRad);
    const sin2m = Math.sin(2 * mRad);
    const sin3m = Math.sin(3 * mRad);
    return sinm * (1.914602 - t * (0.004817 + 0.000014 * t))
           + sin2m * (0.019993 - 0.000101 * t)
           + sin3m * 0.000289;
}

/**
 * Calculate sun true longitude (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunTrueLon(t) {
    return sunGeomMeanLon(t) + sunEqOfCenter(t);
}

/**
 * Calculate sun apparent longitude (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunApparentLon(t) {
    const o = sunTrueLon(t);
    const omega = 125.04 - 1934.136 * t;
    return o - 0.00569 - 0.00478 * Math.sin(omega * DEG_TO_RAD);
}

/**
 * Calculate mean obliquity of the ecliptic (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function meanObliquityOfEcliptic(t) {
    const seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813));
    return 23 + (26 + seconds / 60) / 60;
}

/**
 * Calculate corrected obliquity of the ecliptic (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function obliquityCorrection(t) {
    const e0 = meanObliquityOfEcliptic(t);
    const omega = 125.04 - 1934.136 * t;
    return e0 + 0.00256 * Math.cos(omega * DEG_TO_RAD);
}

/**
 * Calculate sun declination (degrees)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function sunDeclination(t) {
    const e = obliquityCorrection(t);
    const lambda = sunApparentLon(t);
    const sint = Math.sin(e * DEG_TO_RAD) * Math.sin(lambda * DEG_TO_RAD);
    return Math.asin(sint) * RAD_TO_DEG;
}

/**
 * Calculate equation of time (minutes)
 * @param {number} t - Julian Century
 * @returns {number}
 */
function equationOfTime(t) {
    const epsilon = obliquityCorrection(t);
    const l0 = sunGeomMeanLon(t);
    const e = earthOrbitEccentricity(t);
    const m = sunGeomMeanAnomaly(t);

    let y = Math.tan((epsilon / 2) * DEG_TO_RAD);
    y = y * y;

    const sin2l0 = Math.sin(2 * l0 * DEG_TO_RAD);
    const sinm = Math.sin(m * DEG_TO_RAD);
    const cos2l0 = Math.cos(2 * l0 * DEG_TO_RAD);
    const sin4l0 = Math.sin(4 * l0 * DEG_TO_RAD);
    const sin2m = Math.sin(2 * m * DEG_TO_RAD);

    const eqTime = y * sin2l0 - 2 * e * sinm + 4 * e * y * sinm * cos2l0
                   - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;

    return 4 * eqTime * RAD_TO_DEG;
}

/**
 * Calculate hour angle for sunrise/sunset (degrees)
 * @param {number} lat - Latitude in degrees
 * @param {number} solarDec - Solar declination in degrees
 * @param {number} zenith - Solar zenith angle (90.833 for standard sunrise/sunset)
 * @returns {number|null} Hour angle in degrees, or null if no sunrise/sunset
 */
function hourAngleSunrise(lat, solarDec, zenith = 90.833) {
    const latRad = lat * DEG_TO_RAD;
    const decRad = solarDec * DEG_TO_RAD;

    const cosHA = (Math.cos(zenith * DEG_TO_RAD) / (Math.cos(latRad) * Math.cos(decRad)))
                  - Math.tan(latRad) * Math.tan(decRad);

    // Check if sun never rises or never sets
    if (cosHA > 1 || cosHA < -1) {
        return null;
    }

    return Math.acos(cosHA) * RAD_TO_DEG;
}

/**
 * Calculate solar noon in UTC minutes for a given date and longitude
 * @param {number} longitude - Longitude in degrees (positive = East)
 * @param {number} eqTime - Equation of time in minutes
 * @returns {number} Solar noon in UTC minutes from midnight
 */
function solarNoonUTC(longitude, eqTime) {
    return 720 - 4 * longitude - eqTime;
}

/**
 * Calculate sunset time for a given date and location
 * @param {Date} date - The date to calculate sunset for
 * @param {number} latitude - Latitude in degrees (positive = North)
 * @param {number} longitude - Longitude in degrees (positive = East)
 * @returns {Date|null} Sunset time as Date object, or null if no sunset
 */
function getSunset(date, latitude, longitude) {
    const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    const jd = toJulianDay(noon);
    const t = toJulianCentury(jd);

    const eqTime = equationOfTime(t);
    const solarDec = sunDeclination(t);
    const hourAngle = hourAngleSunrise(latitude, solarDec);

    if (hourAngle === null) {
        return null; // No sunset (polar day/night)
    }

    // Solar noon + hour angle (in minutes) = sunset
    const noonUTC = solarNoonUTC(longitude, eqTime);
    const sunsetUTC = noonUTC + hourAngle * 4;

    const sunsetDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0
    ));
    sunsetDate.setUTCMinutes(sunsetUTC);

    return sunsetDate;
}

/**
 * Calculate sunrise time for a given date and location
 * @param {Date} date - The date to calculate sunrise for
 * @param {number} latitude - Latitude in degrees (positive = North)
 * @param {number} longitude - Longitude in degrees (positive = East)
 * @returns {Date|null} Sunrise time as Date object, or null if no sunrise
 */
function getSunrise(date, latitude, longitude) {
    const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    const jd = toJulianDay(noon);
    const t = toJulianCentury(jd);

    const eqTime = equationOfTime(t);
    const solarDec = sunDeclination(t);
    const hourAngle = hourAngleSunrise(latitude, solarDec);

    if (hourAngle === null) {
        return null; // No sunrise (polar day/night)
    }

    // Solar noon - hour angle (in minutes) = sunrise
    const noonUTC = solarNoonUTC(longitude, eqTime);
    const sunriseUTC = noonUTC - hourAngle * 4;

    const sunriseDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0
    ));
    sunriseDate.setUTCMinutes(sunriseUTC);

    return sunriseDate;
}

/**
 * Get the next sunset from the current time
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @param {Date} [fromDate] - Starting date/time (defaults to now)
 * @returns {Date|null} Next sunset time
 */
function getNextSunset(latitude, longitude, fromDate = new Date()) {
    // Try today's sunset
    let sunset = getSunset(fromDate, latitude, longitude);

    if (sunset && sunset > fromDate) {
        return sunset;
    }

    // Today's sunset has passed, get tomorrow's
    const tomorrow = new Date(fromDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getSunset(tomorrow, latitude, longitude);
}

/**
 * Format time as HH:MM
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
    if (!date) return '--:--';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Calculate time remaining until a target time
 * @param {Date} target - Target time
 * @param {Date} [from] - Starting time (defaults to now)
 * @returns {Object} { hours, minutes, seconds, totalSeconds }
 */
function getTimeRemaining(target, from = new Date()) {
    const diff = target - from;

    if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
}

export {
    getSunset,
    getSunrise,
    getNextSunset,
    formatTime,
    getTimeRemaining
};
