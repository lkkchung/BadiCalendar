// Badí' (Bahá'í) Calendar Date Calculation
// Based on official data from the Bahá'í World Centre (years 172-221 B.E.)

// Naw-Rúz lookup table: Bahá'í year → { gregorian month, day, ayyamIHaDays }
// Data source: Her Majesty's Nautical Almanac Office, UK
const NAW_RUZ_DATA = {
    172: { month: 3, day: 21, ayyamIHaDays: 4 },
    173: { month: 3, day: 20, ayyamIHaDays: 4 },
    174: { month: 3, day: 20, ayyamIHaDays: 5 },
    175: { month: 3, day: 21, ayyamIHaDays: 4 },
    176: { month: 3, day: 21, ayyamIHaDays: 4 },
    177: { month: 3, day: 20, ayyamIHaDays: 4 },
    178: { month: 3, day: 20, ayyamIHaDays: 5 },
    179: { month: 3, day: 21, ayyamIHaDays: 4 },
    180: { month: 3, day: 21, ayyamIHaDays: 4 },
    181: { month: 3, day: 20, ayyamIHaDays: 4 },
    182: { month: 3, day: 20, ayyamIHaDays: 5 },
    183: { month: 3, day: 21, ayyamIHaDays: 4 },
    184: { month: 3, day: 21, ayyamIHaDays: 4 },
    185: { month: 3, day: 20, ayyamIHaDays: 4 },
    186: { month: 3, day: 20, ayyamIHaDays: 4 },
    187: { month: 3, day: 20, ayyamIHaDays: 5 },
    188: { month: 3, day: 21, ayyamIHaDays: 4 },
    189: { month: 3, day: 20, ayyamIHaDays: 4 },
    190: { month: 3, day: 20, ayyamIHaDays: 4 },
    191: { month: 3, day: 20, ayyamIHaDays: 5 },
    192: { month: 3, day: 21, ayyamIHaDays: 4 },
    193: { month: 3, day: 20, ayyamIHaDays: 4 },
    194: { month: 3, day: 20, ayyamIHaDays: 4 },
    195: { month: 3, day: 20, ayyamIHaDays: 5 },
    196: { month: 3, day: 21, ayyamIHaDays: 4 },
    197: { month: 3, day: 20, ayyamIHaDays: 4 },
    198: { month: 3, day: 20, ayyamIHaDays: 4 },
    199: { month: 3, day: 20, ayyamIHaDays: 5 },
    200: { month: 3, day: 21, ayyamIHaDays: 4 },
    201: { month: 3, day: 20, ayyamIHaDays: 4 },
    202: { month: 3, day: 20, ayyamIHaDays: 4 },
    203: { month: 3, day: 20, ayyamIHaDays: 5 },
    204: { month: 3, day: 21, ayyamIHaDays: 4 },
    205: { month: 3, day: 20, ayyamIHaDays: 4 },
    206: { month: 3, day: 20, ayyamIHaDays: 4 },
    207: { month: 3, day: 20, ayyamIHaDays: 5 },
    208: { month: 3, day: 21, ayyamIHaDays: 4 },
    209: { month: 3, day: 20, ayyamIHaDays: 4 },
    210: { month: 3, day: 20, ayyamIHaDays: 4 },
    211: { month: 3, day: 20, ayyamIHaDays: 5 },
    212: { month: 3, day: 21, ayyamIHaDays: 4 },
    213: { month: 3, day: 20, ayyamIHaDays: 4 },
    214: { month: 3, day: 20, ayyamIHaDays: 4 },
    215: { month: 3, day: 20, ayyamIHaDays: 4 },
    216: { month: 3, day: 20, ayyamIHaDays: 5 },
    217: { month: 3, day: 20, ayyamIHaDays: 4 },
    218: { month: 3, day: 20, ayyamIHaDays: 4 },
    219: { month: 3, day: 20, ayyamIHaDays: 4 },
    220: { month: 3, day: 20, ayyamIHaDays: 5 },
    221: { month: 3, day: 20, ayyamIHaDays: 4 },
};

