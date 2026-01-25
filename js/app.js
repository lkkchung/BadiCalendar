// Badí' Calendar Application
import { getCurrentBadiDate } from './badiDate.js';

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
 * Update the Bahá'í date display
 */
function updateBadiDateDisplay() {
    const badiDate = getCurrentBadiDate();

    const weekdayEl = document.getElementById('weekday');
    const dayEl = document.getElementById('day');
    const monthEl = document.getElementById('month');
    const yearEl = document.getElementById('year');

    if (weekdayEl) {
        weekdayEl.textContent = `${badiDate.weekdayName.arabic}`;
        weekdayEl.title = badiDate.weekdayName.english;
    }

    if (dayEl) {
        dayEl.textContent = badiDate.day;
    }

    if (monthEl) {
        if (badiDate.isAyyamIHa) {
            monthEl.textContent = 'Ayyám-i-Há';
            monthEl.title = 'Intercalary Days';
        } else {
            monthEl.textContent = badiDate.monthName.arabic;
            monthEl.title = badiDate.monthName.english;
        }
    }

    if (yearEl) {
        yearEl.textContent = `${badiDate.year} B.E.`;
    }
}

/**
 * Update the footer year
 */
function updateFooterYear() {
    const footerYearEl = document.getElementById('footer-year');
    if (footerYearEl) {
        footerYearEl.textContent = new Date().getFullYear();
    }
}

/**
 * Initialize the application
 */
function init() {
    Geolocation.init();
    updateBadiDateDisplay();
    updateFooterYear();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
