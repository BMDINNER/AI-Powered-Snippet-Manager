import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className || !match;
            
            if (isInline) {
              return (
                <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded font-mono text-sm" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <pre className="bg-[#282c34] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-2">
                <code className={className} {...props}>
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            );
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold text-gray-900 my-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-semibold text-gray-800 my-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold text-gray-800 my-2">{children}</h3>;
          },
          p({ children }) {
            return <p className="text-gray-700 my-2 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-gray-700">{children}</li>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-purple-500 pl-4 my-2 text-gray-600 italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-300 rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-gray-300 px-4 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};