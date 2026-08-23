export default function ScreenPlaceholder({ eyebrow = "Coming soon", title, description, plannedFeatures = [] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="font-mono text-xs uppercase tracking-wide text-teal">
        {eyebrow}
      </span>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">{description}</p>

      {plannedFeatures.length > 0 && (
        <ul className="mt-8 flex flex-col gap-2 border-t border-paper-line pt-6 text-sm text-ink/70">
          {plannedFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
