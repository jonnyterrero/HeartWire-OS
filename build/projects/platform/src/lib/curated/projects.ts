// Project ladders sourced from the workspace resource PDF.
// Each topic gets a beginner / intermediate / advanced project so you always
// know what to build next at your current skill level.

export type ProjectGroup =
  | "software-cs"
  | "ee"
  | "math"
  | "physics-chem"
  | "bme-mech";

export type ProjectLadder = {
  id: string;
  category: string;
  trackGroup: ProjectGroup;
  levels: {
    level: 1 | 2 | 3;
    title: string;
    description: string;
  }[];
};

export const PROJECT_GROUP_LABELS: Record<ProjectGroup, string> = {
  "software-cs": "Software Engineering + Computer Science",
  ee: "Electrical Engineering",
  math: "Mathematics",
  "physics-chem": "Physics + Chemistry",
  "bme-mech": "Biomedical / Mechanical Engineering",
};

export const PROJECT_LADDERS: ProjectLadder[] = [
  // === Mathematics ===
  {
    id: "math-linear-algebra",
    category: "Linear Algebra",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Matrix calculator", description: "Python/JS tool computing inverse, determinant, eigenvalues." },
      { level: 2, title: "Image compression with SVD", description: "Implement SVD on an image; show before/after." },
      { level: 3, title: "PCA from scratch", description: "Reduce dimensionality on MNIST or EEG data without using a prebuilt PCA library." },
    ],
  },
  {
    id: "math-logic-proofs",
    category: "Math Foundations / Logic / Proofs",
    trackGroup: "math",
    levels: [
      { level: 1, title: "10 proofs portfolio", description: "Direct, contrapositive, contradiction; pick problems from MIT 6.042J." },
      { level: 2, title: "Truth-table generator", description: "Parse a boolean expression and emit its full truth table." },
      { level: 3, title: "DPLL SAT solver", description: "Implement the Davis–Putnam–Logemann–Loveland algorithm in Python." },
    ],
  },
  {
    id: "math-prob-stats",
    category: "Probability & Statistics",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Coin/dice simulator", description: "Simulate Bayesian inference and the law of large numbers." },
      { level: 2, title: "Statistical dashboard", description: "Pull real data (weather, stocks) and visualize distributions, correlations, hypothesis tests." },
      { level: 3, title: "Monte Carlo engine", description: "Generic MC framework: importance sampling, MCMC, variance reduction." },
    ],
  },
  {
    id: "math-calculus",
    category: "Calculus / Multivariable",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Surface + gradient visualizer", description: "Plot 3D surfaces and gradient fields in matplotlib or three.js." },
      { level: 2, title: "Gradient descent optimizer", description: "Optimize a non-convex function and trace the path." },
      { level: 3, title: "Pendulum / mass-spring sim", description: "Lagrangian mechanics + ODE integration." },
    ],
  },
  {
    id: "math-odes",
    category: "Differential Equations",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Euler & RK4 solvers", description: "Compare convergence on a stiff and non-stiff problem." },
      { level: 2, title: "Predator-prey / logistic models", description: "Lotka-Volterra with phase portraits." },
      { level: 3, title: "Custom ODE library", description: "Adaptive step size, event detection, sensitivity analysis." },
    ],
  },
  {
    id: "math-pdes",
    category: "Partial Differential Equations",
    trackGroup: "math",
    levels: [
      { level: 1, title: "1D heat equation", description: "Forward/backward Euler with stability analysis." },
      { level: 2, title: "2D wave equation", description: "Animated visualization of wave propagation." },
      { level: 3, title: "Physics-Informed Neural Net (PINN)", description: "Solve a PDE by training a NN with the PDE residual as loss." },
    ],
  },
  {
    id: "math-discrete",
    category: "Discrete Math",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Graph traversal visualizer", description: "DFS / BFS step-by-step on a user-drawn graph." },
      { level: 2, title: "Combinatorics calculator", description: "Permutations, combinations, Catalan, Stirling, with explanations." },
      { level: 3, title: "Routing algorithm", description: "A* + Dijkstra with real OSM data." },
    ],
  },
  {
    id: "math-numerical",
    category: "Numerical Analysis",
    trackGroup: "math",
    levels: [
      { level: 1, title: "Numerical integration", description: "Trapezoid, Simpson, Gauss; compare error vs step size." },
      { level: 2, title: "Root-finding tools", description: "Bisection, Newton, secant with convergence plots." },
      { level: 3, title: "Lorenz attractor", description: "Simulate, study sensitivity to initial conditions, render animation." },
    ],
  },

  // === Software Engineering + CS ===
  {
    id: "cs-programming",
    category: "Programming Foundations",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "CLI calculator", description: "Python with operator precedence and unit tests." },
      { level: 2, title: "Unit-converter web app", description: "Vite + React, deploy to Vercel." },
      { level: 3, title: "API-driven dashboard", description: "Pull weather/crypto/finance data, charts, caching, auth." },
    ],
  },
  {
    id: "cs-dsa",
    category: "Data Structures & Algorithms",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Implement core DS", description: "Stack, queue, linked list, heap, hash map. Tests for each." },
      { level: 2, title: "Sorting visualizer", description: "Animate quicksort/mergesort/heapsort step-by-step." },
      { level: 3, title: "Pathfinding simulator", description: "A* + Dijkstra on a grid with obstacles + diagonals + weights." },
    ],
  },
  {
    id: "cs-architecture",
    category: "Computer Architecture",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Number-base converter", description: "Binary/hex/decimal with bitwise visualizations." },
      { level: 2, title: "ISA decoder", description: "Decode RISC-V or MIPS instructions from raw hex." },
      { level: 3, title: "Mini virtual machine", description: "Registers, memory, stack ops; run simple programs." },
    ],
  },
  {
    id: "cs-os",
    category: "Operating Systems",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Scheduler simulator", description: "FCFS, Round Robin, SJF; compare wait times." },
      { level: 2, title: "Memory allocator", description: "First-fit / best-fit / buddy with fragmentation metrics." },
      { level: 3, title: "Toy shell", description: "Pipes, redirection, job control, builtin commands." },
    ],
  },
  {
    id: "cs-networks",
    category: "Computer Networks",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Packet inspector", description: "Parse Ethernet/IP/TCP headers from a pcap file." },
      { level: 2, title: "Sockets chat app", description: "Multi-room IRC-style chat over raw TCP." },
      { level: 3, title: "TCP-like protocol", description: "Reliable transport on top of UDP: ACK, retransmit, congestion control." },
    ],
  },
  {
    id: "cs-frontend",
    category: "Frontend",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Responsive landing page", description: "Pure HTML/CSS, mobile-first." },
      { level: 2, title: "React component library", description: "Buttons, modals, forms, tables; Storybook docs." },
      { level: 3, title: "Full UI clone", description: "Spotify, Notion, or Netflix homepage with real interactions." },
    ],
  },
  {
    id: "cs-backend",
    category: "Backend",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "REST API", description: "Node + Express; CRUD on a JSON store; deploy to Vercel/Render." },
      { level: 2, title: "JWT authentication", description: "Refresh tokens, password hashing, RBAC." },
      { level: 3, title: "Microservices stack", description: "Postgres + Redis + queue worker; OpenAPI docs; Docker compose." },
    ],
  },
  {
    id: "cs-databases",
    category: "Databases",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Student CRUD app", description: "Postgres + Prisma; one-to-many; basic seed." },
      { level: 2, title: "Real-project schema", description: "Design + migrate a non-trivial schema (HeartWire, e-commerce, social)." },
      { level: 3, title: "ORM-like query builder", description: "Type-safe builder over raw SQL with migrations and a CLI." },
    ],
  },
  {
    id: "cs-devops",
    category: "DevOps",
    trackGroup: "software-cs",
    levels: [
      { level: 1, title: "Vercel/Netlify deploy", description: "Static site with custom domain and HTTPS." },
      { level: 2, title: "GitHub Actions CI/CD", description: "Test → build → deploy on every push." },
      { level: 3, title: "Dockerized full-stack", description: "Compose Postgres + API + Web; deploy to Fly.io or Railway." },
    ],
  },

  // === Electrical Engineering ===
  {
    id: "ee-circuits",
    category: "Circuits",
    trackGroup: "ee",
    levels: [
      { level: 1, title: "Ohm's Law calculator", description: "Includes resistor color-code decoder and series/parallel calculator." },
      { level: 2, title: "RC/RL transient simulator", description: "Numerically solve in Python; plot v(t), i(t)." },
      { level: 3, title: "Mini SPICE simulator", description: "Modified nodal analysis; DC + small-signal AC." },
    ],
  },
  {
    id: "ee-signals",
    category: "Signals & Systems",
    trackGroup: "ee",
    levels: [
      { level: 1, title: "Signal generator", description: "Sine/square/triangle/noise; export to WAV." },
      { level: 2, title: "Fourier transform visualizer", description: "Show time-domain signal and live FFT side-by-side." },
      { level: 3, title: "LTI system + convolution engine", description: "Convolve impulse response with input; pole/zero plot, step response." },
    ],
  },
  {
    id: "ee-dsp",
    category: "DSP",
    trackGroup: "ee",
    levels: [
      { level: 1, title: "Filter demo", description: "Low-pass / high-pass / band-pass on noisy signal; show frequency response." },
      { level: 2, title: "Audio equalizer", description: "Real-time EQ on mic input using WebAudio or Python." },
      { level: 3, title: "Real-time DSP chain", description: "Multi-stage pipeline (HP → notch → compressor) on an embedded MCU or Python with sounddevice." },
    ],
  },
  {
    id: "ee-control",
    category: "Control Theory",
    trackGroup: "ee",
    levels: [
      { level: 1, title: "PID simulation", description: "Tune P/I/D on a first-order plant; show overshoot, settling time." },
      { level: 2, title: "Cruise-control model", description: "Drag, slope, and disturbances; compare PID vs LQR." },
      { level: 3, title: "Quadrotor / robot-arm controller", description: "Cascade control, state estimation, simulation in PyBullet or Webots." },
    ],
  },
  {
    id: "ee-embedded",
    category: "Embedded Systems",
    trackGroup: "ee",
    levels: [
      { level: 1, title: "Blink + UART", description: "STM32 / Arduino: GPIO, timers, UART logging." },
      { level: 2, title: "Sensor + display project", description: "I2C/SPI sensor (BME280, MPU6050) → OLED display." },
      { level: 3, title: "RTOS-based device", description: "FreeRTOS tasks, queues, semaphores; instrumented with traces." },
    ],
  },

  // === Physics + Chemistry ===
  {
    id: "chem-general",
    category: "General / Inorganic Chemistry",
    trackGroup: "physics-chem",
    levels: [
      { level: 1, title: "Periodic-table explorer", description: "Click an element → properties, electron config, common reactions." },
      { level: 2, title: "Reaction balancer", description: "Parse a chemical equation and balance via linear algebra." },
      { level: 3, title: "Molecular orbital visualizer", description: "Interactive 3D orbitals; bond formation animations." },
    ],
  },
  {
    id: "chem-organic",
    category: "Organic Chemistry",
    trackGroup: "physics-chem",
    levels: [
      { level: 1, title: "Reaction-mechanism flashcards", description: "Spaced-repetition app for orgo I/II reactions." },
      { level: 2, title: "SMILES → 2D structure", description: "Parse SMILES; render with RDKit." },
      { level: 3, title: "Reaction outcome predictor", description: "Train a small ML model on USPTO reaction data." },
    ],
  },
  {
    id: "chem-biochem",
    category: "Biochemistry",
    trackGroup: "physics-chem",
    levels: [
      { level: 1, title: "Pathway map drawer", description: "Glycolysis / TCA / OxPhos as interactive diagrams." },
      { level: 2, title: "Enzyme kinetics calculator", description: "Michaelis-Menten + Lineweaver-Burk fits." },
      { level: 3, title: "Signaling pathway sim", description: "ODEs for a kinase cascade; sensitivity analysis." },
    ],
  },
  {
    id: "chem-thermo",
    category: "Thermodynamics",
    trackGroup: "physics-chem",
    levels: [
      { level: 1, title: "Ideal-gas calculator", description: "PV=nRT plus real-gas (van der Waals) corrections." },
      { level: 2, title: "Thermo diagrams", description: "PV / TS / HS plots for Carnot, Otto, Rankine cycles." },
      { level: 3, title: "Cycle simulator", description: "Heat engine / refrigeration with efficiency reporting and component-level losses." },
    ],
  },
  {
    id: "chem-phys",
    category: "Physical Chemistry",
    trackGroup: "physics-chem",
    levels: [
      { level: 1, title: "Particle in a box", description: "Visualize wavefunctions and energy levels for varying box sizes." },
      { level: 2, title: "Spectroscopy line simulator", description: "Hydrogen spectral series; vibrational/rotational spectra." },
      { level: 3, title: "Molecular dynamics", description: "LJ fluid in 2D; equilibrate and compute pair correlation function." },
    ],
  },

  // === Biomedical / Mechanical ===
  {
    id: "neuro-intro",
    category: "Intro Neuroscience",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "Neural anatomy flashcards", description: "Labeled diagrams + spaced repetition." },
      { level: 2, title: "Neural pathway simulator", description: "Visualize signal flow through a small circuit (e.g., reflex arc)." },
      { level: 3, title: "EEG band visualizer", description: "Stream EEG data; show alpha/beta/gamma power live." },
    ],
  },
  {
    id: "neuro-eng",
    category: "Neural Engineering",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "Spike sorter", description: "Threshold + PCA + k-means on synthetic data." },
      { level: 2, title: "Biosignal filter toolkit", description: "Butterworth, IIR, notch filters; ECG/EEG demo." },
      { level: 3, title: "Simple BCI", description: "P300 or motor-imagery classifier; closed-loop demo." },
    ],
  },
  {
    id: "neuro-acquisition",
    category: "Neural Signal Acquisition",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "Noise & filter sim", description: "Add 60Hz hum + EMG; recover with notch + bandpass." },
      { level: 2, title: "EEG/EMG Python toolkit", description: "Pull from PhysioNet; standard preprocessing." },
      { level: 3, title: "Real-time pipeline", description: "Arduino + Python: sample → filter → display in <100ms." },
    ],
  },
  {
    id: "neuro-analysis",
    category: "Neural Data Analysis",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "PSTH + raster plots", description: "Pull a public spike dataset and visualize." },
      { level: 2, title: "Decoder classifier", description: "SVM/kNN to decode movement direction from spike rates." },
      { level: 3, title: "Deep neural decoder", description: "CNN/RNN on raw or filtered traces; compare to classical decoders." },
    ],
  },
  {
    id: "bme-instrumentation",
    category: "Biomedical Instrumentation",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "PPG heart-rate detector", description: "Phone camera or pulse sensor → BPM with noise rejection." },
      { level: 2, title: "Gait analysis classifier", description: "Phone IMU; segment + classify normal vs abnormal gait." },
      { level: 3, title: "Wearable symptom tracker", description: "Custom Arduino + sensors; on-device ML (TensorFlow Lite Micro)." },
    ],
  },
  {
    id: "mech-statics",
    category: "Mechanical Statics & Mechanics of Materials",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "Truss solver", description: "Method-of-joints solver with visualization." },
      { level: 2, title: "Beam stress calculator", description: "Bending/shear diagrams + Mohr's circle for any cross-section." },
      { level: 3, title: "FEA from scratch (1D)", description: "Linear FEA for axial bars; compare to analytical." },
    ],
  },
  {
    id: "mech-thermo",
    category: "Mechanical Thermodynamics & Fluids",
    trackGroup: "bme-mech",
    levels: [
      { level: 1, title: "Otto/Diesel cycle calculator", description: "Compute efficiency, work, heat at each state." },
      { level: 2, title: "Pipe-flow solver", description: "Darcy-Weisbach; pump curves; system curve intersection." },
      { level: 3, title: "Heat exchanger sizing", description: "Effectiveness-NTU and LMTD methods with optimization." },
    ],
  },
];
