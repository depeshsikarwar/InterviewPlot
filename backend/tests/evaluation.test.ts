import { describe, it, expect } from 'vitest';
import { aiService } from '../src/services/ai/ai.service';

describe('Rigorous AI Evaluator Unit Tests', () => {
  it('should give a zero score (0/100) if the candidate only says "hello"', async () => {
    const question = 'Tell me about a challenging obstacle you faced in a project.';
    const answer = 'hello';

    const result = await aiService.evaluateHRAnswer(question, answer, 'Software Engineer');

    expect(result.overallScore).toBe(0);
    expect(result.relevanceScore).toBe(0);
    expect(result.weaknesses.some((w) => w.includes('hello'))).toBe(true);
    expect(result.weaknesses.some((w) => w.includes('CRITICAL NON-ANSWER'))).toBe(true);
  });

  it('should severely penalize very short answers (< 15 words)', async () => {
    const question = 'Describe a conflict you had with a teammate.';
    const answer = 'We had an argument about the project and then we resolved it.';

    const result = await aiService.evaluateHRAnswer(question, answer, 'Software Engineer');

    expect(result.overallScore).toBeLessThanOrEqual(35);
    expect(result.weaknesses.some((w) => w.includes('underdeveloped'))).toBe(true);
  });

  it('should reward high scores (>= 75) for a complete, structured STAR answer with technical metrics', async () => {
    const question = 'Tell me about a time you overcame a critical technical obstacle.';
    const answer = `During my final year engineering project, our microservices application began crashing under a simulated load of 500 concurrent users due to database connection starvation. My task was to restore system stability and lower p99 latency before our live demo. I personally analyzed the PostgreSQL query execution plans, identified three missing compound indexes on our foreign keys, and implemented Redis connection pooling. As a result, query latency dropped by 78% and our application achieved 100% uptime during the evaluation.`;

    const result = await aiService.evaluateHRAnswer(question, answer, 'Software Engineer');

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.structureScore).toBeGreaterThanOrEqual(4.0);
    expect(result.ownershipScore).toBeGreaterThanOrEqual(4.0);
    expect(result.resultsScore).toBeGreaterThanOrEqual(4.0);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('should fail trivial answers in technical interview evaluation with 0 score', async () => {
    const question = 'Explain how a B-Tree index improves query speed in PostgreSQL.';
    const answer = 'hi';

    const result = await aiService.evaluateTechnicalAnswer(question, answer, 'DBMS');

    expect(result.score).toBe(0);
    expect(result.weaknesses.some((w) => w.includes('No technical explanation'))).toBe(true);
  });
});
