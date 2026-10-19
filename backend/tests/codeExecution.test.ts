import { describe, it, expect } from 'vitest';
import { codeSandbox } from '../src/services/codeExecution/sandbox';

describe('Code Sandbox Execution Engine', () => {
  it('should successfully execute Python Two Sum and pass test cases', async () => {
    const pythonCode = `
def twoSum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []
`;

    const testCases = [
      { type: 'SAMPLE' as const, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
      { type: 'SAMPLE' as const, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
      { type: 'HIDDEN' as const, input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' },
    ];

    const result = await codeSandbox.runCode('python', pythonCode, testCases);

    expect(result.status).toBe('ACCEPTED');
    expect(result.totalTests).toBe(3);
    expect(result.passedTests).toBe(3);
    expect(result.sampleTestsPassed).toBe(2);
    expect(result.hiddenTestsPassed).toBe(1);
    expect(result.results[0].passed).toBe(true);
  });

  it('should detect wrong answers in Python code', async () => {
    const wrongPython = `
def twoSum(nums, target):
    return [0, 0] # deliberately wrong
`;
    const testCases = [
      { type: 'SAMPLE' as const, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
    ];

    const result = await codeSandbox.runCode('python', wrongPython, testCases);

    expect(result.status).toBe('WRONG_ANSWER');
    expect(result.passedTests).toBe(0);
  });

  it('should terminate infinite loops within the timeout', async () => {
    const infiniteLoop = `
def twoSum(nums, target):
    while True:
        pass
    return []
`;
    const testCases = [
      { type: 'SAMPLE' as const, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
    ];

    const result = await codeSandbox.runCode('python', infiniteLoop, testCases);

    expect(result.status).toBe('TIME_LIMIT_EXCEEDED');
    expect(result.results[0].errorMessage).toContain('Time limit exceeded');
  });

  it('should successfully execute JavaScript Valid Parentheses and pass test cases', async () => {
    const jsCode = `
function isValid(s) {
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
`;

    const testCases = [
      { type: 'SAMPLE' as const, input: 's = "()"', expectedOutput: 'true' },
      { type: 'SAMPLE' as const, input: 's = "()[]{}"', expectedOutput: 'true' },
      { type: 'SAMPLE' as const, input: 's = "(]"', expectedOutput: 'false' },
    ];

    const result = await codeSandbox.runCode('javascript', jsCode, testCases);

    expect(result.status).toBe('ACCEPTED');
    expect(result.passedTests).toBe(3);
  });
});
