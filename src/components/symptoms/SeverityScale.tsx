"use client";

interface SeverityScaleProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const SeverityScale = ({ value, onChange, min = 0, max = 10 }: SeverityScaleProps) => {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer rounded-full bg-muted"
      />
      <span className="w-10 text-center text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
};
