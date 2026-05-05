# Final Project Execution Plan

## Scope
Design, implement, and validate an autonomous color-based robotic handoff pipeline.

## Week-by-Week Plan

### Week 1 — Hardware + Firmware Baseline
- Wire LED, sensor, shift register, and actuator lines.
- Flash firmware and capture raw RGB readings for at least 4 classes (red, yellow, green, blue).
- Build first threshold table from measured distributions.

### Week 2 — Data + Backend
- Build Python serial bridge that parses `classified=<color>` lines.
- Store events in SQLite (or PostgreSQL if available).
- Implement REST endpoints from `backend/api-contract.md`.

### Week 3 — Dashboard + Integration
- Build dashboard with:
  - recent events table,
  - per-color counts,
  - confidence trend chart.
- Verify complete loop from sensor → dashboard.

### Week 4 — Validation + Demo Prep
- Run at least $N=30$ handoff cycles and log outcomes.
- Compute:
  - classification accuracy,
  - false positive rate,
  - end-to-end latency.
- Prepare demo script, fail-safe plan, and backup recording.

## Risk Register
1. **Lighting variance** → add shroud and calibration routine.
2. **Sensor drift** → baseline sample every 10 cycles.
3. **Serial disconnects** → auto-reconnect in bridge service.
4. **Mechanical mis-handoff** → add retry state with timeout.

## Deliverables
- Firmware (`firmware/arm-handoff-controller.ino`)
- API spec (`backend/api-contract.md`)
- Dashboard implementation (to be added)
- Final report with metrics and figures
