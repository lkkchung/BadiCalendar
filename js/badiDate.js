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

// Twin Holy Birthdays lookup table: Bahá'í year → { babMonth, babDay, bahMonth, bahDay }
// Birth of the Báb (first day) and Birth of Bahá'u'lláh (second day)
// Data source: Bahá'í World Centre 50-year calendar (years 172-221 B.E.)
const TWIN_BIRTHDAYS = {
    172: { babMonth: 13, babDay: 10, bahMonth: 13, bahDay: 11 },
    173: { babMonth: 12, babDay: 18, bahMonth: 12, bahDay: 19 },
    174: { babMonth: 12, babDay: 7,  bahMonth: 12, bahDay: 8 },
    175: { babMonth: 13, babDay: 6,  bahMonth: 13, bahDay: 7 },
    176: { babMonth: 12, babDay: 14, bahMonth: 12, bahDay: 15 },
    177: { babMonth: 12, babDay: 4,  bahMonth: 12, bahDay: 5 },
    178: { babMonth: 13, babDay: 4,  bahMonth: 13, bahDay: 5 },
    179: { babMonth: 12, babDay: 11, bahMonth: 12, bahDay: 12 },
    180: { babMonth: 12, babDay: 1,  bahMonth: 12, bahDay: 2 },
    181: { babMonth: 12, babDay: 19, bahMonth: 13, bahDay: 1 },
    182: { babMonth: 12, babDay: 8,  bahMonth: 12, bahDay: 9 },
    183: { babMonth: 13, babDay: 7,  bahMonth: 13, bahDay: 8 },
    184: { babMonth: 12, babDay: 15, bahMonth: 12, bahDay: 16 },
    185: { babMonth: 12, babDay: 5,  bahMonth: 12, bahDay: 6 },
    186: { babMonth: 13, babDay: 5,  bahMonth: 13, bahDay: 6 },
    187: { babMonth: 12, babDay: 14, bahMonth: 12, bahDay: 15 },
    188: { babMonth: 12, babDay: 2,  bahMonth: 12, bahDay: 3 },
    189: { babMonth: 13, babDay: 2,  bahMonth: 13, bahDay: 3 },
    190: { babMonth: 12, babDay: 10, bahMonth: 12, bahDay: 11 },
    191: { babMonth: 13, babDay: 10, bahMonth: 13, bahDay: 11 },
    192: { babMonth: 12, babDay: 17, bahMonth: 12, bahDay: 18 },
    193: { babMonth: 12, babDay: 6,  bahMonth: 12, bahDay: 7 },
    194: { babMonth: 13, babDay: 6,  bahMonth: 13, bahDay: 7 },
    195: { babMonth: 12, babDay: 15, bahMonth: 12, bahDay: 16 },
    196: { babMonth: 12, babDay: 4,  bahMonth: 12, bahDay: 5 },
    197: { babMonth: 13, babDay: 4,  bahMonth: 13, bahDay: 5 },
    198: { babMonth: 12, babDay: 12, bahMonth: 12, bahDay: 13 },
    199: { babMonth: 12, babDay: 1,  bahMonth: 12, bahDay: 2 },
    200: { babMonth: 12, babDay: 19, bahMonth: 13, bahDay: 1 },
    201: { babMonth: 12, babDay: 8,  bahMonth: 12, bahDay: 9 },
    202: { babMonth: 13, babDay: 8,  bahMonth: 13, bahDay: 9 },
    203: { babMonth: 12, babDay: 16, bahMonth: 12, bahDay: 17 },
    204: { babMonth: 12, babDay: 5,  bahMonth: 12, bahDay: 6 },
    205: { babMonth: 13, babDay: 5,  bahMonth: 13, bahDay: 6 },
    206: { babMonth: 12, babDay: 14, bahMonth: 12, bahDay: 15 },
    207: { babMonth: 12, babDay: 3,  bahMonth: 12, bahDay: 4 },
    208: { babMonth: 13, babDay: 2,  bahMonth: 13, bahDay: 3 },
    209: { babMonth: 12, babDay: 10, bahMonth: 12, bahDay: 11 },
    210: { babMonth: 13, babDay: 9,  bahMonth: 13, bahDay: 10 },
    211: { babMonth: 12, babDay: 18, bahMonth: 12, bahDay: 19 },
    212: { babMonth: 12, babDay: 6,  bahMonth: 12, bahDay: 7 },
    213: { babMonth: 13, babDay: 6,  bahMonth: 13, bahDay: 7 },
    214: { babMonth: 12, babDay: 15, bahMonth: 12, bahDay: 16 },
    215: { babMonth: 12, babDay: 4,  bahMonth: 12, bahDay: 5 },
    216: { babMonth: 13, babDay: 4,  bahMonth: 13, bahDay: 5 },
    217: { babMonth: 12, babDay: 11, bahMonth: 12, bahDay: 12 },
    218: { babMonth: 11, babDay: 19, bahMonth: 12, bahDay: 1 },
    219: { babMonth: 12, babDay: 19, bahMonth: 13, bahDay: 1 },
    220: { babMonth: 12, babDay: 9,  bahMonth: 12, bahDay: 10 },
    221: { babMonth: 13, babDay: 8,  bahMonth: 13, bahDay: 9 },
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

// Bahá'í Holy Days
// Format: { month: 1-19 (or 0 for Ayyám-i-Há), day: 1-19, ...names and type }
const HOLY_DAYS = [
    // Work-suspended holy days (9 days)
    {
        month: 1,
        day: 1,
        english: "Naw-Rúz",
        arabic: "نوروز",
        description: "Bahá'í New Year",
        workSuspended: true
    },
    {
        month: 2,
        day: 13,
        english: "First Day of Riḍván",
        arabic: "أول أيام الرضوان",
        description: "Declaration of Bahá'u'lláh",
        workSuspended: true
    },
    {
        month: 3,
        day: 2,
        english: "Ninth Day of Riḍván",
        arabic: "اليوم التاسع من الرضوان",
        description: "Ninth Day of Festival",
        workSuspended: true
    },
    {
        month: 3,
        day: 5,
        english: "Twelfth Day of Riḍván",
        arabic: "اليوم الثاني عشر من الرضوان",
        description: "Last Day of Festival",
        workSuspended: true
    },
    {
        month: 4,
        day: 8,
        english: "Declaration of the Báb",
        arabic: "إعلان الباب",
        description: "May 23, 1844",
        workSuspended: true
    },
    {
        month: 4,
        day: 13,
        english: "Ascension of Bahá'u'lláh",
        arabic: "صعود بهاء الله",
        description: "May 29, 1892",
        workSuspended: true
    },
    {
        month: 6,
        day: 17,
        english: "Martyrdom of the Báb",
        arabic: "استشهاد الباب",
        description: "July 9, 1850",
        workSuspended: true
    },
    // Twin Holy Birthdays (Birth of the Báb & Birth of Bahá'u'lláh)
    // are year-specific — looked up dynamically via TWIN_BIRTHDAYS table

    // Commemorative holy days
    {
        month: 14,
        day: 4,
        english: "Day of the Covenant",
        arabic: "يوم الميثاق",
        description: "Commemorating 'Abdu'l-Bahá",
        workSuspended: false
    },
    {
        month: 14,
        day: 6,
        english: "Ascension of 'Abdu'l-Bahá",
        arabic: "صعود عبد البهاء",
        description: "November 28, 1921",
        workSuspended: false
    }
];

/**
 * Check if a given Badí' date is a holy day
 * @param {number} month - Badí' month (1-19, or 0 for Ayyám-i-Há)
 * @param {number} day - Day of the month (1-19)
 * @param {number} [year] - Bahá'í year (needed for Twin Holy Birthdays)
 * @returns {Object|null} - Holy day object or null
 */
function getHolyDay(month, day, year) {
    // Check fixed holy days first
    const fixed = HOLY_DAYS.find(hd => hd.month === month && hd.day === day);
    if (fixed) return fixed;

    // Check Twin Holy Birthdays (year-specific)
    if (year) {
        const twins = TWIN_BIRTHDAYS[year];
        if (twins) {
            if (month === twins.babMonth && day === twins.babDay) {
                return { month, day, english: "Birth of the Báb", arabic: "مولد الباب", description: "October 20, 1819", workSuspended: true };
            }
            if (month === twins.bahMonth && day === twins.bahDay) {
                return { month, day, english: "Birth of Bahá'u'lláh", arabic: "مولد بهاء الله", description: "November 12, 1817", workSuspended: true };
            }
        }
    }

    return null;
}

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
    const d1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
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

    // Check if this date is a holy day
    const holyDay = getHolyDay(month, day, badiYear);

    return {
        year: badiYear,
        month: month,
        day: day,
        weekday: badiWeekday,
        isAyyamIHa: isAyyamIHa,
        monthName: isAyyamIHa ? AYYAM_I_HA : MONTHS[month - 1],
        weekdayName: WEEKDAYS[badiWeekday],
        holyDay: holyDay,
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
 * @param {Date} gregorianDate - Optional Gregorian date (defaults to current date)
 * @returns {Object} - Current Bahá'í date object
 */
function getCurrentBadiDate(gregorianDate = new Date()) {
    return gregorianToBadi(gregorianDate);
}

/**
 * Get the current day in the month or Ayyám-i-Há period
 * @param {Date} gregorianDate - Gregorian date (with sunset boundary already accounted for)
 * @returns {Object} - Object containing day info for display components
 * @property {number} dayInPeriod - Current day number (1-19 for months, 1-4/5 for Ayyám-i-Há)
 * @property {number} totalDaysInPeriod - Total days in current period (19, 4, or 5)
 * @property {boolean} isAyyamIHa - Whether currently in Ayyám-i-Há
 * @property {number} month - Month number (1-19, or 0 for Ayyám-i-Há)
 * @property {number} year - Bahá'í year
 */
function getCurrentDayInPeriod(gregorianDate = new Date()) {
    const badiDate = gregorianToBadi(gregorianDate);

    let totalDaysInPeriod;
    if (badiDate.isAyyamIHa) {
        // Ayyám-i-Há has 4 or 5 days depending on the year
        totalDaysInPeriod = getAyyamIHaDays(badiDate.year);
    } else {
        // Regular months always have 19 days
        totalDaysInPeriod = 19;
    }

    return {
        dayInPeriod: badiDate.day,
        totalDaysInPeriod: totalDaysInPeriod,
        isAyyamIHa: badiDate.isAyyamIHa,
        month: badiDate.month,
        year: badiDate.year
    };
}

// Export functions and data
export {
    MONTHS,
    WEEKDAYS,
    AYYAM_I_HA,
    NAW_RUZ_DATA,
    TWIN_BIRTHDAYS,
    HOLY_DAYS,
    gregorianToBadi,
    formatBadiDate,
    getCurrentBadiDate,
    getCurrentDayInPeriod,
    getNawRuzDate,
    getAyyamIHaDays,
    findBadiYear,
    getHolyDay,
};
