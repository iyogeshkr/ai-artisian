// Unused component — candidate for DesignGeneratorPage.jsx v2
export default function PromptExamples({ examples, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {examples.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
        >
          {example.length > 56 ? `${example.slice(0, 53)}...` : example}
        </button>
      ))}
    </div>
  );
}
