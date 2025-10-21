import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { NewFlareDialog } from '../NewFlareDialog';
import { flareRepository } from '@/lib/repositories/flareRepository';

let mockCreate: jest.SpiedFunction<typeof flareRepository.create>;

describe('NewFlareDialog', () => {
  const baseProps = {
    userId: 'user-123',
    onClose: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.spyOn(flareRepository, 'create').mockResolvedValue({
      id: 'flare-1',
      userId: 'user-123',
      symptomId: 'custom',
      symptomName: 'Test Flare',
      startDate: new Date(),
      severity: 5,
      bodyRegions: ['left-groin'],
      status: 'active',
      interventions: [],
      notes: '',
      photoIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  afterEach(() => {
    mockCreate.mockRestore();
  });

  it('shows coordinate summary for regions with captured values', () => {
    render(
      <NewFlareDialog
        {...baseProps}
        initialRegion="left-groin"
        initialCoordinates={{ 'left-groin': { x: 0.42, y: 0.67 } }}
      />
    );

    const summarySection = screen.getByText(/Precise Coordinates/i).closest('div');
    expect(summarySection).not.toBeNull();

    const coordinateList = summarySection!.querySelector('ul');
    expect(coordinateList).not.toBeNull();

    const list = coordinateList!;
    expect(within(list).getByText(/left groin/i)).toBeInTheDocument();
    expect(within(list).getByText(/x: 0.42, y: 0.67/i)).toBeInTheDocument();
  });

  it('passes normalized coordinates to flareRepository.create on submit', async () => {
    const onCreated = jest.fn();

    render(
      <NewFlareDialog
        {...baseProps}
        onCreated={onCreated}
        initialRegion="left-groin"
        initialCoordinates={{ 'left-groin': { x: 0.5, y: 0.25 } }}
      />
    );

    const symptomInput = screen.getByPlaceholderText(/Abscess, Lesion, Pain/i);
    fireEvent.change(symptomInput, { target: { value: 'Groin flare' } });

    const submitButton = screen.getByRole('button', { name: /Create Flare/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        coordinates: [{ regionId: 'left-groin', x: 0.5, y: 0.25 }],
      }));
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it('handles regions without coordinates gracefully', async () => {
    render(
      <NewFlareDialog
        {...baseProps}
        initialRegion="left-groin"
        initialCoordinates={{}}
      />
    );

    const symptomInput = screen.getByPlaceholderText(/Abscess, Lesion, Pain/i);
    fireEvent.change(symptomInput, { target: { value: 'Groin flare' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Flare/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        coordinates: undefined,
      }));
    });
    expect(screen.getByText(/Not captured/i)).toBeInTheDocument();
  });
});
