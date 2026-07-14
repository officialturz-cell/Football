# Docs — Football Analyst AI

This folder contains product, architecture, and implementation guidance. Read these before implementing new features.

Principles
- Single-user, not a betting product.
- Keep business logic out of React components; use services, providers, and lib layers.
- Use TypeScript strict mode; avoid `any`.
- Use the App Router and server components for data fetching where appropriate.
- Preserve separation of concerns: providers, normalizers, prompt builders, analysis logic.

Project layout (high level)
- app/ — Next.js routes and server components
- components/ — small, reusable UI components
- hooks/ — client hooks
- providers/ — provider adapters for football data and AI (empty for now)
- services/ — domain services using providers
- types/ — TypeScript contracts and DTOs
- utils/ — small predictable helpers
- lib/ — constants and shared utilities
- docs/ — this docs folder

Feature Implementation Guidance
- When adding new features, add tests and keep files small and focused.
- Add loading, empty, and error states for every screen.
- Do NOT add authentication, payments, or multi-user features.
- Avoid storing persistent state in the UI. Introduce a simple persistence layer later if requested.

AI & Analysis
- The "Calculcate Football Analysis" button in the UI is a placeholder. The analysis flow must be implemented as a service that accepts normalized match data and returns an AnalysisResult.
- Keep prompt builders and AI providers isolated under providers/ai so they can be swapped.

Styling
- Tailwind is the design system. Keep the look dark and minimal.


