import CodeBlock from "@/components/ui/CodeBlock";

export interface ArchLayer {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  color: string;
  techStack: string[];
  metrics?: string;
  cliCommand?: string;
  description: string;
}

interface LayerPanelProps {
  layer: ArchLayer;
}

export default function LayerPanel({ layer }: LayerPanelProps) {
  return (
    <div className="bg-surface-2 border border-edge-2 rounded-md p-6">
      {/* Layer number badge */}
      <div
        className="font-code text-[11px] tracking-widest uppercase mb-2"
        style={{ color: layer.color }}
      >
        {layer.number}
      </div>

      {/* Layer name */}
      <h2 className="font-display text-2xl text-ink mb-1">{layer.name}</h2>

      {/* Subtitle */}
      <p className="text-muted text-[15px] md:text-sm mb-4">{layer.subtitle}</p>

      {/* Description */}
      <p className="text-muted text-[15px] md:text-sm leading-relaxed mb-4">{layer.description}</p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {layer.techStack.map((tech) => (
          <span
            key={tech}
            className="font-code text-[11px] border border-edge px-2 py-0.5 rounded text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Metrics */}
      {layer.metrics && (
        <p className="font-code text-[12px] text-jade mb-4">◆ {layer.metrics}</p>
      )}

      {/* CLI command */}
      {layer.cliCommand && (
        <CodeBlock code={layer.cliCommand} lang="bash" />
      )}
    </div>
  );
}
