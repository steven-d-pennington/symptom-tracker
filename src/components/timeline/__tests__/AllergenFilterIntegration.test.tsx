import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimelineView from '../TimelineView';

// Mock repositories to minimal no-op for this test
jest.mock('@/lib/repositories/userRepository', () => ({
  userRepository: {
    getOrCreateCurrentUser: jest.fn().mockResolvedValue({ id: 'user-123' })
  }
}));

jest.mock('@/lib/repositories/medicationEventRepository', () => ({
  medicationEventRepository: { findByDateRange: jest.fn().mockResolvedValue([]) }
}));
jest.mock('@/lib/repositories/triggerEventRepository', () => ({
  triggerEventRepository: { findByDateRange: jest.fn().mockResolvedValue([]) }
}));
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: { getActiveFlaresWithTrend: jest.fn().mockResolvedValue([]) }
}));
jest.mock('@/lib/repositories/foodEventRepository', () => ({
  foodEventRepository: { findByDateRange: jest.fn().mockResolvedValue([]) }
}));
jest.mock('@/lib/repositories/foodRepository', () => ({
  foodRepository: { getById: jest.fn().mockResolvedValue(undefined) }
}));
jest.mock('@/lib/utils/cn', () => ({ cn: (...c: string[]) => c.join(' ') }));
jest.mock('lucide-react', () => ({ ArrowRight: () => <div />, Loader2: () => <div /> }));

describe('TimelineView Allergen Filter Integration (empty data)', () => {
  it('renders allergen filter and empty-state message changes when filter applied', async () => {
    render(<TimelineView />);

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText(/No events today yet/i)).toBeInTheDocument();
    });

    // Click an allergen chip
    const dairyApply = screen.getByRole('button', { name: /apply dairy allergen filter/i });
    dairyApply.click();

    // Now the empty state should reflect allergen filtering message
    await waitFor(() => {
      expect(screen.getByText(/No matching food events for the selected allergen/i)).toBeInTheDocument();
    });
  });
});

