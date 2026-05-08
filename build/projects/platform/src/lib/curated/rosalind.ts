export type RosalindProblem = {
  id: string;
  code: string;
  title: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  why: string;
};

export const ROSALIND_PROBLEMS: RosalindProblem[] = [
  { id: "ros-dna", code: "DNA", title: "Counting DNA Nucleotides", url: "https://rosalind.info/problems/dna/", difficulty: "easy", why: "Count A/C/G/T - the 'hello world' of bioinformatics." },
  { id: "ros-rna", code: "RNA", title: "Transcribing DNA into RNA", url: "https://rosalind.info/problems/rna/", difficulty: "easy", why: "Replace every T with U. Trivial but establishes pipeline structure." },
  { id: "ros-revc", code: "REVC", title: "Complementing a Strand of DNA", url: "https://rosalind.info/problems/revc/", difficulty: "easy", why: "Reverse complement - used everywhere downstream." },
  { id: "ros-gc", code: "GC", title: "Computing GC Content", url: "https://rosalind.info/problems/gc/", difficulty: "easy", why: "The canonical GC-content problem." },
  { id: "ros-hamm", code: "HAMM", title: "Counting Point Mutations (Hamming)", url: "https://rosalind.info/problems/hamm/", difficulty: "easy", why: "Simplest sequence-distance metric - intro to alignment scoring." },
  { id: "ros-subs", code: "SUBS", title: "Finding a Motif in DNA", url: "https://rosalind.info/problems/subs/", difficulty: "easy", why: "Substring search - twin of LeetCode #28." },
  { id: "ros-prot", code: "PROT", title: "Translating RNA into Protein", url: "https://rosalind.info/problems/prot/", difficulty: "medium", why: "Codon-table lookup - bridges molecular biology and CS." },
  { id: "ros-cons", code: "CONS", title: "Consensus and Profile", url: "https://rosalind.info/problems/cons/", difficulty: "medium", why: "Profile matrices - intro to probabilistic sequence models." },
  { id: "ros-grph", code: "GRPH", title: "Overlap Graphs", url: "https://rosalind.info/problems/grph/", difficulty: "medium", why: "Assemble a de novo graph from reads - assembly fundamentals." },
  { id: "ros-lcsm", code: "LCSM", title: "Finding a Shared Motif", url: "https://rosalind.info/problems/lcsm/", difficulty: "medium", why: "Longest common substring across many sequences." },
  { id: "ros-mrna", code: "MRNA", title: "Inferring mRNA from Protein", url: "https://rosalind.info/problems/mrna/", difficulty: "medium", why: "Modular arithmetic + codon tables." },
  { id: "ros-orf", code: "ORF", title: "Open Reading Frames", url: "https://rosalind.info/problems/orf/", difficulty: "medium", why: "Translate across all 6 frames - classic bioinformatics pipeline step." },
  { id: "ros-splc", code: "SPLC", title: "RNA Splicing", url: "https://rosalind.info/problems/splc/", difficulty: "medium", why: "Remove introns, translate exons." },
  { id: "ros-kmer", code: "KMER", title: "k-Mer Composition", url: "https://rosalind.info/problems/kmer/", difficulty: "medium", why: "Exhaustive k-mer counting - foundation for many alignment algos." },
  { id: "ros-long", code: "LONG", title: "Genome Assembly as Shortest Superstring", url: "https://rosalind.info/problems/long/", difficulty: "hard", why: "Shortest superstring problem - genuinely hard, good interview discussion." },
  { id: "ros-ba1b", code: "BA1B", title: "Most Frequent k-mers", url: "https://rosalind.info/problems/ba1b/", difficulty: "easy", why: "Counts frequency of k-length substrings - sibling of LeetCode 187." },
];
