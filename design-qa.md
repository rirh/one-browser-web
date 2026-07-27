# Node management design QA

**Source visual truth**

- `/var/folders/23/j16wtksn2gv4mpfkln3k6t_c0000gn/T/codex-clipboard-e00ba238-319d-4b94-b810-4a00a9456227.png` — original create-node dialog.
- `/var/folders/23/j16wtksn2gv4mpfkln3k6t_c0000gn/T/codex-clipboard-08b3314f-8c48-4e80-aa48-0e2d55ece5ce.png` — searchable, scrollable country picker state.
- `/var/folders/23/j16wtksn2gv4mpfkln3k6t_c0000gn/T/codex-clipboard-26c60247-f4fb-4465-90f2-ac6aacf4da25.png` — system navigation with the missing node-management icon.

**Rendered implementation evidence**

- Full create dialog: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-dialog-after.png`
- Open, scrolled country picker with Flagcdn assets: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-country-dropdown-reference-aligned.png`
- Selected country with flag: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-country-selected-flag.png`
- Sidebar icon state: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-sidebar-after.png`

**Viewport and normalization**

- Browser CSS viewport: `834 × 640`, device scale factor `1`.
- Original dialog: `1668 × 1280` (`@2x`), normalized to `834 × 640`.
- Original country picker: `822 × 912` (`@2x`), normalized to `411 × 456`; implementation country region was cropped and normalized to the same size.
- Original sidebar: `504 × 682` (`@2x`), normalized to `252 × 341`; implementation sidebar was cropped to `256 × 341` and normalized to `252 × 341`.

**State**

- Create dialog open in Simplified Chinese.
- Country picker open and keyboard-scrolled to the Zimbabwe–Comoros region; visible native scrollbar, Flagcdn images loaded.
- Search tested with `新加坡`; one matching option selected; selected trigger showed `新加坡` and its flag.
- Node-management navigation item active with a network icon despite an unregistered or empty route icon value.

**Comparison evidence**

- Full-view dialog comparison: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-dialog-comparison.png`
- Focused country-picker comparison: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-country-dropdown-comparison.png`
- Focused sidebar comparison: `/Users/zh/.codex/visualizations/2026/07/22/019f889e-d092-74b2-aab5-155c5df931f4/node-sidebar-comparison.png`

**Findings**

- No remaining P0/P1/P2 findings.
- Typography: existing application font, sizes, weights, and hierarchy remain consistent with the reference and surrounding product UI.
- Spacing/layout: the two-column dialog grid, compact control height, picker width, row density, radii, and footer placement match the existing design language. Removing server-owned/unneeded fields is an intentional product change requested by the user.
- Colors/tokens: implementation uses the existing neutral background, border, muted, hover, focus, and primary-action tokens.
- Image quality/assets: country flags are real PNG assets from `flagcdn.com`, loaded at `w20` with a `w40` 2x source; all 249 rendered picker flags reported non-zero natural width. No placeholder or code-drawn flag assets are used.
- Copy/content: node ID is described as system-generated; expected exit IP and carrier fields are absent; country/region is searchable and selectable.
- Accessibility/interaction: labeled combobox, keyboard navigation, searchable listbox, ISO code text, decorative empty-alt flags, and visible selection state are present.

**Comparison history**

1. P1: node-management icon was missing when the route icon key was empty or unknown. Fixed with a route-specific `NetworkIcon` fallback. Post-fix evidence: sidebar comparison and DOM check (`1` matching link, `1` SVG).
2. P1: initial create form exposed a client-entered node ID plus fields the user did not need. Fixed by moving ID generation to the server, removing expected exit IP/carrier inputs, and replacing free-text region with country selection. Post-fix evidence: full-view dialog comparison.
3. P2: the first country-control iteration did not reliably filter or persist selection. Replaced with the product's Command + Popover pattern. Post-fix evidence: searching `新加坡` yielded one option and selection persisted in the trigger.
4. P2: country rows had no flags and the scroll affordance was hidden. Added Flagcdn images to rows and the selected trigger, plus a bounded list with a thin visible scrollbar. Post-fix evidence: country-picker comparison; list metrics were `288px` client height, `7976px` scroll height, and keyboard navigation changed `scrollTop` from `0` to `360`.

**Primary interactions tested**

- Opened and closed-state-inspected the country selector.
- Keyboard-scrolled through the full country list.
- Searched for and selected Singapore.
- Verified the selected trigger's Flagcdn image loaded.
- Checked final dialog and sidebar tabs for browser console errors: none.

**Follow-up polish**

- None required for this scope.

final result: passed

---

# Egress install and delete dialog design QA

**Source visual truth**

- `/var/folders/23/j16wtksn2gv4mpfkln3k6t_c0000gn/T/codex-clipboard-a41b12be-9c0e-4bab-8bc4-abe48adc562c.png`
- Source dimensions: `1838 × 1552`.

**Rendered implementation evidence**

- Install result: `/Users/zh/.codex/visualizations/2026/07/24/019f9333-bfc1-7152-a854-913bcfa915e7/egress-install-dialog-optimized.jpg`
- Delete confirmation: `/Users/zh/.codex/visualizations/2026/07/24/019f9333-bfc1-7152-a854-913bcfa915e7/egress-delete-dialog-with-uninstall.jpg`
- Captured dimensions: `1280 × 1080`, CSS viewport `1280 × 1080`, reported device pixel ratio `1`.

