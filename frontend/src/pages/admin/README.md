# CarvoHub Admin Module - Second-Hand Car Sales

This module provides a comprehensive admin interface for managing second-hand car listings, sellers, and reports.

## Features

### 1. Dashboard Overview
- Key metrics and statistics for all services
- Visual charts for:
  - Car listing status distribution
  - Monthly listing trends
- Quick access to add new car listings

### 2. Car Listings Management
- View all car listings in a searchable data grid
- Filter by brand, year, price range, and status
- Approve or reject pending listings
- Delete listings
- View detailed car information

### 3. Seller Management
- View all registered sellers
- Block/unblock sellers
- View seller details and statistics

### 4. Add New Cars
- Form to manually add new car listings
- Image upload functionality
- Complete car specification fields

## Routes

- `/admin/dashboard` - Admin dashboard with overview statistics
- `/admin/cars` - Car listings management
- `/admin/cars/:id` - Detailed view of a specific car
- `/admin/cars/add` - Add new car listing form
- `/admin/sellers` - Seller management
- `/admin/interested-cars` - Interested cars management

## Authentication

- Protected routes requiring admin JWT token
- Login at `/admin/login`
- Token stored in localStorage

## Components

### Pages
- `AdminDashboard.jsx` - Main dashboard with statistics and add car functionality
- `CarListings.jsx` - Manage all car listings
- `CarDetails.jsx` - Detailed view of a specific car
- `AddCar.jsx` - Form to add new car listings
- `Sellers.jsx` - Manage sellers
- `AdminInterestedList.jsx` - Manage interested car listings
- `AdminInterestedUsers.jsx` - View users interested in specific cars

### Layout Components
- `AdminLayout.jsx` - Main layout with navbar and sidebar
- `Navbar.jsx` - Top navigation bar
- `Sidebar.jsx` - Collapsible sidebar navigation
- `Footer.jsx` - Footer with company information