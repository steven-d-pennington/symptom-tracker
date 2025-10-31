import 'fake-indexeddb/auto';
import { db } from '../../db/client';
import { symptomInstanceRepository } from '../symptomInstanceRepository';
import { SymptomInstanceRecord } from '../../db/schema';

describe('SymptomInstanceRepository', () => {
  beforeEach(async () => {
    await db.symptomInstances.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should not throw when a symptom instance has an undefined severityScale', async () => {
    const userId = 'user-1';
    const now = new Date();

    const recordWithScale: SymptomInstanceRecord = {
      id: 'symptom-1',
      userId,
      name: 'Headache',
      category: 'Pain',
      severity: 5,
      severityScale: JSON.stringify({ min: 1, max: 10, labels: { 1: 'Mild', 10: 'Severe' } }),
      timestamp: now,
      updatedAt: now,
    };

    // This record simulates old data where severityScale might not have been defined
    const recordWithoutScale: SymptomInstanceRecord = {
      id: 'symptom-2',
      userId,
      name: 'Fatigue',
      category: 'General',
      severity: 7,
      // @ts-ignore - Intentionally testing an undefined property to replicate the bug
      severityScale: undefined,
      timestamp: new Date(now.getTime() + 1000),
      updatedAt: new Date(now.getTime() + 1000),
    };

    await db.symptomInstances.bulkAdd([recordWithScale, recordWithoutScale]);

    // The getAll method uses recordToSymptom internally. This should not throw.
    await expect(symptomInstanceRepository.getAll(userId)).resolves.not.toThrow();

    const symptoms = await symptomInstanceRepository.getAll(userId);

    expect(symptoms).toHaveLength(2);

    const symptomWithScale = symptoms.find(s => s.id === 'symptom-1');
    const symptomWithoutScale = symptoms.find(s => s.id === 'symptom-2');

    expect(symptomWithScale?.severityScale).toBeDefined();
    expect(symptomWithScale?.severityScale.max).toBe(10);

    // This is the key assertion: ensure the property is undefined and not causing a crash
    expect(symptomWithoutScale?.severityScale).toBeUndefined();
  });
});
