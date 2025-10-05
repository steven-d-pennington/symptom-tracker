import { SymptomCategory } from "@/lib/types/symptoms";

interface SymptomCategoriesProps {
  categories: SymptomCategory[];
}

export const SymptomCategories = ({ categories }: SymptomCategoriesProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Categories</h3>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-3 text-sm"
          >
            <span className="font-semibold text-foreground">{category.name}</span>
            {category.description ? (
              <span className="text-muted-foreground">{category.description}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
