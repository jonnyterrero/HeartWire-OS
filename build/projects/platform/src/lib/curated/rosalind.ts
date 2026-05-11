export type RosalindProblem = {
  id: string;
  code: string;
  title: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  why: string;
  category?: string;
};

// Compact builder. Code + title shown verbatim; URL synthesized from the
// canonical Rosalind slug pattern: /problems/<lowercase-code>/.
type RosInput = [string, string, "easy" | "medium" | "hard", string, string?];
function mk(rows: RosInput[], category: string): RosalindProblem[] {
  return rows.map(([code, title, difficulty, why]) => ({
    id: `ros-${code.toLowerCase()}`,
    code,
    title,
    url: `https://rosalind.info/problems/${code.toLowerCase()}/`,
    difficulty,
    why,
    category,
  }));
}

// ─── Bioinformatics Stronghold (the canonical track) ────────────────────────

const FOUNDATIONS = mk(
  [
    ["DNA", "Counting DNA Nucleotides", "easy", "Count A/C/G/T — the 'hello world' of bioinformatics."],
    ["RNA", "Transcribing DNA into RNA", "easy", "Replace every T with U. Trivial but establishes pipeline shape."],
    ["REVC", "Complementing a Strand of DNA", "easy", "Reverse complement — used in nearly every downstream task."],
    ["FIB", "Rabbits and Recurrence Relations", "easy", "Fibonacci-style recurrence — first taste of dynamic programming."],
    ["GC", "Computing GC Content", "easy", "The canonical GC-content problem."],
    ["HAMM", "Counting Point Mutations", "easy", "Hamming distance — simplest sequence-distance metric."],
    ["IPRB", "Mendel's First Law", "easy", "Probability of dominant phenotype in offspring."],
    ["PROT", "Translating RNA into Protein", "medium", "Codon-table lookup — bridges molecular biology and CS."],
    ["SUBS", "Finding a Motif in DNA", "easy", "Substring search — sibling of LeetCode #28."],
    ["FIBD", "Mortal Fibonacci Rabbits", "medium", "Aging Fibonacci with bounded lifespan."],
  ],
  "Foundations"
);

const STRINGS_AND_MOTIFS = mk(
  [
    ["CONS", "Consensus and Profile", "medium", "Profile matrices — intro to probabilistic sequence models."],
    ["GRPH", "Overlap Graphs", "medium", "Build a de novo graph from reads — assembly fundamentals."],
    ["IEV", "Calculating Expected Offspring", "easy", "Linearity of expectation across genotype pairs."],
    ["LCSM", "Finding a Shared Motif", "medium", "Longest common substring across many sequences."],
    ["LIA", "Independent Alleles", "medium", "Binomial probability across generations."],
    ["MPRT", "Finding a Protein Motif", "medium", "Pull from UniProt + regex-style motif scan."],
    ["MRNA", "Inferring mRNA from Protein", "medium", "Modular arithmetic + codon redundancy."],
    ["ORF", "Open Reading Frames", "medium", "Translate across all 6 frames — pipeline staple."],
    ["PERM", "Enumerating Gene Orders", "easy", "Permutation generation."],
    ["PRTM", "Calculating Protein Mass", "easy", "Sum monoisotopic residue masses."],
    ["REVP", "Locating Restriction Sites", "medium", "Find reverse-palindromic substrings."],
    ["SPLC", "RNA Splicing", "medium", "Remove introns, translate exons."],
  ],
  "Strings & Motifs"
);

const COMBINATORICS_PROB = mk(
  [
    ["LEXF", "Enumerating k-mers Lexicographically", "easy", "Cartesian-product enumeration."],
    ["LGIS", "Longest Increasing Subsequence", "medium", "Synteny detection in genome assembly."],
    ["LONG", "Genome Assembly as Shortest Superstring", "hard", "Shortest-superstring problem — genuinely hard."],
    ["PMCH", "Perfect Matchings and RNA Secondary Structures", "medium", "Counting perfect matchings in RNA folding."],
    ["PPER", "Partial Permutations", "easy", "Falling factorial mod 1,000,000."],
    ["PROB", "Introduction to Random Strings", "medium", "Probability of a string under a GC-content model."],
    ["SIGN", "Enumerating Oriented Gene Orderings", "easy", "Signed permutations enumeration."],
    ["SSEQ", "Finding a Spliced Motif", "easy", "Subsequence (not substring) location."],
    ["TRAN", "Transitions and Transversions", "easy", "Mutation-class ratio — Ti/Tv."],
    ["TREE", "Completing a Tree", "easy", "Edges needed to make a forest a tree."],
  ],
  "Combinatorics & Probability"
);

const ALIGNMENT_DP = mk(
  [
    ["EDIT", "Edit Distance", "medium", "Levenshtein DP — backbone of alignment."],
    ["EDTA", "Edit Distance Alignment", "medium", "Edit distance + recover the alignment."],
    ["GLOB", "Global Alignment with Scoring Matrix", "medium", "Needleman-Wunsch with BLOSUM62."],
    ["LOCA", "Local Alignment with Scoring Matrix", "medium", "Smith-Waterman."],
    ["MGAP", "Maximizing the Gap Symbols of an Optimal Alignment", "medium", "Gap-rich alignments via LCS length."],
    ["LAFF", "Local Alignment with Affine Gap Penalty", "hard", "3-state affine-gap DP."],
    ["GAFF", "Global Alignment with Scoring Matrix and Affine Gap Penalty", "hard", "Global affine gaps — multi-layer DP."],
    ["OAP", "Overlap Alignment", "medium", "Overlap alignment for assembly."],
    ["SIMS", "Finding a Motif with Modifications", "medium", "Fitting alignment with one approximate occurrence."],
    ["CTEA", "Counting Optimal Alignments", "hard", "Count distinct optimal alignments mod 134,217,727."],
  ],
  "Alignment & DP"
);

