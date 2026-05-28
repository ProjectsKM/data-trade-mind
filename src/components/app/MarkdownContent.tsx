import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Componente separado em arquivo próprio pra permitir lazy-load via
// React.lazy no /mind — react-markdown + remark-gfm somam ~150KB que só
// precisam carregar depois que o stream termina (ou em mensagens antigas
// com markdown), nunca no carregamento inicial da rota.
const MarkdownContent = memo(function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2
              className="font-display mt-3 mb-2 text-base font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--foreground)" }}
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3
              className="font-display mt-3 mb-1.5 text-[15px] font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--foreground)" }}
            >
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4
              className="font-display mt-2.5 mb-1 text-sm font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--accent)" }}
            >
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5
              className="font-display mt-2 mb-1 text-[13px] font-semibold uppercase tracking-wider first:mt-0"
              style={{ color: "var(--text-muted)" }}
            >
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="my-1.5 first:mt-0 last:mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {children}
            </p>
          ),
          ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong style={{ color: "var(--foreground)" }}>{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code
              className="rounded px-1 py-0.5 font-mono text-[12px]"
              style={{ background: "var(--surface-3, var(--surface))", color: "var(--accent)" }}
            >
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="my-2 border-l-2 pl-3 italic"
              style={{ borderColor: "var(--accent)", color: "var(--text-muted)" }}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownContent;
