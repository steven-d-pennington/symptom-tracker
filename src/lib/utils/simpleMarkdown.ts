/**
 * Simple Markdown Renderer
 * Supports basic formatting: bold (**text**) and bullet lists (- item)
 * Sanitizes output to prevent XSS attacks
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'list' | 'listItem';
  content: string | MarkdownNode[];
}

/**
 * Sanitize text to prevent XSS attacks
 */
function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Parse markdown text into an AST
 */
export function parseMarkdown(text: string): MarkdownNode[] {
  if (!text || text.trim().length === 0) {
    return [{ type: 'text', content: '' }];
  }

  const lines = text.split('\n');
  const nodes: MarkdownNode[] = [];
  let currentList: MarkdownNode[] | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Empty line
    if (trimmedLine.length === 0) {
      if (currentList) {
        nodes.push({ type: 'list', content: currentList });
        currentList = null;
      }
      continue;
    }

    // List item (- item)
    if (trimmedLine.startsWith('- ')) {
      const itemText = trimmedLine.substring(2);
      const itemContent = parseInlineMarkdown(itemText);

      if (!currentList) {
        currentList = [];
      }
      currentList.push({ type: 'listItem', content: itemContent });
      continue;
    }

    // Regular text
    if (currentList) {
      nodes.push({ type: 'list', content: currentList });
      currentList = null;
    }

    const inlineContent = parseInlineMarkdown(trimmedLine);
    nodes.push({ type: 'text', content: inlineContent });
  }

  // Close any open list
  if (currentList) {
    nodes.push({ type: 'list', content: currentList });
  }

  return nodes;
}

/**
 * Parse inline markdown (bold)
 */
function parseInlineMarkdown(text: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    // Check for bold (**text**)
    if (text[i] === '*' && text[i + 1] === '*') {
      // Save current text
      if (currentText.length > 0) {
        nodes.push({ type: 'text', content: sanitizeText(currentText) });
        currentText = '';
      }

      // Find closing **
      let j = i + 2;
      while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '*')) {
        j++;
      }

      if (j < text.length - 1) {
        // Found closing **
        const boldText = text.substring(i + 2, j);
        nodes.push({ type: 'bold', content: sanitizeText(boldText) });
        i = j + 2;
      } else {
        // No closing **, treat as literal
        currentText += text[i];
        i++;
      }
    } else {
      currentText += text[i];
      i++;
    }
  }

  // Save remaining text
  if (currentText.length > 0) {
    nodes.push({ type: 'text', content: sanitizeText(currentText) });
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', content: '' }];
}

/**
 * Render markdown nodes to HTML string
 */
export function renderMarkdownToHTML(nodes: MarkdownNode[]): string {
  return nodes.map(node => renderNode(node)).join('');
}

function renderNode(node: MarkdownNode): string {
  switch (node.type) {
    case 'text':
      if (Array.isArray(node.content)) {
        return node.content.map(renderNode).join('');
      }
      return node.content;

    case 'bold':
      return `<strong>${node.content}</strong>`;

    case 'list':
      if (Array.isArray(node.content)) {
        const items = node.content.map(renderNode).join('');
        return `<ul class="list-disc list-inside ml-2 mt-1 space-y-1">${items}</ul>`;
      }
      return '';

    case 'listItem':
      if (Array.isArray(node.content)) {
        const content = node.content.map(renderNode).join('');
        return `<li class="text-sm">${content}</li>`;
      }
      return `<li class="text-sm">${node.content}</li>`;

    default:
      return '';
  }
}

/**
 * Main function: Convert markdown text to HTML
 */
export function markdownToHTML(text: string): string {
  const nodes = parseMarkdown(text);
  return renderMarkdownToHTML(nodes);
}
