# AI Rules for Dyad AI Editor

This document outlines the core technologies used in this project and provides guidelines for using specific libraries and frameworks. Adhering to these rules ensures consistency, maintainability, and optimal performance of the application.

## Tech Stack Overview

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and developer experience.
*   **Vite**: A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.
*   **React Router**: A standard library for routing in React applications.
*   **Supabase**: An open-source Firebase alternative for database, authentication, and storage.
*   **React Query (TanStack Query)**: A powerful library for fetching, caching, synchronizing, and updating server state in React.
*   **Lucide React**: A collection of beautiful and consistent open-source icons.
*   **React Hook Form & Zod**: Libraries for efficient form management and schema-based validation.

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please follow these rules when implementing features:

*   **UI Components**:
    *   **Always** use `shadcn/ui` components for all user interface elements.
    *   If a required component is not available in `shadcn/ui`, create a new, small, and focused component in `src/components/` using Tailwind CSS and Radix UI primitives (if applicable). **Do not modify existing `shadcn/ui` component files.**
*   **Styling**:
    *   **Exclusively** use Tailwind CSS for all styling. Avoid inline styles or other CSS frameworks.
    *   Ensure designs are responsive using Tailwind's utility classes.
*   **Routing**:
    *   Use `react-router-dom` for all client-side navigation.
    *   Keep the main application routes defined within `src/App.tsx`.
*   **State Management (Server-side)**:
    *   For fetching, caching, and updating server data (e.g., from Supabase), use `@tanstack/react-query`.
*   **Authentication & Database**:
    *   All authentication and database interactions must be handled using the `@supabase/supabase-js` client, imported from `src/integrations/supabase/client.ts`.
*   **Icons**:
    *   Use icons from the `lucide-react` library.
*   **Forms & Validation**:
    *   Implement forms using `react-hook-form` for state management.
    *   Use `zod` for defining form schemas and validation rules.
*   **Date Handling**:
    *   For date selection, use `react-day-picker`.
    *   For date formatting, use `date-fns`.
*   **Notifications**:
    *   Use `sonner` for general, non-blocking toast notifications.
    *   For more interactive or specific UI toasts, use the custom `useToast` hook (which leverages `@radix-ui/react-toast`).
*   **Carousels**:
    *   Use `embla-carousel-react` for implementing carousels.
*   **PDF Viewing**:
    *   Use `react-pdf` for displaying PDF documents within the application.
*   **Utility Functions**:
    *   Use `clsx` and `tailwind-merge` (via the `cn` utility in `src/lib/utils.ts`) for conditionally applying and merging Tailwind CSS classes.