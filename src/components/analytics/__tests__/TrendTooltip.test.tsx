import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrendTooltip } from '../TrendTooltip';

describe('TrendTooltip', () => {
    it('should render the trigger button with accessible label', () => {
        render(<TrendTooltip term="R-Squared" explanation="A statistical measure..." />);
        
        const button = screen.getByRole('button', { name: /What does R-Squared mean\?/i });
        expect(button).toBeInTheDocument();
    });

    it('should display tooltip content on hover', async () => {
        const user = userEvent.setup();
        render(<TrendTooltip term="R-Squared" explanation="A statistical measure of fit" />);
        
        const button = screen.getByRole('button', { name: /What does R-Squared mean\?/i });
        await user.hover(button);
        
        await waitFor(() => {
            expect(screen.getByText('R-Squared')).toBeInTheDocument();
            expect(screen.getByText('A statistical measure of fit')).toBeInTheDocument();
        });
    });

    it('should hide tooltip on mouse leave', async () => {
        const user = userEvent.setup();
        render(<TrendTooltip term="Slope" explanation="Rate of change" />);
        
        const button = screen.getByRole('button', { name: /What does Slope mean\?/i });
        await user.hover(button);
        
        await waitFor(() => {
            expect(screen.getByText('Slope')).toBeInTheDocument();
        });

        await user.unhover(button);
        
        await waitFor(() => {
            expect(screen.queryByText('Rate of change')).not.toBeInTheDocument();
        });
    });

    it('should support keyboard navigation with focus', async () => {
        const user = userEvent.setup();
        render(<TrendTooltip term="Confidence" explanation="Statistical reliability" />);
        
        const button = screen.getByRole('button', { name: /What does Confidence mean\?/i });
        
        // Tab to focus the button
        await user.tab();
        expect(button).toHaveFocus();
    });

    it('should show tooltip on keyboard focus', async () => {
        const user = userEvent.setup();
        render(<TrendTooltip term="Trend" explanation="Direction over time" />);
        
        const button = screen.getByRole('button', { name: /What does Trend mean\?/i });
        
        // Focus the button
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Trend')).toBeInTheDocument();
            expect(screen.getByText('Direction over time')).toBeInTheDocument();
        });
    });

    it('should dismiss tooltip on Escape key', async () => {
        const user = userEvent.setup();
        render(<TrendTooltip term="Analysis" explanation="Examination of data" />);
        
        const button = screen.getByRole('button', { name: /What does Analysis mean\?/i });
        
        // Focus to show tooltip
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Analysis')).toBeInTheDocument();
        });

        // Press Escape
        await user.keyboard('{Escape}');
        
        await waitFor(() => {
            expect(screen.queryByText('Examination of data')).not.toBeInTheDocument();
        });
    });

    it('should have proper ARIA attributes', () => {
        render(<TrendTooltip term="Metric" explanation="Measured value" />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'What does Metric mean?');
    });

    it('should hide help icon from screen readers', () => {
        const { container } = render(<TrendTooltip term="Data" explanation="Information collected" />);
        
        const icon = container.querySelector('svg');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
});
