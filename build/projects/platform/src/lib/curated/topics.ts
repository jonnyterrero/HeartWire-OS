import type { TrackId } from "./index";

export type CuratedTopic = {
  id: string;
  name: string;
  track: TrackId;
  questionsRange?: string;
  subtopics: string;
};

export const CURATED_TOPICS: CuratedTopic[] = [
  // FE Electrical
  { id: "ee-math", name: "Mathematics", track: "fe-electrical", questionsRange: "11-17", subtopics: "Algebra/trig, complex numbers, calculus, ODEs, linear algebra" },
  { id: "ee-circuits", name: "Circuit Analysis (DC & AC)", track: "fe-electrical", questionsRange: "11-17", subtopics: "KCL/KVL, Thevenin/Norton, phasors, impedance, waveform analysis" },
  { id: "ee-power", name: "Power Systems", track: "fe-electrical", questionsRange: "8-12", subtopics: "Power factor, 3-phase, transformers, motors/generators, delta-wye" },
  { id: "ee-digital", name: "Digital Systems", track: "fe-electrical", questionsRange: "8-12", subtopics: "Boolean logic, logic gates, Karnaugh maps, flip-flops, state machines" },
  { id: "ee-electronics", name: "Electronics", track: "fe-electrical", questionsRange: "7-11", subtopics: "Diode/transistor models, op-amps, rectifiers, amplifiers" },
  { id: "ee-control", name: "Control Systems", track: "fe-electrical", questionsRange: "6-9", subtopics: "Block diagrams, Bode plots, stability, PID response" },
  { id: "ee-linear", name: "Linear Systems", track: "fe-electrical", questionsRange: "5-8", subtopics: "Laplace transforms, transfer functions, frequency/transient response" },
  { id: "ee-dsp", name: "Signal Processing", track: "fe-electrical", questionsRange: "5-8", subtopics: "Nyquist/aliasing, analog/digital filters, Z-transforms" },
  { id: "ee-comms", name: "Communications", track: "fe-electrical", questionsRange: "5-8", subtopics: "Fourier transforms, AM/FM/PCM modulation, multiplexing" },
  { id: "ee-econ", name: "Engineering Economics", track: "fe-electrical", questionsRange: "5-8", subtopics: "Time value of money, cost-benefit analysis" },
  { id: "ee-compsys", name: "Computer Systems", track: "fe-electrical", questionsRange: "5-8", subtopics: "Microprocessors, memory, interfacing" },
  { id: "ee-emag", name: "Electromagnetics", track: "fe-electrical", questionsRange: "4-6", subtopics: "Maxwell's equations, electrostatics, transmission lines" },
  { id: "ee-net", name: "Computer Networks", track: "fe-electrical", questionsRange: "4-6", subtopics: "OSI model, TCP/IP, LAN/WAN, network security" },
  { id: "ee-se", name: "Software Engineering", track: "fe-electrical", questionsRange: "4-6", subtopics: "Algorithms (Big-O), data structures, recursion, sorting" },

  // FE Mechanical
  { id: "me-dyn", name: "Dynamics, Kinematics & Vibrations", track: "fe-mechanical", questionsRange: "10-15", subtopics: "Particles & rigid body kinematics, Newton's 2nd law, free/forced vibrations" },
  { id: "me-fluids", name: "Fluid Mechanics", track: "fe-mechanical", questionsRange: "10-15", subtopics: "Bernoulli, internal/external flow, compressible flow, pumps/scaling laws" },
  { id: "me-thermo", name: "Thermodynamics", track: "fe-mechanical", questionsRange: "10-15", subtopics: "Laws of thermo, power cycles, HVAC, psychrometrics, combustion" },
  { id: "me-design", name: "Mechanical Design & Analysis", track: "fe-mechanical", questionsRange: "10-15", subtopics: "Machine element stress, failure theories, springs, bearings, GD&T" },
  { id: "me-statics", name: "Statics", track: "fe-mechanical", questionsRange: "9-14", subtopics: "Equilibrium, trusses/frames, centroids, moments of inertia" },
  { id: "me-mom", name: "Mechanics of Materials", track: "fe-mechanical", questionsRange: "9-14", subtopics: "Mohr's circle, bending/torsion/axial stress, column buckling" },
  { id: "me-mat", name: "Material Properties", track: "fe-mechanical", questionsRange: "7-11", subtopics: "Stress-strain diagrams, phase diagrams, fatigue/fracture, corrosion" },
  { id: "me-heat", name: "Heat Transfer", track: "fe-mechanical", questionsRange: "7-11", subtopics: "Conduction, convection, radiation, heat exchangers" },
  { id: "me-math", name: "Mathematics", track: "fe-mechanical", questionsRange: "6-9", subtopics: "Calculus, ODEs, numerical methods, linear algebra" },
  { id: "me-em", name: "Electricity & Magnetism", track: "fe-mechanical", questionsRange: "5-8", subtopics: "DC/AC circuit analysis, motors/generators" },
  { id: "me-controls", name: "Measurements & Controls", track: "fe-mechanical", questionsRange: "5-8", subtopics: "Sensors, block diagrams, dynamic system response" },

  // Biomedical interview
  { id: "bme-interview", name: "BME Behavioral / Design", track: "biomedical-interview", subtopics: "Device design process, FDA/IEC standards, case studies, quality systems" },
  { id: "bme-bioinf", name: "Bioinformatics & DNA algorithms", track: "biomedical-interview", subtopics: "Sequence alignment, k-mers, GC content, BLAST, HMMs" },
  { id: "bme-biomaterials", name: "Biomaterials & Biocompatibility", track: "biomedical-interview", subtopics: "Metals/polymers/ceramics, surface chemistry, ISO 10993" },
  { id: "bme-signals", name: "Biosignals & Instrumentation", track: "biomedical-interview", subtopics: "ECG/EEG filtering, sensor front-ends, sampling theorem" },
  { id: "bme-mechanics", name: "Biomechanics", track: "biomedical-interview", subtopics: "Tissue mechanics, implant loading, gait analysis" },

  // DSA
  { id: "dsa-arrays", name: "Arrays & Hashing", track: "dsa", subtopics: "Two pointers, sliding window, hash maps" },
  { id: "dsa-strings", name: "Strings", track: "dsa", subtopics: "Pattern matching, rolling hash, Rabin-Karp" },
  { id: "dsa-trees", name: "Trees & Graphs", track: "dsa", subtopics: "BFS, DFS, topological sort, union-find" },
  { id: "dsa-dp", name: "Dynamic Programming", track: "dsa", subtopics: "Memoization, tabulation, knapsack, LIS" },
  { id: "dsa-systems", name: "System Design", track: "dsa", subtopics: "Scalability, caching, consistency, load balancing" },
];
