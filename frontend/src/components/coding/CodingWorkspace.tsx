import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Play, CheckCircle2, XCircle, Clock, AlertTriangle, Terminal, Code2 } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  promptText: string;
  starterCode: Record<string, string>;
  testCases: { type: 'SAMPLE' | 'HIDDEN'; input: string; expectedOutput: string }[];
}

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    topic: 'DSA: Arrays & Hash Maps',
    difficulty: 'Easy',
    promptText: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []
`,
      javascript: `function twoSum(nums, target) {
    const lookup = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (lookup.has(diff)) {
            return [lookup.get(diff), i];
        }
        lookup.set(nums[i], i);
    }
    return [];
}
`,
      cpp: `#include <vector>
#include <unordered_map>
#include <iostream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> lookup;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (lookup.find(diff) != lookup.end()) {
            return {lookup[diff], i};
        }
        lookup[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto res = twoSum(nums, 9);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}
`,
      java: `import java.util.HashMap;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int[] res = twoSum(nums, 9);
        System.out.println("[" + res[0] + ", " + res[1] + "]");
    }
}
`,
    },
    testCases: [
      { type: 'SAMPLE', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
      { type: 'SAMPLE', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
      { type: 'HIDDEN', input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    topic: 'DSA: Stacks',
    difficulty: 'Easy',
    promptText: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    starterCode: {
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else "#"
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}
`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>
#include <iostream>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mp = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (mp.count(c)) {
            if (st.empty() || st.top() != mp[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

int main() {
    cout << (isValid("()[]{}") ? "true" : "false") << endl;
    return 0;
}
`,
      java: `import java.util.Stack;
import java.util.HashMap;

public class Solution {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        HashMap<Character, Character> map = new HashMap<>();
        map.put(')', '(');
        map.put('}', '{');
        map.put(']', '[');
        for (char c : s.toCharArray()) {
            if (map.containsKey(c)) {
                if (stack.isEmpty() || stack.pop() != map.get(c)) return false;
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}") ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { type: 'SAMPLE', input: 's = "()"', expectedOutput: 'true' },
      { type: 'SAMPLE', input: 's = "()[]{}"', expectedOutput: 'true' },
      { type: 'SAMPLE', input: 's = "(]"', expectedOutput: 'false' },
      { type: 'HIDDEN', input: 's = "([)]"', expectedOutput: 'false' },
      { type: 'HIDDEN', input: 's = "{[]}"', expectedOutput: 'true' },
    ],
  },
];

export const CodingWorkspace: React.FC = () => {
  const { theme } = useTheme();

  const [problems, setProblems] = useState<Problem[]>(DEFAULT_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<Problem>(DEFAULT_PROBLEMS[0]);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState<string>(DEFAULT_PROBLEMS[0].starterCode.python);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>('');

  // Fetch problems from backend question bank
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/code/problems');
        if (res.data.success && res.data.data.length > 0) {
          const loaded = res.data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            topic: p.topic,
            difficulty: p.difficulty,
            promptText: p.promptText,
            starterCode: p.starterCode || DEFAULT_PROBLEMS[0].starterCode,
            testCases: p.testCases || DEFAULT_PROBLEMS[0].testCases,
          }));
          setProblems(loaded);
          setSelectedProblem(loaded[0]);
          setCode(loaded[0].starterCode[language] || loaded[0].starterCode.python);
        }
      } catch (err) {
        // Fallback to default problem set
      }
    };
    fetchProblems();
  }, []);

  // Update code when language changes
  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'cpp' | 'java') => {
    setLanguage(newLang);
    const newCode = selectedProblem.starterCode[newLang] || selectedProblem.starterCode.python || '';
    setCode(newCode);
    setExecutionResult(null);
  };

  // Update problem
  const handleProblemChange = (probId: string) => {
    const prob = problems.find((p) => p.id === probId) || problems[0];
    setSelectedProblem(prob);
    setCode(prob.starterCode[language] || prob.starterCode.python || '');
    setExecutionResult(null);
  };

  // Run Sample Tests
  const handleRunSampleTests = async () => {
    setRunning(true);
    setActiveTab('tests');
    try {
      const res = await api.post('/code/run', {
        language,
        sourceCode: code,
        problemId: selectedProblem.id,
      });

      if (res.data.success) {
        setExecutionResult(res.data.data);
        if (res.data.data.consoleOutput) {
          setConsoleOutput(res.data.data.consoleOutput);
        }
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'RUNTIME_ERROR',
        results: [],
        compileError: err.response?.data?.error?.message || err.message,
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit Solution (Sample + Hidden Tests)
  const handleSubmitSolution = async () => {
    setSubmitting(true);
    setActiveTab('tests');
    try {
      const res = await api.post('/code/submit', {
        language,
        sourceCode: code,
        problemId: selectedProblem.id,
      });

      if (res.data.success) {
        setExecutionResult(res.data.data);
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'RUNTIME_ERROR',
        results: [],
        compileError: err.response?.data?.error?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-7.5rem)] flex flex-col">
      {/* Top Bar: Problem Selector, Language Switcher, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-brand-500" />
          <select
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus-ring"
            value={selectedProblem.id}
            onChange={(e) => handleProblemChange(e.target.value)}
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {selectedProblem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Language:</span>
            <select
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus-ring cursor-pointer"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="cpp">C++ (GCC 13)</option>
              <option value="java">Java 17</option>
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunSampleTests}
            isLoading={running}
            leftIcon={<Play className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Run Sample Tests
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmitSolution}
            isLoading={submitting}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Split: Problem Prompt (Left) and Monaco Editor + Execution Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Problem Description */}
        <Card className="lg:col-span-5 flex flex-col p-5 overflow-y-auto space-y-4">
          <div>
            <span className="text-xs font-bold text-brand-500">{selectedProblem.topic}</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{selectedProblem.title}</h2>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {selectedProblem.promptText}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Sample Test Cases:</h4>
            {selectedProblem.testCases.filter((tc) => tc.type !== 'HIDDEN').map((tc, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
                <p className="text-slate-400">Input: <span className="text-brand-400">{tc.input}</span></p>
                <p className="text-slate-400">Expected: <span className="text-emerald-400">{tc.expectedOutput}</span></p>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Monaco Code Editor + Output Panel */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          {/* Monaco Editor Container */}
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900">
            <Editor
              height="100%"
              language={language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, Courier, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Execution Results / Output Panel */}
          <div className="h-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-2 py-1 rounded font-semibold ${activeTab === 'tests' ? 'bg-brand-500/15 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Test Results {executionResult && `(${executionResult.passedTests}/${executionResult.totalTests} Passed)`}
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-2 py-1 rounded font-semibold ${activeTab === 'console' ? 'bg-brand-500/15 text-brand-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Console Output
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${executionResult.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {executionResult.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {executionResult.executionTimeMs}ms
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 flex-1 overflow-y-auto font-mono text-xs text-slate-300">
              {activeTab === 'tests' ? (
                executionResult ? (
                  executionResult.compileError ? (
                    <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Compilation / Execution Error:</p>
                      <pre className="mt-1 text-[11px] whitespace-pre-wrap">{executionResult.compileError}</pre>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {executionResult.results.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            r.passed
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-[11px] flex items-center gap-1.5">
                              {r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              Case {idx + 1} ({r.type})
                            </span>
                            <p className="text-[10px] text-slate-400">Input: {r.input}</p>
                            <p className="text-[10px] text-slate-400">Expected: {r.expectedOutput} | Output: {r.actualOutput}</p>
                            {r.errorMessage && <p className="text-[10px] text-rose-400">{r.errorMessage}</p>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{r.executionTimeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-slate-500 text-center py-4">Click "Run Sample Tests" or "Submit Solution" to test your code.</p>
                )
              ) : (
                <pre className="whitespace-pre-wrap text-[11px] text-slate-300">
                  {consoleOutput || 'No stdout printed.'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
