# Design — Ultimate Fighter Builder

Three screens, one linear session. The design has to do two different jobs: read
clearly as a fast decision-making tool for five minutes of spinning and stealing,
then land one big emotional beat at the reveal.

## Colour

Dark-committed broadcast palette — one near-black ground, a small set of reserved
accents. Gold means a top-tier outcome and nothing else; red is the promotion/danger
register; green/blue mark wins and neutral information respectively. Grade badges get
their own five-colour scale (S gold, A green, B blue, C amber, D red) so a build's
strengths and weaknesses are readable at a glance without reading every letter.

## Type

Barlow Condensed for display (tier titles, fighter names, ratings), Barlow for body
copy. Numbers are tabular so a rating changing in place doesn't jitter its neighbors.

## The three screens

**Start** — sells the premise in one screen: pool choice, Hard Mode toggle, the six
tools previewed as chips before the player commits to anything.

**Build** — a slot rail across the top (six tools, filled or open) is the whole state
of the build at a glance. Below it, one spin control and a reveal panel that only
appears once a fighter has actually landed. Nothing here has a multi-step confirm —
spin, see, steal, done.

**Result** — the payoff. Tier title first and biggest, coloured by how good the
outcome was; a rating ring; the full record; then a receipt (exactly which grade came
from which fighter) and one or two simulated "spotlight" fights, so the six abstract
choices the player made read back as a story.

## Motion

Framer Motion throughout, but restrained to two jobs: arrival (`fadeUp`/`Stagger` on
every screen's content) and one small piece of drama (the slot-machine reel cycling
during a spin, a spring-in on the tier reveal). Nothing is gated behind an animation
finishing — see the README's note on why that's a hard rule here, not a preference.

`prefers-reduced-motion` collapses the reel's cycling animation to a static dimmed
state and shortens every transition; nothing disappears or becomes unreachable.

## Accessibility

Touch targets ≥44px under `pointer: coarse`. Focus rings are never removed. Every
interactive element carries a text label. Colour is never the only signal — grade
badges carry the letter, win/loss carries a check or an X icon alongside the colour.
No horizontal scroll at 375–1440px; the build screen's slot rail collapses from six
columns to three to two as the viewport narrows rather than overflowing.
