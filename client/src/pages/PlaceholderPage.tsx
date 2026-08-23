interface Props {
  title: string;
}

export default function PlaceholderPage({ title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="text-4xl">🚧</div>
      <h2 className="text-xl font-semibold" style={{ color: "#1A2E22" }}>
        {title}
      </h2>
      <p className="text-sm" style={{ color: "#4A6355" }}>
        This page will be implemented in the next feature branch.
      </p>
    </div>
  );
}

