import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Parses and renders text containing LaTeX math formulas:
 * - Block math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Raw LaTeX expressions
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  if (!content) return null;

  // If the whole content looks like pure LaTeX (starts with \ or has math operators and no regular words)
  const isPureLatex =
    content.trim().startsWith('\\') &&
    !content.includes(' ') &&
    !content.includes('\n');

  if (isPureLatex) {
    try {
      const html = katex.renderToString(content.trim(), {
        displayMode: !inline,
        throwOnError: false,
      });
      return (
        <span
          className={`katex-rendered ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <span className={className}>{content}</span>;
    }
  }

  // Tokenize string by $$...$$ and $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
  const parts = content.split(regex);

  return (
    <span className={`inline-block max-w-full leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Block math $$...$$ or \[...\]
        if (
          (part.startsWith('$$') && part.endsWith('$$')) ||
          (part.startsWith('\\[') && part.endsWith('\\]'))
        ) {
          const math = part.startsWith('$$')
            ? part.slice(2, -2)
            : part.slice(2, -2);
          try {
            const html = katex.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="my-2 block text-center overflow-x-auto py-1"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        // Inline math $...$ or \(...\)
        if (
          (part.startsWith('$') && part.endsWith('$')) ||
          (part.startsWith('\\(') && part.endsWith('\\)'))
        ) {
          const math = part.startsWith('$')
            ? part.slice(1, -1)
            : part.slice(2, -2);
          try {
            const html = katex.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-math px-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        // Regular text (support line breaks)
        return (
          <React.Fragment key={index}>
            {part.split('\n').map((line, lIdx, arr) => (
              <React.Fragment key={lIdx}>
                {line}
                {lIdx < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </span>
  );
};
