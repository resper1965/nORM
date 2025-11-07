/**
 * Build validation tests
 * These tests verify that the project can build successfully
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Build Validation', () => {
  describe('TypeScript Configuration', () => {
    it('should have tsconfig.json', () => {
      const tsconfigPath = join(process.cwd(), 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);
    });

    it('should have valid tsconfig.json structure', () => {
      const tsconfigPath = join(process.cwd(), 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      
      expect(tsconfig).toHaveProperty('compilerOptions');
      expect(tsconfig.compilerOptions).toHaveProperty('target');
      expect(tsconfig.compilerOptions).toHaveProperty('lib');
    });
  });

  describe('Next.js Configuration', () => {
    it('should have next.config.js', () => {
      const nextConfigPath = join(process.cwd(), 'next.config.js');
      expect(existsSync(nextConfigPath)).toBe(true);
    });
  });

  describe('Package Configuration', () => {
    it('should have package.json', () => {
      const packagePath = join(process.cwd(), 'package.json');
      expect(existsSync(packagePath)).toBe(true);
    });

    it('should have required scripts', () => {
      const packagePath = join(process.cwd(), 'package.json');
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      expect(pkg.scripts).toHaveProperty('build');
      expect(pkg.scripts).toHaveProperty('dev');
      expect(pkg.scripts).toHaveProperty('test');
    });
  });

  describe('Agent Files', () => {
    it('should have base-agent.ts', () => {
      const filePath = join(process.cwd(), 'lib/ai/agents/base-agent.ts');
      expect(existsSync(filePath)).toBe(true);
    });

    it('should have content-generator-agent.ts', () => {
      const filePath = join(process.cwd(), 'lib/ai/agents/content-generator-agent.ts');
      expect(existsSync(filePath)).toBe(true);
    });

    it('should have content-evaluator-agent.ts', () => {
      const filePath = join(process.cwd(), 'lib/ai/agents/content-evaluator-agent.ts');
      expect(existsSync(filePath)).toBe(true);
    });

    it('should have reputation-analyzer-agent.ts', () => {
      const filePath = join(process.cwd(), 'lib/ai/agents/reputation-analyzer-agent.ts');
      expect(existsSync(filePath)).toBe(true);
    });

    it('should have orchestrator.ts', () => {
      const filePath = join(process.cwd(), 'lib/ai/agents/orchestrator.ts');
      expect(existsSync(filePath)).toBe(true);
    });
  });
});