// 19 months of the Bahá'í calendar
const MONTHS = [
    { arabic: "Bahá", english: "Splendour" },
    { arabic: "Jalál", english: "Glory" },
    { arabic: "Jamál", english: "Beauty" },
    { arabic: "`Aẓamat", english: "Grandeur" },
    { arabic: "Núr", english: "Light" },
    { arabic: "Raḥmat", english: "Mercy" },
    { arabic: "Kalimát", english: "Words" },
    { arabic: "Kamál", english: "Perfection" },
    { arabic: "Asmá'", english: "Names" },
    { arabic: "`Izzat", english: "Might" },
    { arabic: "Mashíyyat", english: "Will" },
    { arabic: "`Ilm", english: "Knowledge" },
    { arabic: "Qudrat", english: "Power" },
    { arabic: "Qawl", english: "Speech" },
    { arabic: "Masá'il", english: "Questions" },
    { arabic: "Sharaf", english: "Honour" },
    { arabic: "Sulṭán", english: "Sovereignty" },
    { arabic: "Mulk", english: "Dominion" },
    { arabic: "`Alá'", english: "Loftiness" },
];

// Ayyám-i-Há (Intercalary Days)
const AYYAM_I_HA = { arabic: 'Ayyám-i-Há', english: 'Intercalary Days' };

// 7 weekdays (week starts Saturday)
const WEEKDAYS = [
    { arabic: "Jalál", english: "Glory" },       // Saturday
    { arabic: "Jamál", english: "Beauty" },      // Sunday
    { arabic: "Kamál", english: "Perfection" },  // Monday
    { arabic: "Fiḍál", english: "Grace" },       // Tuesday
    { arabic: "`Idál", english: "Justice" },     // Wednesday
    { arabic: "Istijlál", english: "Majesty" },  // Thursday
    { arabic: "Istiqlál", english: "Independence" }, // Friday
];

/**
 * Get the Gregorian date of Naw-Rúz for a given Bahá'í year
 * @param {number} badiYear - Bahá'í year (B.E.)
 * @returns {Date} - Gregorian date of Naw-Rúz
 */
function getNawRuzDate(badiYear) {
    const data = NAW_RUZ_DATA[badiYear];
    if (data) {
        // Naw-Rúz falls in the Gregorian year that is badiYear + 1843
        // (Year 1 B.E. = 1844, so year 172 = 2015, etc.)
        const gregorianYear = badiYear + 1843;
        return new Date(gregorianYear, data.month - 1, data.day);
    }
    // Fallback for years outside lookup table: estimate March 20/21
    const gregorianYear = badiYear + 1843;
    return new Date(gregorianYear, 2, 20); // Default to March 20
}

/**
 * Get the number of Ayyám-i-Há days for a given Bahá'í year
 * @param {number} badiYear - Bahá'í year (B.E.)
 * @returns {number} - Number of intercalary days (4 or 5)
 */
function getAyyamIHaDays(badiYear) {
    const data = NAW_RUZ_DATA[badiYear];
    if (data) {
        return data.ayyamIHaDays;
    }
    // Fallback: use Gregorian leap year as approximation
    const gregorianYear = badiYear + 1843;
    const isLeap = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
    return isLeap ? 5 : 4;
}

/**
 * Find the Bahá'í year for a given Gregorian date
 * @param {Date} date - Gregorian date
 * @returns {number} - Bahá'í year (B.E.)
 */
function findBadiYear(date) {
    // Estimate the Bahá'í year
    const gregorianYear = date.getFullYear();
    let badiYear = gregorianYear - 1843;

    // Check if we're before Naw-Rúz of this estimated year
    const nawRuz = getNawRuzDate(badiYear);
    if (date < nawRuz) {
        badiYear--;
    }

    return badiYear;
}

