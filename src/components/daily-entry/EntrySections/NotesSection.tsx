"use client";

interface NotesSectionProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const NotesSection = ({ notes, onChange }: NotesSectionProps) => {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">Notes</span>
      <textarea
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Add context about today's health, triggers, or wins."
        className="min-h-32 rounded-lg border border-border bg-background px-4 py-3"
      />
    </label>
  );
};
