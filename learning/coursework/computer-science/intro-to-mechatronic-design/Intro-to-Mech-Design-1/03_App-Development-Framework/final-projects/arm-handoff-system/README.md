# Arm Handoff Final Project (End-to-End)

This project starter gives you a complete implementation path from prototype firmware to demo-ready application.

## 1) Project Goal
Build a robotic handoff system that:
- detects object color with an RGB LED + sensor,
- classifies object color robustly,
- commands actuator states through shift-register outputs,
- logs classifications to a backend,
- displays run telemetry on a web dashboard.

## 2) System Architecture

```text
Sensor + RGB LED + MCU (Arduino)
        |
        | serial (USB) / optional BLE
        v
Python bridge service (local)
        |
        | REST
        v
FastAPI backend + SQLite/PostgreSQL
        |
        | JSON
        v
React/Next.js dashboard
```

## 3) Build Plan (Recommended Sequence)
1. **Firmware stabilization**
   - Compile and validate deterministic scan loop.
   - Replace `goto` with a finite-state loop.
   - Calibrate color thresholds with real measurements.
2. **Data bridge**
   - Create a Python script to parse serial output into structured events.
3. **Backend API**
   - Implement event ingest endpoint and recent-results endpoint.
4. **Dashboard**
   - Show live class counts, last N events, confidence trends.
5. **Demo hardening**
   - Add watchdog behavior and sensor-failure fallback.

## 4) Folder Guide
- `firmware/` → Arduino control code.
- `backend/` → API contracts and service notes.
- `web/` → frontend requirements and UI flow.
- `docs/` → timeline, risks, and validation plans.

## 5) Demo Checklist
- [ ] Hardware wired and verified pin mapping.
- [ ] Firmware compiles with zero errors.
- [ ] Color classification validated on 20+ trials per color.
- [ ] Telemetry visible in backend logs.
- [ ] Dashboard updates within 1–2 seconds.
- [ ] Short demo script rehearsed (2–3 min).

## 6) Success Metrics
- Classification accuracy target: $\geq 90\%$ on controlled lighting.
- End-to-end latency target: $\leq 2\,s$ from scan to dashboard update.
- Demo reliability: $\geq 95\%$ successful handoffs across 30 cycles.
