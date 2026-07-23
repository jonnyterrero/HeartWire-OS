# MASTER PLAN — CSWA + FE Electrical + ML/Hardware Pipeline
### Anchor: BME senior, FGCU, graduating Spring 2027 · FE sitting May 2027 · Built for HeartWire OS + Obsidian

> **Study budget (hard cap):** 2 self-study blocks/day — **05:00–08:00** and **21:00–23:00**. Plan targets **≤ 2.5 focused hrs/day (~14–18 hrs/week)** on top of coursework + powerlifting/BJJ. Everything below fits inside that.
>
> **Sequencing law:** CSWA is passed **before** any CSWP content. FE heavy-review starts **only after CSWP Segment 3**. The exception — and the highest-ROI move in this whole plan — is the **triple-overlap zones** below, which you start *now* because they pay off in FE **and** ML/Hardware **and** your BME coursework at once.

---

## 🔺 TRIPLE-OVERLAP ZONES — study these first, always

These topics appear in **≥ 2 of your 3 goals plus your BME coursework**. They are the only content you're allowed to work *before* their "official" phase, because every hour compounds three ways.

| Zone | FE EE domain | ML/Hardware use | BME course anchor | HeartWire Track |
|---|---|---|---|---|
| **Circuit Analysis (DC/AC/transient)** | Circuit Analysis (10–15 Q) | Sensor front-ends, ADC, PCB | Biomedical Instrumentation | Electrical Engineering |
| **Signals & Systems / DSP** | Linear Systems + Signal Processing (10–16 Q) | Feature extraction, edge ML preprocessing | Biomedical Signal Processing | Electrical Engineering |
| **Linear Algebra + Probability** | Mathematics + Prob/Stats (15–23 Q) | Core ML math (every model) | Neural Data Analysis | Mathematics |
| **Digital Systems / Embedded** | Digital Systems (7–11 Q) | MCU/FPGA inference, TinyML | Neural Signal Acquisition | EE + SWE/CS |

**Rule:** In every phase, ~30% of your non-CAD study hours go to a triple-overlap zone until FE. Nothing else has this leverage.

---

# PHASE 1 — NOW (Jul–Sep 2026): CSWA Foundation + Overlap Seeding

**Mission:** Reach CSWA sample-exam scores comfortably >70%. Seed triple-overlap circuits/math. Ship Portfolio Project #1 v0. **CSWP is forbidden this phase.**

**Primary resources (name-specific):**
- **CAD:** SOLIDWORKS built-in tutorials (Parts → Assemblies → Drawings) → *Official Certified SOLIDWORKS Associate (CSWA) Examination Guide*, David Planchard (SDC Publications) → **Official CSWA sample exam PDF** (solidworks.com/sw/docs) → YouTube: **GoEngineer** CSWA webinars, **CAD CAM Tutorials by MHKHERADMANDNIA**.
- **Overlap math/circuits:** *Practical Electronics for Inventors* (Scherz) OR **Khan Academy — Circuit Analysis**; **3Blue1Brown — Essence of Linear Algebra** (full series).
- **ML foundation:** **Andrew Ng — Machine Learning Specialization** (Coursera, Course 1 only this phase).

