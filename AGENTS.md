<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 NetRise Frontend — Agent Instructions & Architectural Guidelines

Any AI agent, assistant, or developer working on this codebase **MUST strictly adhere** to the following rules, standards, and conventions. Do not violate these instructions without explicit permission from the user.

---

## 1. 🛠️ Tech Stack & Language Constraints

- **Language**: **JavaScript (ES6+) ONLY**.
  - Do NOT create `.ts` or `.tsx` files. Use `.js` or `.jsx`.
- **Framework**: **Next.js 16+ (App Router, Turbopack)**.
- **Styling**: **Tailwind CSS v4**.
  - Always use `cn(...)` from `@/lib/utils` to merge dynamic Tailwind classes safely.
- **State Management**: **Zustand**.
  - Do NOT introduce Redux, MobX, Recoil, or React Context for global state unless explicitly requested.
- **Icons**: **`lucide-react`**.
- **Path Aliases**: Always use `@/*` configured in `jsconfig.json` (`@/components`, `@/store`, `@/hooks`, `@/lib`, `@/services`). Never use brittle relative paths like `../../../../`.

---

## 2. 📁 Folder Structure & File Placement Rules

Maintain strict modularity. Every file belongs to its dedicated location:

```text
src/
├── app/                  # Next.js App Router only (pages, layouts, route handlers)
│   ├── (auth)/           # Route group for auth (e.g. login, register)
│   ├── (dashboard)/      # Route group for dashboard/internal features
│   ├── api/              # Route Handlers (route.js)
│   ├── globals.css       # Tailwind entry and CSS variables
│   ├── layout.js         # Root layout (Navbar, Footer, meta)
│   ├── page.js           # Home page
│   ├── error.js          # Error boundary ("use client")
│   ├── loading.js        # Global loading fallback
│   └── not-found.js      # Custom 404 page
│
├── components/           # Reusable UI & Layout Components
│   ├── common/           # Generic primitives (Button, Card, Input, Modal, Badge, Skeleton, ActionMenu)
│   │   └── table/        # Unified Data Table Ecosystem (DataTable, Table, TablePagination, etc.)
│   ├── layout/           # Structural layout pieces (Navbar, Footer, Sidebar)
│   └── modules/          # Domain/page-specific feature sections (e.g. modules/home/, modules/auth/)
│
├── store/                # Zustand global stores
│   ├── useAppStore.js    # UI state (theme, sidebar, toasts)
│   ├── useAuthStore.js   # Auth state (user, token, session)
│   └── index.js          # Barrel export
│
├── hooks/                # Custom React hooks
│   ├── useDataTable.js   # High-performance search, sort, pagination & selection hook
│   ├── useLocalStorage.js# Safe client-side storage
│   ├── useMediaQuery.js  # Screen size detector (using useSyncExternalStore)
│   └── useDebounce.js    # Input debounce
│
├── lib/                  # Utilities & Constants
│   ├── utils.js          # cn (clsx + tailwind-merge), formatDate, truncate
│   └── constants.js      # SITE_CONFIG, NAV_LINKS, static constants
│
└── services/             # API clients & network services
    └── api.js            # Unified fetch wrapper (GET, POST, PUT, DELETE)
```

---

## 3. 📊 Universal Table System Standard (MANDATORY)

Every table across the entire application **MUST HAVE THE EXACT SAME DESIGN AND PERFORMANCE STANDARD**:

1. **Always use `DataTable` from `@/components/common/table`**:
   - Never build one-off `<table>` tables from scratch with inconsistent styles.
   - Use the standard `columns` definition array: `[{ key, header, sortable, render, align, width }]`.
2. **Fast Data Loading & Zero CLS (Cumulative Layout Shift)**:
   - Always connect the `isLoading` prop to display `TableSkeleton` during data fetching.
   - Never leave empty table areas or jarring blank screens during loading.
3. **Use the `useDataTable` Hook**:
   - For client-side data, always use `useDataTable({ data, searchKeys, initialPageSize, initialSortKey })` from `@/hooks/useDataTable`.
   - It provides memoized, ultra-fast sorting, multi-key search, pagination, and row selection without re-render performance drops.
4. **Standard Sub-components**:
   - Use `Badge` from `@/components/common/Badge` for status fields (`success`, `warning`, `error`, `info`).
   - Use `ActionMenu` from `@/components/common/ActionMenu` for row actions (View, Edit, Delete).
   - Use `formatDate()` from `@/lib/utils` for consistent date formatting.

---

## 4. 🧠 Zustand State Management Rules

- Store files must be named `use<Name>Store.js` and placed inside `src/store/`.
- Export both named exports and update `src/store/index.js`.
- Always select specific slice states in components to prevent unnecessary re-renders:
  ```javascript
  // ✅ Correct
  const user = useAuthStore((state) => state.user);
  
  // ❌ Avoid destructuring the entire store unless necessary
  const { user, token, ...everything } = useAuthStore();
  ```
- Any asynchronous API actions should update `isLoading: true` before fetching and reset it in `finally`.

---

## 5. ⚡ Next.js & React 19 Strict Rules

1. **"use client" Directive**:
   - Only add `"use client"` at the top of files that use React hooks (`useState`, `useEffect`, `useMemo`), Zustand hooks, or browser event listeners.
   - Server Components are the default. Keep data fetching on the server where appropriate.
2. **React 19 ESLint Compliance**:
   - **Never call `setState()` synchronously inside `useEffect()`**.
   - For subscribing to browser events/APIs (like `matchMedia`), always use `useSyncExternalStore`.
3. **Prerender Stability**:
   - Avoid calling non-deterministic APIs (like raw `new Date()` or `Math.random()`) during static Server Component rendering if it causes prerender bailouts.
4. **Error Handling**:
   - API endpoints (`route.js`) must return structured JSON errors with correct HTTP status codes (`NextResponse.json({ error }, { status })`).
   - UI pages should have corresponding `error.js` and `loading.js` where appropriate.

---

## 6. ✅ Verification Checklist Before Finishing Any Task

Before completing any task, the agent MUST run:
1. `npm run lint` — Must exit with 0 errors and 0 warnings.
2. `npm run build` — Must successfully compile and build all routes with Next.js Turbopack.
