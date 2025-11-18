# Overview

This is a comprehensive medicine supply chain management platform that connects consumers, retailers, and wholesalers in a unified ecosystem. The platform provides real-time inventory tracking, medicine search capabilities, order management, and role-based dashboards for different types of users in the pharmaceutical supply chain.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, utilizing a component-based architecture. The UI framework leverages shadcn/ui components for a consistent design system with Tailwind CSS for styling. The application uses Wouter for client-side routing and TanStack Query for efficient data fetching and state management. The component structure follows a modular approach with reusable UI components, page components, and specialized dashboard components for different user roles.

## Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. The server implements a layered structure with route handlers, storage abstraction layer, and middleware for request logging and error handling. The API provides endpoints for managing categories, medicines, stores, inventory, orders, and reorder requests. The storage layer is abstracted through an interface pattern, making it database-agnostic and easily testable.

## Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema supports a multi-tenant architecture with three main user roles (consumer, retailer, wholesaler) and includes tables for medicines, categories, stores, inventory, orders, and reorder requests. The database design enables real-time inventory tracking across multiple stores and supports complex supply chain relationships.

## State Management
Client-side state is managed through TanStack Query for server state and React's built-in state management for local UI state. The query client is configured with sensible defaults for caching and error handling. Form state is handled using React Hook Form with Zod schema validation for type safety.

## Authentication & Authorization
The application implements role-based access control with three distinct user roles: consumer, retailer, and wholesaler. Each role has specific permissions and access to different dashboard views and functionalities. The system is designed to support session-based authentication with proper security measures.

## Development Tooling
The project uses Vite for fast development builds and hot module replacement. TypeScript is configured for strict type checking across the entire codebase. The build process includes separate compilation for client and server code, with esbuild handling the server bundle for production.

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Design
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI

## State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for type safety

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment tools and error handling