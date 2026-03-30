import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'break-words text-sm leading-6 text-foreground',
        '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]',
        '[&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-semibold',
        '[&_h2]:text-xl [&_h2]:font-semibold',
        '[&_h3]:text-lg [&_h3]:font-semibold',
        '[&_hr]:my-4 [&_hr]:border-border',
        '[&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border/70',
        '[&_li]:my-1',
        '[&_ol]:list-decimal [&_ol]:pl-6',
        '[&_p]:my-0 [&_p+*]:mt-3',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-100',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',
        '[&_table]:w-full [&_table]:border-collapse',
        '[&_tbody_tr:nth-child(even)]:bg-muted/35',
        '[&_td]:border [&_td]:border-border/70 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
        '[&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium',
        '[&_ul]:list-disc [&_ul]:pl-6',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
