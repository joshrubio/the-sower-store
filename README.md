
# 🛍️ The Sower - Ecommerce Platform

A production-ready, full-stack ecommerce platform built with modern web technologies. This project demonstrates advanced patterns in e-commerce development, including inventory management, payment processing, and order lifecycle management.

## 📋 Table of Contents

- [🏗️ Architecture Overview](#-architecture-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [✨ Key Features](#-key-features)
- [🔧 System Design](#-system-design)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔒 Security Features](#-security-features)
- [📊 API Endpoints](#-api-endpoints)

## 🏗️ Architecture Overview

This is a **Next.js 15** application using the **App Router** with a hybrid architecture combining:

- **Server Components** for data fetching and SEO optimization
- **Client Components** for interactive features (cart, forms)
- **API Routes** for backend logic and external integrations
- **Database-first approach** with MongoDB for data persistence

### Core Principles

- **Type Safety**: Full TypeScript implementation with strict typing
- **Atomic Operations**: Database transactions to prevent race conditions
- **Error Boundaries**: Comprehensive error handling and graceful degradation
- **Security First**: Input validation, authentication, and secure defaults

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library
- **Zustand** - Lightweight state management

### Backend & Infrastructure
- **Next.js API Routes** - Serverless backend functions
- **MongoDB** - NoSQL database with Mongoose ODM
- **Stripe** - Payment processing and product management
- **Clerk** - Authentication and user management
- **Resend** - Email delivery service

### Development & Quality
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control with conventional commits

## ✨ Key Features

### 🛒 E-commerce Core
- **Product Catalog**: Dynamic product display with Stripe integration
- **Shopping Cart**: Real-time cart management with Zustand
- **Checkout Flow**: Secure Stripe-powered payment processing
- **Order Management**: Complete order lifecycle tracking

### 📦 Inventory Management
- **Real-time Stock Tracking**: Atomic inventory operations
- **Stock Validation**: Prevents overselling with race condition protection
- **Admin Dashboard**: Comprehensive inventory management interface
- **Automatic Rollback**: Stock restoration on order cancellations

### 🔐 Security & Authentication
- **Clerk Integration**: Secure user authentication
- **API Protection**: Authenticated endpoints for sensitive operations
- **Input Validation**: Comprehensive data sanitization
- **Environment Security**: Runtime environment variable validation

### 📧 Communication
- **Order Confirmations**: Automated emails to customers and admins
- **Email Templates**: React-based email components with Resend
- **Order Notifications**: Real-time order status updates

## 🔧 System Design

### Inventory Management System

The inventory system uses atomic MongoDB operations to prevent race conditions:

```typescript
// Atomic stock reduction with validation
await Inventory.updateOne(
  {
    productId,
    "variants.size": size,
    "variants.color": color,
    "variants.stock": { $gte: quantity } // Prevents negative stock
  },
  {
    $inc: { "variants.$.stock": -quantity } // Atomic decrement
  }
);
```

### Order Processing Flow

1. **Pre-checkout Validation**: Stock verification before Stripe session creation
2. **Payment Processing**: Secure Stripe checkout with webhook confirmation
3. **Inventory Reduction**: Atomic stock decrement on successful payment
4. **Email Notifications**: Automated confirmations to customer and admin
5. **Error Recovery**: Rollback mechanisms for failed operations

### State Management Architecture

- **Server State**: API routes handle data mutations
- **Client State**: Zustand manages cart and UI state
- **Persistent State**: MongoDB stores orders and inventory
- **External State**: Stripe manages products and payments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Stripe account
- Clerk account
- Resend account

### Installation

```bash
# Clone the repository
git clone https://github.com/joshrubio/the-sower-store.git
cd the-sower-store

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Environment Setup

```env
# Database
MONGODB_URI=mongodb+srv://...

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Email Service
RESEND_API_KEY=re_...

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=your-admin@email.com
```

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── inventory/            # Stock management
│   │   ├── orders/               # Order operations
│   │   ├── send-order/           # Email notifications
│   │   └── webhook/stripe/       # Payment webhooks
│   ├── admin/                    # Admin dashboard
│   ├── checkout/                 # Checkout flow
│   ├── products/                 # Product pages
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # Shadcn components
│   ├── product-card.tsx         # Product display
│   ├── product-detail.tsx       # Product page
│   └── navbar.tsx               # Navigation
├── lib/                          # Utility libraries
│   ├── stripe.ts                # Stripe configuration
│   ├── mongodb.ts               # Database connection
│   └── utils.ts                 # Helper functions
├── models/                       # Mongoose schemas
│   ├── Order.ts                 # Order model
│   └── Inventory.ts             # Inventory model
├── store/                        # State management
│   └── cart-store.ts            # Cart state
└── emails/                       # Email templates
    └── order-confirmation.tsx   # Order confirmation
```

## 🔒 Security Features

### Authentication & Authorization
- **Clerk-powered authentication** for admin operations
- **API route protection** with user verification
- **Role-based access control** for sensitive endpoints

### Data Validation
- **Runtime environment validation** prevents startup with invalid config
- **Input sanitization** on all API endpoints
- **Type-safe database operations** with Mongoose schemas

### Payment Security
- **Stripe webhook verification** ensures payment authenticity
- **Secure session handling** with proper error responses
- **PCI compliance** through Stripe's secure infrastructure

## 📊 API Endpoints

### Inventory Management
```
GET  /api/inventory          # Get all inventory
POST /api/inventory/check    # Check stock availability
POST /api/inventory/reduce   # Reduce stock (authenticated)
POST /api/inventory/rollback # Rollback stock (authenticated)
```

### Order Management
```
GET  /api/orders             # Get all orders
GET  /api/orders/[id]        # Get specific order
PATCH /api/orders/[id]       # Update order status
```

### Email & Notifications
```
POST /api/send-order         # Send order confirmation
```

### Payment Processing
```
POST /api/webhook/stripe     # Stripe webhook handler
```

## 🤝 Contributing

This project follows modern development practices:

- **Conventional Commits** for clear git history
- **ESLint** for code quality
- **TypeScript** for type safety
- **Atomic commits** for maintainable history

## 📄 License

This project is built for educational and demonstration purposes, showcasing modern full-stack development patterns and best practices in e-commerce applications.

## 👌 Quick Start

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

### Cloning the Repository

Run the following commands in your terminal:

```bash
git clone https://github.com/yourusername/your-ecommerce-repo.git
cd your-ecommerce-repo
npm install
npm run dev
```
