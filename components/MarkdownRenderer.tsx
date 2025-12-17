import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split by newlines to handle blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  lines.forEach((line, lineIndex) => {
    // 1. Headers (###)
    if (line.startsWith('### ')) {
      // Flush list if exists
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${lineIndex}`} className="list-disc ml-5 mb-2 space-y-1">{currentList}</ul>);
        currentList = [];
      }
      elements.push(
        <h3 key={lineIndex} className="font-bold text-teal-200 mt-3 mb-1 text-sm uppercase tracking-wide">
          {parseInline(line.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // 2. Lists (* or -)
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().substring(2);
      currentList.push(
        <li key={`${lineIndex}-li`}>
          {parseInline(text)}
        </li>
      );
      return;
    }

    // Flush list if we encounter a non-list line
    if (currentList.length > 0) {
      elements.push(<ul key={`list-${lineIndex}`} className="list-disc ml-5 mb-2 space-y-1">{currentList}</ul>);
      currentList = [];
    }

    // 3. Empty lines (Paragraph breaks)
    if (line.trim() === '') {
      elements.push(<div key={lineIndex} className="h-2" />);
      return;
    }

    // 4. Regular Paragraphs
    elements.push(
      <p key={lineIndex} className="mb-1 text-slate-300">
        {parseInline(line)}
      </p>
    );
  });

  // Flush remaining list
  if (currentList.length > 0) {
    elements.push(<ul key={`list-end`} className="list-disc ml-5 mb-2 space-y-1">{currentList}</ul>);
  }

  return <div>{elements}</div>;
};

// Helper to parse **bold** inside a string
const parseInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-teal-300">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};