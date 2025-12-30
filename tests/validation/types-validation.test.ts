/**
 * Type validation tests
 * Verify that all types are properly exported and can be imported
 */

import { describe, it, expect, vi } from "vitest";

// Mock OpenAI to prevent initialization errors during imports
vi.mock("@/lib/ai/openai", () => ({
  openai: {},
  callOpenAI: vi.fn(),
  getModel: vi.fn(),
}));

describe("Type Exports", () => {
  it("should export agent types", async () => {
    const agents = await import("@/lib/ai/agents");

    expect(agents.ContentGeneratorAgent).toBeDefined();
    expect(agents.ContentEvaluatorAgent).toBeDefined();
    expect(agents.ReputationAnalyzerAgent).toBeDefined();
    expect(agents.createAgentContext).toBeDefined();
    expect(agents.orchestrateContentGenerationWithEvaluation).toBeDefined();
    expect(agents.orchestrateReputationAnalysis).toBeDefined();
  });

  it("should export domain types", async () => {
    // Only check for runtime values (Enums, Classes, Consts)
    // Interfaces are erased at runtime
    const domain = await import("@/lib/types/domain");
    // Expect nothing if only interfaces are exported
    expect(domain).toBeDefined();
  });

  it("should export API types", async () => {
    // Only check for runtime values
    const api = await import("@/lib/types/api");
    expect(api).toBeDefined();
  });

  it("should export error types", async () => {
    const errors = await import("@/lib/errors/errors");

    expect(errors.AppError).toBeDefined();
    expect(errors.ValidationError).toBeDefined();
    expect(errors.NotFoundError).toBeDefined();
  });
});