| Week Range | Goal | Daily Task | HeartWire Track | Obsidian Output | Hrs/Wk |
|---|---|---|---|---|---|
| **Jul 21–Aug 3** (W1–2) | CSWA: interface + sketching fluency | AM: SW built-in Parts tutorials; sketch relations/extrude/revolve drills | Biomedical + Mechanical Eng | `CSWA MOC`; atomic notes: "Sketch Relations", "Extrude vs Revolve" | 12 |
| **Jul 21–Aug 3** (overlap) | Overlap seed | PM (2×/wk): 3B1B Linear Algebra ch1–4; log as course | Mathematics | Lit note: "Linear Algebra — vectors/matrices as transforms" | 3 |
| **Aug 4–17** (W3–4) | CSWA: features (sweep/loft/patterns/fillets) | AM: part-modeling drills — 14/23 CSWA Q live here, highest leverage | Biomedical + Mechanical Eng | Atomic notes per feature; `CSWA/Part-Modeling` folder | 12 |
| **Aug 4–17** (overlap) | Overlap seed | PM (2×/wk): Khan Circuit Analysis — DC, Ohm/Kirchhoff, dividers | Electrical Engineering | "KCL/KVL cheat-note"; link → Instrumentation MOC | 3 |
| **Aug 18–31** (W5–6) | CSWA: mass props, materials, reference geometry | AM: mass-properties + coordinate-system problems (exact-answer style) | Biomedical + Mechanical Eng | "Mass Properties workflow" atomic note | 11 |
| **Aug 18–31** (ML) | ML foundation | PM (2×/wk): Andrew Ng ML Spec C1 (regression, gradient descent) | Software Eng + CS | "Gradient descent" lit note + code snippet block | 4 |
| **Sep 1–14** (W7–8) | CSWA: assemblies (5 Q) + standard mates | AM: build 2–3 multi-part assemblies (coincident/concentric/parallel/tangent) | Biomedical + Mechanical Eng | "Standard Mates" reference note | 11 |
| **Sep 1–14** (overlap) | Overlap seed | PM: Khan Circuit Analysis — AC, phasors, impedance | Electrical Engineering | "Phasors & impedance" atomic note | 3 |
| **Sep 15–28** (W9–10) | CSWA: drawings (4 Q) + **Practice Test #1** | AM: derive 2D views + annotations; **take Official CSWA sample exam** | Biomedical + Mechanical Eng | Log score in HeartWire FE/PE-style session; "CSWA weak-areas" note | 11 |
| **Sep 15–28** (portfolio) | Project #1 v0 | PM: spec **Wearable Biosignal Classifier** (ESP32 + ADC, ECG/EMG capture) | SWE/CS + EE | `Projects/P1-BioSignal` MOC + hardware BOM note | 4 |