**State**

- Simplified Chinese, light theme.
- Install result with a development node in the offline/pending state.
- Delete confirmation for the same node with the uninstall command loaded.

**Full-view and focused comparison evidence**

- DOM verification confirmed the complete install dialog exposes current online state, lifecycle status, environment, TLS state, node ID, expiry, Native/Docker tabs, one-click command, copy action, and completion action.
- DOM verification confirmed the complete delete dialog exposes node identity, online state, lifecycle status, uninstall command, copy action, cancel action, and destructive delete action.
- Full visual comparison is blocked: the in-app browser screenshot contains the correct rendered dialog but offsets and clips fixed-position dialog content in the captured image. The complete state cannot be normalized against the source screenshot reliably.

**Findings**

- No functional or semantic P0/P1 findings were found in the rendered DOM.
- Typography uses the existing Inter-based application typography and established weights.
- Spacing and layout were intentionally reduced from the source: the large warning and four-field metadata block became one compact live-status card; uninstall was removed from the install tabs.
- Colors use existing background, muted, border, badge, destructive, and primary tokens.
- Icons use the existing Lucide component library; no image assets are required for these dialogs.
- Copy now separates the install decision from the uninstall/delete flow.
- P2 visual verification remains blocked because a complete, correctly positioned implementation screenshot could not be captured.

**Primary interactions tested**

- Submitted the create form through the mocked development enrollment response.
- Verified the Native tab is selected and the Docker tab is available.
- Verified live-state labels and the one-click installer command are present.
- Opened the delete confirmation and verified the uninstall command and copy/delete controls are present.

**Comparison history**

1. P1 information architecture issue: uninstall was presented as a peer install method. Fixed by moving uninstall into delete confirmation.
2. P2 density issue: warning, metadata, tabs, command, and long help text made the install dialog excessively tall. Fixed with a smaller frame, compact live-status card, two install tabs, shorter command viewport, and one-line token warning.
3. P2 status visibility issue: install and delete dialogs did not expose the latest node state. Fixed with SSE-backed query-cache status in the install dialog and SSE-updated action state in delete confirmation.

**Follow-up polish**

- Repeat full screenshot comparison from an authenticated browser session if pixel-level verification is required.

final result: blocked

---

# Header icon size design QA

**Source visual truth**

- `/var/folders/23/j16wtksn2gv4mpfkln3k6t_c0000gn/T/codex-clipboard-4d03a242-0f7c-4dc7-8b91-5c266395a7bb.png`
- Source dimensions: `280 × 152`. The source records the reported defect: the language control is `28 × 28` CSS pixels while the theme control is `24 × 24`.

**Rendered implementation evidence**

- Full page: `/Users/zh/.codex/visualizations/2026/07/26/019f9ebd-16cc-7a60-8422-8aa179599350/header-icons/implementation-download-page.png`
- Focused Header crop: `/Users/zh/.codex/visualizations/2026/07/26/019f9ebd-16cc-7a60-8422-8aa179599350/header-icons/implementation-header-icons.png`
- Focused source/implementation comparison: `/Users/zh/.codex/visualizations/2026/07/26/019f9ebd-16cc-7a60-8422-8aa179599350/header-icons/header-icons-comparison.png`

**Viewport and normalization**

- Browser CSS viewport: `768 × 600`, device scale factor `1`.
- Implementation crop: `140 × 76`, upscaled to `280 × 152` only to normalize against the source screenshot density.
- State: Simplified Chinese, light theme, public download page Header.

**Comparison evidence**

- Full-view evidence confirms both controls remain aligned in the existing Header layout.
- Focused comparison confirms both rendered buttons are `28 × 28` CSS pixels and both SVG bounds are `16 × 16`.
- A separate focused region was required because the full-page screenshot renders the controls too small for reliable pixel comparison.

**Findings**

- No remaining P0/P1/P2 findings.
- Fonts and typography: unchanged; this scope contains icon-only controls with accessible labels.
- Spacing and layout rhythm: both controls now use the same `icon-sm` size, radius, vertical alignment, and existing `6px` Header gap.
- Colors and visual tokens: existing outline, muted background, hover, dark-mode, and border tokens are unchanged.
- Image quality and asset fidelity: both controls continue to use the existing Lucide icon components; no raster assets or replacement drawings were introduced.
- Copy and content: unchanged.
- Accessibility and interaction: both controls retain their accessible labels. Theme switching changed the root state from light to dark and back; the language menu opened with Simplified Chinese selected and then closed.

**Comparison history**

1. P2: the language control used `icon-sm` while the theme control used `icon-xs`, producing mismatched `28 × 28` and `24 × 24` button frames plus mismatched `16 × 16` and `12 × 12` icon bounds.
2. Fix: changed the shared `ThemeToggleButton` to `icon-sm`.
3. Post-fix evidence: browser-computed bounds report both buttons at `28 × 28` and both icons at `16 × 16`; the focused comparison shows matching frames.

**Primary interactions tested**

- Toggled light → dark → light.
- Opened and closed the language menu.
- Checked browser console warnings and errors: none.

**Follow-up polish**

- None required for this scope.

final result: passed
