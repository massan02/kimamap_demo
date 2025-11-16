<!-- Sync Impact Report: Constitution v1.0.0
Version: 0.0.0 → 1.0.0 (MINOR: Initial constitution creation with project principles)
Added Principles:
  1. Clean Foundation - Minimal-first, phased development approach
  2. Strict Type Safety - TypeScript strict mode, minimal 'any' usage
  3. Simplicity First - YAGNI principle, avoid over-abstraction
  4. Latest Stable Stack - Test-proven stable versions
  5. Testing & Quality - TDD approach, comprehensive test coverage
Added Sections:
  - Development Practices (platform conventions, naming, patterns)
  - Code Quality Standards (TypeScript, React Native, Express guidelines)
  - Governance (amendment procedure, versioning, compliance)
Templates Updated: ✅ spec-template.md, plan-template.md, tasks-template.md
Follow-up: None (all placeholders resolved)
-->

# Kimamap（気ままっぷ）Constitution

## Core Principles

### I. Clean Foundation
Start minimal and expand phase by phase. Kimamap development follows a strict phased approach where each phase builds a complete, testable feature set.

**Non-negotiable rules:**
- Phase 1 establishes project foundation (Expo, Navigation, Authentication)
- Each Phase MUST include end-to-end testing and manual QA
- New features only added when previous phase is stable and documented
- No premature optimization or over-engineering for future scenarios
- Rationale: Prevents scope creep, ensures early feedback, maintains code quality as project grows

### II. Strict Type Safety
All TypeScript code MUST use `strict: true` mode. Type safety is non-negotiable and enforced at build time.

**Non-negotiable rules:**
- `any` type usage is prohibited except in exceptional cases with explicit justification
- All async operations MUST have proper return types
- Props and return values MUST be fully typed
- Use type aliases (not interfaces) for consistency across the project
- Rationale: Prevents runtime errors, improves refactoring safety, enables IDE tooling benefits

### III. Simplicity First
Avoid over-abstraction. Follow YAGNI principle: only build what is needed now, not what might be needed later.

**Non-negotiable rules:**
- No architectural patterns beyond what immediate problem requires
- Prefer straightforward component logic over complex state management until actually needed
- No custom utilities without clear, repeated use case
- Code review focuses on simplicity: if feature can be implemented simpler, it MUST be simplified
- Rationale: Reduces maintenance burden, speeds up initial development, makes codebase more understandable

### IV. Latest Stable Stack
Use thoroughly tested, stable versions of dependencies (as of January 2025).

**Non-negotiable rules:**
- React Native 0.81.x (not rc, not experimental)
- Expo SDK 54.0.x (not beta versions)
- Express 5.1.0 (LTS support, explicit error handling)
- TypeScript 5.9.x with `node20` target
- Supabase JS Client 2.81.x (no pre-release versions)
- Never use experimental features for core functionality
- Rationale: Ensures stability, long-term support, documented ecosystem, reduces surprise breaking changes

### V. Testing & Quality
Quality is built in through continuous testing. All features require test coverage before merge.

**Non-negotiable rules:**
- TDD approach: write tests or specs before implementation
- Unit tests for business logic (AI planning algorithm, data transformations)
- Integration tests for API endpoints and cross-component flows
- Manual QA before each phase completion
- Code review verifies test coverage (minimum 80% for critical paths)
- Rationale: Catches bugs early, documents expected behavior, enables safe refactoring

## Development Practices

### TypeScript Conventions
- Configuration: `strict: true` enforced
- Files: Utility functions are camelCase (e.g., `formatDate.ts`), classes/types are PascalCase
- All async functions explicitly return `Promise<Type>`
- Use type alias pattern: `type MyType = {...}` preferred over `interface`

### React Native Standards
- Functional components with Hooks (no class components)
- Styling: `StyleSheet.create()` for all style definitions
- Platform branching: Use `Platform.OS` for platform-specific code
- Single Responsibility: Each component handles one feature/concern
- Props: Interface/type for all component props

### Express 5 Standards
- Leverage async/await automatic error handling (errors passed to `next()`)
- No try/catch required for route handlers
- All endpoints return JSON with consistent error shape
- Request validation with Zod schemas before business logic
- Type-safe route definitions

### Naming Conventions
- **Components**: PascalCase (e.g., `MapScreen.tsx`, `LocationMarker.tsx`)
- **Utilities/Services**: camelCase (e.g., `formatDate.ts`, `fetchSpots.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **React files**: Always use `.tsx` for components, `.ts` for utilities

## Code Quality Standards

### TypeScript Rules
- No `any` type without documented exception
- All DOM/React type imports explicit
- Discriminated unions for complex state
- `readonly` for immutable data structures
- Exhaustiveness checking for enums/union types

### React Native Rules
- Functional components and Hooks mandatory
- Minimize re-renders with proper dependency arrays
- Use `React.memo()` for expensive components
- StyleSheet usage prevents dynamic style injection attacks
- Platform-specific code isolated and tested on both platforms

### Express Rules
- Every endpoint validates input with Zod
- Error response format: `{ error: string, code: string, details?: unknown }`
- TypeScript enables inline API documentation
- No synchronous file operations in route handlers
- CORS explicitly configured

## Governance

### Amendment Procedure
Constitution changes require explicit reasoning and version bump:
- **MAJOR (X.0.0)**: Removes principle or changes existing principle fundamentally
- **MINOR (X.Y.0)**: Adds new principle or substantially expands guidance
- **PATCH (X.Y.Z)**: Clarifications, wording fixes, non-semantic refinements

All amendments MUST be documented in this file with rationale before implementation begins.

### Compliance & Review
- Every PR verifies alignment with Core Principles I-V
- Code review explicitly checks compliance with applicable standards
- Phase completion gates include constitution compliance verification
- Technical decisions outside this constitution require team discussion and explicit approval

### Versioning Policy
- Version format: MAJOR.MINOR.PATCH
- Constitution version increments with changes
- Previous versions archived in `.specify/memory/constitution-history/`
- Runtime guidance in `CLAUDE.md` and `PRIORITY.md` must align with constitution

**Version**: 1.0.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
