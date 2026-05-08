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

export const LEETCODE_PROBLEMS: LeetCodeProblem[] = [
  { id: "lc-187", number: 187, title: "Repeated DNA Sequences", url: "https://leetcode.com/problems/repeated-dna-sequences/", difficulty: "medium", tags: ["hash table", "sliding window", "rolling hash", "DNA"], track: ["dsa", "biomedical-interview", "bioinformatics"], topicIds: ["dsa-strings", "bme-bioinf"], why: "Find all 10-letter substrings that appear more than once in a DNA string. Classic sliding window + hash map." },
  { id: "lc-28", number: 28, title: "Find the Index of the First Occurrence in a String", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty: "easy", tags: ["strings", "KMP"], track: ["dsa", "bioinformatics"], topicIds: ["dsa-strings", "bme-bioinf"], why: "Motif finding - Rosalind 'Finding a Motif in DNA' in one line." },
  { id: "lc-76", number: 76, title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "hard", tags: ["sliding window", "hash table"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Backbone of many sequence-matching algorithms in bioinformatics." },
  { id: "lc-438", number: 438, title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "medium", tags: ["sliding window", "hash table"], track: ["dsa", "bioinformatics"], topicIds: ["dsa-strings"], why: "Analog of searching rearranged k-mers - useful pattern for GC-window analysis." },
  { id: "lc-1876", number: 1876, title: "Substrings of Size Three with Distinct Characters", url: "https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/", difficulty: "easy", tags: ["sliding window"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Warm-up for k-mer / GC-content sliding-window problems." },
  { id: "lc-3", number: 3, title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "medium", tags: ["sliding window"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Foundational sliding-window problem every bio-DSA sweep builds on." },
  { id: "lc-209", number: 209, title: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty: "medium", tags: ["sliding window", "two pointers"], track: ["dsa"], topicIds: ["dsa-arrays"], why: "Two-pointer template for window-based scans." },
  { id: "lc-560", number: 560, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "medium", tags: ["prefix sum", "hash table"], track: ["dsa"], topicIds: ["dsa-arrays"], why: "Prefix-sum pattern - analogous to computing cumulative GC for any window in O(1)." },
  { id: "lc-139", number: 139, title: "Word Break", url: "https://leetcode.com/problems/word-break/", difficulty: "medium", tags: ["dp", "strings"], track: ["dsa"], topicIds: ["dsa-dp", "dsa-strings"], why: "Classic DP that shows up in tokenization and sequence parsing." },
  { id: "lc-300", number: 300, title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "medium", tags: ["dp", "binary search"], track: ["dsa"], topicIds: ["dsa-dp"], why: "LIS underlies synteny detection and ordering problems in genome assembly." },
  { id: "lc-72", number: 72, title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "hard", tags: ["dp", "strings"], track: ["dsa", "bioinformatics"], topicIds: ["dsa-dp", "bme-bioinf"], why: "Levenshtein distance - core of sequence alignment." },
  { id: "lc-1143", number: 1143, title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "medium", tags: ["dp", "strings"], track: ["dsa", "bioinformatics"], topicIds: ["dsa-dp", "bme-bioinf"], why: "LCS = simplified global alignment (Needleman-Wunsch without gap penalties)." },
  { id: "lc-387", number: 387, title: "First Unique Character in a String", url: "https://leetcode.com/problems/first-unique-character-in-a-string/", difficulty: "easy", tags: ["hash table", "counting"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Character counting - a trivial variation computes base frequency / GC content." },
  { id: "lc-383", number: 383, title: "Ransom Note", url: "https://leetcode.com/problems/ransom-note/", difficulty: "easy", tags: ["counting", "hash table"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Basic frequency-map practice, same skeleton as counting A/C/G/T." },
  { id: "lc-242", number: 242, title: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", difficulty: "easy", tags: ["hash table", "sorting"], track: ["dsa"], topicIds: ["dsa-strings"], why: "Canonical counting problem - warm-up before DNA-base counting." },
  { id: "lc-207", number: 207, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", difficulty: "medium", tags: ["graph", "topological sort"], track: ["dsa"], topicIds: ["dsa-trees"], why: "Topological sort - shows up in assembly DAG ordering." },
  { id: "lc-200", number: 200, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "medium", tags: ["graph", "dfs", "bfs"], track: ["dsa"], topicIds: ["dsa-trees"], why: "Flood fill - same pattern as connected component analysis on images from microscopy." },
];
