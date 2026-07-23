import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMarkdownRendererProps {
  content: string;
  className?: string;
}

export const ChatMarkdownRenderer: React.FC<ChatMarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) {
    return null;
  }

  const cleanContent = content.trim();

  const isMarkdown = cleanContent.includes('**') || 
      cleanContent.includes('# ') ||
      cleanContent.includes('* ') ||
      cleanContent.includes('- ') ||
      cleanContent.includes('> ') ||
      cleanContent.includes('|');

  const markdownContent = isMarkdown ? cleanContent : `\`\`\`text\n${cleanContent}\n\`\`\``;

  return (
    <div className={`chat-markdown-renderer ${className}`}>
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
            
            const language = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');
            
            return (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  backgroundColor: '#282c34',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px',
                  margin: '8px 0',
                }}
                showLineNumbers={false}
              >
                {codeString}
              </SyntaxHighlighter>
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
          h4({ children }) {
            return <h4 className="text-base font-semibold text-gray-800 my-2">{children}</h4>;
          },
          h5({ children }) {
            return <h5 className="text-sm font-semibold text-gray-800 my-1">{children}</h5>;
          },
          h6({ children }) {
            return <h6 className="text-xs font-semibold text-gray-800 my-1">{children}</h6>;
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
          thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="border-b border-gray-200">{children}</tr>;
          },
          th({ children }) {
            return <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-gray-300 px-4 py-2">{children}</td>;
          },
          hr() {
            return <hr className="my-4 border-gray-300" />;
          },
          img({ src, alt }) {
            return <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-2" />;
          },
          strong({ children }) {
            return <strong className="font-bold text-gray-900">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          del({ children }) {
            return <del className="line-through text-gray-500">{children}</del>;
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};