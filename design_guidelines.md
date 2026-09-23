{
  "design_system": {
    "name": "KaalChakra (existing) — Admin + Map Detail Cards extension",
    "non_negotiables": [
      "Reuse existing KaalChakra tokens from /frontend/src/index.css (HSL CSS variables). Do not introduce a new palette.",
      "Keep public UI unchanged; admin should feel like 'admin mode' via layout + chrome (top bar, subtle borders), not new colors.",
      "All interactive and key informational elements MUST include data-testid (kebab-case, role-based).",
      "Use shadcn/ui components from /app/frontend/src/components/ui/*.jsx (not HTML primitives).",
      "Icons: lucide-react only.",
      "No universal transitions (no transition-all)."
    ],
    "brand_attributes": [
      "Museum placard + editorial: serif headings (Crimson Text) with clean sans UI (Figtree)",
      "Trustworthy back-office: dense information, clear hierarchy, strong focus states",
      "Heritage cues: parchment surfaces, saffron/gold accents, teal for info",
      "Admin mode distinction: 'ink' top bar, breadcrumbing, subtle gridlines"
    ]
  },

  "typography": {
    "font_pairing": {
      "display_headings": "Crimson Text (already used globally for h1-h4)",
      "ui_body": "Figtree (body font-sans)",
      "mono": "Azeret Mono (IDs, slugs, tokens, lat/lng)"
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em]",
      "h2": "text-base md:text-lg text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-semibold",
      "table_header": "text-xs uppercase tracking-wide text-muted-foreground",
      "body": "text-sm sm:text-base leading-6",
      "small": "text-xs text-muted-foreground",
      "mono_small": "font-mono text-xs tabular-nums"
    },
    "admin_tone_rules": [
      "Use serif only for page titles/section titles; keep form labels, table headers, and buttons in sans for clarity.",
      "Use mono for slugs, IDs, URLs, coordinates, and JWT-related debug info (if shown)."
    ]
  },

  "color_and_tokens": {
    "source_of_truth": "/app/frontend/src/index.css",
    "usage_map": {
      "surfaces": {
        "page_bg": "bg-background",
        "cards": "bg-card text-card-foreground",
        "muted_panels": "bg-muted/40",
        "admin_chrome": "bg-[hsl(var(--stage))] text-[hsl(var(--brand-ink))] (in dark mode invert via tokens)"
      },
      "actions": {
        "primary": "bg-primary text-primary-foreground hover:bg-primary/90",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "ghost": "hover:bg-muted",
        "destructive": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      "status_badges": {
        "success": "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
        "warning": "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20",
        "info": "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border-[hsl(var(--info))]/20"
      },
      "focus": {
        "ring": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      }
    },
    "admin_mode_distinction": [
      "Use a darker top bar (stage/stage-2) + thin saffron underline (border-b border-primary/30) to signal admin context.",
      "Keep content surfaces parchment-like (card/background tokens) so it still feels KaalChakra."
    ]
  },

  "layout_and_grid": {
    "admin_shell": {
      "pattern": "Top bar + left rail (optional on desktop) + main content with Tabs",
      "max_width": "max-w-6xl (content), but allow tables to go full width on large screens when needed",
      "page_padding": "px-4 sm:px-6 lg:px-8 py-6",
      "grid": {
        "overview_cards": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        "analytics": "grid grid-cols-1 lg:grid-cols-3 gap-4 (charts span 2)"
      }
    },
    "mobile_first_rules": [
      "On mobile: Tabs become horizontally scrollable (use ScrollArea) and tables become card-list (optional) or allow horizontal scroll with ScrollArea.",
      "Dialogs/Drawers: prefer Dialog on desktop; Drawer on mobile for long forms (fort editor)."
    ]
  },

  "component_path": {
    "shadcn_primary": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "alert_dialog": "/app/frontend/src/components/ui/alert-dialog.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "label": "/app/frontend/src/components/ui/label.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "sonner": "/app/frontend/src/components/ui/sonner.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "dropdown_menu": "/app/frontend/src/components/ui/dropdown-menu.jsx"
    },
    "recommended_additions_optional": {
      "recharts": "Use for analytics charts (bar distribution).",
      "framer_motion": "Optional for subtle entrance animations in admin cards and dialogs."
    }
  },

  "feature_1_map_detail_cards": {
    "where": "Explore page Leaflet map marker click",
    "interaction": {
      "trigger": "Marker click opens Leaflet Popup with a compact card",
      "primary_action": "View Fort navigates to /forts/:slug (or existing route)",
      "secondary": "Close popup (X) via Leaflet default; also close on View Fort click"
    },
    "popup_card_spec": {
      "size": "w-[260px] sm:w-[300px]",
      "container_classes": "rounded-xl overflow-hidden border border-border bg-card text-card-foreground shadow-lg",
      "image_area": {
        "height": "h-28",
        "classes": "relative w-full h-28 bg-muted",
        "img_classes": "w-full h-full object-cover",
        "overlay": "absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 (ONLY over image; keep small area)"
      },
      "content_area": {
        "classes": "p-3 space-y-2",
        "title": "text-base font-semibold leading-snug",
        "desc": "text-xs text-muted-foreground line-clamp-3",
        "meta_row_optional": "flex items-center gap-2 text-xs text-muted-foreground (region/era badge)"
      },
      "cta_row": {
        "classes": "pt-1 flex items-center gap-2",
        "button": "<Button size=\"sm\" className=\"flex-1\">View Fort</Button>",
        "button_variant": "default (primary)"
      },
      "dark_mode": [
        "Rely on tokens: bg-card/text-card-foreground/border-border.",
        "Ensure Leaflet popup tip + wrapper background is transparent so card edges look clean."
      ],
      "leaflet_css_notes": [
        "Override .leaflet-popup-content-wrapper to remove default padding/background; let the card handle it.",
        "Keep popup close button visible: style to match muted-foreground and hover to foreground."
      ],
      "data_testids": {
        "popup_root": "explore-map-fort-popup",
        "title": "explore-map-fort-popup-title",
        "view_button": "explore-map-fort-popup-view-fort-button"
      }
    },
    "micro_interactions": [
      "Card: subtle lift on mount (optional Framer Motion: y: 6 -> 0, opacity 0 -> 1, duration 0.18).",
      "Button hover: use existing shadcn button hover; add only 'transition-colors'.",
      "Image: no zoom-on-hover inside popup (avoid jitter while map pans)."
    ]
  },

  "feature_2_admin_panel": {
    "routes": {
      "login": "/admin (if not authed) or /admin/login",
      "app": "/admin (dashboard shell)",
      "rule": "Do not link /admin in public nav; allow direct URL entry"
    },
    "admin_login_screen": {
      "layout": {
        "pattern": "Split layout on desktop; single column on mobile",
        "outer": "min-h-[calc(100vh-0px)] grid grid-cols-1 lg:grid-cols-2",
        "left_panel": "hidden lg:flex flex-col justify-between p-10 bg-[hsl(var(--stage))] text-[hsl(var(--brand-ink))]",
        "left_panel_content": [
          "KaalChakra wordmark + small heritage line",
          "Security note: 'Admin access only'",
          "Optional: subtle fort silhouette watermark via opacity-10 background image"
        ],
        "right_panel": "flex items-center justify-center px-4 py-10",
        "card": "w-full max-w-md"
      },
      "form_components": {
        "card": "<Card>",
        "fields": [
          "<Label>Username</Label> + <Input autoComplete=\"username\">",
          "<Label>Password</Label> + <Input type=\"password\" autoComplete=\"current-password\">"
        ],
        "submit": "<Button className=\"w-full\">Sign in</Button>",
        "helper": "Muted text for error messages; use <Alert variant=destructive> for auth failures"
      },
      "data_testids": {
        "username": "admin-login-username-input",
        "password": "admin-login-password-input",
        "submit": "admin-login-submit-button",
        "error": "admin-login-error-message"
      },
      "micro_interactions": [
        "On submit: disable button + show inline spinner (lucide Loader2) with animate-spin.",
        "On error: shake is optional; prefer a calm Alert + focus username field.",
        "Toast on success: sonner 'Signed in' then redirect."
      ]
    },

    "dashboard_shell": {
      "top_bar": {
        "classes": "sticky top-0 z-40 border-b border-primary/25 bg-[hsl(var(--stage))] text-[hsl(var(--brand-ink))]",
        "inner": "h-14 flex items-center justify-between px-4 sm:px-6",
        "left": [
          "Admin badge (Badge variant=secondary) + 'KaalChakra Admin'",
          "Breadcrumb (Breadcrumb component) showing current tab"
        ],
        "right": [
          "Theme toggle (existing app pattern)",
          "User menu (DropdownMenu): 'Sign out'"
        ],
        "data_testids": {
          "root": "admin-topbar",
          "signout": "admin-signout-button"
        }
      },
      "main": {
        "wrapper": "px-4 sm:px-6 lg:px-8 py-6",
        "header_block": "mb-6",
        "title": "<h1 className=\"text-3xl sm:text-4xl\">Admin</h1>",
        "subtitle": "<p className=\"text-sm text-muted-foreground\">Manage forts, quizzes, leaderboard, and analytics.</p>"
      },
      "tabs_nav": {
        "component": "Tabs",
        "tabs": ["Overview", "Forts", "Quizzes", "Leaderboard"],
        "classes": {
          "list": "w-full justify-start gap-2 bg-muted/40 p-1 rounded-xl overflow-x-auto no-scrollbar",
          "trigger": "data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg px-3 py-2 text-sm"
        },
        "data_testids": {
          "tabs": "admin-tabs",
          "overview": "admin-tab-overview",
          "forts": "admin-tab-forts",
          "quizzes": "admin-tab-quizzes",
          "leaderboard": "admin-tab-leaderboard"
        }
      }
    },

    "tables_and_crud": {
      "table_container": "rounded-xl border border-border bg-card overflow-hidden",
      "table_header": "bg-muted/30",
      "row_hover": "hover:bg-muted/30",
      "density": "Use compact padding: TableHead/TableCell add className='py-3 px-4'",
      "actions_pattern": {
        "preferred": "DropdownMenu in last column (MoreHorizontal icon) with Edit/Delete",
        "delete": "AlertDialog confirmation with explicit entity name"
      },
      "empty_state": {
        "component": "Card",
        "copy": "No forts yet. Create your first fort to populate the Explore map.",
        "cta": "Button 'Create Fort'"
      },
      "loading_state": {
        "component": "Skeleton",
        "pattern": "Skeleton rows (8–10) + header skeleton; keep layout stable"
      },
      "error_state": {
        "component": "Alert variant=destructive",
        "pattern": "Show error + 'Retry' button"
      },
      "data_testids": {
        "forts_table": "admin-forts-table",
        "quizzes_table": "admin-quizzes-table",
        "leaderboard_table": "admin-leaderboard-table",
        "row_action_menu": "admin-row-actions-menu",
        "confirm_delete": "admin-confirm-delete-button"
      }
    },

    "forms_and_modals": {
      "fort_editor": {
        "surface": "Dialog (desktop) / Drawer (mobile)",
        "layout": "Two-column form on lg screens; single column on mobile",
        "grid": "grid grid-cols-1 lg:grid-cols-2 gap-4",
        "sections": [
          "Identity: name, native_name, slug",
          "Location: region, lat, lng",
          "Story: hook, description, narration",
          "Quick facts: list editor",
          "Timeline: list editor",
          "Media: image URLs (array), model URL"
        ],
        "field_patterns": [
          "Use Label + Input/Textarea; helper text in text-xs text-muted-foreground.",
          "For arrays (quick facts, timeline, image URLs): use a small repeater UI with 'Add item' button and per-item delete (ghost button).",
          "For lat/lng: use mono input + tabular-nums.",
          "Slug: show inline validation (Badge) for uniqueness/format."
        ],
        "footer": "Sticky footer inside dialog with Cancel (secondary) + Save (primary)",
        "data_testids": {
          "open_create": "admin-forts-create-button",
          "open_edit": "admin-forts-edit-button",
          "save": "admin-fort-editor-save-button",
          "cancel": "admin-fort-editor-cancel-button"
        }
      },
      "quiz_editor": {
        "surface": "Dialog",
        "fields": [
          "Question text (Textarea)",
          "Options (repeater 4) + correct answer Select",
          "Difficulty Select (optional)",
          "Related fort slug Select (optional)"
        ],
        "data_testids": {
          "open_create": "admin-quizzes-create-button",
          "save": "admin-quiz-editor-save-button"
        }
      }
    },

    "leaderboard_manager": {
      "features": [
        "Table view of entries",
        "Clear leaderboard button (destructive) with AlertDialog confirmation",
        "Optional filter by date range using Calendar (shadcn)"
      ],
      "data_testids": {
        "clear_button": "admin-leaderboard-clear-button",
        "clear_confirm": "admin-leaderboard-clear-confirm-button"
      }
    },

    "analytics_overview": {
      "stat_cards": {
        "component": "Card",
        "layout": "CardHeader with title + icon; CardContent with big number",
        "number_style": "text-2xl sm:text-3xl font-semibold tabular-nums",
        "delta_badge": "Badge with success/warning/info styles",
        "data_testids": {
          "fort_count": "admin-analytics-fort-count",
          "quiz_count": "admin-analytics-quiz-count",
          "leaderboard_count": "admin-analytics-leaderboard-count"
        }
      },
      "charts": {
        "library": "Recharts (recommended)",
        "install": "npm i recharts",
        "chart_types": [
          "Bar chart: forts by region",
          "Bar chart: quiz questions by difficulty (if available)"
        ],
        "chart_card": "Card with muted header; chart area p-4",
        "colors": "Use CSS vars: fill='hsl(var(--chart-1))' etc",
        "accessibility": "Provide aria-label on chart container + table fallback for screen readers"
      }
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Prefer short, calm motions: 120–200ms for hover/focus; 180–240ms for dialog entrance.",
      "Use transition-colors, transition-shadow; avoid transition-all.",
      "Respect prefers-reduced-motion (already enforced globally)."
    ],
    "recommended_patterns": {
      "buttons": "hover:shadow-sm active:scale-[0.98] (only on primary CTAs)",
      "cards": "hover:shadow-md hover:-translate-y-[1px] (only on clickable cards; not on tables)",
      "tab_switch": "No sliding indicator; rely on active background + subtle shadow"
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast: rely on existing tokens; do not place gold text on parchment without sufficient contrast.",
      "All dialogs must trap focus (shadcn Dialog does).",
      "All icon-only buttons must have sr-only labels.",
      "Tables: ensure header cells use <TableHead> and row actions are keyboard reachable.",
      "Map popup: ensure 'View Fort' is a real button/link and focusable."
    ],
    "focus_styles": "Use focus-visible ring tokens; never remove outline without replacement."
  },

  "images": {
    "image_urls": [
      {
        "category": "map-popup-fort-photo",
        "description": "Use existing fort image URL from backend; fallback to a neutral parchment placeholder if missing.",
        "urls": []
      },
      {
        "category": "admin-login-watermark-optional",
        "description": "Optional subtle SVG silhouette (local asset recommended). Avoid external stock unless needed.",
        "urls": []
      }
    ]
  },

  "instructions_to_main_agent": [
    "Do not change :root tokens in index.css; reuse existing variables.",
    "Implement Leaflet popup card by rendering a shadcn Card-like markup inside Popup; override Leaflet popup wrapper styles to be transparent.",
    "Admin: create a dedicated layout component (AdminShell) with top bar + Tabs; keep /admin hidden from public nav.",
    "Use Dialog for create/edit; for long Fort form use Drawer on mobile (match shadcn patterns).",
    "All buttons/inputs/menus/tables/errors must include data-testid.",
    "Use Sonner for toasts (success/error).",
    "If adding charts, use Recharts with CSS var colors (chart-1..5)."
  ]
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
