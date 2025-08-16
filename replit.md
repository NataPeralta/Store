# Replit.md

## Overview

This is a full-stack e-commerce web application built with a modern tech stack. The frontend is hosted on Replit and connects to a backend API hosted on Hostinger. The application allows users to browse products, add them to a shopping cart, and place orders with cash-on-delivery payment. Products and orders are stored in a MySQL database on Hostinger. The frontend is built with React and styled using Tailwind CSS with shadcn/ui components, while the backend uses Express.js with Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: React Context API for cart management and TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Data Sources**: Google Sheets API integration for product catalog management
- **Storage Pattern**: In-memory caching with database persistence for orders

### Data Storage Solutions
- **Primary Database**: MySQL hosted on Hostinger for storing products and orders
- **External Data Source**: Google Sheets integration available for product catalog management (optional)
- **ORM**: Drizzle ORM provides type-safe database operations with MySQL dialect
- **Architecture**: Frontend on Replit connects to backend API on Hostinger via CORS requests

### API Design
- **Architecture**: RESTful API with clear endpoint structure
- **Endpoints**:
  - `GET /api/products` - Retrieve product catalog
  - `POST /api/products/refresh` - Force refresh from Google Sheets
  - `POST /api/orders` - Create new orders
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Component Composition**: Modular UI components with shadcn/ui patterns
- **Data Fetching**: TanStack Query for efficient server state management with caching
- **Form Management**: Declarative form handling with validation

## External Dependencies

### Database Services
- **Hostinger MySQL**: MySQL database hosting service
- **Drizzle ORM**: Type-safe database toolkit with MySQL adapter
- **Connection**: Direct MySQL connection configured for Hostinger credentials

### Google Services Integration
- **Google Sheets API**: Product catalog management requiring:
  - `GOOGLE_CLIENT_EMAIL` - Service account email
  - `GOOGLE_PRIVATE_KEY` - Service account private key
  - `GOOGLE_SHEETS_ID` - Target spreadsheet identifier

### UI and Styling Libraries
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error reporting