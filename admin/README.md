
# Servpe Admin Panel

A standalone admin dashboard for the Servpe platform, running independently on port 5000.

## Features

- **Dashboard Overview**: Platform statistics and quick actions
- **Category Management**: Create, edit, and manage service categories and subcategories
- **User Management**: Monitor and manage all platform users (clients, freelancers, admins)
- **Service Management**: Review and moderate freelancer services
- **Order Management**: Monitor all platform orders and transactions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the admin folder:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run preview` - Preview production build on port 5000
- `npm run lint` - Run ESLint

## Architecture

This is a standalone React application built with:

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing

## API Integration

The admin panel connects to the main backend API at `http://localhost:5000/api` for:

- Fetching platform statistics
- Managing categories and subcategories
- User management operations
- Service moderation
- Order monitoring

## Authentication

Currently, the admin panel runs without authentication for direct access. In production, you should implement proper admin authentication.

## Development

The admin panel is completely independent from the main application and can be developed, built, and deployed separately.

## License

This project is part of the Servpe platform.
