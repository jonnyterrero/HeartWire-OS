# Dashboard Requirements (MVP)

## Core Views
1. **Live status card**
   - Last classified color
   - Last event timestamp
   - Device connection state
2. **Event stream table**
   - Timestamp, RGB, classification, confidence
3. **Aggregate chart**
   - Bar chart of class frequencies over selected time window
4. **Latency panel**
   - Moving average of sensor-to-UI update delay

## UX Requirements
- Update interval: 1 second polling (or WebSocket if available).
- Mobile-friendly layout for live demonstration.
- Color labels should include text + icon for accessibility.

## Acceptance Criteria
- Dashboard reflects newly ingested event within 2 seconds.
- No UI crash over 10 minutes of continuous updates.
- Clear “No data” fallback state when device offline.
