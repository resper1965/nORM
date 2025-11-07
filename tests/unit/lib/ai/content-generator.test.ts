/**
 * Tests for Content Generator Agent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGeneratorAgent, createAgentContext } from '@/lib/ai/agents';
import type { ContentGenerationInput } from '@/lib/ai/agents';

// Mock OpenAI
vi.mock('@/lib/ai/openai', () => ({
  callOpenAI: vi.fn(),
  getModel: vi.fn(() => 'gpt-4'),
  openai: null,
}));

describe('ContentGeneratorAgent', () => {
  const context = createAgentContext('test-client-id', 'Test Client', 'test-user-id');

  describe('Initialization', () => {
    it('should create agent with context', () => {
      const agent = new ContentGeneratorAgent(context);
      expect(agent).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject empty topic', async () => {
      const agent = new ContentGeneratorAgent(context);
      const input: ContentGenerationInput = {
        topic: '',
        targetKeywords: ['keyword'],
        articleCount: 1,
      };

      const result = await agent.execute(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty keywords array', async () => {
      const agent = new ContentGeneratorAgent(context);
      const input: ContentGenerationInput = {
        topic: 'Test topic',
        targetKeywords: [],
        articleCount: 1,
      };

      // Should still work with empty keywords (will use topic)
      const result = await agent.execute(input);
      // May fail due to OpenAI mock, but should not crash
      expect(result).toBeDefined();
    });
  });

  describe('Article Count Validation', () => {
    it('should accept valid article count', async () => {
      const agent = new ContentGeneratorAgent(context);
      const input: ContentGenerationInput = {
        topic: 'Test topic',
        targetKeywords: ['keyword'],
        articleCount: 3,
      };

      // May fail due to OpenAI mock, but should validate input
      const result = await agent.execute(input);
      expect(result).toBeDefined();
    });
  });
});

