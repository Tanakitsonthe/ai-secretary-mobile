"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

export default function MarkdownView({ content }: { content: string }) {
  return (
    <article className="prose prose-zinc dark:prose-invert prose-headings:scroll-mt-20 max-w-none px-4 py-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
