import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { logger } from '../../config/logger';

export interface TestCase {
  id?: string;
  type?: 'SAMPLE' | 'HIDDEN';
  input: string;
  expectedOutput: string;
}

export interface TestResultOutput {
  testCaseIndex: number;
  type: 'SAMPLE' | 'HIDDEN';
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
  errorMessage?: string;
}

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILE_ERROR';
  totalTests: number;
  passedTests: number;
  sampleTestsPassed: number;
  hiddenTestsPassed: number;
  executionTimeMs: number;
  memoryKb?: number;
  compileError?: string;
  results: TestResultOutput[];
  consoleOutput?: string;
}

const TIMEOUT_MS = 4000;
const MAX_OUTPUT_BYTES = 50 * 1024; // 50KB

export class CodeSandboxService {
  async runCode(
    language: string,
    sourceCode: string,
    testCases: TestCase[] = []
  ): Promise<ExecutionResult> {
    const sandboxId = crypto.randomBytes(8).toString('hex');
    const tempDir = path.join(os.tmpdir(), `interviewpilot_sandbox_${sandboxId}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const lang = language.toLowerCase();
      let compileError: string | undefined;

      // Compile step for compiled languages
      if (lang === 'cpp') {
        const sourcePath = path.join(tempDir, 'solution.cpp');
        const binPath = path.join(tempDir, 'solution');
        fs.writeFileSync(sourcePath, sourceCode);

        const compileRes = await this.runProcess('/usr/bin/g++', ['-O2', '-std=c++17', sourcePath, '-o', binPath], tempDir, '', 10000);
        if (compileRes.exitCode !== 0) {
          return {
            status: 'COMPILE_ERROR',
            totalTests: testCases.length,
            passedTests: 0,
            sampleTestsPassed: 0,
            hiddenTestsPassed: 0,
            executionTimeMs: 0,
            compileError: compileRes.stderr || 'Compilation failed',
            results: [],
          };
        }
      } else if (lang === 'java') {
        const sourcePath = path.join(tempDir, 'Solution.java');
        fs.writeFileSync(sourcePath, sourceCode);

        const javacPath = fs.existsSync('/opt/homebrew/opt/openjdk@17/bin/javac') ? '/opt/homebrew/opt/openjdk@17/bin/javac' : 'javac';
        const compileRes = await this.runProcess(javacPath, ['Solution.java'], tempDir, '', 10000);
        if (compileRes.exitCode !== 0) {
          return {
            status: 'COMPILE_ERROR',
            totalTests: testCases.length,
            passedTests: 0,
            sampleTestsPassed: 0,
            hiddenTestsPassed: 0,
            executionTimeMs: 0,
            compileError: compileRes.stderr || 'Java compilation failed',
            results: [],
          };
        }
      }

      // If no test cases provided, run once as arbitrary script
      if (testCases.length === 0) {
        const singleRes = await this.executeSingleRun(lang, sourceCode, tempDir, '');
        return {
          status: singleRes.exitCode === 0 ? 'ACCEPTED' : (singleRes.timedOut ? 'TIME_LIMIT_EXCEEDED' : 'RUNTIME_ERROR'),
          totalTests: 1,
          passedTests: singleRes.exitCode === 0 ? 1 : 0,
          sampleTestsPassed: singleRes.exitCode === 0 ? 1 : 0,
          hiddenTestsPassed: 0,
          executionTimeMs: singleRes.durationMs,
          consoleOutput: singleRes.stdout || singleRes.stderr,
          results: [{
            testCaseIndex: 0,
            type: 'SAMPLE',
            input: 'Default run',
            expectedOutput: '',
            actualOutput: singleRes.stdout,
            passed: singleRes.exitCode === 0,
            executionTimeMs: singleRes.durationMs,
            errorMessage: singleRes.stderr,
          }],
        };
      }

      // Run each test case
      const results: TestResultOutput[] = [];
      let totalExecutionTime = 0;
      let sampleTestsPassed = 0;
      let hiddenTestsPassed = 0;
      let hasRuntimeError = false;
      let hasTimeLimit = false;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const isHidden = tc.type === 'HIDDEN';
        const tcResult = await this.executeTestCase(lang, sourceCode, tempDir, tc, i);

        totalExecutionTime += tcResult.executionTimeMs;

        if (tcResult.passed) {
          if (isHidden) hiddenTestsPassed++;
          else sampleTestsPassed++;
        }

        if (tcResult.errorMessage?.includes('Time limit exceeded')) {
          hasTimeLimit = true;
        } else if (tcResult.errorMessage && !tcResult.passed) {
          hasRuntimeError = true;
        }

        results.push(tcResult);
      }

      const passedTests = sampleTestsPassed + hiddenTestsPassed;
      let finalStatus: ExecutionResult['status'] = 'ACCEPTED';

      if (passedTests < testCases.length) {
        if (hasTimeLimit) finalStatus = 'TIME_LIMIT_EXCEEDED';
        else if (hasRuntimeError && results.some((r) => r.errorMessage && !r.passed)) finalStatus = 'RUNTIME_ERROR';
        else finalStatus = 'WRONG_ANSWER';
      }

      return {
        status: finalStatus,
        totalTests: testCases.length,
        passedTests,
        sampleTestsPassed,
        hiddenTestsPassed,
        executionTimeMs: Math.round(totalExecutionTime / testCases.length),
        results,
      };
    } finally {
      // Clean up temporary files
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        logger.warn(`Failed to cleanup temp dir: ${tempDir}`);
      }
    }
  }

  private async executeTestCase(
    lang: string,
    sourceCode: string,
    tempDir: string,
    tc: TestCase,
    index: number
  ): Promise<TestResultOutput> {
    const isHidden = tc.type === 'HIDDEN';
    const res = await this.executeSingleRun(lang, sourceCode, tempDir, tc.input);

    const actual = res.stdout.trim();
    const expected = tc.expectedOutput.trim();

    // Check equality (loose normalization for whitespace / brackets / boolean casing)
    const passed = this.compareOutputs(actual, expected);

    return {
      testCaseIndex: index,
      type: tc.type || 'SAMPLE',
      input: isHidden ? '[Hidden Test Case]' : tc.input,
      expectedOutput: isHidden ? '[Hidden]' : tc.expectedOutput,
      actualOutput: isHidden && !passed ? '[Mismatch in hidden case]' : actual,
      passed,
      executionTimeMs: res.durationMs,
      errorMessage: res.timedOut ? 'Time limit exceeded (> 4.0s)' : (res.stderr || undefined),
    };
  }

  private compareOutputs(actual: string, expected: string): boolean {
    if (actual === expected) return true;

    // Normalize lowercase (e.g. true vs True)
    if (actual.toLowerCase() === expected.toLowerCase()) return true;

    // Normalize JSON strings (e.g. [0, 1] vs [0,1])
    try {
      const parsedActual = JSON.parse(actual);
      const parsedExpected = JSON.parse(expected);
      if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) return true;
    } catch {
      // not JSON
    }

    // Strip whitespace inside arrays/commas
    const normalize = (s: string) => s.replace(/\s+/g, '').replace(/True/g, 'true').replace(/False/g, 'false');
    return normalize(actual) === normalize(expected);
  }

  private async executeSingleRun(
    lang: string,
    sourceCode: string,
    tempDir: string,
    stdin: string
  ): Promise<{ exitCode: number; stdout: string; stderr: string; durationMs: number; timedOut: boolean }> {
    const startTime = Date.now();

    if (lang === 'python') {
      const scriptPath = path.join(tempDir, `script_${Date.now()}.py`);
      // Wrap code with a test harness if it defines a solution function and input has parameters
      const fullScript = this.wrapPythonHarness(sourceCode, stdin);
      fs.writeFileSync(scriptPath, fullScript);

      const pythonPath = fs.existsSync('/Library/Frameworks/Python.framework/Versions/3.14/bin/python3')
        ? '/Library/Frameworks/Python.framework/Versions/3.14/bin/python3'
        : 'python3';

      return this.runProcess(pythonPath, [scriptPath], tempDir, stdin, TIMEOUT_MS);
    } else if (lang === 'javascript' || lang === 'node') {
      const scriptPath = path.join(tempDir, `script_${Date.now()}.js`);
      const fullScript = this.wrapJavaScriptHarness(sourceCode, stdin);
      fs.writeFileSync(scriptPath, fullScript);

      return this.runProcess('/opt/homebrew/bin/node', [scriptPath], tempDir, stdin, TIMEOUT_MS);
    } else if (lang === 'cpp') {
      const binPath = path.join(tempDir, 'solution');
      return this.runProcess(binPath, [], tempDir, stdin, TIMEOUT_MS);
    } else if (lang === 'java') {
      const javaPath = fs.existsSync('/opt/homebrew/opt/openjdk@17/bin/java') ? '/opt/homebrew/opt/openjdk@17/bin/java' : 'java';
      return this.runProcess(javaPath, ['Solution'], tempDir, stdin, TIMEOUT_MS);
    }

    return { exitCode: 1, stdout: '', stderr: `Unsupported language: ${lang}`, durationMs: 0, timedOut: false };
  }

  private wrapPythonHarness(code: string, input: string): string {
    // If the user already wrote a full script with print(), run directly
    if (code.includes('if __name__ == "__main__":') || (!code.includes('def ') && code.includes('print('))) {
      return code;
    }

    // Auto-harness for functions: parses "nums = [2,7,11,15], target = 9" or "s = \"()\""
    return `
import sys
import json

${code}

# Test Harness
def __run_harness():
    test_input = """${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"""
    
    # Try finding functions defined in user code
    funcs = [f for name, f in list(globals().items()) if callable(f) and not name.startswith('_')]
    if not funcs:
        return
        
    func = funcs[-1] # Primary solution function
    
    # Extract arguments from variable assignment syntax
    if test_input:
        import re
        kwargs = {}
        # Match variable assignments like: nums = [2,7,11,15], target = 9
        parts = [p.strip() for p in re.split(r',(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)(?=(?:[^\\[]*\\[[^\\]]*\\])*[^\\]]*$)', test_input) if '=' in p]
        
        args = []
        for p in parts:
            if '=' in p:
                k, v = p.split('=', 1)
                try:
                    val = eval(v.strip())
                    args.append(val)
                except:
                    args.append(v.strip().strip('"').strip("'"))
        
        try:
            if args:
                res = func(*args)
            else:
                res = func()
            print(json.dumps(res) if isinstance(res, (dict, list, bool, int, float)) else str(res))
            return
        except Exception as e:
            sys.stderr.write(str(e))
            sys.exit(1)

__run_harness()
`;
  }

  private wrapJavaScriptHarness(code: string, input: string): string {
    if (code.includes('console.log(') && !code.includes('function ') && !code.includes('const ') && !code.includes('let ')) {
      return code;
    }

    return `
${code}

try {
  const testInput = "${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
  // Detect solution function
  const func = typeof twoSum !== 'undefined' ? twoSum : (typeof isValid !== 'undefined' ? isValid : null);
  if (func && testInput) {
    // Parse arguments
    let args = [];
    if (testInput.includes('nums =') && testInput.includes('target =')) {
      const numsMatch = testInput.match(/nums\\s*=\\s*(\\[.*?\\])/);
      const targetMatch = testInput.match(/target\\s*=\\s*(-?\\d+)/);
      if (numsMatch && targetMatch) {
        args = [JSON.parse(numsMatch[1]), parseInt(targetMatch[1], 10)];
      }
    } else if (testInput.includes('s =')) {
      const sMatch = testInput.match(/s\\s*=\\s*"(.*?)"/);
      if (sMatch) {
        args = [sMatch[1]];
      }
    }

    const result = func(...args);
    console.log(JSON.stringify(result));
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
`;
  }

  private runProcess(
    command: string,
    args: string[],
    cwd: string,
    stdin: string,
    timeoutMs: number
  ): Promise<{ exitCode: number; stdout: string; stderr: string; durationMs: number; timedOut: boolean }> {
    return new Promise((resolve) => {
      const start = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const proc = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGKILL');
      }, timeoutMs);

      if (stdin) {
        proc.stdin.write(stdin);
      }
      proc.stdin.end();

      proc.stdout.on('data', (data) => {
        if (stdout.length < MAX_OUTPUT_BYTES) {
          stdout += data.toString();
        }
      });

      proc.stderr.on('data', (data) => {
        if (stderr.length < MAX_OUTPUT_BYTES) {
          stderr += data.toString();
        }
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: code ?? (timedOut ? 124 : 1),
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          durationMs: Date.now() - start,
          timedOut,
        });
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout: '',
          stderr: err.message,
          durationMs: Date.now() - start,
          timedOut: false,
        });
      });
    });
  }
}

export const codeSandbox = new CodeSandboxService();
