/**
 * Text Annotation Rendering Tests
 */

import { wrapText, getTextBackgroundColor } from '@/lib/utils/annotationRendering';

// Mock canvas context for text measurement
class MockCanvasRenderingContext2D {
  measureText(text: string): TextMetrics {
    // Mock: each character is 8px wide
    const width = text.length * 8;
    return { width } as TextMetrics;
  }
}

describe('Text Annotation Rendering', () => {
  describe('wrapText', () => {
    let ctx: MockCanvasRenderingContext2D;

    beforeEach(() => {
      ctx = new MockCanvasRenderingContext2D();
    });

    it('should return single line for short text', () => {
      const text = 'Hello';
      const maxWidth = 100;
      
      const lines = wrapText(ctx as any, text, maxWidth);
      
      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe('Hello');
    });

    it('should wrap long text into multiple lines', () => {
      const text = 'This is a very long text that should wrap';
      const maxWidth = 80; // ~10 characters
      
      const lines = wrapText(ctx as any, text, maxWidth);
      
      expect(lines.length).toBeGreaterThan(1);
      lines.forEach(line => {
        expect(line.length * 8).toBeLessThanOrEqual(maxWidth + 8); // +8 for tolerance
      });
    });

    it('should not break words mid-word', () => {
      const text = 'Supercalifragilisticexpialidocious test';
      const maxWidth = 100;
      
      const lines = wrapText(ctx as any, text, maxWidth);
      
      lines.forEach(line => {
        // Check that words are intact (no mid-word breaks)
        const words = line.trim().split(' ');
        words.forEach(word => {
          expect(word).not.toMatch(/^[a-z]/); // No lowercase start after break
        });
      });
    });

    it('should handle empty text', () => {
      const lines = wrapText(ctx as any, '', 100);
      
      expect(lines).toEqual([]);
    });

    it('should handle single word', () => {
      const lines = wrapText(ctx as any, 'Word', 100);
      
      expect(lines).toEqual(['Word']);
    });
  });

  describe('getTextBackgroundColor', () => {
    it('should return dark background for white text', () => {
      const bgColor = getTextBackgroundColor('#FFFFFF');
      
      expect(bgColor).toBe('rgba(0, 0, 0, 0.7)');
    });

    it('should return dark background for yellow text', () => {
      const bgColor = getTextBackgroundColor('#EAB308');
      
      expect(bgColor).toBe('rgba(0, 0, 0, 0.7)');
    });

    it('should return light background for red text', () => {
      const bgColor = getTextBackgroundColor('#E53E3E');
      
      expect(bgColor).toBe('rgba(255, 255, 255, 0.7)');
    });

    it('should return light background for blue text', () => {
      const bgColor = getTextBackgroundColor('#3B82F6');
      
      expect(bgColor).toBe('rgba(255, 255, 255, 0.7)');
    });

    it('should return light background for green text', () => {
      const bgColor = getTextBackgroundColor('#22C55E');
      
      expect(bgColor).toBe('rgba(255, 255, 255, 0.7)');
    });

    it('should return light background for black text', () => {
      const bgColor = getTextBackgroundColor('#000000');
      
      expect(bgColor).toBe('rgba(255, 255, 255, 0.7)');
    });

    it('should handle lowercase hex colors', () => {
      const bgColor = getTextBackgroundColor('#ffffff');
      
      expect(bgColor).toBe('rgba(0, 0, 0, 0.7)');
    });
  });
});
