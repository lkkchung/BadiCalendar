// Badí' Calendar Application
import { getCurrentBadiDate, getCurrentDayInPeriod } from './badiDate.js';
import { getNextSunset, getSunset, formatTime } from './suncalc.js';

/**
 * Language Preference module - manages language state and persistence
 */
const LanguagePreference = {
    // Storage key
    STORAGE_KEY: 'badiCalendarLanguage',

    // Valid language values
    LANGUAGES: {
        ARABIC: 'arabic',
        ENGLISH: 'english'
    },

    // Current language preference
    currentLanguage: null,

    // DOM elements
    elements: {
        toggleBtn: null,
        toggleText: null
    },

    /**
     * Initialize language preference module
     */
    init() {
        this.elements.toggleBtn = document.getElementById('language-toggle-btn');
        this.elements.toggleText = document.getElementById('language-toggle-text');

        // Load saved preference or default to Arabic
        this.currentLanguage = this.loadPreference() || this.LANGUAGES.ARABIC;

        // Update toggle UI to match saved preference
        this.updateToggleUI();

        // Set up event listener for toggle button clicks
        if (this.elements.toggleBtn) {
            this.elements.toggleBtn.addEventListener('click', () => {
                // Toggle between Arabic and English
                const newLanguage = this.currentLanguage === this.LANGUAGES.ARABIC
                    ? this.LANGUAGES.ENGLISH
                    : this.LANGUAGES.ARABIC;
                this.setLanguage(newLanguage);
            });
        }
    },

    /**
     * Get current language preference
     * @returns {string} - 'arabic' or 'english'
     */
    getLanguage() {
        return this.currentLanguage;
    },

    /**
     * Set language preference
     * @param {string} language - 'arabic' or 'english'
     */
    setLanguage(language) {
        if (language !== this.LANGUAGES.ARABIC && language !== this.LANGUAGES.ENGLISH) {
            console.error('Invalid language:', language);
            return;
        }

        this.currentLanguage = language;
        this.savePreference(language);
        this.updateToggleUI();

        // Dispatch custom event for other modules to react
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: language }
        }));
    },

    /**
     * Update toggle UI to match current language
     */
    updateToggleUI() {
        if (this.elements.toggleBtn) {
            // Update data attribute for CSS styling
            this.elements.toggleBtn.setAttribute('data-lang', this.currentLanguage);
        }

        if (this.elements.toggleText) {
            // Button text always says "Arabic Names"
            this.elements.toggleText.textContent = 'Arabic Names';
        }
    },

    /**
     * Save language preference to localStorage
     * @param {string} language
     */
    savePreference(language) {
        try {
            localStorage.setItem(this.STORAGE_KEY, language);
        } catch (e) {
            console.warn('Failed to save language preference:', e);
        }
    },

    /**
     * Load language preference from localStorage
     * @returns {string|null}
     */
    loadPreference() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to load language preference:', e);
            return null;
        }
    }
};

export { LanguagePreference };

/**
 * Debug Time module - allows manual time/date override for testing
 */