### ✅ CHECKPOINT — do not enter Phase 2 until ALL true:
- [ ] Official **CSWA sample exam ≥ 80%** (margin over the 70% bar — it's whole-exam pass/fail).
- [ ] Part modeling, assemblies, and drawings each **self-scored ≥ 4/5** in HeartWire (log per category, like lifting RPE).
- [ ] Linear algebra ch1–8 + DC/AC circuit basics captured as **atomic notes** with a `#triple-overlap` tag in Obsidian.
- [ ] **P1 hardware ordered** (ESP32/Arduino, AD8232 ECG or MyoWare EMG sensor) and BOM note written.
- [ ] HeartWire shows **≥ 120 logged CSWA practice minutes/week** average across the phase.

---

# PHASE 2 — MID (Oct–Dec 2026): Pass CSWA → CSWP Bridge → Segments 1–2 + ML Ramp

**Mission:** **Sit and pass CSWA.** Bridge into CSWP tools, attack **Segments 1 & 2**. Ramp real ML (PyTorch). Keep overlap circuits/DSP warm. Open the job-application funnel.

**Primary resources:**
- **CSWP:** **GoEngineer CSWP Preparation guide** + *SOLIDWORKS CSWP* practice (3dengr.com breakdown); YouTube: **"What You Must Know Before Taking CSWP"**. Timed drills mandatory.
- **ML:** **Andrew Ng Deep Learning Specialization** (C1–C2) → **PyTorch** via *Deep Learning with PyTorch* (Stevens/Antiga) or **fast.ai Part 1**.
- **DSP overlap:** Steve Brunton (**"Data-Driven Science & Engineering"** YouTube) — Fourier/DSP playlists.
- **Careers:** clean GitHub, resume v1.

| Week Range | Goal | Daily Task | HeartWire Track | Obsidian Output | Hrs/Wk |
|---|---|---|---|---|---|
| **Oct 1–14** (W1–2) | **PASS CSWA** | AM: final timed full mocks → **schedule + sit CSWA** once mock ≥80% | Biomedical + Mechanical Eng | "CSWA — PASSED" milestone note; retro of weak Qs | 9 |
| **Oct 1–14** (ML) | ML ramp | PM: Ng DL Spec C1 (NN + backprop) | Software Eng + CS | "Backprop by hand" lit note | 5 |
| **Oct 15–31** (W3–4) | CSWP bridge tools | AM: link values/equations, multi-body (combine/split/delete), hole wizard, ribs, draft w/ neutral plane | Biomedical + Mechanical Eng | `CSWP MOC`; atomic note per new tool | 8 |
| **Oct 15–31** (overlap) | Overlap keep-warm | PM (2×/wk): Brunton Fourier/FFT + convolution | Electrical Engineering | "FFT & convolution" atomic note | 3 |
| **Oct 15–31** (career) | Funnel opens | 1×/wk: resume v1, GitHub README pass, LinkedIn "open to work" | Software Eng + CS | "Job-Search MOC" + target-company list | 2 |
| **Nov 1–14** (W5–6) | **CSWP Segment 1** (Part Mod, ~70 min) | AM: timed Seg-1 drills (no trial-and-error); attempt when consistent | Biomedical + Mechanical Eng | "CSWP Seg1" prep + attempt log in HeartWire | 8 |
| **Nov 1–14** (ML) | ML ramp | PM: Ng DL Spec C2 (regularization/optimization) + first PyTorch tensor notebook | Software Eng + CS | Code note: "PyTorch tensors & autograd" | 5 |
| **Nov 15–30** (W7–8) | **CSWP Segment 2** (Configs & Design Tables — zero CSWA overlap) | AM: dedicated configs + design-table block; timed drills | Biomedical + Mechanical Eng | "Configurations vs Design Tables" atomic note | 8 |
| **Nov 15–30** (portfolio) | P1 build | PM: ESP32 reads AD8232 ECG → serial; basic DSP filter in C++ | EE + SWE/CS | P1 build-log; "Sampling & Nyquist" note | 4 |
| **Dec 1–14** (W9–10) | CSWP Seg 1–2 consolidation / retake buffer | AM: re-attempt any failed segment (14-day rule) OR polish Seg 3 prep | Biomedical + Mechanical Eng | Update CSWP MOC with pass/fail per segment | 7 |
| **Dec 1–14** (ML) | Classic ML | PM: scikit-learn — train/test, CNN on 1D biosignal (PyTorch) | Software Eng + CS | "1D-CNN for biosignals" lit note | 5 |
| **Dec 15–31** (W11–13) | Overlap → FE on-ramp (triple-overlap only) | PM: NCEES **FE Reference Handbook** — locate Circuits/Math/Signals sections; Wasim Asghar circuits problems | EE + Mathematics | "FE Handbook nav map" note; `FE MOC` created | 7 |

### ✅ CHECKPOINT — do not enter Phase 3 until ALL true:
- [ ] **CSWA CERTIFIED** (certificate # logged as a HeartWire milestone).
- [ ] **CSWP Segment 1 passed** (or scheduled with a passing-level mock); Segment 2 attempted.
- [ ] **PyTorch competency:** you can build/train a small NN from scratch and explain backprop (note exists).
- [ ] **P1 hardware captures a real biosignal** and streams it (build-log + short clip).
- [ ] **FE Reference Handbook downloaded**, navigation map noted, `FE MOC` seeded; **resume v1 + clean GitHub live**.
- [ ] **First 5–10 job applications submitted** to new-grad 2027 ML/hardware reqs (see Goal 3 timeline).

---

# PHASE 3 — LATE (Jan–Mar 2027): CSWP Segment 3 → Close CADs → FE Heavy Ramp

**Mission:** Finish **CSWP Segment 3**, then hard-pivot to FE. This is the FE grind window. Ship Portfolio Project #2.

**Primary resources:**
- **CSWP Seg 3:** assemblies + interference/collision detection drills; GoEngineer Seg-3 walkthroughs.
- **FE EE (core):** **Wasim Asghar — *FE Electrical and Computer Review Manual*** (primary text) + ***FE Electrical and Computer Practice Problems*** (same author); **PrepFE** question bank (prepfe.com); **NCEES FE Reference Handbook** (navigation is a tested skill); YouTube: **Gregory Nazario**, **Ace Your FE Exam**.
- **ML/HW:** **TinyML** — *TinyML* (Warden/Situnayake) + **Edge Impulse** tutorials; **TensorFlow Lite for Microcontrollers**.

| Week Range | Goal | Daily Task | HeartWire Track | Obsidian Output | Hrs/Wk |
|---|---|---|---|---|---|
| **Jan 1–14** (W1–2) | **CSWP Segment 3** (Assemblies + interference, ~80 min) | AM: full-assembly drills + interference detection until automatic; attempt | Biomedical + Mechanical Eng | "CSWP Seg3" log; **"CSWP COMPLETE"** milestone on pass | 8 |
| **Jan 1–14** (FE) | FE Math + Prob/Stats | PM: Asghar Math + Prob/Stats chapters; PrepFE quiz sets | Mathematics | FE atomic notes; spaced-rep cards created | 6 |
| **Jan 15–31** (W3–4) | FE **Circuit Analysis** (triple-overlap — highest FE weight) | AM+PM: Asghar Circuits; 40+ PrepFE circuit problems; timed | Electrical Engineering | "FE Circuits formula sheet"; SR cards | 12 |
| **Feb 1–14** (W5–6) | FE **Linear Systems + Signal Processing** (triple-overlap) | AM: Asghar Linear Systems/DSP; Laplace, transfer fns, Fourier | Electrical Engineering | "Transfer functions & Bode" note; SR cards | 11 |
| **Feb 1–14** (portfolio) | Project #2 | PM: **PyTorch 1D-CNN arrhythmia classifier** on **PhysioNet MIT-BIH** → ONNX/TFLite export | Software Eng + CS | `Projects/P2-ECG-ML` MOC + results note | 4 |
| **Feb 15–28** (W7–8) | FE **Electronics + Digital Systems** (triple-overlap) | AM: Asghar Electronics + Digital; diodes/BJT/op-amps, logic/FSM | EE + SWE/CS | "Op-amp configs" + "FSM/K-map" notes; SR cards | 11 |
| **Feb 15–28** (HW) | Edge ML | PM: deploy P2 model to ESP32 via TFLite-Micro (link to P1 hardware) | EE + SWE/CS | "TFLite-Micro deploy" build-log | 4 |
| **Mar 1–14** (W9–10) | FE **Power + Electromagnetics + Control** | AM: Asghar Power/EM/Controls; PrepFE mixed sets | Electrical Engineering | Domain formula sheets; SR cards | 12 |
| **Mar 15–31** (W11–13) | FE **Comms + Networks + Computer/Software** + **Full Practice Exam #1** | AM: remaining domains; **take NCEES official FE practice exam (timed)** | EE + SWE/CS | "FE Practice Exam #1 — score + gap map" note | 12 |

### ✅ CHECKPOINT — do not enter Phase 4 until ALL true:
- [ ] **CSWP fully COMPLETE** (all 3 segments passed) — CAD track is now *closed*, zero further CAD hours.
- [ ] **All 18 FE EE domains touched at least once**; formula sheet exists per domain.
- [ ] **NCEES official FE practice exam taken once**, score + per-domain gap map logged in HeartWire FE/PE sessions.
- [ ] **Spaced-repetition deck live** (Obsidian SR plugin or Anki) with daily reviews logged in HeartWire **habit tracker**.
- [ ] **Project #2 trained + exported + running on-device**; **Project #3 scoped**.
- [ ] **Interview funnel active** — ≥ 20 applications out, ≥ 1 recruiter screen scheduled.

---

# PHASE 4 — FINAL (Apr–May 2027): FE Taper → Sit FE → Close Portfolio → Job Push

**Mission:** Peak for the **FE exam (~mid-May 2027)**. Land the offer. CAD is done; this phase is FE + interviews only.

**Primary resources:** Asghar practice-problem book (2nd pass on misses only), **PrepFE full-length exams**, **NCEES official practice exam** (2nd attempt), FE Reference Handbook speed-drills.

| Week Range | Goal | Daily Task | HeartWire Track | Obsidian Output | Hrs/Wk |
|---|---|---|---|---|---|
| **Apr 1–14** (W1–2) | FE weak-domain repair | AM+PM: target lowest 4 domains from gap map; redo missed problems | EE + Mathematics | Update "FE gap map"; SR intensive | 13 |
| **Apr 1–14** (portfolio) | Project #3 | 2×/wk: **FIR filter or NN-inference on FPGA (Verilog, Tang Nano)** OR quantized model on STM32; benchmark vs CPU | EE + SWE/CS | `Projects/P3-HW-Accel` MOC + benchmark note | 3 |
| **Apr 15–30** (W3–4) | FE full-length simulation | AM: **PrepFE full-length #1 (timed, 5.5h sim on a weekend)**; review every miss | Electrical Engineering | "Full Exam #2 — score/gaps" note | 13 |
| **May 1–7** (W5) | FE Reference-Handbook speed | AM: pure handbook-navigation drills (find any equation < 20s); **NCEES practice exam 2nd pass** | EE + Mathematics | "Handbook speed-drill" log | 12 |
| **May 8–14** (W6) | **Taper + SIT FE EXAM** | Light AM review, sleep priority, formula-sheet skim; **take FE** | Electrical Engineering | **"FE — SAT" milestone**; brain-dump note post-exam | 6 |
| **May 15–31** (W7–9) | Portfolio polish + job close | Finalize P1–P3 READMEs + demo videos; interview loops | Software Eng + CS | Portfolio site live; "Offers/decisions" note | 8 |

### ✅ CHECKPOINT — graduation-ready when ALL true:
- [ ] **FE Electrical & Computer exam SAT** (result pending/passed logged as milestone).
- [ ] **PrepFE + NCEES full-lengths ≥ target** (aim ≥ 70% on official practice before sitting).
- [ ] **3 portfolio projects shipped** with READMEs + demo clips, pinned on GitHub, linked from a portfolio site.
- [ ] **CSWA + CSWP both certified** and listed on resume/LinkedIn.
- [ ] **Active interview pipeline / offer in hand** for an ML/Hardware new-grad role.

---

# Goal 3 Detail — ML/Hardware Post-Grad Pipeline

### Target-role skill stack (entry-level ML/Hardware Engineer)
```
CORE ML        : Python ✓ | NumPy/Pandas ✓ | PyTorch ✗→ | scikit-learn ~ | CNN/RNN/Transformer theory ✗→
EDGE/HW ML     : TinyML/TFLite-Micro ✗→ | quantization ✗→ | Edge Impulse ✗→ | ONNX ✗→
HARDWARE       : Embedded C++ ✓ | MCU (ESP32/STM32) ~ | ADC/sensors ✗→ | FPGA/Verilog ✗→ | KiCad/PCB ~
SIGNAL/MATH    : Linear algebra ✗→ | Probability ✗→ | DSP/Fourier ✗→
SYSTEMS/OPS    : Git ✓ | Docker ✓ | Linux ~ | REST/backend ✓ | React Native ✓ (transferable UI)
```
`✓ have · ~ partial · ✗→ gap, addressed by this plan`

### Gap analysis (current → target)
| Have now | Gap to close | Where this plan closes it |
|---|---|---|
| Python, React Native, AI agents, embedded C++, Docker, backend | **PyTorch + DL theory** | Phase 2 (Ng DL Spec + PyTorch) |
| | **Edge/TinyML deployment** | Phase 3 (TFLite-Micro, Edge Impulse) |
| | **Formal DSP / linear algebra / probability** | Triple-overlap + FE ramp (Phases 1–3) |
| | **FPGA/HDL + digital design** | Phase 4 P3 + FE Digital Systems |
| | **Sensor/ADC hardware integration** | P1 (Phase 1–2) |

### 3 portfolio projects (ML + hardware integration)
1. **P1 — Wearable Biosignal Classifier** *(Phase 1→2):* ESP32/Arduino + AD8232 ECG (or MyoWare EMG) → on-device DSP filter → serial/BLE stream. *Proves:* embedded C++, ADC/sensors, sampling/DSP. Ties directly to **HeartWire** theme.
2. **P2 — ECG Arrhythmia ML Pipeline** *(Phase 3):* PyTorch 1D-CNN on **PhysioNet MIT-BIH** → ONNX/TFLite export → dashboard in your existing Next.js/React-Native stack. *Proves:* PyTorch, classical+deep ML, MLOps, full-stack.
3. **P3 — Hardware Accelerator** *(Phase 4):* FIR filter or quantized NN inference on **FPGA (Verilog, Tang Nano)** or **STM32**, benchmarked vs CPU. *Proves:* HDL/digital design, optimization, hardware depth. **P2 model + P1 hardware feed into P3 → one coherent "sense → classify → accelerate" story.**

### Job-application timeline
| When | Action | Deliverables ready |
|---|---|---|
| **Aug–Sep 2026** | Resume v1, clean GitHub, LinkedIn open-to-work | P1 v0 + resume |
| **Sep–Nov 2026** | **Apply to new-grad 2027 cohorts** (early cycles fill fast) | 1 project + resume |
| **Dec 2026–Feb 2027** | Continued apps + recruiter screens; portfolio site | 2 projects + site |
| **Mar–Apr 2027** | Interview loops; leetcode/system-design in HeartWire (LeetCode tracker) | 3 projects + certs |
| **May 2027** | Close offers post-FE | Full stack + FE sat |

**Target companies/roles:** *Hardware+ML:* NVIDIA, AMD, Qualcomm, Intel, Analog Devices, Texas Instruments, Apple (Hardware). *Edge-AI startups:* Edge Impulse, Syntiant, SiMa.ai. *MedTech (BME leverage):* Medtronic, Boston Scientific, Abbott, GE HealthCare. *Roles:* Embedded ML Engineer, Edge AI Engineer, Hardware Engineer (New Grad), ML Systems Engineer.

---

# 🎯 STACK READINESS SCORECARD (as of Jul 2026)

| Goal | Score | Gap analysis |
|---|:---:|---|
| **1 — CSWA Certification** | **6 / 10** | Strong prerequisite momentum (engineering senior, CAD-adjacent BME work), but no certified interface fluency yet. Part-modeling reps (14/23 Q) are the make-or-break; drawings/GD&T annotations typically the weakest new area. **Fastest goal to green** — realistically an 8–9/10 by Oct 2026. |
| **2 — FE Electrical Exam** | **4 / 10** | Biggest lift. Circuits/Signals overlap with BME coursework gives a real head start (→ high-priority domains), but FE spans **18 domains** including Power, Electromagnetics, Comms, Controls that BME barely touches. Reference-Handbook navigation speed is an untrained, tested skill. Requires the disciplined Jan–May grind + spaced repetition to reach a passing 7/10. |
| **3 — ML/Hardware Pipeline** | **5 / 10** | Excellent software base (Python, React Native, AI agents, embedded C++, Docker, backend) = ahead of most new grads on shipping. Gaps are **formal DL (PyTorch), edge/TinyML deployment, DSP, and FPGA/HDL**. Three integrated projects + BME/biosignal niche make you *differentiated*, not generic. Reaches 8/10 by graduation if P1–P3 ship on schedule. |

**Bottom line:** CSWA is a near-term certainty. ML/Hardware is your strongest strategic bet — lean into the biosignal niche where BME + embedded + ML converge (your unfair advantage). FE is the hard grind that must not be deferred past January — the triple-overlap seeding starting *this week* is what makes the compressed FE window survivable.

---
*Load milestones (CSWA, CSWP Seg 1/2/3, FE registration, FE sitting, P1–P3) into HeartWire OS as dated milestones with a dependency flag: CSWP-start → CSWA-complete. Log every session (CAD/FE/ML) as a tracked session with a per-category confidence score. Mirror all conceptual outputs into Obsidian as atomic notes under the MOCs named above.*
