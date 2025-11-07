/**
 * Tests for BaseAgent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseAgent, type AgentContext } from '@/lib/ai/agents/base-agent';
import type { AgentResponse } from '@/lib/ai/agents/base-agent';

// Mock implementation for testing
class TestAgent extends BaseAgent<string, string> {
  constructor(context: AgentContext) {
    super(context, 'TestAgent');
  }

  protected getSystemPrompt(): string {
    return 'You are a test agent';
  }

  async execute(input: string): Promise<AgentResponse<string>> {
    if (!this.validateInput(input)) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    return {
      success: true,
      data: `Processed: ${input}`,
    };
  }
}

describe('BaseAgent', () => {
  const mockContext: AgentContext = {
    clientId: 'test-client-id',
    clientName: 'Test Client',
    userId: 'test-user-id',
  };

  describe('validateInput', () => {
    it('should validate non-null input', () => {
      const agent = new TestAgent(mockContext);
      expect(agent['validateInput']('test')).toBe(true);
    });

    it('should reject null input', () => {
      const agent = new TestAgent(mockContext);
      expect(agent['validateInput'](null as any)).toBe(false);
    });

    it('should reject undefined input', () => {
      const agent = new TestAgent(mockContext);
      expect(agent['validateInput'](undefined as any)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should process valid input successfully', async () => {
      const agent = new TestAgent(mockContext);
      const result = await agent.execute('test input');

      expect(result.success).toBe(true);
      expect(result.data).toBe('Processed: test input');
    });

    it('should reject invalid input', async () => {
      const agent = new TestAgent(mockContext);
      const result = await agent.execute(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input');
    });
  });
});

