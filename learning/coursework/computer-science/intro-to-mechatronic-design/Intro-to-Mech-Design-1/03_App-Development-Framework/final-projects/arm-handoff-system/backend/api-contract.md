# Backend API Contract (MVP)

## POST `/api/v1/events`
Ingest one classification event from serial bridge.

### Request JSON
```json
{
  "timestamp": "2026-04-26T18:20:00Z",
  "sensor": {"r": 512, "g": 478, "b": 301},
  "classification": "red",
  "confidence": 0.91,
  "device_id": "arm-handoff-01"
}
```

### Response JSON
```json
{
  "ok": true,
  "event_id": "evt_123"
}
```

## GET `/api/v1/events/recent?limit=25`
Returns recent event stream for dashboard.

### Response JSON
```json
{
  "events": [
    {
      "timestamp": "2026-04-26T18:20:00Z",
      "classification": "red",
      "confidence": 0.91,
      "sensor": {"r": 512, "g": 478, "b": 301}
    }
  ]
}
```

## GET `/api/v1/health`
Basic health endpoint for demo reliability checks.
