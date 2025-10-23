# CarvoHub Dashboard Components

This directory contains modern, professional React components for the CarvoHub Customer Dashboard using React, Material UI (MUI v5+), and Framer Motion.

## Components

### 1. Sidebar.jsx
- Fixed sidebar with rounded edges and shadow
- Icons with labels for all dashboard sections
- Active item highlighting with blue gradient bar
- Hover animations with shift effect
- Responsive design that collapses to icons only on smaller screens

### 2. Header.jsx
- Top header bar with app name and logo
- Profile avatar, notification bell, and logout icon
- Sticky positioning with shadow and #1E3A8A background
- Responsive design for mobile views

### 3. ServiceCard.jsx
- Animated service cards with hover effects
- Each card includes an icon and "Explore" button
- Lift effect on hover with glow
- Consistent styling with the overall dashboard theme

### 4. Dashboard.jsx
- Complete dashboard layout component
- Combines all other components into a cohesive interface
- Smooth animations and transitions using Framer Motion
- Responsive grid layout for all screen sizes

## Features

- **Modern Design**: Clean, minimal, and professional interface
- **Animations**: Smooth transitions and hover effects using Framer Motion
- **Responsive**: Fully responsive layout for all device sizes
- **Consistent Styling**: Uses the CarvoHub color palette (#1E3A8A, #3B82F6, #FACC15)
- **Reusable Components**: Each component can be used independently

## Color Palette

| Element    | Color     |
|------------|-----------|
| Primary    | #1E3A8A   |
| Secondary  | #3B82F6   |
| Accent     | #FACC15   |
| Background | #F9FAFB   |
| Card       | #FFFFFF   |

## Usage

```jsx
import { Dashboard, Sidebar, Header, ServiceCard } from './components/carvohub-dashboard';

// Use individual components
<Sidebar user={user} onLogout={handleLogout} />

// Or use the complete dashboard
<Dashboard user={user} onLogout={handleLogout} />
```