import { PrismaClient, InterviewType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive placement database seeding...');

  // 1. Core Skill Catalog
  const defaultSkills = [
    { name: 'Data Structures & Algorithms', category: 'DSA', description: 'Arrays, Trees, Graphs, DP, Sorting, Searching' },
    { name: 'Problem Solving & Optimization', category: 'DSA', description: 'Time/space complexity analysis and edge case reasoning' },
    { name: 'Object-Oriented Programming (OOP)', category: 'CS Fundamentals', description: 'Polymorphism, Inheritance, Encapsulation, Abstraction' },
    { name: 'Database Management Systems (DBMS)', category: 'CS Fundamentals', description: 'SQL, Indexing, ACID properties, Normalization' },
    { name: 'Operating Systems', category: 'CS Fundamentals', description: 'Concurrency, Threads, Deadlocks, Virtual Memory' },
    { name: 'Computer Networks', category: 'CS Fundamentals', description: 'TCP/IP, HTTP/HTTPS, DNS, WebSockets, REST' },
    { name: 'Frontend Architecture & React', category: 'Frontend', description: 'React hooks, State management, DOM performance, CSS' },
    { name: 'Backend Engineering & APIs', category: 'Backend', description: 'Express, RESTful standards, Auth, Caching, Middleware' },
    { name: 'System Design & Scalability', category: 'System Design', description: 'Load balancers, Microservices, Sharding, Message queues' },
    { name: 'Behavioral: STAR Communication', category: 'HR/Behavioral', description: 'Structured answers covering Situation, Task, Action, Result' },
    { name: 'Conflict Resolution & Teamwork', category: 'HR/Behavioral', description: 'Navigating disagreements, collaboration, empathy' },
    { name: 'Ownership & Accountability', category: 'HR/Behavioral', description: 'Taking responsibility for deliverables, admitting mistakes' },
  ];

  for (const skill of defaultSkills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`✅ Seeded ${defaultSkills.length} default skills`);

  // 2. Real-World Question Bank Items (Coding, Technical CS Fundamentals, HR Behavioral)
  const questionBankItems = [
    // ==========================================
    // CODING CHALLENGES (LeetCode / Striver SDE Placement Sheet)
    // ==========================================
    {
      title: 'Two Sum Problem',
      category: InterviewType.CODING,
      topic: 'DSA: Arrays & Hash Maps',
      difficulty: 'Easy',
      companyTags: ['Google', 'Amazon', 'Meta', 'TCS', 'Infosys'],
      promptText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
      starterCode: {
        python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Use a hash map for O(n) lookup\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n',
        javascript: 'function twoSum(nums, target) {\n    const lookup = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (lookup.has(diff)) return [lookup.get(diff), i];\n        lookup.set(nums[i], i);\n    }\n    return [];\n}\n',
        cpp: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> lookup;\n    for (int i = 0; i < nums.size(); ++i) {\n        int diff = target - nums[i];\n        if (lookup.count(diff)) return {lookup[diff], i};\n        lookup[nums[i]] = i;\n    }\n    return {};\n}\n',
        java: 'import java.util.HashMap;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[] { map.get(diff), i };\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}\n',
      },
      sampleAnswer: 'Use an unordered hash map to store seen numbers and their indices in O(N) time and O(N) space.',
      testCases: [
        { type: 'SAMPLE', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
        { type: 'SAMPLE', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
        { type: 'HIDDEN', input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' },
        { type: 'HIDDEN', input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2, 4]' },
      ],
      hints: ['A brute-force solution is O(N^2). Can you use a hash map to achieve O(N) time complexity?'],
    },
    {
      title: 'Valid Parentheses',
      category: InterviewType.CODING,
      topic: 'DSA: Stacks',
      difficulty: 'Easy',
      companyTags: ['Microsoft', 'Amazon', 'Meta', 'Infosys', 'Bloomberg'],
      promptText: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      starterCode: {
        python: 'def isValid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n',
        javascript: 'function isValid(s) {\n    const stack = [];\n    const map = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (map[char]) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n',
        cpp: '#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    unordered_map<char, char> mp = {{\')\', \'(\'}, {\'}\', \'{\' }, {\']\', \'[\'}};\n    for (char c : s) {\n        if (mp.count(c)) {\n            if (st.empty() || st.top() != mp[c]) return false;\n            st.pop();\n        } else {\n            st.push(c);\n        }\n    }\n    return st.empty();\n}\n',
        java: 'import java.util.Stack;\nimport java.util.HashMap;\n\npublic class Solution {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        HashMap<Character, Character> map = new HashMap<>();\n        map.put(\')\', \'(\'); map.put(\'}\', \'{\'); map.put(\']\', \'[\');\n        for (char c : s.toCharArray()) {\n            if (map.containsKey(c)) {\n                if (stack.isEmpty() || stack.pop() != map.get(c)) return false;\n            } else { stack.push(c); }\n        }\n        return stack.isEmpty();\n    }\n}\n',
      },
      sampleAnswer: 'Push opening brackets onto a LIFO stack. For each closing bracket, check if it matches the stack top.',
      testCases: [
        { type: 'SAMPLE', input: 's = "()"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "()[]{}"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "(]"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = "([)]"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = "{[]}"', expectedOutput: 'true' },
      ],
      hints: ['Use a Last-In-First-Out (LIFO) stack to match opening and closing brackets.'],
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      category: InterviewType.CODING,
      topic: 'DSA: Arrays & DP',
      difficulty: 'Easy',
      companyTags: ['Amazon', 'Google', 'Apple', 'TCS'],
      promptText: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      starterCode: {
        python: 'def maxProfit(prices: list[int]) -> int:\n    min_price = float("inf")\n    max_profit = 0\n    for p in prices:\n        if p < min_price:\n            min_price = p\n        elif p - min_price > max_profit:\n            max_profit = p - min_price\n    return max_profit\n',
        javascript: 'function maxProfit(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (let p of prices) {\n        if (p < minPrice) minPrice = p;\n        else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n    }\n    return maxProfit;\n}\n',
        cpp: '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    int minPrice = 1e9, maxProf = 0;\n    for (int p : prices) {\n        minPrice = min(minPrice, p);\n        maxProf = max(maxProf, p - minPrice);\n    }\n    return maxProf;\n}\n',
        java: 'public class Solution {\n    public static int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE, maxProfit = 0;\n        for (int p : prices) {\n            if (p < minPrice) minPrice = p;\n            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n        }\n        return maxProfit;\n    }\n}\n',
      },
      sampleAnswer: 'Iterate through prices keeping track of the minimum price so far and the maximum difference in O(N) time.',
      testCases: [
        { type: 'SAMPLE', input: 'prices = [7,1,5,3,6,4]', expectedOutput: '5' },
        { type: 'SAMPLE', input: 'prices = [7,6,4,3,1]', expectedOutput: '0' },
        { type: 'HIDDEN', input: 'prices = [2,4,1]', expectedOutput: '2' },
      ],
      hints: ['Track the minimum price seen so far as you iterate through the list.'],
    },
    {
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      category: InterviewType.CODING,
      topic: 'DSA: Dynamic Programming',
      difficulty: 'Medium',
      companyTags: ['Google', 'Microsoft', 'TCS', 'Infosys'],
      promptText: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nExample 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
      starterCode: {
        python: 'def maxSubArray(nums: list[int]) -> int:\n    max_sum = current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n',
        javascript: 'function maxSubArray(nums) {\n    let maxSum = nums[0];\n    let curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        maxSum = Math.max(maxSum, curr);\n    }\n    return maxSum;\n}\n',
        cpp: '#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    int curr = nums[0], maxS = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        curr = max(nums[i], curr + nums[i]);\n        maxS = max(maxS, curr);\n    }\n    return maxS;\n}\n',
        java: 'public class Solution {\n    public static int maxSubArray(int[] nums) {\n        int curr = nums[0], maxS = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            curr = Math.max(nums[i], curr + nums[i]);\n            maxS = Math.max(maxS, curr);\n        }\n        return maxS;\n    }\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
        { type: 'SAMPLE', input: 'nums = [1]', expectedOutput: '1' },
        { type: 'HIDDEN', input: 'nums = [5,4,-1,7,8]', expectedOutput: '23' },
      ],
      hints: ['At each step, decide whether to add current number to running sum or start a new subarray.'],
    },
    {
      title: 'Valid Palindrome',
      category: InterviewType.CODING,
      topic: 'DSA: Two Pointers',
      difficulty: 'Easy',
      companyTags: ['Meta', 'Apple', 'Microsoft'],
      promptText: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
      starterCode: {
        python: 'def isPalindrome(s: str) -> bool:\n    filtered = [c.lower() for c in s if c.isalnum()]\n    return filtered == filtered[::-1]\n',
        javascript: 'function isPalindrome(s) {\n    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n    return cleaned === cleaned.split("").reverse().join("");\n}\n',
        cpp: '#include <string>\n#include <cctype>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    int i = 0, j = s.length() - 1;\n    while (i < j) {\n        while (i < j && !isalnum(s[i])) i++;\n        while (i < j && !isalnum(s[j])) j--;\n        if (tolower(s[i]) != tolower(s[j])) return false;\n        i++; j--;\n    }\n    return true;\n}\n',
        java: 'public class Solution {\n    public static boolean isPalindrome(String s) {\n        int i = 0, j = s.length() - 1;\n        while (i < j) {\n            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;\n            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;\n            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;\n            i++; j--;\n        }\n        return true;\n    }\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 's = "A man, a plan, a canal: Panama"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "race a car"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = " "', expectedOutput: 'true' },
      ],
      hints: ['Use two pointers moving from both ends inward while skipping non-alphanumeric characters.'],
    },
    {
      title: 'Container With Most Water',
      category: InterviewType.CODING,
      topic: 'DSA: Two Pointers',
      difficulty: 'Medium',
      companyTags: ['Google', 'Amazon', 'Meta'],
      promptText: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
      starterCode: {
        python: 'def maxArea(height: list[int]) -> int:\n    left, right = 0, len(height) - 1\n    max_w = 0\n    while left < right:\n        w = (right - left) * min(height[left], height[right])\n        if w > max_w: max_w = w\n        if height[left] < height[right]: left += 1\n        else: right -= 1\n    return max_w\n',
        javascript: 'function maxArea(height) {\n    let left = 0, right = height.length - 1, maxW = 0;\n    while (left < right) {\n        const w = (right - left) * Math.min(height[left], height[right]);\n        if (w > maxW) maxW = w;\n        if (height[left] < height[right]) left++;\n        else right--;\n    }\n    return maxW;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'height = [1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
        { type: 'SAMPLE', input: 'height = [1,1]', expectedOutput: '1' },
        { type: 'HIDDEN', input: 'height = [4,3,2,1,4]', expectedOutput: '16' },
      ],
      hints: ['Start with the widest container using two pointers. Always move the pointer with the shorter height inward.'],
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      category: InterviewType.CODING,
      topic: 'DSA: Sliding Window',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Google', 'Bloomberg', 'Meta'],
      promptText: 'Given a string s, find the length of the longest substring without repeating characters.\n\nExample 1:\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
      starterCode: {
        python: 'def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n',
        javascript: 'function lengthOfLongestSubstring(s) {\n    let map = new Map(), left = 0, maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        if (map.has(s[right]) && map.get(s[right]) >= left) {\n            left = map.get(s[right]) + 1;\n        }\n        map.set(s[right], right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 's = "abcabcbb"', expectedOutput: '3' },
        { type: 'SAMPLE', input: 's = "bbbbb"', expectedOutput: '1' },
        { type: 'HIDDEN', input: 's = "pwwkew"', expectedOutput: '3' },
      ],
      hints: ['Use a sliding window with a hash map recording the most recent index of each character.'],
    },
    {
      title: 'Climbing Stairs (Dynamic Programming)',
      category: InterviewType.CODING,
      topic: 'DSA: Dynamic Programming',
      difficulty: 'Easy',
      companyTags: ['Amazon', 'Google', 'Uber', 'TCS'],
      promptText: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nExample:\nInput: n = 3\nOutput: 3\nExplanation: There are three ways: 1+1+1, 1+2, 2+1.',
      starterCode: {
        python: 'def climbStairs(n: int) -> int:\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n',
        javascript: 'function climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) {\n        let temp = a + b; a = b; b = temp;\n    }\n    return b;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'n = 2', expectedOutput: '2' },
        { type: 'SAMPLE', input: 'n = 3', expectedOutput: '3' },
        { type: 'HIDDEN', input: 'n = 5', expectedOutput: '8' },
      ],
      hints: ['Notice that ways(n) = ways(n-1) + ways(n-2), which is equivalent to the Fibonacci sequence.'],
    },
    {
      title: 'Search in Rotated Sorted Array',
      category: InterviewType.CODING,
      topic: 'DSA: Binary Search',
      difficulty: 'Medium',
      companyTags: ['Google', 'Microsoft', 'Amazon'],
      promptText: 'There is an integer array nums sorted in ascending order (with distinct values) that is possibly rotated at an unknown pivot index.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.',
      starterCode: {
        python: 'def search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]: right = mid - 1\n            else: left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]: left = mid + 1\n            else: right = mid - 1\n    return -1\n',
        javascript: 'function search(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        let mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[left] <= nums[mid]) {\n            if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n            else left = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n            else right = mid - 1;\n        }\n    }\n    return -1;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'nums = [4,5,6,7,0,1,2], target = 0', expectedOutput: '4' },
        { type: 'SAMPLE', input: 'nums = [4,5,6,7,0,1,2], target = 3', expectedOutput: '-1' },
        { type: 'HIDDEN', input: 'nums = [1], target = 0', expectedOutput: '-1' },
      ],
      hints: ['At least one half of the array will always remain normally sorted. Determine which half is sorted and check if target lies within its bounds.'],
    },
    {
      title: 'Coin Change Problem',
      category: InterviewType.CODING,
      topic: 'DSA: Dynamic Programming',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
      promptText: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
      starterCode: {
        python: 'def coinChange(coins: list[int], amount: int) -> int:\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float("inf") else -1\n',
        javascript: 'function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (let c of coins) {\n        for (let i = c; i <= amount; i++) {\n            dp[i] = Math.min(dp[i], dp[i - c] + 1);\n        }\n    }\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'coins = [1,2,5], amount = 11', expectedOutput: '3' },
        { type: 'SAMPLE', input: 'coins = [2], amount = 3', expectedOutput: '-1' },
        { type: 'HIDDEN', input: 'coins = [1], amount = 0', expectedOutput: '0' },
      ],
      hints: ['Define dp[i] as the minimum coins needed for amount i. Transition: dp[i] = min(dp[i], dp[i - coin] + 1).'],
    },

    // ==========================================
    // TECHNICAL CS FUNDAMENTALS & SYSTEM DESIGN
    // ==========================================
    {
      title: 'Database Indexing Under the Hood',
      category: InterviewType.TECHNICAL,
      topic: 'DBMS: Indexing & Performance',
      difficulty: 'Medium',
      companyTags: ['PostgreSQL', 'Amazon', 'Uber', 'MySQL'],
      promptText: 'Explain how a B-Tree index improves query speed in a relational database like PostgreSQL. What are the trade-offs of having too many indexes on a table?',
      sampleAnswer: 'A B-Tree keeps data sorted in balanced hierarchical nodes, reducing search complexity from O(N) full table scans to O(log N). The trade-offs include increased storage overhead and write amplification, as every INSERT, UPDATE, or DELETE must also synchronously update corresponding B-Tree nodes.',
      hints: ['Think about read operations vs write operations and index maintenance overhead.'],
    },
    {
      title: 'Difference Between Process and Thread',
      category: InterviewType.TECHNICAL,
      topic: 'Operating Systems: Concurrency',
      difficulty: 'Easy',
      companyTags: ['Microsoft', 'Google', 'Qualcomm', 'Infosys'],
      promptText: 'What is the fundamental difference between a Process and a Thread? How do they share or isolate memory, and how does context switching compare between them?',
      sampleAnswer: 'A process is an independent execution unit with its own dedicated virtual address space and file descriptors. A thread is a lightweight execution flow within a process that shares the heap and memory space with other threads in the same process, but maintains its own program counter and stack.',
      hints: ['Address memory isolation, IPC vs shared memory, and context switching overhead.'],
    },
    {
      title: 'PostgreSQL MVCC & ACID Compliance',
      category: InterviewType.TECHNICAL,
      topic: 'DBMS: Transactions & Concurrency',
      difficulty: 'Hard',
      companyTags: ['Stripe', 'Amazon', 'Uber'],
      promptText: 'How does PostgreSQL achieve ACID transaction isolation without locking readers? Explain Multi-Version Concurrency Control (MVCC) and Write-Ahead Logging (WAL).',
      sampleAnswer: 'Postgres uses MVCC by maintaining multiple versions of row tuples with xmin and xmax transaction IDs. Readers never block writers and writers never block readers. WAL guarantees durability by writing transaction delta records sequentially to disk before flushing changes to data files.',
      hints: ['Mention transaction snapshots, xmin/xmax tuple headers, and crash recovery.'],
    },
    {
      title: 'TCP 3-Way Handshake vs UDP',
      category: InterviewType.TECHNICAL,
      topic: 'Networks: Transport Protocols',
      difficulty: 'Medium',
      companyTags: ['Cisco', 'Cloudflare', 'Google', 'TCS'],
      promptText: 'Explain the sequence of packets in a TCP 3-way handshake (SYN, SYN-ACK, ACK). When would an engineering team choose UDP over TCP?',
      sampleAnswer: 'Client sends SYN, server responds with SYN-ACK, and client completes connection with ACK. UDP is preferred in latency-critical applications like live video streaming or gaming where packet loss is preferable to head-of-line blocking retransmission delays.',
      hints: ['Explain sequence numbers, connection state, and reliability vs throughput.'],
    },
    {
      title: 'System Design: Scaling to 1 Million Users',
      category: InterviewType.TECHNICAL,
      topic: 'System Design: Scalability',
      difficulty: 'Hard',
      companyTags: ['Meta', 'Netflix', 'Amazon'],
      promptText: 'Design a high-level architecture for a web application expected to grow from 1,000 to 1,000,000 daily active users. What bottlenecks arise and how do you address them?',
      sampleAnswer: '1. Introduce a load balancer (Nginx/ALB) and stateless application servers. 2. Implement a caching layer (Redis) for hot read queries. 3. Configure database read replicas and eventually shard horizontally. 4. Offload asynchronous tasks (emails, notifications) to message queues (RabbitMQ/Kafka). 5. Serve static assets via CDN.',
      hints: ['Start with monolithic database bottleneck, then cache, queues, read replicas, and CDN.'],
    },
    {
      title: 'System Design: URL Shortener (TinyURL)',
      category: InterviewType.TECHNICAL,
      topic: 'System Design: High Availability',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Microsoft', 'Google'],
      promptText: 'Design a scalable URL shortening service like TinyURL or Bitly. How do you generate unique short URLs, handle redirects with low latency, and scale to 100M URLs?',
      sampleAnswer: 'Use Base62 encoding (a-z, A-Z, 0-9) over a unique 64-bit auto-incrementing ID generated by Snowflake or distributed token servers. Store mapping in a distributed key-value store or PostgreSQL with an index on short_hash. Cache top 20% URLs in Redis (LRU cache) for sub-5ms 301/302 redirects.',
      hints: ['Discuss Base62 encoding, ID generation, database schema, caching, and 301 vs 302 redirect HTTP codes.'],
    },
    {
      title: 'What Happens When You Type google.com in a Browser?',
      category: InterviewType.TECHNICAL,
      topic: 'Networks & Web: End-to-End Request Lifecycle',
      difficulty: 'Medium',
      companyTags: ['Google', 'Meta', 'Amazon', 'Apple'],
      promptText: 'Trace the entire lifecycle from when a user types "https://google.com" into the browser navigation bar and presses Enter until the webpage finishes rendering on screen.',
      sampleAnswer: '1. Browser checks cache (browser, OS, router). 2. DNS query recursively resolves domain to IP via root, TLD, and authoritative nameservers. 3. TCP 3-way handshake established with server. 4. TLS cryptographic handshake (certificate validation, session key negotiation). 5. HTTP GET request sent. 6. Server responds with 200 OK HTML payload. 7. Browser parses HTML to construct DOM tree, parses CSS for CSSOM, builds Render Tree, executes Layout/Reflow, and paints pixels to GPU.',
      hints: ['Cover DNS resolution, TCP/TLS handshake, HTTP response, and browser rendering pipeline (DOM, CSSOM, Render Tree, Paint).'],
    },
    {
      title: 'Explain Deadlocks: 4 Coffman Conditions & Prevention',
      category: InterviewType.TECHNICAL,
      topic: 'Operating Systems: Synchronization',
      difficulty: 'Medium',
      companyTags: ['Microsoft', 'Google', 'Amazon'],
      promptText: 'What is a deadlock in concurrent programming? State the 4 Coffman conditions required for a deadlock to occur, and explain strategies to prevent or break deadlocks.',
      sampleAnswer: 'A deadlock is a state where a set of processes are blocked because each is holding a resource and waiting for another resource held by another process. 4 Coffman conditions: 1. Mutual Exclusion. 2. Hold and Wait. 3. No Preemption. 4. Circular Wait. Prevention involves breaking at least one condition, such as enforcing strict global lock ordering to eliminate circular wait, or using timeouts with tryLock.',
      hints: ['Name: Mutual exclusion, Hold & wait, No preemption, Circular wait. Mention global lock acquisition ordering.'],
    },
    {
      title: 'SQL vs NoSQL: When to Choose Which?',
      category: InterviewType.TECHNICAL,
      topic: 'DBMS: Architecture & CAP Theorem',
      difficulty: 'Easy',
      companyTags: ['TCS', 'Infosys', 'Amazon', 'Microsoft'],
      promptText: 'Compare relational databases (SQL: Postgres, MySQL) and non-relational databases (NoSQL: MongoDB, DynamoDB). Under what application requirements would you choose one over the other?',
      sampleAnswer: 'Choose SQL when data is structured with complex relationships, and strict ACID transaction consistency is mandatory (e.g., banking, e-commerce orders, inventory). Choose NoSQL when schema flexibility is required, data is hierarchical/document-oriented, or massive horizontal write scaling is needed with eventual consistency.',
      hints: ['Discuss schema flexibility, ACID transactions vs CAP theorem, joins, and horizontal vs vertical scaling.'],
    },
    {
      title: 'Microservices vs Monolith Architecture',
      category: InterviewType.TECHNICAL,
      topic: 'System Design: Architectural Patterns',
      difficulty: 'Medium',
      companyTags: ['Uber', 'Netflix', 'Amazon'],
      promptText: 'What are the main advantages and trade-offs of breaking a monolithic application into a microservices architecture? What new complexities are introduced?',
      sampleAnswer: 'Microservices enable independent deployment, domain separation, and technology heterogeneity. However, they introduce substantial operational overhead: network latency between services, distributed tracing, complex failure cascades, and the need for distributed transaction management (Saga pattern or 2PC) instead of local database transactions.',
      hints: ['Highlight network latency, distributed logging/tracing, independent deployments, and data consistency.'],
    },

    // ==========================================
    // HR BEHAVIORAL & STAR QUESTIONS (Top Placement Rounds)
    // ==========================================
    {
      title: 'Tell Me About Yourself & Why Software Engineering?',
      category: InterviewType.HR,
      topic: 'HR: Introduction & Aspirations',
      difficulty: 'Easy',
      companyTags: ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys'],
      promptText: 'Please introduce yourself. Walk me through your academic background, the core technical projects you have built, and what drives your passion for software engineering.',
      sampleAnswer: 'I am a final-year computer science student passionate about building performant distributed backend services. In my recent capstone project, I built a real-time collaborative workspace using Node.js and WebSockets that handled over 50 concurrent connections with sub-100ms latency. I enjoy dissecting complex system problems and optimizing bottlenecks, and I am excited to contribute as a software engineer.',
      hints: ['Keep it to 90 seconds. Cover education, top 1-2 impactful projects, technical skillset, and alignment with the role.'],
    },
    {
      title: 'Facing a Significant Technical Obstacle',
      category: InterviewType.HR,
      topic: 'HR: Conflict & Obstacles',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
      promptText: 'Describe a situation in a past project or academic endeavor where you encountered a major unexpected obstacle. What was the situation, what action did you personally take to overcome it, and what was the outcome?',
      sampleAnswer: 'In my capstone project, our auth API changed contracts two weeks before launch. As backend lead, I wrote an adapter wrapper within 48 hours to translate payloads, preserving backwards compatibility and delivering on time.',
      hints: ['Focus on your specific actions rather than just complaining about the problem. Conclude with measurable results.'],
    },
    {
      title: 'Handling Technical Disagreements in a Team',
      category: InterviewType.HR,
      topic: 'HR: Teamwork & Communication',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Microsoft', 'Meta'],
      promptText: 'Have you ever had a disagreement with a team member or mentor regarding a technical decision? How did you resolve it constructively?',
      sampleAnswer: 'During a hackathon, a teammate wanted MongoDB for graph-like recommendations, while I advocated for Postgres joins. I benchmarked query latency on sample data within 30 minutes, showing 4x faster results in Postgres, which convinced the team empirically.',
      hints: ['Highlight objective criteria (benchmarks, user experience) rather than personal ego.'],
    },
    {
      title: 'Learning from a Past Failure or Critical Bug',
      category: InterviewType.HR,
      topic: 'HR: Accountability & Learning',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Meta', 'Google'],
      promptText: 'Tell me about a time when a software bug you wrote made it past testing or caused a failure. How did you handle the situation and what did you learn?',
      sampleAnswer: 'I deployed a database migration that lacked a default value for a new non-null column, failing in staging. I immediately rolled back, wrote unit tests for migration scripts, and documented a migration checklist for our team.',
      hints: ['Acknowledge accountability without deflecting blame, and explain the preventative system you established.'],
    },
    {
      title: 'Delivering Under Tight Deadlines & Ambiguity',
      category: InterviewType.HR,
      topic: 'HR: Time Management & Prioritization',
      difficulty: 'Medium',
      companyTags: ['Amazon', 'Apple', 'TCS'],
      promptText: 'Describe a project where requirements were ambiguous and the deadline was tight. How did you prioritize deliverables to ensure successful completion?',
      sampleAnswer: 'During our college semester project, client requirements changed 5 days before submission. I broke down deliverables into Must-Have (P0), Should-Have (P1), and Nice-to-Have (P2), focusing 100% of team effort on core user workflows.',
      hints: ['Explain your prioritization framework (e.g. MoSCoW, impact vs effort).'],
    },
    {
      title: 'Why Do You Want to Work at Our Company?',
      category: InterviewType.HR,
      topic: 'HR: Company Alignment & Motivation',
      difficulty: 'Easy',
      companyTags: ['Google', 'Microsoft', 'TCS', 'Infosys'],
      promptText: 'What specifically attracts you to our organization? How do our engineering challenges and company culture align with your long-term career goals?',
      sampleAnswer: 'I have followed your engineering blog and was impressed by your architectural migration to event-driven microservices. I want to work in an environment where code is tested thoroughly at massive scale, and where mentorship and high code review standards foster continuous engineering growth.',
      hints: ['Show you researched the company tech stack, culture, or engineering blogs. Connect it with your personal growth goals.'],
    },
    {
      title: 'Tell Me About a Time You Showed Leadership',
      category: InterviewType.HR,
      topic: 'HR: Leadership & Initiative',
      difficulty: 'Medium',
      companyTags: ['Google', 'Amazon', 'Meta'],
      promptText: 'Describe an instance where you stepped up and demonstrated leadership, initiative, or mentorship without having a formal leadership title.',
      sampleAnswer: 'During our group project, our team lacked a unified Git workflow, leading to frequent merge conflicts. I took the initiative to set up branch protection rules, create a Pull Request template, and host a 30-minute workshop on interactive rebase, which eliminated merge conflicts for the rest of the semester.',
      hints: ['Leadership is about initiative, improving team velocity, and removing roadblocks for others.'],
    },
    {
      title: 'How Do You Handle Constructive Criticism?',
      category: InterviewType.HR,
      topic: 'HR: Growth Mindset & Feedback',
      difficulty: 'Easy',
      companyTags: ['Microsoft', 'Amazon', 'Apple'],
      promptText: 'How do you respond when a senior engineer or peer gives critical feedback on your code or proposal during a code review?',
      sampleAnswer: 'I view code review feedback as a valuable learning opportunity. When a senior engineer pointed out that my loop had O(N^2) complexity and recommended a two-pointer approach, I thanked them, studied the algorithm, benchmarked the 10x performance gain, and documented the pattern in our team wiki.',
      hints: ['Emphasize humbleness, curiosity, growth mindset, and implementing the recommendations without defensiveness.'],
    },
  ];

  for (const rawItem of questionBankItems) {
    const item: any = { ...rawItem };

    // Set sheet tags and optimal complexity if not already specified
    if (!item.sheetTags || item.sheetTags.length === 0) {
      if (item.category === InterviewType.CODING) {
        item.sheetTags = ['Striver SDE 75', 'Blind 75', 'NeetCode 150', 'FAANG Fast-Track'];
        if (item.difficulty === 'Easy') item.sheetTags.push('TCS & Mass Recruiter');
        
        if (item.topic.includes('Binary Search')) {
          item.optimalComplexity = { time: 'O(log N)', space: 'O(1)', note: 'Binary partition over sorted half' };
        } else if (item.topic.includes('Two Pointers') || item.topic.includes('Arrays')) {
          item.optimalComplexity = { time: 'O(N)', space: 'O(1)', note: 'Linear traversal with constant memory' };
        } else {
          item.optimalComplexity = { time: 'O(N)', space: 'O(N)', note: 'Optimal auxiliary data structure' };
        }
      } else if (item.category === InterviewType.TECHNICAL) {
        item.sheetTags = ['CS Core Placement', 'TCS & Mass Recruiter', 'FAANG Fast-Track'];
        item.optimalComplexity = { time: 'Architectural', space: 'Distributed', note: 'Core CS Fundamentals' };
      } else {
        item.sheetTags = ['Behavioral & Leadership', 'Amazon Leadership Principles', 'TCS & Mass Recruiter'];
        item.optimalComplexity = { time: 'STAR Format', space: 'Concise & Structured', note: 'Situation -> Task -> Action -> Result' };
      }
    }

    // Ensure 3 tiered hints for AlgoExpert-style reveal
    if (!item.hints || item.hints.length < 3) {
      const existingHints = item.hints || [];
      const baseHint = existingHints[0] || 'Understand the core requirements and trade-offs.';
      item.hints = [
        `Tier 1 (Conceptual Approach): ${baseHint}`,
        `Tier 2 (Optimal Data Structure / Paradigm): Consider how caching visited state or using pointer traversal eliminates redundant iterations.`,
        `Tier 3 (Step-by-step Logic): Validate input boundaries, initialize accumulator/lookup structures, loop through inputs while maintaining invariant state, and return the formatted result.`
      ];
    }

    const existing = await prisma.questionBankItem.findFirst({
      where: { title: item.title },
    });
    if (existing) {
      await prisma.questionBankItem.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.questionBankItem.create({
        data: item,
      });
    }
  }
  console.log(`✅ Upserted ${questionBankItems.length} verified placement questions with company and sheet tags`);

  // 3. Demo Candidate Account Setup
  const demoEmail = 'candidate@interviewpilot.ai';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('DemoPass123!', 10);
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: hashedPassword,
        isVerified: true,
        profile: {
          create: {
            fullName: 'Alex Vance',
            targetRole: 'Full Stack Software Engineer',
            experienceLevel: 'Fresher',
            degree: 'B.Tech in Computer Science & Engineering',
            graduationYear: 2026,
            programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'C++'],
            technicalSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
            dailyStudyMinutes: 90,
          },
        },
      },
    });

    console.log(`✅ Created demo user: ${demoEmail} (Password: DemoPass123!)`);
  } else {
    console.log(`ℹ️  Demo user already exists: ${demoEmail}`);
  }

  // 4. Seed Real Progress Records for Demo User (LeetCode / NeetCode style)
  if (demoUser) {
    const allDbQuestions = await prisma.questionBankItem.findMany();
    const twoSum = allDbQuestions.find((q) => q.title.includes('Two Sum'));
    const validParentheses = allDbQuestions.find((q) => q.title.includes('Valid Parentheses'));
    const dbIndex = allDbQuestions.find((q) => q.title.includes('Database Indexing'));
    const substring = allDbQuestions.find((q) => q.title.includes('Longest Substring'));
    const mvcc = allDbQuestions.find((q) => q.title.includes('PostgreSQL MVCC'));
    const conflict = allDbQuestions.find((q) => q.title.includes('Technical Conflict'));

    const progressToSeed = [
      { q: twoSum, status: 'SOLVED' as const, isBookmarked: true, lastScore: 100 },
      { q: validParentheses, status: 'SOLVED' as const, isBookmarked: false, lastScore: 100 },
      { q: dbIndex, status: 'SOLVED' as const, isBookmarked: true, lastScore: 88 },
      { q: substring, status: 'ATTEMPTED' as const, isBookmarked: true, lastScore: 65 },
      { q: mvcc, status: 'ATTEMPTED' as const, isBookmarked: false, lastScore: 50 },
      { q: conflict, status: 'SOLVED' as const, isBookmarked: true, lastScore: 92 },
    ];

    for (const prog of progressToSeed) {
      if (prog.q) {
        await prisma.userQuestionProgress.upsert({
          where: {
            userId_questionBankItemId: {
              userId: demoUser.id,
              questionBankItemId: prog.q.id,
            },
          },
          update: {
            status: prog.status,
            isBookmarked: prog.isBookmarked,
            lastScore: prog.lastScore,
            solvedAt: prog.status === 'SOLVED' ? new Date() : null,
          },
          create: {
            userId: demoUser.id,
            questionBankItemId: prog.q.id,
            status: prog.status,
            isBookmarked: prog.isBookmarked,
            lastScore: prog.lastScore,
            solvedAt: prog.status === 'SOLVED' ? new Date() : null,
          },
        });
      }
    }
    console.log(`✅ Seeded realistic progress records for ${demoEmail}`);
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
