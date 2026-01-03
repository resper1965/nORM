/**
 * Unit tests for SERP tracker
 */

import { describe, it, expect } from 'vitest';

describe('SERP Tracker', () => {
  describe('detectClientContent', () => {
    // Helper function to test URL detection
    const detectClientContent = (url: string, clientWebsite: string): boolean => {
      try {
        const urlObj = new URL(url);
        const websiteObj = new URL(
          clientWebsite.startsWith('http') ? clientWebsite : `https://${clientWebsite}`
        );
        
        const urlDomain = urlObj.hostname.replace(/^www\./, '');
        const websiteDomain = websiteObj.hostname.replace(/^www\./, '');
        
        return urlDomain === websiteDomain;
      } catch {
        return false;
      }
    };

    it('should detect client content when domains match', () => {
      expect(
        detectClientContent('https://empresa.com.br/artigo', 'https://empresa.com.br')
      ).toBe(true);
    });

    it('should detect client content ignoring www', () => {
      expect(
        detectClientContent('https://www.empresa.com.br/artigo', 'https://empresa.com.br')
      ).toBe(true);
      
      expect(
        detectClientContent('https://empresa.com.br/artigo', 'https://www.empresa.com.br')
      ).toBe(true);
    });

    it('should not detect client content for different domains', () => {
      expect(
        detectClientContent('https://outro-site.com.br/artigo', 'https://empresa.com.br')
      ).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(
        detectClientContent('invalid-url', 'https://empresa.com.br')
      ).toBe(false);
    });
  });
});
