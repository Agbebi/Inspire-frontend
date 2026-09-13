# Kito Edu Homepage Design

## Design Direction

The Kito Edu homepage uses a premium editorial dashboard aesthetic. It should feel calm, precise, and confident rather than like a generic education landing page.

The visual idea is **academic clarity**:

- Deep ink surfaces create focus and contrast.
- Acid lime highlights signal progress, activity, and action.
- Editorial typography gives the product a distinct voice.
- Dashboard-inspired data makes the platform feel tangible immediately.
- Motion is restrained and purposeful: reveal, orient, and reward interaction.

## Color System

Homepage colors are scoped to `.home-shell` in `src/index.css`.

### Dark Mode

| Token | Value | Use |
| --- | --- | --- |
| `--home-ink` | `#10120f` | Page background |
| `--home-panel` | `#171a15` | Panel base |
| `--home-paper` | `#f2f2e9` | Primary text |
| `--home-muted` | `#9b9f91` | Supporting text |
| `--home-lime` | `#d7fb75` | Accent, actions, live indicators |

### Light Mode

Light mode overrides the same tokens under `.light .home-shell`.

- Background: warm paper `#f3f3eb`
- Primary text: charcoal `#171a14`
- Supporting text: muted olive gray `#697064`
- Accent: darker olive `#8aa83e`
- Panels: white and pale green-gray surfaces

Use the existing tokens instead of introducing new one-off colors. This keeps dark and light mode behavior aligned.

## Typography

- **Primary family:** Geist Variable, loaded through `@fontsource-variable/geist`.
- **Display accent:** Georgia is used only for italic words such as `story` and `behind the progress`.
- **Headlines:** Large, tight, and low-weight. Use negative tracking and short line-height for editorial impact.
- **Supporting copy:** Muted, readable, and limited to a comfortable measure.
- **Labels:** Small uppercase text with generous letter spacing for metadata and status indicators.

Avoid default system-font substitutions or adding another typeface without a clear hierarchy need.

## Page Structure

The homepage is organized in this order:

1. **Navigation**
   - Kito Edu mark and wordmark
   - Platform status indicator
   - Theme toggle
2. **Hero**
   - Kicker, headline, supporting copy, primary action, secondary action
   - Trust proof with compact avatar marks
   - Academic performance preview card
3. **Feature strip**
   - Four concise capability statements
4. **Portal section**
   - Role-based access cards
   - Featured “Find Your School” card
5. **Footer**
   - Copyright and concise product positioning

The main conversion path is `/auth/school/find`. Super Admin access continues to use `/auth/superadmin/login`.

## Motion

Motion libraries have intentionally separate responsibilities.

### GSAP

GSAP owns the one-time page entrance sequence in `src/pages/home.jsx`:

- Navigation drops in from above.
- Hero content rises into place with a stagger.
- The analytics preview enters with a slight rotation.
- Feature and portal sections reveal afterward.
- Decorative orbit rings rotate continuously.

The timeline is scoped with `gsap.context` and reverted on unmount. Keep new selectors inside the `.home-shell` scope to avoid affecting other pages.

### Framer Motion

Framer Motion owns local interaction states:

- Analytics preview lifts and tilts on hover.
- Portal cards lift on hover.
- Floating metric notes gently bob continuously.

Use spring transitions for cards and slow ease-in-out loops for ambient elements. Do not add motion that competes with the headline or makes data difficult to read.

Respect reduced-motion preferences when adding future animation. Entrance and decorative loops should be disabled or shortened for users who request reduced motion.

## Component and CSS Conventions

The homepage currently uses semantic, page-specific classes rather than utility-heavy markup:

- `.home-shell`
- `.home-nav`
- `.hero-section`
- `.preview-card`
- `.feature-strip`
- `.portal-section`
- `.home-footer`

Keep homepage styles scoped to these classes. Avoid changing global design tokens to solve a homepage-only visual issue.

Use `Link` for navigation and preserve the existing route paths. Use Lucide icons for interface symbols rather than hand-drawn SVG icons, except for the chart visualization, which is intentionally part of the product preview.

## Responsive Behavior

- Above `800px`: two-column hero and portal layout.
- Below `800px`: stacked hero, two-column feature strip, stacked portal content.
- Below `480px`: single-column portal cards, compact preview card, vertically stacked hero actions.

The page must remain vertically scrollable. Decorative overflow is contained horizontally with `overflow-x: hidden`; do not restore `overflow: hidden` on the page shell.

Maintain stable dimensions for the analytics card, chart, orbit elements, and action controls so animation does not shift surrounding content.

## Accessibility Notes

- Keep the analytics preview `aria-label` intact.
- Decorative orbit, noise, and chart elements should remain `aria-hidden`.
- Preserve visible focus states from the shared button and link styles.
- Keep contrast readable in both theme modes.
- Theme toggle must remain keyboard accessible and expose its switch state.
- Do not use animation as the only way to communicate status.

## Verification Checklist

Before shipping homepage changes:

- Run `npm run lint` from `Inspire-frontend`.
- Run `npm run build` from `Inspire-frontend`.
- Check dark and light mode manually.
- Check desktop, tablet, and narrow mobile widths.
- Confirm the page scrolls vertically.
- Confirm all portal links still navigate correctly.
- Check that initial motion does not obscure the primary action.
