import type { TrackId } from "./index";

export type LeetCodeProblem = {
  id: string;
  number: number;
  title: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  track: TrackId[];
  topicIds: string[];
  why: string;
};

// Compact builder so the (long) NeetCode 150 list stays readable.
type LCInput = [
  number,
  string,
  "easy" | "medium" | "hard",
  string[], // tags
  string // why / category
];
const dsa: TrackId[] = ["dsa"];
const dsaBio: TrackId[] = ["dsa", "bioinformatics"];
const dsaBmi: TrackId[] = ["dsa", "biomedical-interview"];

function mk(
  rows: LCInput[],
  topicIds: string[],
  track: TrackId[] = dsa
): LeetCodeProblem[] {
  return rows.map(([n, title, difficulty, tags, why]) => ({
    id: `lc-${n}`,
    number: n,
    title,
    url: `https://leetcode.com/problems/${title
      .toLowerCase()
      .replace(/[()'.,]/g, "")
      .replace(/\s+/g, "-")}/`,
    difficulty,
    tags,
    track,
    topicIds,
    why,
  }));
}

// ─── Bio-flavored extras (kept for backwards-compat with existing progress) ──
const BIO_EXTRAS: LeetCodeProblem[] = [
  { id: "lc-187", number: 187, title: "Repeated DNA Sequences", url: "https://leetcode.com/problems/repeated-dna-sequences/", difficulty: "medium", tags: ["hash table", "sliding window", "rolling hash", "DNA"], track: dsaBio.concat("biomedical-interview") as TrackId[], topicIds: ["dsa-strings", "bme-bioinf"], why: "All 10-letter substrings appearing more than once in a DNA string." },
  { id: "lc-28", number: 28, title: "Find the Index of the First Occurrence in a String", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty: "easy", tags: ["strings", "KMP"], track: dsaBio, topicIds: ["dsa-strings", "bme-bioinf"], why: "Motif finding — Rosalind 'Finding a Motif in DNA' in one line." },
  { id: "lc-438", number: 438, title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "medium", tags: ["sliding window", "hash table"], track: dsaBio, topicIds: ["dsa-strings"], why: "Searching rearranged k-mers — same shape as GC-window analysis." },
  { id: "lc-1876", number: 1876, title: "Substrings of Size Three with Distinct Characters", url: "https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/", difficulty: "easy", tags: ["sliding window"], track: dsa, topicIds: ["dsa-strings"], why: "Warm-up for k-mer / GC-content sliding-window problems." },
  { id: "lc-560", number: 560, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "medium", tags: ["prefix sum", "hash table"], track: dsa, topicIds: ["dsa-arrays"], why: "Prefix-sum pattern — analog of cumulative-GC in O(1) per window." },
  { id: "lc-139", number: 139, title: "Word Break", url: "https://leetcode.com/problems/word-break/", difficulty: "medium", tags: ["dp", "strings"], track: dsa, topicIds: ["dsa-dp", "dsa-strings"], why: "DP that shows up in tokenization and sequence parsing." },
  { id: "lc-72", number: 72, title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "hard", tags: ["dp", "strings"], track: dsaBio, topicIds: ["dsa-dp", "bme-bioinf"], why: "Levenshtein distance — core of sequence alignment." },
  { id: "lc-1143", number: 1143, title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "medium", tags: ["dp", "strings"], track: dsaBio, topicIds: ["dsa-dp", "bme-bioinf"], why: "Simplified global alignment (Needleman–Wunsch without gap penalties)." },
  { id: "lc-387", number: 387, title: "First Unique Character in a String", url: "https://leetcode.com/problems/first-unique-character-in-a-string/", difficulty: "easy", tags: ["hash table", "counting"], track: dsa, topicIds: ["dsa-strings"], why: "Char counting — same skeleton as base frequency / GC content." },
  { id: "lc-383", number: 383, title: "Ransom Note", url: "https://leetcode.com/problems/ransom-note/", difficulty: "easy", tags: ["counting", "hash table"], track: dsa, topicIds: ["dsa-strings"], why: "Frequency-map practice, same skeleton as counting A/C/G/T." },
  { id: "lc-242", number: 242, title: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", difficulty: "easy", tags: ["hash table", "sorting"], track: dsa, topicIds: ["dsa-strings"], why: "Canonical counting problem — warm-up before DNA-base counting." },
  { id: "lc-200", number: 200, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "medium", tags: ["graph", "dfs", "bfs"], track: dsaBmi, topicIds: ["dsa-trees"], why: "Flood fill — same pattern as connected components on microscopy images." },
];

// ─── NeetCode 150 (canonical roadmap) ───────────────────────────────────────
const ARRAYS_HASHING = mk(
  [
    [217, "Contains Duplicate", "easy", ["array", "hash"], "Arrays & Hashing #1 — bedrock of de-duplication problems."],
    [1, "Two Sum", "easy", ["array", "hash"], "Arrays & Hashing — the hashing template every interview leans on."],
    [49, "Group Anagrams", "medium", ["hash", "sorting"], "Arrays & Hashing — bucketing by canonical key."],
    [347, "Top K Frequent Elements", "medium", ["heap", "bucket sort"], "Arrays & Hashing — bucket sort beats the heap trap."],
    [271, "Encode and Decode Strings", "medium", ["design"], "Arrays & Hashing — length-prefix serialization classic."],
    [238, "Product of Array Except Self", "medium", ["prefix product"], "Arrays & Hashing — prefix/suffix passes without division."],
    [36, "Valid Sudoku", "medium", ["matrix", "hash"], "Arrays & Hashing — three sets per row/col/box."],
    [128, "Longest Consecutive Sequence", "medium", ["hash"], "Arrays & Hashing — O(n) only-start trick."],
  ],
  ["dsa-arrays", "dsa-strings"]
);

const TWO_POINTERS = mk(
  [
    [125, "Valid Palindrome", "easy", ["two pointers", "string"], "Two Pointers — alphanumeric filter + symmetric walk."],
    [167, "Two Sum II Input Array Is Sorted", "medium", ["two pointers"], "Two Pointers — paired with the sorted-array invariant."],
    [15, "3Sum", "medium", ["two pointers", "sorting"], "Two Pointers — sort + pinned + sweep."],
    [11, "Container With Most Water", "medium", ["two pointers"], "Two Pointers — shrink-the-shorter-wall greedy."],
    [42, "Trapping Rain Water", "hard", ["two pointers", "stack"], "Two Pointers — left/right max envelopes."],
  ],
  ["dsa-arrays"]
);

const SLIDING_WINDOW = mk(
  [
    [121, "Best Time to Buy and Sell Stock", "easy", ["dp", "sliding window"], "Sliding Window — running min + best diff."],
    [3, "Longest Substring Without Repeating Characters", "medium", ["sliding window"], "Sliding Window — the canonical template."],
    [424, "Longest Repeating Character Replacement", "medium", ["sliding window"], "Sliding Window — invariant on most-frequent-char."],
    [567, "Permutation in String", "medium", ["sliding window", "hash"], "Sliding Window — fixed-size frequency match."],
    [76, "Minimum Window Substring", "hard", ["sliding window"], "Sliding Window — variable-size with required-char count."],
    [239, "Sliding Window Maximum", "hard", ["deque", "sliding window"], "Sliding Window — monotonic deque pattern."],
  ],
  ["dsa-strings", "dsa-arrays"]
);

const STACK = mk(
  [
    [20, "Valid Parentheses", "easy", ["stack"], "Stack — bracket-matching base case."],
    [155, "Min Stack", "medium", ["stack", "design"], "Stack — auxiliary structure design."],
    [150, "Evaluate Reverse Polish Notation", "medium", ["stack"], "Stack — postfix evaluation."],
    [22, "Generate Parentheses", "medium", ["backtracking"], "Stack/Backtracking — pruned generation by counts."],
    [739, "Daily Temperatures", "medium", ["monotonic stack"], "Stack — monotonic decreasing stack template."],
    [853, "Car Fleet", "medium", ["stack", "sorting"], "Stack — sort by start, sweep arrival times."],
    [84, "Largest Rectangle in Histogram", "hard", ["monotonic stack"], "Stack — landmark monotonic stack."],
  ],
  ["dsa-strings"]
);

const BINARY_SEARCH = mk(
  [
    [704, "Binary Search", "easy", ["binary search"], "Binary Search — the literal template."],
    [74, "Search a 2D Matrix", "medium", ["binary search", "matrix"], "Binary Search — flatten + bisect."],
    [875, "Koko Eating Bananas", "medium", ["binary search"], "Binary Search — bisect on the answer space."],
    [153, "Find Minimum in Rotated Sorted Array", "medium", ["binary search"], "Binary Search — pivot detection."],
    [33, "Search in Rotated Sorted Array", "medium", ["binary search"], "Binary Search — pick the sorted half each step."],
    [981, "Time Based Key Value Store", "medium", ["binary search", "design"], "Binary Search — bisect on per-key timestamp lists."],
    [4, "Median of Two Sorted Arrays", "hard", ["binary search"], "Binary Search — bisect on partition index."],
  ],
  ["dsa-arrays"]
);

const LINKED_LIST = mk(
  [
    [206, "Reverse Linked List", "easy", ["linked list"], "Linked List — pointer-rewire fundamentals."],
    [21, "Merge Two Sorted Lists", "easy", ["linked list"], "Linked List — sentinel-node merging."],
    [143, "Reorder List", "medium", ["linked list", "two pointers"], "Linked List — find mid, reverse, merge."],
    [19, "Remove Nth Node From End of List", "medium", ["two pointers"], "Linked List — two-pointer offset trick."],
    [138, "Copy List With Random Pointer", "medium", ["linked list", "hash"], "Linked List — hash old→new and patch pointers."],
    [2, "Add Two Numbers", "medium", ["linked list", "math"], "Linked List — long addition with carry."],
    [141, "Linked List Cycle", "easy", ["fast slow"], "Linked List — Floyd's tortoise & hare."],
    [287, "Find the Duplicate Number", "medium", ["fast slow"], "Linked List — Floyd applied to index→value graph."],
    [146, "LRU Cache", "medium", ["design", "linked list"], "Linked List — hash + doubly-linked list."],
    [25, "Reverse Nodes in K Group", "hard", ["linked list"], "Linked List — group reverse with bookkeeping."],
    [23, "Merge K Sorted Lists", "hard", ["heap", "linked list"], "Linked List — heap merge or pairwise merge."],
  ],
  ["dsa-trees"]
);

const TREES = mk(
  [
    [226, "Invert Binary Tree", "easy", ["tree", "recursion"], "Trees — recursion warm-up."],
    [104, "Maximum Depth of Binary Tree", "easy", ["tree", "dfs"], "Trees — base of every height/diameter problem."],
    [543, "Diameter of Binary Tree", "easy", ["tree", "dfs"], "Trees — max depth bookkeeping during recursion."],
    [110, "Balanced Binary Tree", "easy", ["tree", "dfs"], "Trees — recursive height + balance check."],
    [100, "Same Tree", "easy", ["tree", "dfs"], "Trees — structural equality."],
    [572, "Subtree of Another Tree", "easy", ["tree", "dfs"], "Trees — combines sameTree with traversal."],
    [235, "Lowest Common Ancestor of a Binary Search Tree", "medium", ["bst"], "Trees — BST property collapses LCA to a walk."],
    [102, "Binary Tree Level Order Traversal", "medium", ["tree", "bfs"], "Trees — BFS template."],
    [199, "Binary Tree Right Side View", "medium", ["tree", "bfs"], "Trees — last-of-level BFS."],
    [1448, "Count Good Nodes in Binary Tree", "medium", ["tree", "dfs"], "Trees — DFS with running max."],
    [98, "Validate Binary Search Tree", "medium", ["bst"], "Trees — bound-passing recursion."],
    [230, "Kth Smallest Element in a BST", "medium", ["bst", "dfs"], "Trees — in-order with early stop."],
    [105, "Construct Binary Tree from Preorder and Inorder Traversal", "medium", ["tree"], "Trees — split-by-root reconstruction."],
    [124, "Binary Tree Maximum Path Sum", "hard", ["tree", "dp"], "Trees — split contribution vs through-the-root."],
    [297, "Serialize and Deserialize Binary Tree", "hard", ["tree", "design"], "Trees — preorder with null markers."],
  ],
  ["dsa-trees"]
);

const TRIES = mk(
  [
    [208, "Implement Trie Prefix Tree", "medium", ["trie", "design"], "Tries — insert/search/startsWith from scratch."],
    [211, "Design Add and Search Words Data Structure", "medium", ["trie", "dfs"], "Tries — wildcard match via DFS."],
    [212, "Word Search II", "hard", ["trie", "backtracking"], "Tries — board DFS pruned by trie."],
  ],
  ["dsa-strings"]
);

const HEAP = mk(
  [
    [703, "Kth Largest Element in a Stream", "easy", ["heap"], "Heap — min-heap of size k template."],
    [1046, "Last Stone Weight", "easy", ["heap"], "Heap — repeated max-extract."],
    [973, "K Closest Points to Origin", "medium", ["heap"], "Heap — partial selection."],
    [215, "Kth Largest Element in an Array", "medium", ["heap", "quickselect"], "Heap — heap or quickselect partition."],
    [621, "Task Scheduler", "medium", ["heap", "greedy"], "Heap — greedy max-frequency scheduling."],
    [355, "Design Twitter", "medium", ["heap", "design"], "Heap — merge K user feeds."],
    [295, "Find Median from Data Stream", "hard", ["heap", "design"], "Heap — two-heap balance trick."],
  ],
  ["dsa-arrays"]
);

const BACKTRACKING = mk(
  [
    [78, "Subsets", "medium", ["backtracking"], "Backtracking — include/exclude template."],
    [39, "Combination Sum", "medium", ["backtracking"], "Backtracking — repeats allowed, prune by sum."],
    [46, "Permutations", "medium", ["backtracking"], "Backtracking — used-set permutations."],
    [90, "Subsets II", "medium", ["backtracking"], "Backtracking — sort + skip duplicates."],
    [40, "Combination Sum II", "medium", ["backtracking"], "Backtracking — sorted dedupe variant."],
    [79, "Word Search", "medium", ["backtracking", "dfs"], "Backtracking — DFS on grid with visited mask."],
    [131, "Palindrome Partitioning", "medium", ["backtracking", "dp"], "Backtracking — partition + isPalindrome check."],
    [17, "Letter Combinations of a Phone Number", "medium", ["backtracking"], "Backtracking — Cartesian product."],
    [51, "N Queens", "hard", ["backtracking"], "Backtracking — diagonal-set pruning."],
  ],
  ["dsa-arrays", "dsa-strings"]
);

const GRAPHS = mk(
  [
    [200, "Number of Islands", "medium", ["graph", "dfs", "bfs"], "Graphs — flood fill on a grid."],
    [133, "Clone Graph", "medium", ["graph", "dfs"], "Graphs — DFS/BFS with hash mapping."],
    [695, "Max Area of Island", "medium", ["graph", "dfs"], "Graphs — flood fill returning size."],
    [417, "Pacific Atlantic Water Flow", "medium", ["graph", "bfs"], "Graphs — multi-source BFS from edges."],
    [130, "Surrounded Regions", "medium", ["graph", "dfs"], "Graphs — boundary DFS to mark survivors."],
    [994, "Rotting Oranges", "medium", ["graph", "bfs"], "Graphs — multi-source BFS over time."],
    [207, "Course Schedule", "medium", ["graph", "topological sort"], "Graphs — cycle detection in a DAG."],
    [210, "Course Schedule II", "medium", ["graph", "topological sort"], "Graphs — Kahn's algorithm output."],
    [684, "Redundant Connection", "medium", ["graph", "union find"], "Graphs — DSU merge until conflict."],
    [127, "Word Ladder", "hard", ["graph", "bfs"], "Graphs — BFS over implicit transformation graph."],
    [261, "Graph Valid Tree", "medium", ["graph", "union find"], "Graphs — DSU + edge count check."],
    [323, "Number of Connected Components in an Undirected Graph", "medium", ["graph", "union find"], "Graphs — DSU component count."],
    [178, "Number of Islands II", "hard", ["graph", "union find"], "Graphs — incremental DSU on a stream."],
  ],
  ["dsa-trees"]
);

const ADVANCED_GRAPHS = mk(
  [
    [332, "Reconstruct Itinerary", "hard", ["graph", "eulerian"], "Advanced Graphs — Hierholzer's Eulerian path."],
    [1584, "Min Cost to Connect All Points", "medium", ["graph", "mst"], "Advanced Graphs — Prim's / Kruskal's MST."],
    [743, "Network Delay Time", "medium", ["graph", "dijkstra"], "Advanced Graphs — Dijkstra's shortest path."],
    [787, "Cheapest Flights Within K Stops", "medium", ["graph", "bellman ford"], "Advanced Graphs — Bellman-Ford with stop limit."],
    [778, "Swim in Rising Water", "hard", ["graph", "dijkstra"], "Advanced Graphs — Dijkstra over min-max edge weight."],
    [269, "Alien Dictionary", "hard", ["graph", "topological sort"], "Advanced Graphs — derive edges, then topo sort."],
  ],
  ["dsa-trees"]
);

const DP_1D = mk(
  [
    [70, "Climbing Stairs", "easy", ["dp"], "1-D DP — Fibonacci recurrence."],
    [746, "Min Cost Climbing Stairs", "easy", ["dp"], "1-D DP — pick the cheaper predecessor."],
    [198, "House Robber", "medium", ["dp"], "1-D DP — pick or skip."],
    [213, "House Robber II", "medium", ["dp"], "1-D DP — circular variant via two passes."],
    [5, "Longest Palindromic Substring", "medium", ["dp", "string"], "1-D DP — expand around centers."],
    [647, "Palindromic Substrings", "medium", ["dp", "string"], "1-D DP — center expansion counting."],
    [91, "Decode Ways", "medium", ["dp"], "1-D DP — single + double-digit branches."],
    [322, "Coin Change", "medium", ["dp"], "1-D DP — unbounded knapsack min."],
    [300, "Longest Increasing Subsequence", "medium", ["dp", "binary search"], "1-D DP — O(n log n) with patience sorting."],
    [139, "Word Break", "medium", ["dp", "trie"], "1-D DP — index-based reachability."],
    [377, "Combination Sum IV", "medium", ["dp"], "1-D DP — order-sensitive count."],
    [416, "Partition Equal Subset Sum", "medium", ["dp", "knapsack"], "1-D DP — subset-sum knapsack."],
  ],
  ["dsa-dp"]
);

const DP_2D = mk(
  [
    [62, "Unique Paths", "medium", ["dp"], "2-D DP — grid-path counting."],
    [1143, "Longest Common Subsequence", "medium", ["dp", "string"], "2-D DP — LCS classic."],
    [309, "Best Time to Buy and Sell Stock With Cooldown", "medium", ["dp"], "2-D DP — state machine on holdings."],
    [518, "Coin Change II", "medium", ["dp", "knapsack"], "2-D DP — unbounded count."],
    [494, "Target Sum", "medium", ["dp"], "2-D DP — recast as subset partition."],
    [97, "Interleaving String", "medium", ["dp", "string"], "2-D DP — index pair reachability."],
    [329, "Longest Increasing Path in a Matrix", "hard", ["dp", "graph"], "2-D DP — DFS + memo."],
    [115, "Distinct Subsequences", "hard", ["dp", "string"], "2-D DP — match/skip recurrence."],
    [72, "Edit Distance", "hard", ["dp", "string"], "2-D DP — Levenshtein."],
    [312, "Burst Balloons", "hard", ["dp"], "2-D DP — interval DP, last-to-burst trick."],
    [10, "Regular Expression Matching", "hard", ["dp", "string"], "2-D DP — state on pattern position."],
  ],
  ["dsa-dp"]
);

const GREEDY = mk(
  [
    [53, "Maximum Subarray", "medium", ["greedy", "dp"], "Greedy — Kadane's algorithm."],
    [55, "Jump Game", "medium", ["greedy"], "Greedy — running farthest reach."],
    [45, "Jump Game II", "medium", ["greedy"], "Greedy — implicit BFS over jumps."],
    [134, "Gas Station", "medium", ["greedy"], "Greedy — restart-on-deficit insight."],
    [846, "Hand of Straights", "medium", ["greedy"], "Greedy — peel groups from sorted multiset."],
    [1899, "Merge Triplets to Form Target Triplet", "medium", ["greedy"], "Greedy — only consider non-exceeding triplets."],
    [763, "Partition Labels", "medium", ["greedy"], "Greedy — last-occurrence sweep."],
    [678, "Valid Parenthesis String", "medium", ["greedy"], "Greedy — track open-paren range."],
  ],
  ["dsa-arrays"]
);

const INTERVALS = mk(
  [
    [57, "Insert Interval", "medium", ["intervals"], "Intervals — single-pass merge."],
    [56, "Merge Intervals", "medium", ["intervals", "sorting"], "Intervals — sort then collapse."],
    [435, "Non Overlapping Intervals", "medium", ["intervals", "greedy"], "Intervals — sort by end, count overlaps."],
    [252, "Meeting Rooms", "easy", ["intervals"], "Intervals — sort + adjacent check."],
    [253, "Meeting Rooms II", "medium", ["intervals", "heap"], "Intervals — sweep line / min-heap."],
    [1851, "Minimum Interval to Include Each Query", "hard", ["intervals", "heap"], "Intervals — offline query with min-heap by length."],
  ],
  ["dsa-arrays"]
);

const MATH_GEOM = mk(
  [
    [48, "Rotate Image", "medium", ["matrix"], "Math/Geom — transpose + reverse."],
    [54, "Spiral Matrix", "medium", ["matrix"], "Math/Geom — bounded layer-by-layer walk."],
    [73, "Set Matrix Zeroes", "medium", ["matrix"], "Math/Geom — use first row/col as flags."],
    [202, "Happy Number", "easy", ["math", "fast slow"], "Math/Geom — cycle detection on digit-square sequence."],
    [66, "Plus One", "easy", ["math"], "Math/Geom — long addition warmup."],
    [50, "Pow X N", "medium", ["math"], "Math/Geom — fast exponentiation."],
    [43, "Multiply Strings", "medium", ["math"], "Math/Geom — schoolbook string multiply."],
    [2013, "Detect Squares", "medium", ["hash", "geometry"], "Math/Geom — count diagonals via point map."],
  ],
  ["dsa-arrays"]
);

const BIT_MANIP = mk(
  [
    [136, "Single Number", "easy", ["bit"], "Bit — XOR pairing trick."],
    [191, "Number of 1 Bits", "easy", ["bit"], "Bit — Brian Kernighan's trick."],
    [338, "Counting Bits", "easy", ["bit", "dp"], "Bit — DP on popcount."],
    [190, "Reverse Bits", "easy", ["bit"], "Bit — fixed-width reversal."],
    [268, "Missing Number", "easy", ["bit", "math"], "Bit — XOR or arithmetic sum."],
    [371, "Sum of Two Integers", "medium", ["bit"], "Bit — carry via AND, sum via XOR."],
    [7, "Reverse Integer", "medium", ["math"], "Bit/Math — 32-bit overflow handling."],
  ],
  ["dsa-arrays"]
);

const NEETCODE_150 = [
  ...ARRAYS_HASHING,
  ...TWO_POINTERS,
  ...SLIDING_WINDOW,
  ...STACK,
  ...BINARY_SEARCH,
  ...LINKED_LIST,
  ...TREES,
  ...TRIES,
  ...HEAP,
  ...BACKTRACKING,
  ...GRAPHS,
  ...ADVANCED_GRAPHS,
  ...DP_1D,
  ...DP_2D,
  ...GREEDY,
  ...INTERVALS,
  ...MATH_GEOM,
  ...BIT_MANIP,
];

// De-dupe by id so BIO_EXTRAS overrides win where they exist.
const seen = new Set<string>();
const merged: LeetCodeProblem[] = [];
for (const p of [...BIO_EXTRAS, ...NEETCODE_150]) {
  if (seen.has(p.id)) continue;
  seen.add(p.id);
  merged.push(p);
}

export const LEETCODE_PROBLEMS: LeetCodeProblem[] = merged;
