import { NextRequest, NextResponse } from 'next/server'
import type { PitchSlide } from '@/lib/agents/pitch-builder'

// ---------------------------------------------------------------------------
// HTML template for self-contained presentation
// ---------------------------------------------------------------------------

function buildHTMLPresentation(slides: PitchSlide[], dealerName: string): string {
  const slideHTML = slides
    .map(
      (slide, i) => `
    <section class="slide" id="slide-${i}" style="display: ${i === 0 ? 'flex' : 'none'}">
      <div class="slide-badge">${slide.type.toUpperCase()}</div>
      <h1>${escapeHtml(slide.title)}</h1>
      <p class="subtitle">${escapeHtml(slide.subtitle)}</p>
      <div class="content">${markdownToHtml(slide.content)}</div>
    </section>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Visio Auto Pitch — ${escapeHtml(dealerName)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #09090b; color: #fafafa;
    min-height: 100vh; overflow: hidden;
  }
  .slide {
    min-height: 100vh; padding: 60px 80px;
    flex-direction: column; justify-content: center; gap: 24px;
    max-width: 1200px; margin: 0 auto;
  }
  .slide-badge {
    display: inline-block; padding: 4px 12px;
    background: rgba(16,185,129,0.15); color: #34d399;
    border-radius: 6px; font-size: 11px; font-weight: 600;
    letter-spacing: 1px; width: fit-content;
  }
  h1 { font-size: 48px; font-weight: 700; line-height: 1.1; color: #fff; }
  .subtitle { font-size: 20px; color: #a1a1aa; max-width: 600px; }
  .content { font-size: 16px; line-height: 1.8; color: #d4d4d8; max-width: 800px; }
  .content strong { color: #34d399; font-weight: 600; }
  .content ul { list-style: none; padding: 0; }
  .content li { padding: 6px 0; padding-left: 20px; position: relative; }
  .content li::before { content: ''; position: absolute; left: 0; top: 14px; width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
  .content table { border-collapse: collapse; margin: 16px 0; }
  .content th, .content td { padding: 8px 16px; text-align: left; border-bottom: 1px solid #27272a; }
  .content th { color: #a1a1aa; font-weight: 500; font-size: 13px; }
  .content blockquote { border-left: 3px solid #10b981; padding-left: 16px; font-style: italic; color: #a1a1aa; }
  .nav {
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 16px;
    background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 8px 20px;
  }
  .nav button {
    background: none; border: 1px solid #3f3f46; color: #fafafa; padding: 8px 16px;
    border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
    transition: all 0.15s;
  }
  .nav button:hover { background: #27272a; border-color: #10b981; }
  .nav .counter { font-size: 13px; color: #71717a; font-variant-numeric: tabular-nums; }
  .brand {
    position: fixed; top: 24px; left: 32px;
    display: flex; align-items: center; gap: 8px;
  }
  .brand-dot { width: 28px; height: 28px; border-radius: 8px; background: #10b981; display: flex; align-items: center; justify-content: center; }
  .brand-dot svg { width: 14px; height: 14px; fill: white; }
  .brand-name { font-size: 13px; font-weight: 600; color: #a1a1aa; }
</style>
</head>
<body>
  <div class="brand">
    <div class="brand-dot">
      <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
    </div>
    <span class="brand-name">VISIO AUTO</span>
  </div>

  ${slideHTML}

  <div class="nav">
    <button onclick="prev()">&#8592; Prev</button>
    <span class="counter"><span id="current">1</span> / ${slides.length}</span>
    <button onclick="next()">Next &#8594;</button>
  </div>

  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    const counter = document.getElementById('current');
    function show(i) {
      slides.forEach(s => s.style.display = 'none');
      slides[i].style.display = 'flex';
      counter.textContent = i + 1;
    }
    function next() { if (current < slides.length - 1) { current++; show(current); } }
    function prev() { if (current > 0) { current--; show(current); } }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });
  </script>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function markdownToHtml(md: string): string {
  let html = md
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#34d399">$1</a>')
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_match, header, body) => {
    const ths = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map((row: string) => {
      const tds = row.split('|').filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join('')
      return `<tr>${tds}</tr>`
    }).join('')
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
  })
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  // Paragraphs (remaining lines)
  html = html.replace(/^(?!<)((?!<[uo]l|<li|<table|<block|<h).+)$/gm, '<p>$1</p>')
  return html
}

// ---------------------------------------------------------------------------
// Markdown export
// ---------------------------------------------------------------------------

function buildMarkdown(slides: PitchSlide[], dealerName: string): string {
  const lines = [`# Visio Auto Pitch — ${dealerName}\n`]
  for (const slide of slides) {
    lines.push(`---\n`)
    lines.push(`## ${slide.title}\n`)
    lines.push(`*${slide.subtitle}*\n`)
    lines.push(slide.content)
    lines.push('')
  }
  lines.push(`---\n\n*Generated by Visio Auto AI Pitch Builder*`)
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slides, format, dealer_name } = body as {
      slides: PitchSlide[]
      format: 'json' | 'html' | 'markdown'
      dealer_name?: string
    }

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'slides array is required' }, { status: 400 })
    }

    const name = dealer_name ?? 'Dealership'

    switch (format) {
      case 'html': {
        const html = buildHTMLPresentation(slides, name)
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="visio-auto-pitch-${name.toLowerCase().replace(/\s+/g, '-')}.html"`,
          },
        })
      }
      case 'markdown': {
        const md = buildMarkdown(slides, name)
        return new NextResponse(md, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="visio-auto-pitch-${name.toLowerCase().replace(/\s+/g, '-')}.md"`,
          },
        })
      }
      case 'json':
      default:
        return NextResponse.json({ data: { slides, dealer_name: name } })
    }
  } catch (error) {
    console.error('Pitch export error:', error)
    return NextResponse.json(
      { error: 'Failed to export pitch', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
