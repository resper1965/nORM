/**
 * Type validation tests
 * Verify that all types are properly exported and can be imported
 */

import { describe, it, expect } from 'vitest';

describe('Type Exports', () => {
  it('should export agent types', async () => {
    const agents = await import('@/lib/ai/agents');
    
    expect(agents.ContentGeneratorAgent).toBeDefined();
    expect(agents.ContentEvaluatorAgent).toBeDefined();
    expect(agents.ReputationAnalyzerAgent).toBeDefined();
    expect(agents.createAgentContext).toBeDefined();
    expect(agents.orchestrateContentGenerationWithEvaluation).toBeDefined();
    expect(agents.orchestrateReputationAnalysis).toBeDefined();
  });

  it('should export domain types', async () => {
    const domain = await import('@/lib/types/domain');
    
    expect(domain.Client).toBeDefined();
    expect(domain.Keyword).toBeDefined();
    expect(domain.GeneratedContent).toBeDefined();
  });

  it('should export API types', async () => {
    const api = await import('@/lib/types/api');
    
    expect(api.GenerateContentRequest).toBeDefined();
    expect(api.GenerateContentResponse).toBeDefined();
    expect(api.ReputationResponse).toBeDefined();
  });

  it('should export error types', async () => {
    const errors = await import('@/lib/errors/errors');
    
    expect(errors.AppError).toBeDefined();
    expect(errors.ValidationError).toBeDefined();
    expect(errors.NotFoundError).toBeDefined();
  });
});