const GRAPHS_AND_ASSEMBLY = mk(
  [
    ["DBRU", "Constructing a De Bruijn Graph", "medium", "k-mer adjacency graph — modern assembly."],
    ["BA3A", "Generate the k-mer Composition of a String", "easy", "k-mer enumeration."],
    ["BA3B", "Reconstruct a String from its Genome Path", "easy", "Walk a genome path."],
    ["BA3C", "Construct the Overlap Graph of a Collection of k-mers", "easy", "Overlap-graph construction."],
    ["BA3D", "Construct the De Bruijn Graph of a String", "easy", "De Bruijn graph from a single string."],
    ["BA3E", "Construct the De Bruijn Graph of a Collection of k-mers", "easy", "De Bruijn from many reads."],
    ["BA3F", "Find an Eulerian Cycle in a Graph", "medium", "Hierholzer's algorithm."],
    ["BA3G", "Find an Eulerian Path in a Graph", "medium", "Eulerian path with degree fix-up."],
    ["BA3H", "Reconstruct a String from its k-mer Composition", "medium", "Assembly via Eulerian path on De Bruijn."],
    ["GASM", "Genome Assembly Using Reads", "hard", "Smallest k where assembly succeeds."],
  ],
  "Graphs & Assembly"
);

const SUFFIX_AND_TREES = mk(
  [
    ["TRIE", "Introduction to Pattern Matching", "medium", "Build a trie from many patterns."],
    ["SUFF", "Encoding Suffix Trees", "medium", "Compressed suffix tree edges."],
    ["LREP", "Finding the Longest Multiple Repeat", "hard", "Longest substring appearing ≥ k times."],
    ["NWCK", "Distances in Trees", "easy", "Newick tree parsing + path distances."],
    ["NKEW", "Newick Format with Edge Weights", "medium", "Weighted Newick distances."],
    ["CTBL", "Creating a Character Table", "medium", "Character tables from a tree."],
    ["CSTR", "Creating a Character Table from Genetic Strings", "medium", "Character table from a multiple alignment."],
    ["RSUB", "Identifying Reversing Substitutions", "hard", "Detect reversing substitutions on a tree."],
  ],
  "Suffix & Phylogenetic Trees"
);

const POPGEN_AND_PHYLO = mk(
  [
    ["AFRQ", "Counting Disease Carriers", "easy", "Hardy-Weinberg from allele frequencies."],
    ["WFMD", "The Wright-Fisher Model of Genetic Drift", "medium", "Allele-frequency distribution after one generation."],
    ["EBIN", "Wright-Fisher's Expected Behavior", "easy", "Expected counts under Wright-Fisher."],
    ["FOUN", "The Founder Effect and Genetic Drift", "medium", "Drift over multiple generations, log-prob."],
    ["SEXL", "Sex-Linked Inheritance", "easy", "X-linked recessive inheritance probabilities."],
    ["INDC", "Independent Segregation of Chromosomes", "medium", "Binomial-tail probabilities of allele inheritance."],
    ["BA7A", "Compute Distances Between Leaves", "easy", "Sum-of-edge-weights matrix from a tree."],
    ["BA7B", "Compute Limb Lengths in a Tree", "easy", "Limb-length formula in additive trees."],
    ["BA7C", "Implement AdditivePhylogeny", "medium", "Reconstruct an additive tree from a distance matrix."],
    ["BA7D", "Implement UPGMA", "medium", "UPGMA hierarchical clustering."],
    ["BA7E", "Implement the Neighbor Joining Algorithm", "medium", "Saitou-Nei NJ — modern phylogeny baseline."],
  ],
  "Population Genetics & Phylogeny"
);

const PROTEOMICS = mk(
  [
    ["SPEC", "Inferring Protein from Spectrum", "easy", "Recover residues from prefix-mass differences."],
    ["CONV", "Comparing Spectra with the Spectral Convolution", "medium", "Spectral convolution = Minkowski difference."],
    ["FULL", "Inferring Peptide from Full Spectrum", "hard", "Reconstruct peptide from a full mass spectrum."],
    ["PRSM", "Matching a Spectrum to a Protein", "medium", "Identify the proteome's best-fit candidate."],
    ["SGRA", "Using the Spectrum Graph to Infer Peptides", "medium", "Walk the spectrum graph for the longest peptide."],
  ],
  "Proteomics"
);

// Existing ids preserved for progress continuity.
export const ROSALIND_PROBLEMS: RosalindProblem[] = [
  ...FOUNDATIONS,
  ...STRINGS_AND_MOTIFS,
  ...COMBINATORICS_PROB,
  ...ALIGNMENT_DP,
  ...GRAPHS_AND_ASSEMBLY,
  ...SUFFIX_AND_TREES,
  ...POPGEN_AND_PHYLO,
  ...PROTEOMICS,
  // Extras kept for back-compat with previously completed items.
  { id: "ros-kmer", code: "KMER", title: "k-Mer Composition", url: "https://rosalind.info/problems/kmer/", difficulty: "medium", why: "Exhaustive k-mer counting — foundation for many alignment algos.", category: "Strings & Motifs" },
  { id: "ros-ba1b", code: "BA1B", title: "Most Frequent k-mers", url: "https://rosalind.info/problems/ba1b/", difficulty: "easy", why: "Counts frequency of k-length substrings — sibling of LeetCode 187.", category: "Strings & Motifs" },
];