const DebugTime = {
    // Time offset in milliseconds (null = use real time)
    debugOffset: null,

    // Visual indicator element
    indicatorElement: null,

    // Indicator update interval
    indicatorInterval: null,

    /**
     * Initialize debug mode from URL parameters
     */
    init() {
        // Check URL for ?debugTime parameter
        const params = new URLSearchParams(window.location.search);
        const debugTimeParam = params.get('debugTime');
        if (debugTimeParam) {
            const date = new Date(debugTimeParam);
            if (!isNaN(date.getTime())) {
                this.setDebugTime(date);
            }
        }

        // Expose console commands
        window.debugTime = (dateStr) => this.setDebugTime(new Date(dateStr));
        window.clearDebugTime = () => this.clearDebugTime();
        window.advanceTime = (minutes) => this.advanceTime(minutes);

        console.log('Debug mode available:');
        console.log('  debugTime("2024-03-20 18:00:00") - Set custom date/time (ticks forward)');
        console.log('  advanceTime(30) - Jump forward/backward by N minutes');
        console.log('  clearDebugTime() - Return to real time');
    },

    /**
     * Get current time (debug or real)
     * @returns {Date}
     */
    now() {
        if (this.debugOffset === null) {
            return new Date();
        }
        return new Date(Date.now() + this.debugOffset);
    },

    /**
     * Set debug time
     * @param {Date} date
     */
    setDebugTime(date) {
        if (isNaN(date.getTime())) {
            console.error('Invalid date');
            return;
        }

        // Calculate offset from current real time
        this.debugOffset = date.getTime() - Date.now();
        this.showIndicator();
        console.log('Debug time set to:', date.toString(), '(time will tick forward)');

        // Trigger updates
        this.triggerUpdates();
    },

    /**
     * Clear debug time (return to real time)
     */
    clearDebugTime() {
        this.debugOffset = null;
        this.hideIndicator();
        console.log('Debug time cleared - using real time');

        // Trigger updates
        this.triggerUpdates();
    },

    /**
     * Advance debug time by specified minutes
     * @param {number} minutes - Number of minutes to advance (can be negative)
     */
    advanceTime(minutes) {
        if (this.debugOffset === null) {
            console.error('Debug mode not active. Call debugTime() first.');
            return;
        }

        // Adjust offset by the specified minutes
        this.debugOffset += minutes * 60 * 1000;
        console.log('Advanced by', minutes, 'minutes to:', this.now().toString());
        this.triggerUpdates();
    },

    /**
     * Trigger all time-dependent updates
     */
    triggerUpdates() {
        // Force location update to recalculate sunset
        const location = Geolocation.getLocation();
        if (location) {
            window.dispatchEvent(new CustomEvent('locationChanged', {
                detail: location
            }));
        }

        // Update displays
        updateBadiDateDisplay();
        updateGregorianDateDisplay();
        updateTimeDisplay();
    },

    /**
     * Show debug mode indicator
     */
    showIndicator() {
        if (!this.indicatorElement) {
            this.indicatorElement = document.createElement('div');
            this.indicatorElement.id = 'debug-indicator';
            this.indicatorElement.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                user-select: none;
            `;
            this.indicatorElement.title = 'Click to exit debug mode';
            this.indicatorElement.addEventListener('click', () => this.clearDebugTime());
            document.body.appendChild(this.indicatorElement);
        }

        // Update indicator text
        this.updateIndicator();

        // Start updating the indicator every second
        if (!this.indicatorInterval) {
            this.indicatorInterval = setInterval(() => this.updateIndicator(), 1000);
        }

        this.indicatorElement.style.display = 'block';
    },

    /**
     * Update indicator text
     */
    updateIndicator() {
        if (this.indicatorElement && this.debugOffset !== null) {
            this.indicatorElement.textContent = `🐛 DEBUG: ${this.now().toLocaleString()}`;
        }
    },

    /**
     * Hide debug mode indicator
     */
    hideIndicator() {
        if (this.indicatorElement) {
            this.indicatorElement.style.display = 'none';
        }

        // Stop updating the indicator
        if (this.indicatorInterval) {
            clearInterval(this.indicatorInterval);
            this.indicatorInterval = null;
        }
    }
};

export { DebugTime };

/**
 * Geolocation module - handles browser geolocation API integration
 */
const Geolocation = {
    // Current location state
    location: null,

    // DOM elements
    elements: {
        locationText: null,
        locationFallback: null,
        locationInput: null,
        locationSubmit: null
    },

    /**
     * Initialize geolocation module
     */
    init() {
        this.elements.locationText = document.getElementById('location-text');
        this.elements.locationFallback = document.getElementById('location-fallback');
        this.elements.locationInput = document.getElementById('location-input');
        this.elements.locationSubmit = document.getElementById('location-submit');

        // Set up fallback input event listeners
        this.setupFallbackInputListeners();

        // Try to load saved location from localStorage
        const savedLocation = this.loadSavedLocation();
        if (savedLocation) {
            this.location = savedLocation;
            this.updateLocationDisplay();
        } else {
            this.requestLocation();
        }
    },

    /**
     * Set up event listeners for fallback location input
     */
    setupFallbackInputListeners() {
        if (this.elements.locationSubmit) {
            this.elements.locationSubmit.addEventListener('click', () => {
                this.handleManualLocationSubmit();
            });
        }

        if (this.elements.locationInput) {
            this.elements.locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleManualLocationSubmit();
                }
            });
        }
    },

    /**
     * Handle manual location submission from fallback input
     */
    handleManualLocationSubmit() {
        const input = this.elements.locationInput.value.trim();
        if (!input) return;

        // Try to parse as coordinates (lat, lng) or (lat lng)
        const coordMatch = input.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.setManualLocation(lat, lng, null);
                return;
            }
        }

        // Look up city in predefined list
        const cityLocation = this.lookupCity(input);
        if (cityLocation) {
            this.setManualLocation(cityLocation.lat, cityLocation.lng, cityLocation.name);
            return;
        }

        // City not found - show error
        this.elements.locationText.textContent = `City "${input}" not found. Try coordinates (lat, lng).`;
    },

    /**
     * Set location from manual input
     * @param {number} lat
     * @param {number} lng
     * @param {string|null} name
     */
    setManualLocation(lat, lng, name) {
        this.location = {
            latitude: lat,
            longitude: lng,
            name: name,
            source: 'manual'
        };

        this.saveLocation(this.location);
        this.updateLocationDisplay();
        this.hideFallbackInput();
        this.elements.locationInput.value = '';

        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('locationChanged', {
            detail: this.location
        }));
    },

    /**
     * Look up city coordinates from predefined list
     * @param {string} query
     * @returns {Object|null}
     */
    lookupCity(query) {
        const cities = {
            'london': { lat: 51.51, lng: -0.13, name: 'London, UK' },
            'london uk': { lat: 51.51, lng: -0.13, name: 'London, UK' },
            'new york': { lat: 40.71, lng: -74.01, name: 'New York, USA' },
            'new york city': { lat: 40.71, lng: -74.01, name: 'New York, USA' },
            'nyc': { lat: 40.71, lng: -74.01, name: 'New York, USA' },
            'brooklyn': { lat: 40.65, lng: -73.95, name: 'Brooklyn, NY' },
            'manhattan': { lat: 40.78, lng: -73.97, name: 'Manhattan, NY' },
            'queens': { lat: 40.73, lng: -73.79, name: 'Queens, NY' },
            'bronx': { lat: 40.84, lng: -73.87, name: 'Bronx, NY' },
            'staten island': { lat: 40.58, lng: -74.15, name: 'Staten Island, NY' },
            'los angeles': { lat: 34.05, lng: -118.24, name: 'Los Angeles, USA' },
            'la': { lat: 34.05, lng: -118.24, name: 'Los Angeles, USA' },
            'chicago': { lat: 41.88, lng: -87.63, name: 'Chicago, USA' },
            'toronto': { lat: 43.65, lng: -79.38, name: 'Toronto, Canada' },
            'vancouver': { lat: 49.28, lng: -123.12, name: 'Vancouver, Canada' },
            'sydney': { lat: -33.87, lng: 151.21, name: 'Sydney, Australia' },
            'melbourne': { lat: -37.81, lng: 144.96, name: 'Melbourne, Australia' },
            'paris': { lat: 48.86, lng: 2.35, name: 'Paris, France' },
            'berlin': { lat: 52.52, lng: 13.41, name: 'Berlin, Germany' },
            'tokyo': { lat: 35.68, lng: 139.69, name: 'Tokyo, Japan' },
            'beijing': { lat: 39.90, lng: 116.41, name: 'Beijing, China' },
            'shanghai': { lat: 31.23, lng: 121.47, name: 'Shanghai, China' },
            'hong kong': { lat: 22.32, lng: 114.17, name: 'Hong Kong' },
            'singapore': { lat: 1.35, lng: 103.82, name: 'Singapore' },
            'mumbai': { lat: 19.08, lng: 72.88, name: 'Mumbai, India' },
            'delhi': { lat: 28.61, lng: 77.21, name: 'Delhi, India' },
            'dubai': { lat: 25.20, lng: 55.27, name: 'Dubai, UAE' },
            'cairo': { lat: 30.04, lng: 31.24, name: 'Cairo, Egypt' },
            'haifa': { lat: 32.79, lng: 34.99, name: 'Haifa, Israel' },
            'tehran': { lat: 35.69, lng: 51.39, name: 'Tehran, Iran' },
            'san francisco': { lat: 37.77, lng: -122.42, name: 'San Francisco, USA' },
            'sf': { lat: 37.77, lng: -122.42, name: 'San Francisco, USA' },
            'seattle': { lat: 47.61, lng: -122.33, name: 'Seattle, USA' },
            'boston': { lat: 42.36, lng: -71.06, name: 'Boston, USA' },
            'miami': { lat: 25.76, lng: -80.19, name: 'Miami, USA' },
            'houston': { lat: 29.76, lng: -95.37, name: 'Houston, USA' },
            'phoenix': { lat: 33.45, lng: -112.07, name: 'Phoenix, USA' },
            'atlanta': { lat: 33.75, lng: -84.39, name: 'Atlanta, USA' },
            'denver': { lat: 39.74, lng: -104.99, name: 'Denver, USA' },
            'mexico city': { lat: 19.43, lng: -99.13, name: 'Mexico City, Mexico' },
            'sao paulo': { lat: -23.55, lng: -46.63, name: 'São Paulo, Brazil' },
            'rio de janeiro': { lat: -22.91, lng: -43.17, name: 'Rio de Janeiro, Brazil' },
            'buenos aires': { lat: -34.60, lng: -58.38, name: 'Buenos Aires, Argentina' },
            'johannesburg': { lat: -26.20, lng: 28.05, name: 'Johannesburg, South Africa' },
            'cape town': { lat: -33.93, lng: 18.42, name: 'Cape Town, South Africa' },
            'lagos': { lat: 6.52, lng: 3.38, name: 'Lagos, Nigeria' },
            'nairobi': { lat: -1.29, lng: 36.82, name: 'Nairobi, Kenya' },
            'moscow': { lat: 55.76, lng: 37.62, name: 'Moscow, Russia' },
            'istanbul': { lat: 41.01, lng: 28.98, name: 'Istanbul, Turkey' },
            'rome': { lat: 41.90, lng: 12.50, name: 'Rome, Italy' },
            'madrid': { lat: 40.42, lng: -3.70, name: 'Madrid, Spain' },
            'amsterdam': { lat: 52.37, lng: 4.90, name: 'Amsterdam, Netherlands' },
            'brussels': { lat: 50.85, lng: 4.35, name: 'Brussels, Belgium' },
            'vienna': { lat: 48.21, lng: 16.37, name: 'Vienna, Austria' },
            'zurich': { lat: 47.37, lng: 8.54, name: 'Zurich, Switzerland' },
            'stockholm': { lat: 59.33, lng: 18.07, name: 'Stockholm, Sweden' },
            'oslo': { lat: 59.91, lng: 10.75, name: 'Oslo, Norway' },
            'copenhagen': { lat: 55.68, lng: 12.57, name: 'Copenhagen, Denmark' },
            'helsinki': { lat: 60.17, lng: 24.94, name: 'Helsinki, Finland' },
            'dublin': { lat: 53.35, lng: -6.26, name: 'Dublin, Ireland' },
            'edinburgh': { lat: 55.95, lng: -3.19, name: 'Edinburgh, UK' },
            'manchester': { lat: 53.48, lng: -2.24, name: 'Manchester, UK' },
            'birmingham': { lat: 52.49, lng: -1.90, name: 'Birmingham, UK' },
            'seoul': { lat: 37.57, lng: 126.98, name: 'Seoul, South Korea' },
            'bangkok': { lat: 13.76, lng: 100.50, name: 'Bangkok, Thailand' },
            'kuala lumpur': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
            'jakarta': { lat: -6.21, lng: 106.85, name: 'Jakarta, Indonesia' },
            'manila': { lat: 14.60, lng: 120.98, name: 'Manila, Philippines' },
            'auckland': { lat: -36.85, lng: 174.76, name: 'Auckland, New Zealand' },
            'wellington': { lat: -41.29, lng: 174.78, name: 'Wellington, New Zealand' }
        };

        const normalized = query.toLowerCase().trim();
        return cities[normalized] || null;
    },

    /**
     * Request location from browser Geolocation API
     */
    requestLocation() {
        if (!navigator.geolocation) {
            this.handleGeolocationError({ code: 0, message: 'Geolocation not supported' });
            return;
        }

        this.elements.locationText.textContent = 'Detecting location...';

        navigator.geolocation.getCurrentPosition(
            (position) => this.handleGeolocationSuccess(position),
            (error) => this.handleGeolocationError(error),
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    },

    /**
     * Handle successful geolocation
     * @param {GeolocationPosition} position
     */
    handleGeolocationSuccess(position) {
        this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'geolocation'
        };

        this.saveLocation(this.location);
        this.updateLocationDisplay();
        this.hideFallbackInput();

        // Dispatch event for other modules to use
        window.dispatchEvent(new CustomEvent('locationChanged', {
            detail: this.location
        }));
    },

    /**
     * Handle geolocation error
     * @param {GeolocationPositionError} error
     */
    handleGeolocationError(error) {
        let message;
        switch (error.code) {
            case 1: // PERMISSION_DENIED
                message = 'Location access denied';
                break;
            case 2: // POSITION_UNAVAILABLE
                message = 'Location unavailable';
                break;
            case 3: // TIMEOUT
                message = 'Location request timed out';
                break;
            default:
                message = 'Geolocation not supported';
        }

        this.elements.locationText.textContent = message;
        this.showFallbackInput();
    },

    /**
     * Show the fallback location input
     */
    showFallbackInput() {
        this.elements.locationFallback.hidden = false;
    },

    /**
     * Hide the fallback location input
     */
    hideFallbackInput() {
        this.elements.locationFallback.hidden = true;
    },

    /**
     * Update the location display text
     */
    updateLocationDisplay() {
        if (!this.location) return;

        const lat = this.location.latitude.toFixed(2);
        const lon = this.location.longitude.toFixed(2);
        const latDir = this.location.latitude >= 0 ? 'N' : 'S';
        const lonDir = this.location.longitude >= 0 ? 'E' : 'W';

        if (this.location.name) {
            this.elements.locationText.textContent = this.location.name;
        } else {
            this.elements.locationText.textContent = `${Math.abs(lat)}°${latDir}, ${Math.abs(lon)}°${lonDir}`;
        }
    },

    /**
     * Save location to localStorage
     * @param {Object} location
     */
    saveLocation(location) {
        try {
            localStorage.setItem('badi-calendar-location', JSON.stringify(location));
        } catch (e) {
            // localStorage not available, continue without persistence
        }
    },

    /**
     * Load saved location from localStorage
     * @returns {Object|null}
     */
    loadSavedLocation() {
        try {
            const saved = localStorage.getItem('badi-calendar-location');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Get the current location
     * @returns {Object|null}
     */
    getLocation() {
        return this.location;
    }
};

// Export for use by other modules
export { Geolocation };

/**
 * Sunset module - handles sunset time calculation and display
 */
const Sunset = {
    // Current sunset time
    nextSunset: null,

    // Current location (cached for recalculation)
    currentLocation: null,

    // DOM elements
    elements: {
        sunsetTime: null
    },

    /**
     * Initialize sunset module
     */
    init() {
        this.elements.sunsetTime = document.getElementById('sunset-time');

        // Listen for location changes
        window.addEventListener('locationChanged', (e) => {
            this.currentLocation = e.detail;
            this.updateSunset(e.detail);
        });

        // Listen for sunset passed - recalculate next sunset
        window.addEventListener('sunsetPassed', () => {
            this.onSunsetPassed();
        });

        // If location already available, calculate sunset
        const location = Geolocation.getLocation();
        if (location) {
            this.currentLocation = location;
            this.updateSunset(location);
        }
    },

    /**
     * Handle sunset passed event
     */
    onSunsetPassed() {
        // Recalculate next sunset
        if (this.currentLocation) {
            // Small delay to ensure we're past the sunset moment
            setTimeout(() => {
                this.updateSunset(this.currentLocation);
            }, 1000);
        }

        // Dispatch event for Bahá'í date update
        window.dispatchEvent(new CustomEvent('badiDayChanged'));
    },

    /**
     * Update sunset calculation for a location
     * @param {Object} location - { latitude, longitude }
     */
    updateSunset(location) {
        if (!location || location.latitude === undefined || location.longitude === undefined) {
            return;
        }

        this.nextSunset = getNextSunset(location.latitude, location.longitude, DebugTime.now());
        this.updateDisplay();

        // Dispatch event for countdown timer
        window.dispatchEvent(new CustomEvent('sunsetUpdated', {
            detail: { sunset: this.nextSunset }
        }));
    },

    /**
     * Update the sunset time display
     */
    updateDisplay() {
        if (!this.elements.sunsetTime) return;

        if (this.nextSunset) {
            this.elements.sunsetTime.textContent = formatTime(this.nextSunset);
        } else {
            this.elements.sunsetTime.textContent = '--:--';
        }
    },

    /**
     * Get the next sunset time
     * @returns {Date|null}
     */
    getNextSunset() {
        return this.nextSunset;
    }
};

export { Sunset };

/**
 * DayDots module - handles circular day indicator dots around the day number
 */
const DayDots = {
    // DOM elements
    elements: {
        container: null
    },

    /**
     * Initialize day dots module
     */
    init() {
        this.elements.container = document.getElementById('day-dots');
    },

    /**
     * Render day dots in circular arrangement
     */
    render() {
        if (!this.elements.container) return;

        // Determine correct Gregorian date for Bahá'í calculation
        const gregorianDate = DebugTime.now();
        const nextSunset = Sunset.getNextSunset();

        // If nextSunset is tomorrow, we've passed today's sunset
        if (nextSunset) {
            const today = DebugTime.now();
            today.setHours(0, 0, 0, 0);
            const sunsetDay = new Date(nextSunset);
            sunsetDay.setHours(0, 0, 0, 0);

            // Sunset is tomorrow → increment date by 1 day
            if (sunsetDay > today) {
                gregorianDate.setDate(gregorianDate.getDate() + 1);
            }
        }

        const periodInfo = getCurrentDayInPeriod(gregorianDate);
        const { dayInPeriod, totalDaysInPeriod } = periodInfo;

        // Clear existing dots
        this.elements.container.innerHTML = '';

        // Calculate circular positions for dots (47.5% of container size for radius)
        const containerSize = this.elements.container.parentElement.offsetWidth;
        const radius = containerSize * 0.475; // 47.5% of container for radius
        const centerX = containerSize / 2; // Center X
        const centerY = containerSize / 2; // Center Y
        const startAngle = -90; // Start at top (12 o'clock position)

        // Create dots for current period
        for (let i = 1; i <= totalDaysInPeriod; i++) {
            const dot = document.createElement('div');
            dot.className = 'day-dot';

            // Determine dot state
            if (i < dayInPeriod) {
                dot.classList.add('day-dot-previous');
            } else if (i === dayInPeriod) {
                dot.classList.add('day-dot-current');
            } else {
                dot.classList.add('day-dot-future');
            }

            // Calculate position in circle
            const angle = startAngle + (360 / totalDaysInPeriod) * (i - 1);
            const radian = (angle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(radian);
            const y = centerY + radius * Math.sin(radian);

            // Position the dot
            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
            dot.style.transform = 'translate(-50%, -50%)';

            dot.setAttribute('aria-label', `Day ${i} of ${totalDaysInPeriod}`);
            this.elements.container.appendChild(dot);
        }
    }
};

export { DayDots };

/**
 * DayCountdown module - renders SVG countdown with tick marks and progress arc
 */
const DayCountdown = {
    elements: {
        ticksGroup: null,
        progressArc: null
    },

    constants: {
        // Countdown tick marks (marking hours of the 24-hour day)
        TICK_INNER_RADIUS: 0.71,   // Inner radius for tick marks (45% of container)
        TICK_OUTER_RADIUS: 0.77,   // Outer radius for tick marks (49% of container)

        // Progress arc (shows progress through current 24-hour day)
        ARC_RADIUS: 0.74,          // Arc radius (47% of container)

        // Common
        START_ANGLE: -90,          // 12 o'clock position
        TOTAL_TICKS: 24            // 24 tick marks total (one per hour)
    },

    init() {
        this.elements.ticksGroup = document.getElementById('countdown-ticks');
        this.elements.progressArc = document.getElementById('progress-arc');

        if (!this.elements.ticksGroup || !this.elements.progressArc) {
            console.warn('DayCountdown: SVG elements not found');
            return;
        }

        // Render static ticks once
        this.renderTicks();

        // Start progress arc updates
        this.startUpdateInterval();

        // Re-render on events
        window.addEventListener('sunsetUpdated', () => this.update());
        window.addEventListener('badiDayChanged', () => {
            // Ticks are always 24, no need to re-render
            // Just update the arc (resets to 0% at sunset)
            this.update();
        });
    },

    renderTicks() {
        if (!this.elements.ticksGroup) return;

        // Clear existing ticks
        this.elements.ticksGroup.innerHTML = '';

        // Always render exactly 24 tick marks (one per hour of the day)
        const totalTicks = this.constants.TOTAL_TICKS;
        const degreesPerTick = 360 / totalTicks;
        const centerX = 100; // viewBox center
        const centerY = 100; // viewBox center
        const viewBoxSize = 200;

        for (let i = 0; i < totalTicks; i++) {
            const angle = this.constants.START_ANGLE + (degreesPerTick * i);
            const angleRad = (angle * Math.PI) / 180;

            // Calculate inner and outer points
            const innerRadius = this.constants.TICK_INNER_RADIUS * viewBoxSize / 2;
            const outerRadius = this.constants.TICK_OUTER_RADIUS * viewBoxSize / 2;

            const x1 = centerX + innerRadius * Math.cos(angleRad);
            const y1 = centerY + innerRadius * Math.sin(angleRad);
            const x2 = centerX + outerRadius * Math.cos(angleRad);
            const y2 = centerY + outerRadius * Math.sin(angleRad);

            // Create tick line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);

            this.elements.ticksGroup.appendChild(line);
        }
    },

    calculateProgress() {
        const nextSunset = Sunset.getNextSunset();
        if (!nextSunset || !Geolocation.location) {
            return 0;
        }

        const now = DebugTime.now();
        const { latitude, longitude } = Geolocation.location;

        // Calculate today's sunset
        const todaySunset = getSunset(now, latitude, longitude);
        if (!todaySunset) {
            return 0;
        }

        // Determine previous sunset based on current time
        // If before today's sunset: use yesterday's sunset
        // If after today's sunset: use today's sunset
        let prevSunset;
        if (now < todaySunset) {
            // Before today's sunset, use yesterday's sunset
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            prevSunset = getSunset(yesterday, latitude, longitude);
        } else {
            // After today's sunset, use today's sunset
            prevSunset = todaySunset;
        }

        if (!prevSunset) {
            return 0;
        }

        const prevSunsetTime = prevSunset.getTime();
        const nextSunsetTime = nextSunset.getTime();

        // Calculate elapsed time from previous sunset to now
        const elapsed = now.getTime() - prevSunsetTime;
        const total = nextSunsetTime - prevSunsetTime;

        // Calculate progress (0.0 to 1.0)
        const progress = Math.max(0, Math.min(1, elapsed / total));

        return progress;
    },

    createArcPath(centerX, centerY, radius, startAngleDeg, endAngleDeg) {
        // Convert angles to radians
        const startAngleRad = (startAngleDeg * Math.PI) / 180;
        const endAngleRad = (endAngleDeg * Math.PI) / 180;

        // Calculate start and end points
        const startX = centerX + radius * Math.cos(startAngleRad);
        const startY = centerY + radius * Math.sin(startAngleRad);
        const endX = centerX + radius * Math.cos(endAngleRad);
        const endY = centerY + radius * Math.sin(endAngleRad);

        // Determine if we need the large arc flag
        let angleDiff = endAngleDeg - startAngleDeg;
        if (angleDiff < 0) angleDiff += 360;
        const largeArcFlag = angleDiff > 180 ? 1 : 0;

        // Create SVG arc path
        const path = [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
        ].join(' ');

        return path;
    },

    update() {
        if (!this.elements.progressArc) return;

        const nextSunset = Sunset.getNextSunset();
        if (!nextSunset) {
            // No sunset data, hide the arc
            this.elements.progressArc.setAttribute('d', '');
            return;
        }

        // Calculate progress through current day (0.0 to 1.0)
        const progress = this.calculateProgress();

        // Arc starts at top of circle (START_ANGLE = -90°)
        // and extends clockwise based on progress (0-100% = 0-360°)
        const startAngle = this.constants.START_ANGLE;
        const endAngle = startAngle + (360 * progress);

        // Generate arc path
        const centerX = 100;
        const centerY = 100;
        const viewBoxSize = 200;
        const radius = this.constants.ARC_RADIUS * viewBoxSize / 2;

        const arcPath = this.createArcPath(centerX, centerY, radius, startAngle, endAngle);
        this.elements.progressArc.setAttribute('d', arcPath);
    },

    startUpdateInterval() {
        this.update();
        setInterval(() => this.update(), 1000);
    }
};

/**
 * MonthDots module - renders month progression dots for the year (20 dots total)
 */
const MonthDots = {
    // DOM elements
    elements: {
        container: null
    },

    /**
     * Initialize month dots module
     */
    init() {
        this.elements.container = document.getElementById('month-dots');
    },

    /**
     * Render month progression dots (20 total: 18 months + Ayyám-i-Há + Month 19)
     */
    render() {
        if (!this.elements.container) return;

        // Determine correct Gregorian date for Bahá'í calculation
        const gregorianDate = DebugTime.now();
        const nextSunset = Sunset.getNextSunset();

        // If nextSunset is tomorrow, we've passed today's sunset
        if (nextSunset) {
            const today = DebugTime.now();
            today.setHours(0, 0, 0, 0);
            const sunsetDay = new Date(nextSunset);
            sunsetDay.setHours(0, 0, 0, 0);

            // Sunset is tomorrow → increment date by 1 day
            if (sunsetDay > today) {
                gregorianDate.setDate(gregorianDate.getDate() + 1);
            }
        }

        const periodInfo = getCurrentDayInPeriod(gregorianDate);
        const { month, isAyyamIHa } = periodInfo;

        // Clear existing dots
        this.elements.container.innerHTML = '';

        // Create 20 dots representing the year structure
        for (let i = 1; i <= 20; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';

            if (i <= 18) {
                // Months 1-18 (circles)
                if (month === i && !isAyyamIHa) {
                    dot.classList.add('progress-dot-current');
                } else if (month > i || (month === i && isAyyamIHa)) {
                    dot.classList.add('progress-dot-past');
                }
                dot.setAttribute('aria-label', `Month ${i}`);
            } else if (i === 19) {
                // Ayyám-i-Há (square)
                dot.classList.add('progress-dot-square');
                if (isAyyamIHa) {
                    dot.classList.add('progress-dot-current');
                } else if (month === 19) {
                    dot.classList.add('progress-dot-past');
                }
                dot.setAttribute('aria-label', 'Ayyám-i-Há');
            } else {
                // Month 19 (circle)
                if (month === 19 && !isAyyamIHa) {
                    dot.classList.add('progress-dot-current');
                }
                dot.setAttribute('aria-label', 'Month 19 (Alá)');
            }

            this.elements.container.appendChild(dot);
        }
    }
};

export { MonthDots };

/**
 * ProgressDots module - renders progress dots for days in current period
 */
const ProgressDots = {
    // DOM elements
    elements: {
        container: null
    },

    /**
     * Initialize progress dots module
     */
    init() {
        this.elements.container = document.getElementById('progress-dots');
    },

    /**
     * Render progress dots for current period (day progression)
     */
    render() {
        if (!this.elements.container) return;

        // Determine correct Gregorian date for Bahá'í calculation
        const gregorianDate = DebugTime.now();
        const nextSunset = Sunset.getNextSunset();

        // If nextSunset is tomorrow, we've passed today's sunset
        if (nextSunset) {
            const today = DebugTime.now();
            today.setHours(0, 0, 0, 0);
            const sunsetDay = new Date(nextSunset);
            sunsetDay.setHours(0, 0, 0, 0);

            // Sunset is tomorrow → increment date by 1 day
            if (sunsetDay > today) {
                gregorianDate.setDate(gregorianDate.getDate() + 1);
            }
        }

        const periodInfo = getCurrentDayInPeriod(gregorianDate);
        const { dayInPeriod, totalDaysInPeriod } = periodInfo;

        // Clear existing dots
        this.elements.container.innerHTML = '';

        // Show dots for current period (day progression)
        for (let i = 1; i <= totalDaysInPeriod; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';

            if (i === dayInPeriod) {
                dot.classList.add('progress-dot-current');
            } else if (i < dayInPeriod) {
                dot.classList.add('progress-dot-past');
            }

            dot.setAttribute('aria-label', `Day ${i} of ${totalDaysInPeriod}`);
            this.elements.container.appendChild(dot);
        }
    }
};

export { ProgressDots };

/**
 * Update the Bahá'í date display
 */
function updateBadiDateDisplay() {
    // Determine correct Gregorian date for Bahá'í calculation
    const gregorianDate = DebugTime.now();
    const nextSunset = Sunset.getNextSunset();

    // If nextSunset is tomorrow, we've passed today's sunset
    // Use tomorrow's Gregorian date for Bahá'í calculation
    if (nextSunset) {
        const today = DebugTime.now();
        today.setHours(0, 0, 0, 0);
        const sunsetDay = new Date(nextSunset);
        sunsetDay.setHours(0, 0, 0, 0);

        // Sunset is tomorrow → increment date by 1 day
        if (sunsetDay > today) {
            gregorianDate.setDate(gregorianDate.getDate() + 1);
        }
    }

    const badiDate = getCurrentBadiDate(gregorianDate);

    // Get current language preference
    const language = LanguagePreference.getLanguage();
    const isEnglish = (language === LanguagePreference.LANGUAGES.ENGLISH);

    const weekdayEl = document.getElementById('weekday');
    const dayEl = document.getElementById('day');
    const monthEl = document.getElementById('month');
    const yearEl = document.getElementById('year');

    if (weekdayEl) {
        weekdayEl.textContent = isEnglish
            ? badiDate.weekdayName.english
            : badiDate.weekdayName.arabic;
        weekdayEl.title = isEnglish
            ? badiDate.weekdayName.arabic
            : badiDate.weekdayName.english;
    }

    if (dayEl) {
        dayEl.textContent = badiDate.day;
    }

    const monthLabelEl = document.getElementById('month-label');
    if (monthLabelEl) {
        monthLabelEl.textContent = badiDate.isAyyamIHa ? 'PERIOD' : 'MONTH';
    }

    if (monthEl) {
        if (badiDate.isAyyamIHa) {
            monthEl.textContent = 'Ayyám-i-Há';
            monthEl.title = 'Intercalary Days';
        } else {
            monthEl.textContent = isEnglish
                ? badiDate.monthName.english
                : badiDate.monthName.arabic;
            monthEl.title = isEnglish
                ? badiDate.monthName.arabic
                : badiDate.monthName.english;
        }
    }

    if (yearEl) {
        yearEl.textContent = `${badiDate.year} B.E.`;
    }

    // Update holy day display
    const holyDaySection = document.getElementById('holy-day-section');
    const holyDayText = document.getElementById('holy-day-text');
    const holyDayDescription = document.getElementById('holy-day-description');
    const holyDayType = document.getElementById('holy-day-type');

    if (badiDate.holyDay) {
        // Show holy day section
        if (holyDaySection) holyDaySection.hidden = false;

        // Display holy day name based on language preference
        if (holyDayText) {
            holyDayText.textContent = isEnglish
                ? badiDate.holyDay.english
                : badiDate.holyDay.arabic;
        }

        // Display description
        if (holyDayDescription) {
            holyDayDescription.textContent = badiDate.holyDay.description;
        }

        // Display type (work-suspended or commemorative)
        if (holyDayType) {
            holyDayType.textContent = badiDate.holyDay.workSuspended
                ? 'Work Suspended'
                : 'Commemorative Holy Day';
        }
    } else {
        // Hide holy day section
        if (holyDaySection) holyDaySection.hidden = true;
    }

    // Update month and day dots
    MonthDots.render();
    DayDots.render();
}

/**
 * Update the Gregorian date display
 */
function updateGregorianDateDisplay() {
    const gregorianDateEl = document.getElementById('gregorian-date');
    if (!gregorianDateEl) return;

    const now = DebugTime.now();
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    // Use locale-aware formatting
    gregorianDateEl.textContent = now.toLocaleDateString(undefined, options);
}

/**
 * Update the current time display with locale-aware formatting
 */
function updateTimeDisplay() {
    const timeEl = document.getElementById('current-time');
    if (!timeEl) return;

    const now = DebugTime.now();
    // Use locale-aware formatting with hours, minutes, seconds
    timeEl.textContent = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Start the auto-updating time display (updates every second)
 */
function startTimeUpdater() {
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
}

/**
 * Update the footer year
 */
function updateFooterYear() {
    const footerYearEl = document.getElementById('footer-year');
    if (footerYearEl) {
        footerYearEl.textContent = DebugTime.now().getFullYear();
    }
}

/**
 * Initialize the application
 */
function init() {
    DebugTime.init();
    LanguagePreference.init();
    Geolocation.init();
    Sunset.init();
    DayDots.init();
    DayCountdown.init();
    MonthDots.init();
    updateBadiDateDisplay();
    updateGregorianDateDisplay();
    startTimeUpdater();
    updateFooterYear();

    // Listen for Bahá'í day change (at sunset)
    window.addEventListener('badiDayChanged', () => {
        updateBadiDateDisplay();
        DayCountdown.update();
    });

    // Listen for language preference changes
    window.addEventListener('languageChanged', () => {
        updateBadiDateDisplay();
    });

    // Recalculate positions on window resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            DayDots.render();
            MonthDots.render();
            DayCountdown.update();
        }, 100); // Debounce: wait 100ms after resize stops
    });
}

// Run when ALL resources are loaded (CSS, fonts, etc.)
// This ensures CSS custom properties and media queries are fully computed
if (document.readyState === 'complete') {
    // Page already loaded
    init();
} else {
    // Wait for full page load (not just DOM ready)
    window.addEventListener('load', () => {
        // Use requestAnimationFrame to ensure layout is fully computed
        requestAnimationFrame(init);
    });
}
