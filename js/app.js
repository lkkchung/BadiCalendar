// Badí' Calendar Application
import { getCurrentBadiDate, getCurrentDayInPeriod } from './badiDate.js';
import { getNextSunset, formatTime } from './suncalc.js';

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
        toggleInput: null
    },

    /**
     * Initialize language preference module
     */
    init() {
        this.elements.toggleInput = document.getElementById('language-toggle-input');

        // Load saved preference or default to Arabic
        this.currentLanguage = this.loadPreference() || this.LANGUAGES.ARABIC;

        // Update toggle UI to match saved preference
        this.updateToggleUI();

        // Set up event listener for toggle changes
        if (this.elements.toggleInput) {
            this.elements.toggleInput.addEventListener('change', (e) => {
                const newLanguage = e.target.checked
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
        if (this.elements.toggleInput) {
            this.elements.toggleInput.checked = (this.currentLanguage === this.LANGUAGES.ENGLISH);
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
            this.elements.sunsetTime.textContent = `Sunset at ${formatTime(this.nextSunset)}`;
        } else {
            this.elements.sunsetTime.textContent = 'Sunset time unavailable';
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
 * Countdown module - handles countdown timer to next sunset
 */
const Countdown = {
    // Target sunset time
    targetSunset: null,

    // Interval ID for the timer
    intervalId: null,

    // DOM elements
    elements: {
        hours: null,
        minutes: null,
        seconds: null
    },

    /**
     * Initialize countdown module
     */
    init() {
        this.elements.hours = document.getElementById('countdown-hours');
        this.elements.minutes = document.getElementById('countdown-minutes');
        this.elements.seconds = document.getElementById('countdown-seconds');

        // Listen for sunset updates
        window.addEventListener('sunsetUpdated', (e) => {
            this.setTarget(e.detail.sunset);
        });

        // Check if sunset already available
        const sunset = Sunset.getNextSunset();
        if (sunset) {
            this.setTarget(sunset);
        }
    },

    /**
     * Set the countdown target
     * @param {Date} sunset
     */
    setTarget(sunset) {
        this.targetSunset = sunset;

        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        // Update immediately and start interval
        this.update();
        this.intervalId = setInterval(() => this.update(), 1000);
    },

    /**
     * Update the countdown display
     */
    update() {
        if (!this.targetSunset) {
            this.displayTime(0, 0, 0);
            return;
        }

        const now = DebugTime.now();
        const diff = this.targetSunset.getTime() - now.getTime();

        if (diff <= 0) {
            // Sunset has passed - request new sunset calculation
            this.displayTime(0, 0, 0);
            window.dispatchEvent(new CustomEvent('sunsetPassed'));
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        this.displayTime(hours, minutes, seconds);
    },

    /**
     * Display time values in the UI
     * @param {number} hours
     * @param {number} minutes
     * @param {number} seconds
     */
    displayTime(hours, minutes, seconds) {
        if (this.elements.hours) {
            this.elements.hours.textContent = String(hours).padStart(2, '0');
        }
        if (this.elements.minutes) {
            this.elements.minutes.textContent = String(minutes).padStart(2, '0');
        }
        if (this.elements.seconds) {
            this.elements.seconds.textContent = String(seconds).padStart(2, '0');
        }
    },

    /**
     * Stop the countdown
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

export { Countdown };

/**
 * ProgressDots module - renders progress dots for days in period
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
     * Render progress dots for current period
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

        // Create dots
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

    // Update progress dots
    ProgressDots.render();
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
    Countdown.init();
    ProgressDots.init();
    updateBadiDateDisplay();
    updateGregorianDateDisplay();
    startTimeUpdater();
    updateFooterYear();

    // Listen for Bahá'í day change (at sunset)
    window.addEventListener('badiDayChanged', () => {
        updateBadiDateDisplay();
    });

    // Listen for language preference changes
    window.addEventListener('languageChanged', () => {
        updateBadiDateDisplay();
    });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
