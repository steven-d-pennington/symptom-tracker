import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { TrendTooltip } from '../TrendTooltip';

describe('TrendTooltip', () => {
    it('should render the screen reader text', () => {
        render(<TrendTooltip term="R-Squared" explanation="A statistical measure..." />);
        
        expect(screen.getByText('What does R-Squared mean?')).toBeInTheDocument();
    });
});
