# Typography System

## Font Families

- **Primary Font**: Inter, system-ui, sans-serif
- **Secondary Font**: Merriweather, Georgia, serif
- **Monospace Font**: JetBrains Mono, Consolas, monospace

## Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| display | 3rem (48px) | 1.2 (57.6px) | 700 | Hero sections, major headings |
| h1 | 2.25rem (36px) | 1.25 (45px) | 700 | Page titles |
| h2 | 1.875rem (30px) | 1.3 (39px) | 600 | Section headings |
| h3 | 1.5rem (24px) | 1.4 (33.6px) | 600 | Subsection headings |
| h4 | 1.25rem (20px) | 1.5 (30px) | 600 | Card titles, minor headings |
| h5 | 1.125rem (18px) | 1.5 (27px) | 600 | Small section headings |
| h6 | 1rem (16px) | 1.5 (24px) | 600 | Small headings, table headers |
| body | 1rem (16px) | 1.5 (24px) | 400 | Main body text |
| body-sm | 0.875rem (14px) | 1.5 (21px) | 400 | Secondary text, captions |
| body-xs | 0.75rem (12px) | 1.5 (18px) | 400 | Legal text, fine print |
| button | 0.875rem (14px) | 1.5 (21px) | 500 | Button text |
| label | 0.75rem (12px) | 1.5 (18px) | 500 | Form labels, badges |

## Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Regular body text |
| 500 | Medium emphasis, buttons |
| 600 | Semi-bold headings, emphasized text |
| 700 | Bold headings, strong emphasis |

## Text Styles

| Style Name | Description | CSS |
|------------|-------------|-----|
| heading-display | Hero display text | `font-family: var(--font-primary); font-size: 3rem; line-height: 1.2; font-weight: 700;` |
| heading-1 | Primary page heading | `font-family: var(--font-primary); font-size: 2.25rem; line-height: 1.25; font-weight: 700;` |
| heading-2 | Section heading | `font-family: var(--font-primary); font-size: 1.875rem; line-height: 1.3; font-weight: 600;` |
| heading-3 | Subsection heading | `font-family: var(--font-primary); font-size: 1.5rem; line-height: 1.4; font-weight: 600;` |
| heading-4 | Minor heading | `font-family: var(--font-primary); font-size: 1.25rem; line-height: 1.5; font-weight: 600;` |
| body-regular | Standard body text | `font-family: var(--font-primary); font-size: 1rem; line-height: 1.5; font-weight: 400;` |
| body-small | Secondary text | `font-family: var(--font-primary); font-size: 0.875rem; line-height: 1.5; font-weight: 400;` |
| body-xsmall | Fine print | `font-family: var(--font-primary); font-size: 0.75rem; line-height: 1.5; font-weight: 400;` |
| button-text | Button text | `font-family: var(--font-primary); font-size: 0.875rem; line-height: 1.5; font-weight: 500;` |
| form-label | Form labels | `font-family: var(--font-primary); font-size: 0.75rem; line-height: 1.5; font-weight: 500;` |
| code | Code snippets | `font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.5; font-weight: 400;` |

## Responsive Typography

| Breakpoint | Scale Adjustment |
|------------|------------------|
| Default (mobile) | Base size (no adjustment) |
| Tablet (640px+) | Scale up by 5% |
| Desktop (1024px+) | Scale up by 10% |
| Large Desktop (1280px+) | Scale up by 15% |

### Fluid Typography

For truly responsive text that scales smoothly between viewport sizes:

```css
h1 {
  font-size: clamp(1.875rem, 5vw, 2.25rem);
  line-height: 1.25;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  line-height: 1.3;
}

.hero-text {
  font-size: clamp(2.25rem, 8vw, 3.5rem);
  line-height: 1.2;
}
