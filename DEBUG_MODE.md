# Debug Mode Documentation

The Badí' Calendar includes a debug mode that allows you to manually set the date and time for testing purposes.

## Usage

Open the browser console (F12) and use these commands:

### Set a custom date/time

```javascript
debugTime("2024-03-20 18:00:00")
```

This freezes time at the specified moment. All time-dependent features (countdown, date displays, sunset calculations) will use this time.

### Advance time by minutes

```javascript
advanceTime(30)  // Advance by 30 minutes
advanceTime(-15) // Go back 15 minutes
```

### Clear debug mode

```javascript
clearDebugTime()
```

This returns to real-time operation.

Alternatively, click the red debug indicator in the top-right corner to exit debug mode.

## URL Parameters

You can also activate debug mode via URL:

```
index.html?debugTime=2024-03-20T18:00:00
```

## Use Cases

- **Testing sunset transitions**: Set time to just before sunset to see the date change
- **Testing holy days**: Set date to a specific holy day to verify displays
- **Testing countdown**: Set time to various points before sunset
- **Testing date calculations**: Verify Bahá'í date calculations on specific dates

## Visual Indicator

When debug mode is active, a red indicator appears in the top-right corner showing:
- 🐛 DEBUG icon
- Current debug date/time

Click the indicator to exit debug mode.

## Technical Details

Debug mode works by overriding all `new Date()` calls in the application with a custom `DebugTime.now()` function that returns either:
- The debug date (when active)
- The real current date (when inactive)

This ensures all time-dependent features use the same time source.
