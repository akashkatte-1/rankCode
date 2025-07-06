import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdownToHtml',
  standalone: true // Mark as standalone
})
export class MarkdownToHtmlPipe implements PipeTransform {
  transform(markdown: string): string {
    // This is a very basic, unsafe conversion.
    // In a real app, use a proper markdown parser like 'marked' or 'dompurify' for sanitization.
    if (!markdown) return '';
    let html = markdown.replace(/\n/g, '<br>'); // Simple newlines to <br>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold**
    html = html.replace(/`(.*?)`/g, '<code>$1</code>'); // `code`
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>'); // ```code block```
    html = html.replace(/\$(.*?)\$/g, '<span>$1</span>'); // Placeholder for LaTeX
    return html;
  }
}
