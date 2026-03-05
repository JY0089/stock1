import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