/**
 * Calculate days between two dates (ignoring time)
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number} - Number of days (date2 - date1)
 */
function daysBetween(date1, date2) {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = d2 - d1;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Convert a Gregorian date to Bahá'í date
 * @param {Date} gregorianDate - The Gregorian date to convert
 * @returns {Object} - Bahá'í date object
 */
function gregorianToBadi(gregorianDate) {
    const badiYear = findBadiYear(gregorianDate);
    const nawRuz = getNawRuzDate(badiYear);
    const dayOfYear = daysBetween(nawRuz, gregorianDate); // 0-indexed (Naw-Rúz = day 0)

    const ayyamIHaDays = getAyyamIHaDays(badiYear);

    // Days in first 18 months: 18 * 19 = 342
    // Then Ayyám-i-Há: 4 or 5 days
    // Then month 19 ('Alá'): 19 days
    // Total: 342 + 4/5 + 19 = 365/366

    let month, day;
    let isAyyamIHa = false;

    if (dayOfYear < 342) {
        // First 18 months (months 1-18)
        month = Math.floor(dayOfYear / 19) + 1;
        day = (dayOfYear % 19) + 1;
    } else if (dayOfYear < 342 + ayyamIHaDays) {
        // Ayyám-i-Há
        isAyyamIHa = true;
        month = 0; // Special indicator for Ayyám-i-Há
        day = dayOfYear - 342 + 1;
    } else {
        // Month 19 ('Alá')
        month = 19;
        day = dayOfYear - 342 - ayyamIHaDays + 1;
    }

    // Calculate weekday (Saturday = 0)
    // JavaScript: Sunday = 0, so we need to adjust
    const jsWeekday = gregorianDate.getDay();
    const badiWeekday = jsWeekday === 0 ? 1 : (jsWeekday === 6 ? 0 : jsWeekday + 1);

    return {
        year: badiYear,
        month: month,
        day: day,
        weekday: badiWeekday,
        isAyyamIHa: isAyyamIHa,
        monthName: isAyyamIHa ? AYYAM_I_HA : MONTHS[month - 1],
        weekdayName: WEEKDAYS[badiWeekday],
    };
}

/**
 * Format a Bahá'í date as a string
 * @param {Object} badiDate - Bahá'í date object from gregorianToBadi()
 * @param {string} format - 'full', 'short', or 'arabic'
 * @returns {string} - Formatted date string
 */
function formatBadiDate(badiDate, format = 'full') {
    const { year, day, isAyyamIHa, monthName, weekdayName } = badiDate;

    if (format === 'arabic') {
        if (isAyyamIHa) {
            return `${weekdayName.arabic}, ${day} ${monthName.arabic} ${year} B.E.`;
        }
        return `${weekdayName.arabic}, ${day} ${monthName.arabic} ${year} B.E.`;
    }

    if (format === 'short') {
        if (isAyyamIHa) {
            return `${day} Ayyám-i-Há ${year}`;
        }
        return `${day} ${monthName.arabic} ${year}`;
    }

    // Full format
    if (isAyyamIHa) {
        return `${weekdayName.arabic} (${weekdayName.english}), ${day} ${monthName.arabic} (${monthName.english}), ${year} B.E.`;
    }
    return `${weekdayName.arabic} (${weekdayName.english}), ${day} ${monthName.arabic} (${monthName.english}), ${year} B.E.`;
}

/**
 * Get the current Bahá'í date
 * @returns {Object} - Current Bahá'í date object
 */
function getCurrentBadiDate() {
    return gregorianToBadi(new Date());
}

// Export functions and data
export {
    MONTHS,
    WEEKDAYS,
    AYYAM_I_HA,
    NAW_RUZ_DATA,
    gregorianToBadi,
    formatBadiDate,
    getCurrentBadiDate,
    getNawRuzDate,
    getAyyamIHaDays,
    findBadiYear,
};
