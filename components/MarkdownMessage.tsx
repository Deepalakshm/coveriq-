import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // paragraphs
        p: ({ children }: { children?: React.ReactNode }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),

        // headings
        h1: ({ children }: { children?: React.ReactNode }) => (
          <h1 className="text-base font-semibold mb-2 mt-3">{children}</h1>
        ),
        h2: ({ children }: { children?: React.ReactNode }) => (
          <h2 className="text-sm font-semibold mb-2 mt-3">{children}</h2>
        ),
        h3: ({ children }: { children?: React.ReactNode }) => (
          <h3 className="text-sm font-medium mb-1 mt-2">{children}</h3>
        ),

        // bold and italic
        strong: ({ children }: { children?: React.ReactNode }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }: { children?: React.ReactNode }) => (
          <em className="italic">{children}</em>
        ),

        // unordered list
        ul: ({ children }: { children?: React.ReactNode }) => (
          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        ),

        // ordered list
        ol: ({ children }: { children?: React.ReactNode }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        ),

        // list item
        li: ({ children }: { children?: React.ReactNode }) => (
          <li className="leading-relaxed">{children}</li>
        ),

        // inline code
        code: ({
          children,
          className,
        }: {
          children?: React.ReactNode;
          className?: string;
        }) => {
          const isBlock = typeof className === 'string' && className.includes('language-');
          if (isBlock) {
            return (
              <pre className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 text-xs overflow-x-auto my-2 font-mono">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="bg-gray-100 text-red-600 rounded px-1 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },

        // blockquote
        blockquote: ({ children }: { children?: React.ReactNode }) => (
          <blockquote className="border-l-2 border-red-300 pl-3 my-2 text-gray-500 italic">
            {children}
          </blockquote>
        ),

        // horizontal rule
        hr: () => <hr className="border-gray-200 my-3" />,

        // links
        a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 underline hover:text-red-700"
          >
            {children}
          </a>
        ),

        // table
        table: ({ children }: { children?: React.ReactNode }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }: { children?: React.ReactNode }) => (
          <thead className="bg-gray-100">{children}</thead>
        ),
        th: ({ children }: { children?: React.ReactNode }) => (
          <th className="border border-gray-200 px-2 py-1 text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }: { children?: React.ReactNode }) => (
          <td className="border border-gray-200 px-2 py-1">{children}</td>
        ),
      } as any}
    >
      {content}
    </ReactMarkdown>
  );
}