"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { bodyMapPreferencesRepository } from '@/lib/repositories/bodyMapPreferencesRepository';
import type { GenderType, BodyType } from '@/lib/types/body-mapping';
import { BodyMapPreviewModal } from './BodyMapPreviewModal';

interface BodyMapPreferencesFormProps {
  userId: string;
}

export function BodyMapPreferencesForm({ userId }: BodyMapPreferencesFormProps) {
  const [selectedGender, setSelectedGender] = useState<GenderType>('neutral');
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType>('average');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await bodyMapPreferencesRepository.get(userId);
        setSelectedGender(prefs.selectedGender || 'neutral');
        setSelectedBodyType(prefs.selectedBodyType || 'average');
      } catch (error) {
        console.error('Failed to load body map preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [userId]);

  // Track changes
  useEffect(() => {
    async function checkChanges() {
      const prefs = await bodyMapPreferencesRepository.get(userId);
      const changed =
        selectedGender !== (prefs.selectedGender || 'neutral') ||
        selectedBodyType !== (prefs.selectedBodyType || 'average');
      setHasChanges(changed);
    }

    if (!loading) {
      checkChanges();
    }
  }, [selectedGender, selectedBodyType, userId, loading]);

  const handleSave = () => {
    // Show preview modal before saving
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await bodyMapPreferencesRepository.setGenderAndBodyType(
        userId,
        selectedGender,
        selectedBodyType
      );
      setHasChanges(false);
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to save body map preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSelectedGender('neutral');
    setSelectedBodyType('average');
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading preferences...
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Gender Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Body Map Gender
            <span className="ml-2 text-xs text-muted-foreground">
              (Choose the body map that best represents you)
            </span>
          </label>
          <div className="space-y-2">
            {(['female', 'male', 'neutral'] as const).map((gender) => (
              <label
                key={gender}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedGender === gender
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={selectedGender === gender}
                  onChange={(e) => setSelectedGender(e.target.value as GenderType)}
                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                  aria-label={`Select ${gender} body map variant`}
                />
                <span className="ml-3 text-sm font-medium text-foreground capitalize">
                  {gender === 'neutral' ? 'Neutral / Other' : gender}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Body Type Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Body Type
            <span className="ml-2 text-xs text-muted-foreground">
              (Optional: Choose your body type for better representation)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['slim', 'average', 'plus-size', 'athletic'] as const).map((bodyType) => (
              <label
                key={bodyType}
                className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedBodyType === bodyType
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="bodyType"
                  value={bodyType}
                  checked={selectedBodyType === bodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value as BodyType)}
                  className="sr-only"
                  aria-label={`Select ${bodyType} body type`}
                />
                <span className="text-sm font-medium text-foreground capitalize">
                  {bodyType}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview Thumbnail */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">Current Selection</div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground capitalize">
                {selectedGender === 'neutral' ? 'Neutral' : selectedGender} - {selectedBodyType}
              </div>
              <div className="text-xs text-muted-foreground">
                Click "Preview & Save" to see how this will look
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              hasChanges && !saving
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            aria-label="Preview and save body map preferences"
          >
            {saving ? 'Saving...' : 'Preview & Save'}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Reset to default preferences"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Info Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Note:</strong> Your body map preference helps make symptom tracking more
          comfortable and accurate. All body maps include the same medical regions for tracking.
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <BodyMapPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmSave}
          gender={selectedGender}
          bodyType={selectedBodyType}
          userId={userId}
        />
      )}
    </>
  );
}
