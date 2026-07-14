type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string }>;
  content?: TiptapNode[];
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyMarks = (text: string, marks?: Array<{ type: string }>) => {
  if (!marks?.length) return text;
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "strike":
        return `<s>${acc}</s>`;
      default:
        return acc;
    }
  }, text);
};

const renderTiptapNode = (node: TiptapNode): string => {
  const children = node.content?.map(renderTiptapNode).join("") ?? "";
  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children || "<br />"}</p>`;
    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const safeLevel = level === 1 || level === 2 || level === 3 ? level : 2;
      return `<h${safeLevel}>${children}</h${safeLevel}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "image": {
      const src = String(node.attrs?.src ?? "");
      if (!src) return "";
      const alt = node.attrs?.alt
        ? ` alt=\"${escapeHtml(String(node.attrs.alt))}\"`
        : "";
      const title = node.attrs?.title
        ? ` title=\"${escapeHtml(String(node.attrs.title))}\"`
        : "";
      return `<img src=\"${escapeHtml(src)}\"${alt}${title} />`;
    }
    case "hardBreak":
      return "<br />";
    case "text": {
      const text = escapeHtml(node.text ?? "");
      return applyMarks(text, node.marks);
    }
    default:
      return children;
  }
};

const tiptapJsonToHtml = (data: TiptapNode): string => {
  if (!data?.type) return "";
  return renderTiptapNode(data);
};

export const normalizeArticleHtmlSpacing = (html: string) =>
  html.replace(/(?:&nbsp;|&#160;| )+/gi, " ");

export const normalizeLegacyContent = (content: string) => {
  if (!content) return { html: "", isLegacy: false };
  if (content.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(content) as TiptapNode;
      if (parsed?.type === "doc") {
        return {
          html: normalizeArticleHtmlSpacing(tiptapJsonToHtml(parsed)),
          isLegacy: true,
        };
      }
    } catch {
      // ignore
    }
  }
  return { html: normalizeArticleHtmlSpacing(content), isLegacy: false };
};

export const stripHtmlToText = (html: string) =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const isHtmlEmpty = (html: string) => {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  return stripHtmlToText(html).length === 0;
};
