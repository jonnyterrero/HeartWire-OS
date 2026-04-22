import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Full seed script — populates tracks, courses, and resources
 * matching the 5amClub workspace resource guide.
 *
 * Run with: npm run db:seed
 *
 * IMPORTANT: Replace USER_ID with your actual Supabase auth user ID.
 * Find it in Supabase Dashboard → Auth → Users after first login.
 */
const USER_ID = "e97402fe-6766-4041-8337-2c5f64aa2af7";

// ─── Types ─────────────────────────────────────────────────
type ResourceSeed = {
  title: string;
  type: "BOOK" | "VIDEO" | "ARTICLE" | "COURSE";
  url: string;
};

type CourseSeed = {
  title: string;
  code: string;
  resources?: ResourceSeed[];
};

type TrackSeed = {
  title: string;
  color: string;
  description?: string;
  courses: CourseSeed[];
};

// ─── Seed Data ─────────────────────────────────────────────
const seedData: TrackSeed[] = [
  // ═══════════════════════════════════════════════════════════
  // BIOMEDICAL ENGINEERING
  // ═══════════════════════════════════════════════════════════
  {
    title: "Biomedical Engineering",
    color: "blue",
    description: "Core BME major — biomaterials, instrumentation, imaging, product design",
    courses: [
      {
        title: "Biomaterials",
        code: "BME 310",
        resources: [
          { title: "MIT OCW — Biomaterials/Tissue Interactions", type: "COURSE", url: "https://ocw.mit.edu/courses/2-79j-biomaterials-tissue-interactions-fall-2022/" },
          { title: "Biomedical Engineering — From Theory to Applications (IntechOpen)", type: "BOOK", url: "https://www.intechopen.com/books/2241" },
        ],
      },
      { title: "Biomechanics", code: "BME 320" },
      {
        title: "Biomedical Instrumentation",
        code: "BME 330",
        resources: [
          { title: "Bio-Medical Instrumentation (Bharath University PDF)", type: "BOOK", url: "https://www.bharathuniv.ac.in/colleges1/downloads/courseware_eee/Notes/NE2/BEE007%20BIO%20MEDICAL%20INSTRUMENTATION.pdf" },
          { title: "Biomedical Instrumentation — SIC1311 (Sathyabama)", type: "BOOK", url: "https://sist.sathyabama.ac.in/sist_coursematerial/uploads/SIC1311.pdf" },
          { title: "Medical Instrumentation Basics (MSU ECE 445)", type: "ARTICLE", url: "https://www.egr.msu.edu/classes/ece445/mason/Files/2-Basics_ch1.pdf" },
          { title: "PEC303: Biomedical Signal Processing (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLeefXVKiX48rcnK0TentV2rXrQoIhuqpy" },
        ],
      },
      { title: "Transport Phenomena", code: "BME 340" },
      { title: "Medical Imaging", code: "BME 450" },
      {
        title: "Bioengineering Product Design",
        code: "BME 490",
        resources: [
          { title: "Stanford Biodesign — Student Guide", type: "COURSE", url: "https://biodesign.stanford.edu/resources/learning/student-guide-to-biodesign.html" },
          { title: "Biomedical Engineering Stanford Course (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLAE4A9DB84AC5F823" },
        ],
      },
      {
        title: "Tissue Engineering",
        code: "BME 460",
        resources: [
          { title: "Tissue Engineering Playlist (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLhEKy-73Kz9kW1tuoWJDvCZifFsDN5ePm" },
          { title: "NextGenTERC — Tissue Engineering Resources", type: "ARTICLE", url: "https://www.nextgenterc.com/" },
        ],
      },
      { title: "Intro to Mechanical Design", code: "ME 270" },
      { title: "Human Physiology", code: "BME 350" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ELECTRICAL ENGINEERING
  // ═══════════════════════════════════════════════════════════
  {
    title: "Electrical Engineering",
    color: "yellow",
    description: "Circuits, signals & systems, electronics, embedded systems, communications",
    courses: [
      {
        title: "Circuits I",
        code: "ECE 201",
        resources: [
          { title: "All About Circuits — Free Textbook", type: "BOOK", url: "https://www.allaboutcircuits.com/textbook/" },
          { title: "DC Electrical Circuit Analysis (Open Textbook)", type: "BOOK", url: "https://open.umn.edu/opentextbooks/textbooks/884" },
          { title: "DC Electrical Circuit Analysis (PDF)", type: "BOOK", url: "https://www.dissidents.com/resources/DCElectricalCircuitAnalysis.pdf" },
          { title: "DC Circuit Analysis Playlist (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLdnqjKaksr8qQ9w3XY5zFXQ2H-zXQFMlI" },
          { title: "MIT 6.002 Circuits and Electronics", type: "VIDEO", url: "https://www.youtube.com/watch?v=AfQxyVuLeCs" },
          { title: "FET — Circuit Analysis and Design (UMich)", type: "COURSE", url: "https://fet.engin.umich.edu" },
        ],
      },
      {
        title: "Circuits II",
        code: "ECE 202",
        resources: [
          { title: "Electric Circuits II — Saher Albatran (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLvgLolfaRAWdMQxSlGTwIRAFg_qHOZMW4" },
          { title: "Electronic Circuits Playlist (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL0o_zxa4K1BV9E-N8tSExU1djL6slnjbL" },
        ],
      },
      {
        title: "Signals & Systems",
        code: "ECE 301",
        resources: [
          { title: "Signals and Systems — Michael Adams (UVic, free textbook)", type: "BOOK", url: "https://www.ece.uvic.ca/~mdadams/sigsysbook/" },
          { title: "Signals and Systems — Oppenheim (PDF)", type: "BOOK", url: "https://www.cedric-richard.fr/assets/files/Signals_and_Systems_2nd_Edition_by_Oppen.pdf" },
          { title: "Signals and Systems — Schaum's Outline (Hwei Hsu, PDF)", type: "BOOK", url: "https://electronicsbookcafe.files.wordpress.com/2015/08/signals-and-systems-2nd-edition-schaums-outline-series-hwei-hsu.pdf" },
          { title: "Signals and Systems — Simon Haykin (PDF)", type: "BOOK", url: "https://studentshubblog.files.wordpress.com/2014/12/signals-and-systems-simon-haykin.pdf" },
          { title: "Signals and Systems — Neso Academy (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO" },
          { title: "MIT Signals and Systems (YouTube)", type: "VIDEO", url: "https://www.youtube.com/watch?v=-FHm2pQmiSM" },
          { title: "Signals and Systems — TutorialsPoint (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLWPirh4EWFpHr_1ZCkuF9ToYUrmujv9Aa" },
          { title: "Signals and Systems for Bioengineers (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLyCKmxwCo5RmZRgxQrDD2sTfxlnu0tlx9" },
          { title: "MATLAB for Signals and Systems (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLcumQJsBYq9F5F07p2vUmBGdaI9ajsZOf" },
        ],
      },
      {
        title: "Analog Electronics",
        code: "ECE 310",
        resources: [
          { title: "Foundations of Analog and Digital Electronic Circuits (PDF)", type: "BOOK", url: "https://neurophysics.ucsd.edu/courses/physics_120/Agarwal%20and%20Lang%20(2005)%20Foundations%20of%20Analog%20and%20Digital.pdf" },
          { title: "Lecture Notes for Analog Electronics (UOregon)", type: "ARTICLE", url: "https://pages.uoregon.edu/rayfrey/AnalogNotes.pdf" },
          { title: "Basic Electronics Course (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLFF553CED56CDE25D" },
        ],
      },
      {
        title: "Embedded Systems",
        code: "ECE-SS",
        resources: [
          { title: "Modern Embedded Programming Course (GitHub)", type: "COURSE", url: "https://github.com/QuantumLeaps/modern-embedded-programming-course" },
          { title: "ARM Embedded Systems Fundamentals (GitHub)", type: "COURSE", url: "https://github.com/arm-university/Embedded-Systems-Fundamentals" },
          { title: "Brown University Embedded Systems Class", type: "COURSE", url: "https://brown-cs1600.github.io" },
          { title: "How to Learn Modern Embedded Systems (GitHub)", type: "ARTICLE", url: "https://github.com/joaocarvalhoopen/How_to_learn_modern_Embedded_Systems" },
        ],
      },
      {
        title: "Communication Systems",
        code: "ECE 320",
        resources: [
          { title: "Communication Systems — AKH (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLGtVq7DEEogZk2DPF5muPRV4p9Q4-UIy5" },
          { title: "MIT Intro to Electric Power Systems", type: "COURSE", url: "https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/pages/readings/" },
        ],
      },
      { title: "Control Theory", code: "ECE 330" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHEMISTRY
  // ═══════════════════════════════════════════════════════════
  {
    title: "Chemistry",
    color: "green",
    description: "Chemistry minor — organic, biochem, physical, analytical, inorganic",
    courses: [
      {
        title: "Organic Chemistry I",
        code: "CHEM 261",
        resources: [
          { title: "Organic Chemistry — OpenStax (LibreTexts)", type: "BOOK", url: "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(OpenStax)" },
          { title: "Organic Chemistry with Biological Emphasis", type: "BOOK", url: "https://open.umn.edu/opentextbooks/textbooks/organic-chemistry-with-a-biological-emphasis-volume-i" },
          { title: "Crash Course Organic Chemistry (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtONguuhLdVmq0HTKS0jksS4" },
          { title: "Freshman Organic Chemistry — Yale (McBride)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL3F629F73640F831D" },
        ],
      },
      {
        title: "Organic Chemistry II",
        code: "CHEM 262",
        resources: [
          { title: "Freshman Organic Chemistry II — Yale (McBride)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLB572BA3ED0F700F1" },
          { title: "The Organic Chemistry Tutor (YouTube)", type: "VIDEO", url: "https://www.youtube.com/channel/UCEWpbFLzoYGPfuWUMFPSaoA" },
          { title: "Interactive Orgo Practice (carbonate-plus, GitHub)", type: "ARTICLE", url: "https://github.com/csvoss/carbonate-plus" },
        ],
      },
      {
        title: "Biochemistry",
        code: "CHEM 380",
        resources: [
          { title: "Biochemistry Free for All (Oregon State)", type: "BOOK", url: "https://biochem.oregonstate.edu/undergraduate/educational-resources" },
          { title: "Professor Dave — Biochemistry Playlist (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9Fazvaf8unWl9J2soXCAvy4" },
          { title: "Kevin Ahern's BB 350 Biochemistry (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL74ED4174166F94A8" },
          { title: "MIT 7.05 General Biochemistry (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP62wNcIMfinU64CAfreShjpt" },
        ],
      },
      {
        title: "Physical Chemistry I",
        code: "CHEM 370",
        resources: [
          { title: "Physical Chemistry I — Thermodynamics (Prof Derricotte)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLYHaXvNA5Jrf_z0xbYhlzv0leoGBXHhll" },
          { title: "MIT 5.60 Thermodynamics & Kinetics (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLA62087102CC93765" },
          { title: "Castellan — Physical Chemistry (PDF)", type: "BOOK", url: "https://biopchem.education/wp-content/uploads/2018/02/castellan_physical_chemistry_3rd_ed.pdf" },
          { title: "Chemistry LibreTexts — Physical Chemistry", type: "BOOK", url: "https://chem.libretexts.org/" },
        ],
      },
      {
        title: "Physical Chemistry II",
        code: "CHEM 371",
        resources: [
          { title: "Physical Chem II — Quantum Mechanics & Spectroscopy (Prof Derricotte)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLYHaXvNA5JrevMbLhoazFQbDdw8pfCm-O" },
          { title: "MIT 5.61 Physical Chemistry (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP62RsEHXe48Imi9-87FzQaJg" },
        ],
      },
      {
        title: "Analytical Chemistry",
        code: "CHEM 330",
        resources: [
          { title: "Analytical Chemistry Lectures Playlist (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLfR17zX97Yimn1O2gbxkv4z0QN4Cs1xzt" },
        ],
      },
      {
        title: "Inorganic Chemistry",
        code: "CHEM 340",
        resources: [
          { title: "Inorganic/Organometallic Chemistry — Professor Dave (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9GlYQJWEhxOBtNXH5DKeNsN" },
          { title: "MIT 5.111 Principles of Chemical Science (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63LOmB3_O0xbgZVZibxj4rb" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // MATHEMATICS
  // ═══════════════════════════════════════════════════════════
  {
    title: "Mathematics",
    color: "purple",
    description: "Mathematics minor — linear algebra, DiffEq, PDEs, probability, discrete math, numerical methods",
    courses: [
      {
        title: "Linear Algebra",
        code: "MATH 270",
        resources: [
          { title: "MIT 18.06SC Linear Algebra (Gilbert Strang)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL221E2BBF13BECF6C" },
          { title: "Linear Algebra Full Course — Dr. Trefor Bazett", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLHXZ9OQGMqxfUl0tcqPNTJsb7R6BqSLo6" },
          { title: "MIT 18.065 Matrix Methods in Data Analysis", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63oMNUHXqIUcrkS2PivhN3k" },
        ],
      },
      {
        title: "Differential Equations",
        code: "MATH 266",
        resources: [
          { title: "MIT 18.03 Differential Equations (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLEC88901EBADDD980" },
          { title: "Paul's Online Math Notes — Differential Equations", type: "ARTICLE", url: "https://tutorial.math.lamar.edu" },
        ],
      },
      {
        title: "Partial Differential Equations",
        code: "MATH 420",
        resources: [
          { title: "PDEs — Faculty of Khan (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLdgVBOaXkb9Ab7UM8sCfQWgdbzxkXTNVD" },
          { title: "Engineering Math: Vector Calc & PDEs — Steve Brunton", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLMrJAkhIeNNQromC4WswpU1krLOq5Ro6S" },
          { title: "PDEs — commutant (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLF6061160B55B0203" },
        ],
      },
      {
        title: "Probability & Statistics",
        code: "MATH 360",
        resources: [
          { title: "MIT 6.041 Probabilistic Systems Analysis", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP61MdtwGTqZA0MreSaDybji8" },
          { title: "MIT RES.6-012 Introduction to Probability", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP60hI9ATjSFgLZpbNJ7myAg6" },
          { title: "Probability Bootcamp — Steve Brunton", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLMrJAkhIeNNR3sNYvfgiKgcStwuPSts9V" },
          { title: "Harvard Statistics 110: Probability", type: "COURSE", url: "https://projects.iq.harvard.edu/stat110/home" },
          { title: "Probability & Random Processes for EE (Leon-Garcia, PDF)", type: "BOOK", url: "https://convexoptimization.com/TOOLS/Leon-Garcia.pdf" },
        ],
      },
      {
        title: "Numerical Methods",
        code: "MATH 340",
        resources: [
          { title: "Numerical Analysis — StudySession (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLDea8VeK4MUTppAXQzHBNz3KiyEd9SQms" },
          { title: "Numerical Methods — Neso Academy (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhoF3cPp0mgOZPuXeu84nAd" },
        ],
      },
      {
        title: "Discrete Math",
        code: "MATH 250",
        resources: [
          { title: "Discrete Mathematics — Neso Academy (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3" },
          { title: "MIT 6.042J Mathematics for Computer Science", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLB7540DEDD482705B" },
          { title: "Logic and Proofs — Discrete Math Videos", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL-VBs-MiT7rO0mBGFCDZlXDAfv0hogq0y" },
        ],
      },
      { title: "Calculus I", code: "MATH 151" },
      { title: "Calculus II", code: "MATH 152" },
      { title: "Calculus III", code: "MATH 253" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // COMPUTER SCIENCE
  // ═══════════════════════════════════════════════════════════
  {
    title: "Computer Science",
    color: "orange",
    description: "Self-study CS — DSA, OS, architecture, networks",
    courses: [
      {
        title: "Data Structures & Algorithms",
        code: "CS 201",
        resources: [
          { title: "LeetCode", type: "ARTICLE", url: "https://leetcode.com" },
          { title: "HackerRank", type: "ARTICLE", url: "https://www.hackerrank.com" },
          { title: "Project Euler (Math + CS)", type: "ARTICLE", url: "https://projecteuler.net" },
        ],
      },
      {
        title: "Operating Systems",
        code: "CS 310",
        resources: [
          { title: "Fundamentals of Operating Systems — Mitch Davis", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLW1yb8L3S1ngGmtKlI5XYcTNQQ1r3xZvq" },
        ],
      },
      {
        title: "Computer Architecture",
        code: "CS 320",
        resources: [
          { title: "Computer Organization & Architecture — Neso Academy", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q" },
          { title: "Digital Design & Computer Architecture — ETH Zürich", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL5Q2soXY2Zi9Eo29LMgKVcaydS7V1zZW3" },
          { title: "Nand2Tetris", type: "COURSE", url: "https://www.nand2tetris.org/" },
        ],
      },
      {
        title: "Compiler Design",
        code: "CS 330",
        resources: [
          { title: "Compiler Design — Neso Academy", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjT3oJxFXRgjPNzeS-LFY-q" },
        ],
      },
      { title: "Computer Networks", code: "CS 340" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SOFTWARE ENGINEERING / FULL-STACK
  // ═══════════════════════════════════════════════════════════
  {
    title: "Software Engineering",
    color: "cyan",
    description: "Full-stack development — React, Next.js, Node, databases, DevOps",
    courses: [
      {
        title: "Full-Stack Development",
        code: "SE-FS",
        resources: [
          { title: "Full Stack Open (University of Helsinki)", type: "COURSE", url: "https://fullstackopen.com/" },
          { title: "CS50 Web Programming (Harvard)", type: "COURSE", url: "https://cs50.harvard.edu/web/" },
          { title: "Eloquent JavaScript", type: "BOOK", url: "https://eloquentjavascript.net/" },
          { title: "Codevolution (YouTube)", type: "VIDEO", url: "https://www.youtube.com/@Codevolution" },
          { title: "Project-Based Learning (GitHub)", type: "ARTICLE", url: "https://github.com/practical-tutorials/project-based-learning" },
        ],
      },
      {
        title: "React",
        code: "SE-REACT",
        resources: [
          { title: "Road to React (free chapters)", type: "BOOK", url: "https://www.roadtoreact.com/" },
          { title: "shadcn/ui", type: "ARTICLE", url: "https://ui.shadcn.com/" },
          { title: "TanStack Query", type: "ARTICLE", url: "https://tanstack.com/query" },
          { title: "React Hook Form", type: "ARTICLE", url: "https://react-hook-form.com/" },
          { title: "Awesome React Components (GitHub)", type: "ARTICLE", url: "https://github.com/brillout/awesome-react-components" },
        ],
      },
      {
        title: "Next.js",
        code: "SE-NEXT",
        resources: [
          { title: "Tailwind CSS", type: "ARTICLE", url: "https://tailwindcss.com/" },
          { title: "Prisma ORM", type: "ARTICLE", url: "https://www.prisma.io/" },
          { title: "NextAuth.js / Auth.js", type: "ARTICLE", url: "https://authjs.dev/" },
          { title: "Awesome Next.js (GitHub)", type: "ARTICLE", url: "https://github.com/unicodeveloper/awesome-nextjs" },
        ],
      },
      {
        title: "Node.js / Backend",
        code: "SE-NODE",
        resources: [
          { title: "Express.js", type: "ARTICLE", url: "https://expressjs.com/" },
          { title: "Socket.io", type: "ARTICLE", url: "https://socket.io/" },
        ],
      },
      {
        title: "Python / Django / FastAPI",
        code: "SE-PY",
        resources: [
          { title: "Django", type: "ARTICLE", url: "https://www.djangoproject.com/" },
          { title: "FastAPI", type: "ARTICLE", url: "https://fastapi.tiangolo.com/" },
          { title: "Automate the Boring Stuff with Python", type: "BOOK", url: "https://automatetheboringstuff.com/" },
        ],
      },
      {
        title: "SQL / Databases",
        code: "SE-SQL",
        resources: [
          { title: "Prisma (multi-DB ORM)", type: "ARTICLE", url: "https://www.prisma.io/" },
          { title: "SQLAlchemy (Python)", type: "ARTICLE", url: "https://www.sqlalchemy.org/" },
          { title: "Use The Index Luke — SQL Tuning", type: "BOOK", url: "https://use-the-index-luke.com/sql/" },
        ],
      },
      {
        title: "TypeScript",
        code: "SE-TS",
        resources: [
          { title: "TypeScript Handbook", type: "BOOK", url: "https://www.typescriptlang.org/docs/handbook/" },
          { title: "fp-ts (Functional Programming)", type: "ARTICLE", url: "https://gcanti.github.io/fp-ts/" },
          { title: "Awesome TypeSafe (GitHub)", type: "ARTICLE", url: "https://github.com/jellydn/awesome-typesafe" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // AI / MACHINE LEARNING
  // ═══════════════════════════════════════════════════════════
  {
    title: "AI / Machine Learning",
    color: "pink",
    description: "Self-study AI/ML — classical ML, deep learning, agents",
    courses: [
      { title: "Machine Learning", code: "AI-ML" },
      { title: "Deep Learning", code: "AI-DL" },
      { title: "AI Agents & Tools", code: "AI-AGT" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // NEUROSCIENCE / NEURAL ENGINEERING
  // ═══════════════════════════════════════════════════════════
  {
    title: "Neuroscience / Neural Engineering",
    color: "indigo",
    description: "Self-study — neuroscience foundations, computational neuro, neural engineering",
    courses: [
      {
        title: "Intro to Neuroscience",
        code: "NEURO 101",
        resources: [
          { title: "MIT 9.13 The Human Brain (YouTube)", type: "VIDEO", url: "https://www.youtube.com/watch?v=ba-HMvDn_vU&list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_5-hM" },
          { title: "Crash Course Neuroscience (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLOA0aRJ90NxuIgOC9YGRUT4Y-CsP12bsS" },
          { title: "Stanford Neuroscience Course (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLtdr2qSB8H94jFZJUwk99gPgK2Utv8RR1" },
          { title: "Introduction to Neuroscience (Open Textbook)", type: "BOOK", url: "https://open.umn.edu/opentextbooks/textbooks/1303" },
          { title: "Neuroscience Online (UT Health)", type: "BOOK", url: "https://nba.uth.tmc.edu/neuroscience/" },
          { title: "OpenStax Behavioral Neuroscience", type: "BOOK", url: "https://openstax.org/details/books/introduction-behavioral-neuroscience" },
          { title: "Harvard Fundamentals of Neuroscience Part 1", type: "COURSE", url: "https://pll.harvard.edu/course/fundamentals-neuroscience-part-1-electrical-properties-neuron" },
          { title: "Coursera — Understanding the Brain (UChicago)", type: "COURSE", url: "https://www.coursera.org/learn/neurobiology" },
        ],
      },
      {
        title: "Computational Neuroscience",
        code: "NEURO 201",
        resources: [
          { title: "Computational Cognitive Neuroscience (textbook + code, GitHub)", type: "BOOK", url: "https://github.com/CompCogNeuro/book" },
          { title: "Computational Neuroscience Textbook (Greene)", type: "BOOK", url: "https://mrgreene09.github.io/computational-neuroscience-textbook/" },
          { title: "MIT Introduction to Neural Computation (OCW)", type: "COURSE", url: "https://ocw.mit.edu/courses/9-40-introduction-to-neural-computation-spring-2018/pages/lecture-notes/" },
          { title: "Open Computational Neuroscience Resources (GitHub)", type: "ARTICLE", url: "https://github.com/asoplata/open-computational-neuroscience-resources" },
        ],
      },
      {
        title: "Neural Engineering",
        code: "NEURO 301",
        resources: [
          { title: "Neural Engineering (Eliasmith & Anderson, full PDF)", type: "BOOK", url: "https://compneuro.uwaterloo.ca/files/Eliasmith.Anderson.2003.Neural.Engineering.Full.Book.pdf" },
          { title: "Neural Signal Processing — Zero to Hero (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PL6Q1zmN6V-zF3gWS1aXIX7fT5oMnmCyRV" },
          { title: "Nengo and Neural Engineering Framework (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLX-XEf1yTMrnjFt30RQ7X6k-dfhL1fIGq" },
        ],
      },
      {
        title: "Neural Signal Processing",
        code: "NEURO 310",
        resources: [
          { title: "Biomedical Signal Processing — MATLAB (GitHub)", type: "ARTICLE", url: "https://github.com/mendes-davi/biomedical-signal-processing" },
          { title: "Biomedical Signal Processing — Python (GitHub)", type: "ARTICLE", url: "https://github.com/parvathi25/Biomedical-Signal-Processing" },
          { title: "Open BSP — PhysioNet/WFDB Tutorials", type: "ARTICLE", url: "https://peterhcharlton.github.io/post/open_bsp/" },
        ],
      },
      { title: "Neural Signal Acquisition", code: "NEURO 311" },
      { title: "Neuro Sensory Engineering", code: "NEURO 320" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ENGINEERING MECHANICS
  // ═══════════════════════════════════════════════════════════
  {
    title: "Engineering Mechanics",
    color: "red",
    description: "Statics, dynamics, strength of materials",
    courses: [
      { title: "Statics", code: "ME 201" },
      { title: "Dynamics", code: "ME 202" },
      { title: "Strength of Materials", code: "ME 310" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHYSICS & GENERAL
  // ═══════════════════════════════════════════════════════════
  {
    title: "Physics & General",
    color: "teal",
    description: "Physics I/II, thermodynamics, management",
    courses: [
      { title: "Physics I", code: "PHYS 201" },
      { title: "Physics II", code: "PHYS 202" },
      {
        title: "Thermodynamics",
        code: "ENGR 301",
        resources: [
          { title: "Thermodynamics — Less Boring Lectures (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLd-0K-8ZyM0WdLse-OASmbqzXdpJcCn3P" },
          { title: "Thermodynamics — Engineering Deciphered (YouTube)", type: "VIDEO", url: "https://www.youtube.com/playlist?list=PLOBajja3EcWKh2FzR0KiGQCKkpjN9FpLV" },
          { title: "Khan Academy — Thermodynamics", type: "COURSE", url: "https://www.khanacademy.org/science/ap-chemistry-beta/x2eef969c74e0d802:thermodynamics" },
        ],
      },
      { title: "Principles of Management", code: "MGT 301" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // COMPUTATIONAL SCIENCE
  // ═══════════════════════════════════════════════════════════
  {
    title: "Computational Science",
    color: "emerald",
    description: "Self-study — computational chemistry, molecular dynamics, quantum chemistry",
    courses: [
      {
        title: "Computational Chemistry",
        code: "COMP-CHEM",
        resources: [
          { title: "Awesome Chemistry Datasets (GitHub)", type: "ARTICLE", url: "https://github.com/kjappelbaum/awesome-chemistry-datasets" },
          { title: "rxn_yields — ML Reaction Yield Prediction (GitHub)", type: "ARTICLE", url: "https://github.com/rxn4chemistry/rxn_yields" },
        ],
      },
      { title: "Molecular Dynamics Simulation", code: "COMP-MD" },
      { title: "Intro to Quantum Chemistry", code: "COMP-QC" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PROGRAMMING LANGUAGES (Reference)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Programming Languages",
    color: "gray",
    description: "Language-specific references — C, C++, C#, MATLAB, Swift, Flutter",
    courses: [
      {
        title: "C",
        code: "LANG-C",
        resources: [
          { title: "Collections-C (GitHub)", type: "ARTICLE", url: "https://github.com/srdja/Collections-C" },
        ],
      },
      {
        title: "C++",
        code: "LANG-CPP",
        resources: [
          { title: "Boost", type: "ARTICLE", url: "https://www.boost.org/" },
          { title: "Eigen (linear algebra)", type: "ARTICLE", url: "http://eigen.tuxfamily.org/" },
          { title: "Awesome C++ (GitHub)", type: "ARTICLE", url: "https://github.com/fffaraz/awesome-cpp" },
          { title: "MIT OCW — Intro to C and C++", type: "COURSE", url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-s096-introduction-to-c-and-c-january-iap-2013/" },
        ],
      },
      {
        title: "C#",
        code: "LANG-CS",
        resources: [
          { title: "Microsoft Learn C# Docs", type: "BOOK", url: "https://learn.microsoft.com/dotnet/csharp/" },
          { title: "Entity Framework Core (GitHub)", type: "ARTICLE", url: "https://github.com/dotnet/efcore" },
        ],
      },
      {
        title: "MATLAB",
        code: "LANG-MAT",
        resources: [
          { title: "Chebfun (numerics)", type: "ARTICLE", url: "http://www.chebfun.org/" },
          { title: "FieldTrip (EEG/MEG toolbox)", type: "ARTICLE", url: "https://www.fieldtriptoolbox.org/" },
          { title: "Awesome MATLAB (GitHub)", type: "ARTICLE", url: "https://github.com/caomw/awesome-matlab-1" },
          { title: "MIT OCW — Intro to MATLAB Programming", type: "COURSE", url: "https://ocw.mit.edu/courses/18-s997-introduction-to-matlab-programming-fall-2011/" },
        ],
      },
      {
        title: "Swift",
        code: "LANG-SWIFT",
        resources: [
          { title: "The Swift Programming Language (Official Book)", type: "BOOK", url: "https://docs.swift.org/swift-book/" },
          { title: "Alamofire (networking, GitHub)", type: "ARTICLE", url: "https://github.com/Alamofire/Alamofire" },
          { title: "Awesome Swift (GitHub)", type: "ARTICLE", url: "https://github.com/matteocrippa/awesome-swift" },
        ],
      },
      {
        title: "Flutter / Dart",
        code: "LANG-FLUTTER",
        resources: [
          { title: "Flutter Docs", type: "BOOK", url: "https://docs.flutter.dev/" },
          { title: "Riverpod (state management)", type: "ARTICLE", url: "https://riverpod.dev/" },
          { title: "Awesome Flutter (GitHub)", type: "ARTICLE", url: "https://github.com/Solido/awesome-flutter" },
        ],
      },
    ],
  },
];

// ─── Project Tasks (from workspace guide) ──────────────────
// Each project is a kanban task tied to a course by title.
// Priority maps: Level 1 = LOW, Level 2 = MEDIUM, Level 3 = HIGH
type TaskSeed = {
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  courseTitle: string; // matched against course titles above
};

const projectTasks: TaskSeed[] = [
  // ── Math Track ───────────────────────────────────────────
  // Linear Algebra
  { title: "Build a matrix calculator (inverse, determinant, eigenvalues)", priority: "LOW", courseTitle: "Linear Algebra" },
  { title: "Image compression with SVD — before/after comparison", priority: "MEDIUM", courseTitle: "Linear Algebra" },
  { title: "PCA from scratch on a real dataset (MNIST or EEG)", priority: "HIGH", courseTitle: "Linear Algebra" },

  // Discrete Math
  { title: "Graph traversal visualizer (DFS/BFS)", priority: "LOW", courseTitle: "Discrete Math" },
  { title: "Build a combinatorics calculator", priority: "MEDIUM", courseTitle: "Discrete Math" },
  { title: "Graph-theory-based routing algorithm", priority: "HIGH", courseTitle: "Discrete Math" },

  // Probability & Statistics
  { title: "Simulate coin flips, dice, and Bayesian inference", priority: "LOW", courseTitle: "Probability & Statistics" },
  { title: "Statistical dashboard for real data (weather, stocks)", priority: "MEDIUM", courseTitle: "Probability & Statistics" },
  { title: "Full Monte Carlo simulation engine", priority: "HIGH", courseTitle: "Probability & Statistics" },

  // Differential Equations
  { title: "Solve ODEs with Python (Euler, RK4)", priority: "LOW", courseTitle: "Differential Equations" },
  { title: "Model population dynamics (logistic, predator-prey)", priority: "MEDIUM", courseTitle: "Differential Equations" },
  { title: "Build your own ODE solver library", priority: "HIGH", courseTitle: "Differential Equations" },

  // PDEs
  { title: "Simulate heat equation (1D)", priority: "LOW", courseTitle: "Partial Differential Equations" },
  { title: "Simulate wave equation (2D)", priority: "MEDIUM", courseTitle: "Partial Differential Equations" },
  { title: "PDE-based neural net (PINNs) for physics modeling", priority: "HIGH", courseTitle: "Partial Differential Equations" },

  // Calculus
  { title: "Visualize gradients and surfaces in MATLAB/Python", priority: "LOW", courseTitle: "Calculus III" },
  { title: "Optimize a multivariable function using gradient descent", priority: "MEDIUM", courseTitle: "Calculus III" },
  { title: "Simulate a physical system (pendulum, mass-spring) using calculus", priority: "HIGH", courseTitle: "Calculus III" },

  // Numerical Methods
  { title: "Implement numerical integration methods", priority: "LOW", courseTitle: "Numerical Methods" },
  { title: "Build root-finding tools (Newton's method, bisection)", priority: "MEDIUM", courseTitle: "Numerical Methods" },
  { title: "Simulate Lorenz attractor numerically", priority: "HIGH", courseTitle: "Numerical Methods" },

  // ── CS Track ─────────────────────────────────────────────
  // DSA
  { title: "Implement basic DS (stack, queue, linked list)", priority: "LOW", courseTitle: "Data Structures & Algorithms" },
  { title: "Build a sorting visualizer", priority: "MEDIUM", courseTitle: "Data Structures & Algorithms" },
  { title: "Pathfinding simulator (A*, Dijkstra)", priority: "HIGH", courseTitle: "Data Structures & Algorithms" },

  // Computer Architecture
  { title: "Build a binary → decimal simulator", priority: "LOW", courseTitle: "Computer Architecture" },
  { title: "CPU instruction decoder (simulate small ISA)", priority: "MEDIUM", courseTitle: "Computer Architecture" },
  { title: "Build a mini virtual machine (registers, stack, ops)", priority: "HIGH", courseTitle: "Computer Architecture" },

  // Operating Systems
  { title: "Simulate scheduling algorithms (RR, FCFS)", priority: "LOW", courseTitle: "Operating Systems" },
  { title: "Build a memory allocator simulation", priority: "MEDIUM", courseTitle: "Operating Systems" },
  { title: "Build a toy shell (cd, ls, run commands)", priority: "HIGH", courseTitle: "Operating Systems" },

  // ── Software Engineering Track ───────────────────────────
  // Frontend (React)
  { title: "Responsive landing page (HTML/CSS)", priority: "LOW", courseTitle: "React" },
  { title: "React component library with reusable UI elements", priority: "MEDIUM", courseTitle: "React" },
  { title: "Full UI clone (Spotify, Netflix, or Notion)", priority: "HIGH", courseTitle: "React" },

  // Backend (Node.js)
  { title: "REST API with Node/Express", priority: "LOW", courseTitle: "Node.js / Backend" },
  { title: "JWT authentication system", priority: "MEDIUM", courseTitle: "Node.js / Backend" },
  { title: "Microservice architecture with Redis/Postgres", priority: "HIGH", courseTitle: "Node.js / Backend" },

  // Databases
  { title: "Build a student database CRUD app", priority: "LOW", courseTitle: "SQL / Databases" },
  { title: "Create relational schemas for a real project", priority: "MEDIUM", courseTitle: "SQL / Databases" },
  { title: "Build your own ORM-like query builder", priority: "HIGH", courseTitle: "SQL / Databases" },

  // Full-Stack / DevOps
  { title: "Deploy site to Vercel", priority: "LOW", courseTitle: "Full-Stack Development" },
  { title: "CI/CD pipeline with GitHub Actions", priority: "MEDIUM", courseTitle: "Full-Stack Development" },
  { title: "Dockerize a full-stack app + deploy to cloud", priority: "HIGH", courseTitle: "Full-Stack Development" },

  // ── EE / Signals / BME Track ─────────────────────────────
  // Circuits
  { title: "Ohm's Law calculator + resistor color code app", priority: "LOW", courseTitle: "Circuits I" },
  { title: "Simulate RC/RL circuits in Python", priority: "MEDIUM", courseTitle: "Circuits I" },
  { title: "Build your own SPICE-like mini-simulator", priority: "HIGH", courseTitle: "Circuits I" },

  // Signals & Systems
  { title: "Build sine, square, triangle signal generator", priority: "LOW", courseTitle: "Signals & Systems" },
  { title: "Fourier transform visualizer", priority: "MEDIUM", courseTitle: "Signals & Systems" },
  { title: "LTI system simulator + convolution engine", priority: "HIGH", courseTitle: "Signals & Systems" },

  // DSP (mapped to Signals & Systems since no separate DSP course)
  { title: "Filtering demo (low-pass, high-pass)", priority: "LOW", courseTitle: "Signals & Systems" },
  { title: "Audio equalizer app", priority: "MEDIUM", courseTitle: "Signals & Systems" },
  { title: "Real-time DSP chain (Python or embedded)", priority: "HIGH", courseTitle: "Signals & Systems" },

  // Biomedical Engineering
  { title: "Heart-rate detection from PPG signals", priority: "LOW", courseTitle: "Biomedical Instrumentation" },
  { title: "Build a gait analysis classifier", priority: "MEDIUM", courseTitle: "Biomedical Instrumentation" },
  { title: "Wearable symptom tracker (Arduino + ML)", priority: "HIGH", courseTitle: "Biomedical Instrumentation" },

  // ── Neuroscience / Neural Engineering ────────────────────
  // Intro Neuroscience
  { title: "Create labeled diagrams of neural structures", priority: "LOW", courseTitle: "Intro to Neuroscience" },
  { title: "Build a neural pathway simulator", priority: "MEDIUM", courseTitle: "Intro to Neuroscience" },
  { title: "App that visualizes EEG frequency bands", priority: "HIGH", courseTitle: "Intro to Neuroscience" },

  // Neural Engineering
  { title: "Spike-sorting algorithm (basic thresholding)", priority: "LOW", courseTitle: "Neural Engineering" },
  { title: "Signal filtering for neural data (Butterworth/IIR)", priority: "MEDIUM", courseTitle: "Neural Engineering" },
  { title: "Simplified BCI prototype", priority: "HIGH", courseTitle: "Neural Engineering" },

  // Neural Signal Processing
  { title: "Plot PSTHs and spike rasters from datasets", priority: "LOW", courseTitle: "Neural Signal Processing" },
  { title: "Neural decoding classifier (SVM or kNN)", priority: "MEDIUM", courseTitle: "Neural Signal Processing" },
  { title: "Deep-learning decoder (CNN/RNN) for neural data", priority: "HIGH", courseTitle: "Neural Signal Processing" },

  // ── Chemistry Track ──────────────────────────────────────
  // Organic Chemistry
  { title: "Reaction mechanism flashcards app", priority: "LOW", courseTitle: "Organic Chemistry I" },
  { title: "SMILES → molecule converter using RDKit", priority: "MEDIUM", courseTitle: "Organic Chemistry I" },
  { title: "Predict reaction outcomes with ML", priority: "HIGH", courseTitle: "Organic Chemistry I" },

  // Biochemistry
  { title: "Draw metabolic pathway maps", priority: "LOW", courseTitle: "Biochemistry" },
  { title: "Enzyme kinetics calculator (Michaelis-Menten, Lineweaver-Burk)", priority: "MEDIUM", courseTitle: "Biochemistry" },
  { title: "Model a signaling pathway computationally", priority: "HIGH", courseTitle: "Biochemistry" },

  // Physical Chemistry
  { title: "Quantum particle in a box visualizer", priority: "LOW", courseTitle: "Physical Chemistry I" },
  { title: "Spectroscopy line simulator", priority: "MEDIUM", courseTitle: "Physical Chemistry I" },
  { title: "Molecular dynamics simulation (small atoms system)", priority: "HIGH", courseTitle: "Physical Chemistry I" },

  // Inorganic / General
  { title: "Build a periodic-table explorer app", priority: "LOW", courseTitle: "Inorganic Chemistry" },
  { title: "Chemical reaction balancer engine", priority: "MEDIUM", courseTitle: "Inorganic Chemistry" },
  { title: "Molecular orbital visualizer", priority: "HIGH", courseTitle: "Inorganic Chemistry" },

  // Thermodynamics
  { title: "Ideal-gas law calculator", priority: "LOW", courseTitle: "Thermodynamics" },
  { title: "Thermodynamic diagrams (PV, TS, HS)", priority: "MEDIUM", courseTitle: "Thermodynamics" },
  { title: "System simulator (heat engine, refrigeration cycle)", priority: "HIGH", courseTitle: "Thermodynamics" },

  // ── Missing from initial pass ─────────────────────────────

  // Math Foundations / Logic / Proofs → Discrete Math
  { title: "Write 10 proofs (direct, contrapositive, contradiction)", priority: "LOW", courseTitle: "Discrete Math" },
  { title: "Build a truth-table generator (JS or Python)", priority: "MEDIUM", courseTitle: "Discrete Math" },
  { title: "Implement a SAT Solver (DPLL) in Python", priority: "HIGH", courseTitle: "Discrete Math" },

  // Programming Foundations → Full-Stack Development
  { title: "Build a CLI calculator (Python)", priority: "LOW", courseTitle: "Full-Stack Development" },
  { title: "Build a unit-converter web app", priority: "MEDIUM", courseTitle: "Full-Stack Development" },
  { title: "API-based dashboard (weather, crypto, finance)", priority: "HIGH", courseTitle: "Full-Stack Development" },

  // Computer Networks
  { title: "Packet inspector tool (parse headers)", priority: "LOW", courseTitle: "Computer Networks" },
  { title: "Build a chat app using sockets", priority: "MEDIUM", courseTitle: "Computer Networks" },
  { title: "Build your own TCP-like protocol in Python", priority: "HIGH", courseTitle: "Computer Networks" },

  // Control Theory
  { title: "PID controller simulation", priority: "LOW", courseTitle: "Control Theory" },
  { title: "Cruise-control system modeling", priority: "MEDIUM", courseTitle: "Control Theory" },
  { title: "Quadrotor or robot arm controller", priority: "HIGH", courseTitle: "Control Theory" },

  // Neural Signal Acquisition
  { title: "Simulate recording noise and filtering", priority: "LOW", courseTitle: "Neural Signal Acquisition" },
  { title: "Python EEG/EMG signal processing toolkit", priority: "MEDIUM", courseTitle: "Neural Signal Acquisition" },
  { title: "Real-time acquisition pipeline (Arduino + Python)", priority: "HIGH", courseTitle: "Neural Signal Acquisition" },

  // Neuro Sensory Engineering
  { title: "Model basic sensory transduction pathways", priority: "LOW", courseTitle: "Neuro Sensory Engineering" },
  { title: "Prosthetic sensor simulation (light/touch)", priority: "MEDIUM", courseTitle: "Neuro Sensory Engineering" },
  { title: "Multi-sensory integration model using ML", priority: "HIGH", courseTitle: "Neuro Sensory Engineering" },
];

// ─── Main ──────────────────────────────────────────────────
async function main() {
  if (USER_ID === "REPLACE_WITH_YOUR_SUPABASE_USER_ID") {
    console.error(
      "ERROR: Replace USER_ID in prisma/seed.ts with your actual Supabase user ID."
    );
    process.exit(1);
  }

  console.log("Seeding database...\n");

  // Map to look up course IDs by title after creation
  const courseMap = new Map<string, string>();

  let totalCourses = 0;
  let totalResources = 0;

  // ── Phase 1: Tracks, Courses, Resources ──────────────────
  for (const trackData of seedData) {
    const track = await prisma.track.create({
      data: {
        title: trackData.title,
        description: trackData.description || null,
        color: trackData.color,
        userId: USER_ID,
      },
    });

    for (const courseData of trackData.courses) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          code: courseData.code,
          trackId: track.id,
          status: "NOT_STARTED",
          ...(courseData.resources && {
            resources: {
              create: courseData.resources.map((r) => ({
                title: r.title,
                type: r.type,
                url: r.url,
                isCompleted: false,
              })),
            },
          }),
        },
        include: { resources: true },
      });

      courseMap.set(courseData.title, course.id);
      totalCourses++;
      totalResources += course.resources.length;
    }

    const courseCount = trackData.courses.length;
    const resCount = trackData.courses.reduce(
      (sum, c) => sum + (c.resources?.length || 0),
      0
    );
    console.log(
      `  ✓ ${trackData.title} — ${courseCount} courses, ${resCount} resources`
    );
  }

  // ── Phase 2: Project Tasks (Kanban) ──────────────────────
  console.log("\nSeeding project tasks...\n");

  let totalTasks = 0;
  let skipped = 0;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    const courseId = courseMap.get(task.courseTitle);

    if (!courseId) {
      console.warn(`  ⚠ Skipped task "${task.title}" — no course match for "${task.courseTitle}"`);
      skipped++;
      continue;
    }

    await prisma.task.create({
      data: {
        title: task.title,
        status: "TODO",
        priority: task.priority,
        userId: USER_ID,
        courseId,
        sortOrder: i,
      },
    });

    totalTasks++;
  }

  console.log(`  ✓ Created ${totalTasks} project tasks (${skipped} skipped)`);

  console.log(
    `\n✅ Done! Seeded ${seedData.length} tracks, ${totalCourses} courses, ${totalResources} resources, ${totalTasks} tasks.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
