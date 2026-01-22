# BadiCalendar Backlog

## Product Requirements

**Vision:** A simple website that displays Bahá'í and Gregorian dates with sunset timing.

**Core Features:**
1. Bahá'í date (month, day, weekday, year B.E.) - updates at sunset
2. Gregorian date (day, month, year, weekday)
3. Current time (locale-aware: AM/PM vs 24hr based on country)
4. Countdown to next sunset

**Decisions:**
- Location: Auto-detect via browser geolocation, fallback to manual input if denied
- Time format: Based on user's locale (AM/PM for US, 24hr for Europe, etc.)
- Language: English only (for now)
- Platform: Web first, mobile app later

---

## Epics

### [ ] Epic 1: Website Foundation
Basic HTML/CSS structure and responsive design.

**Tasks:**
- [ ] Set up HTML structure
- [ ] Create CSS styling and layout
- [ ] Implement responsive design for mobile/tablet/desktop

### [ ] Epic 2: Location & Sunset Services
Get user location and calculate sunset times.

**Tasks:**
- [ ] Implement browser geolocation API integration
- [ ] Create fallback location input UI (for when permission denied)
- [ ] Integrate sunset time calculation (using coordinates)
- [ ] Build countdown timer to next sunset

### [ ] Epic 3: Gregorian Date & Time Display
Show current date and time in familiar format.

**Tasks:**
- [ ] Display current date (day, month, year, weekday)
- [ ] Display current time with locale-aware formatting
- [ ] Auto-update time display

### [ ] Epic 4: Bahá'í Calendar Display
Show Bahá'í date with proper sunset-based day transitions.

**Tasks:**
- [ ] Implement Bahá'í date calculation logic
- [ ] Display month, day, weekday name, year (B.E.)
- [ ] Trigger Bahá'í date update at sunset

---

## Future Considerations
- Multi-language support
- Mobile app (iOS/Android)
- Additional Bahá'í calendar features (Holy Days, Feast days, etc.)
