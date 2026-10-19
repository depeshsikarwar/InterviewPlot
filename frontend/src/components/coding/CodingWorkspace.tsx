import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Code2,
  Sparkles,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Zap,
  Gauge,
  Send,
  Building2,
  Check,
  Copy,
  X
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  promptText: string;
  starterCode: Record<string, string>;
  testCases: { type: 'SAMPLE' | 'HIDDEN'; input: string; expectedOutput: string }[];
  hints?: string[];
  companyTags?: string[];
  optimalComplexity?: { time: string; space: string; note: string };
}

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    topic: 'DSA: Arrays & Hash Maps',
    difficulty: 'Easy',
    companyTags: ['Google', 'Amazon', 'Meta', 'TCS', 'Infosys'],
    optimalComplexity: { time: 'O(N)', space: 'O(N)', note: 'Single pass Hash Map' },
    hints: [
      'Tier 1 (Conceptual Approach): A brute-force nested loop checks all pairs in O(N²). How can we check if the complement has been seen in O(1)?',
      'Tier 2 (Optimal Data Structure): Use a Hash Map (Dictionary) mapping number values to their original indices.',
      'Tier 3 (Step-by-step Logic): For each element x at index i, compute complement = target - x. If complement is in the map, return [map[complement], i]. Otherwise store map[x] = i.'
    ],
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
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> lookup;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (lookup.count(diff)) return {lookup[diff], i};
        lookup[nums[i]] = i;
    }
    return {};
}
`,
      java: `import java.util.HashMap;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) return new int[] { map.get(diff), i };
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
    },
    testCases: [
      { type: 'SAMPLE', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
      { type: 'SAMPLE', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
      { type: 'HIDDEN', input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' },
      { type: 'HIDDEN', input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2, 4]' },
    ],
  },
];

const BASIC_STARTER_TEMPLATES: Record<string, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

// Write your solution below

int main() {
    // Basic structure template
    return 0;
}
`,
  python: `# Write your solution below

def solution():
    pass

if __name__ == "__main__":
    # Basic structure template
    pass
`,
  javascript: `// Write your solution below

function solution() {
    return 0;
}

// Basic structure template
`,
  java: `import java.util.*;

public class Solution {
    // Write your solution below

    public static void main(String[] args) {
        // Basic structure template
    }
}
`,
};

export const CodingWorkspace: React.FC = () => {
  const { theme } = useTheme();

  const [problems, setProblems] = useState<Problem[]>(DEFAULT_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<Problem>(DEFAULT_PROBLEMS[0]);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState<string>(BASIC_STARTER_TEMPLATES.python);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'custom' | 'review'>('tests');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>('');

  // Show Answer / Reference Solution State
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

  // AlgoExpert-style Tiered Hints State
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  // Custom Input State
  const [customInput, setCustomInput] = useState<string>('nums = [2, 7, 11, 15], target = 9');
  const [runningCustom, setRunningCustom] = useState<boolean>(false);

  // AI Big-O & Code Quality Review State
  const [analyzingReview, setAnalyzingReview] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<any>(null);

  // interviewing.io 45-min Live Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, timerSeconds]);

  const formatCodingTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch problems from backend question bank
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/code/problems');
        if (res.data.success && res.data.data.length > 0) {
          const loaded: Problem[] = res.data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            topic: p.topic,
            difficulty: p.difficulty,
            promptText: p.promptText,
            starterCode: p.starterCode || DEFAULT_PROBLEMS[0].starterCode,
            testCases: p.testCases || DEFAULT_PROBLEMS[0].testCases,
            hints: p.hints || [],
            companyTags: p.companyTags || [],
            optimalComplexity: p.optimalComplexity || null,
          }));

          const searchParams = new URLSearchParams(window.location.search);
          const targetId = searchParams.get('problemId');
          const target = loaded.find((p) => p.id === targetId) || loaded[0];

          setProblems(loaded);
          setSelectedProblem(target);
          setCode(BASIC_STARTER_TEMPLATES[language]);
          setRevealedHints({});
          setAiReview(null);
        }
      } catch (err) {
        // Fallback to default problem set
      }
    };
    fetchProblems();
  }, []);

  // Update code when language changes - provides clean starter code
  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'cpp' | 'java') => {
    setLanguage(newLang);
    setCode(BASIC_STARTER_TEMPLATES[newLang]);
    setExecutionResult(null);
  };

  // Update problem - initializes with empty starter template
  const handleProblemChange = (probId: string) => {
    const prob = problems.find((p) => p.id === probId) || problems[0];
    setSelectedProblem(prob);
    setCode(BASIC_STARTER_TEMPLATES[language]);
    setExecutionResult(null);
    setRevealedHints({});
    setAiReview(null);
  };

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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

  // Run Custom Test Input
  const handleRunCustomInput = async () => {
    setRunningCustom(true);
    setActiveTab('custom');
    try {
      const res = await api.post('/code/run', {
        language,
        sourceCode: code,
        problemId: selectedProblem.id,
        customInput,
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
      setRunningCustom(false);
    }
  };

  // Submit Solution (Sample + Hidden Tests & LeetCode Progress Sync)
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

  // AlgoExpert-style AI Code Review & Complexity Analyzer
  const handleAnalyzeComplexity = async () => {
    setAnalyzingReview(true);
    setActiveTab('review');
    try {
      const res = await api.post('/code/ai-review', {
        language,
        sourceCode: code,
        problemTitle: selectedProblem.title,
        problemPrompt: selectedProblem.promptText,
      });

      if (res.data.success) {
        setAiReview(res.data.data);
      }
    } catch (err) {
      // Handle error gracefully
    } finally {
      setAnalyzingReview(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-7.5rem)] flex flex-col">
      {/* Top Bar: Problem Selector, Company Tags, Language, Action Buttons */}
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
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            selectedProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {selectedProblem.difficulty}
          </span>

          {/* Company Placement Badges */}
          {selectedProblem.companyTags && selectedProblem.companyTags.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {selectedProblem.companyTags.slice(0, 3).map((comp, idx) => (
                <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" /> {comp}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* interviewing.io 45:00 Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>{formatCodingTimer(timerSeconds)}</span>
          </div>

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

          {/* AlgoExpert AI Complexity Analyzer Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyzeComplexity}
            isLoading={analyzingReview}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
          >
            Big-O Review
          </Button>

          {/* Show Answer / Reference Solution Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSolutionModal(true)}
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-medium"
            leftIcon={<Lightbulb className="w-3.5 h-3.5 text-amber-400" />}
          >
            Show Answer
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunSampleTests}
            isLoading={running}
            leftIcon={<Play className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Run Tests
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmitSolution}
            isLoading={submitting}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Main Split: Problem Prompt + AlgoExpert Hints (Left) and Monaco Editor + Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Problem Description & AlgoExpert-style Tiered Hints */}
        <Card className="lg:col-span-5 flex flex-col p-5 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-brand-500">{selectedProblem.topic}</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{selectedProblem.title}</h2>
            </div>
            {selectedProblem.optimalComplexity && (
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Target: {selectedProblem.optimalComplexity.time} • {selectedProblem.optimalComplexity.space}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
            {selectedProblem.promptText}
          </div>

          {/* AlgoExpert-style Tiered Hints Accordion */}
          {selectedProblem.hints && selectedProblem.hints.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lightbulb className="w-3.5 h-3.5" /> AlgoExpert Tiered Hints (Progressive Reveal)
              </div>
              <div className="space-y-1.5">
                {selectedProblem.hints.map((hint, idx) => {
                  const isRevealed = revealedHints[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden text-xs"
                    >
                      <button
                        onClick={() => toggleHint(idx)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span className="flex items-center gap-1.5">
                          {isRevealed ? <ChevronDown className="w-3 h-3 text-amber-400" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                          Hint {idx + 1} {idx === 0 ? '(Conceptual)' : idx === 1 ? '(Data Structure)' : '(Step-by-step Logic)'}
                        </span>
                        <span className="text-[10px] text-slate-400">{isRevealed ? 'Hide' : 'Reveal'}</span>
                      </button>
                      {isRevealed && (
                        <div className="p-2.5 pt-0 text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] leading-relaxed bg-amber-500/5">
                          {hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sample Test Cases */}
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

        {/* Right Column: Monaco Code Editor + Multi-Tab Console Panel */}
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

          {/* Execution Results / Multi-Tab Console Panel */}
          <div className="h-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    activeTab === 'tests' ? 'bg-brand-500/15 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Results {executionResult && `(${executionResult.passedTests}/${executionResult.totalTests})`}
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    activeTab === 'custom' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Test Input
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                    activeTab === 'review' ? 'bg-purple-500/15 text-purple-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Big-O Review
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    activeTab === 'console' ? 'bg-brand-500/15 text-brand-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Console Output
                </button>
              </div>

              {executionResult && activeTab === 'tests' && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${executionResult.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {executionResult.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {executionResult.executionTimeMs}ms
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 flex-1 overflow-y-auto font-mono text-xs text-slate-300">
              {/* TAB 1: TEST RESULTS */}
              {activeTab === 'tests' && (
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
                  <p className="text-slate-500 text-center py-6 font-sans">Click "Run Tests" or "Submit" to validate your solution.</p>
                )
              )}

              {/* TAB 2: CUSTOM TEST INPUT RUNNER */}
              {activeTab === 'custom' && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Enter custom test input parameters:</span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleRunCustomInput}
                      isLoading={runningCustom}
                      leftIcon={<Play className="w-3 h-3" />}
                    >
                      Run Custom Test
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. nums = [10, 20, 30], target = 50"
                    className="w-full text-xs font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus-ring"
                  />
                  {executionResult?.results && executionResult.results.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      <span className="text-slate-400 font-semibold">Sandbox Execution Output:</span>
                      <pre className="mt-1 text-emerald-400 whitespace-pre-wrap">
                        {executionResult.results[0].actualOutput || 'Executed with return value.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ALGOEXPERT AI BIG-O & COMPLEXITY REVIEW */}
              {activeTab === 'review' && (
                aiReview ? (
                  <div className="space-y-3 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] uppercase font-bold text-purple-400">Time Complexity</span>
                        <p className="text-lg font-bold font-mono text-purple-300 mt-0.5">{aiReview.timeComplexity}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{aiReview.timeComplexityRationale}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] uppercase font-bold text-blue-400">Auxiliary Space</span>
                        <p className="text-lg font-bold font-mono text-blue-300 mt-0.5">{aiReview.spaceComplexity}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{aiReview.spaceComplexityRationale}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Code Quality Score</span>
                        <p className="text-lg font-bold font-mono text-emerald-300 mt-0.5">{aiReview.qualityScore} / 100</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{aiReview.verdict}</p>
                      </div>
                    </div>

                    {aiReview.refactoringSuggestions && aiReview.refactoringSuggestions.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> Optimal Refactoring Tips:
                        </span>
                        {aiReview.refactoringSuggestions.map((tip: string, idx: number) => (
                          <p key={idx} className="text-slate-300 text-[11px]">• {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 font-sans space-y-2">
                    <p className="text-slate-400 text-xs">Run instant AI analysis for Time/Space Complexity and optimal code quality.</p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleAnalyzeComplexity}
                      isLoading={analyzingReview}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Analyze Complexity & Code Smells
                    </Button>
                  </div>
                )
              )}

              {/* TAB 4: STDOUT CONSOLE */}
              {activeTab === 'console' && (
                <pre className="whitespace-pre-wrap text-[11px] text-slate-300 font-mono">
                  {consoleOutput || 'No stdout printed.'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show Solution / Reveal Answer Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Reference Solution: {selectedProblem.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Language: {language.toUpperCase()} • Optimal Benchmark
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complexity Badges */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Time Complexity:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedProblem.optimalComplexity?.time || 'O(N)'}
                </span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Space Complexity:</span>
                <span className="font-mono font-bold text-blue-400">
                  {selectedProblem.optimalComplexity?.space || 'O(1) to O(N)'}
                </span>
              </div>
              {selectedProblem.optimalComplexity?.note && (
                <>
                  <div className="w-px h-3 bg-slate-700" />
                  <span className="text-slate-400 italic text-[11px]">
                    Note: {selectedProblem.optimalComplexity.note}
                  </span>
                </>
              )}
            </div>

            {/* Solution Code View */}
            <div className="flex-1 overflow-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 p-4">
              <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre">
                {selectedProblem.starterCode[language] || selectedProblem.starterCode.python || '// Solution unavailable'}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Review the optimal approach, then practice coding it in the sandbox.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const sol = selectedProblem.starterCode[language] || selectedProblem.starterCode.python || '';
                    navigator.clipboard.writeText(sol);
                    setCopiedSolution(true);
                    setTimeout(() => setCopiedSolution(false), 2000);
                  }}
                  leftIcon={copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedSolution ? 'Copied!' : 'Copy Solution'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const sol = selectedProblem.starterCode[language] || selectedProblem.starterCode.python || '';
                    setCode(sol);
                    setShowSolutionModal(false);
                  }}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Load into Editor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
