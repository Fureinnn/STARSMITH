# QuestMaster - Gamified TODO Application

## Overview

QuestMaster is a gamified task management application that transforms everyday productivity into an RPG-like experience. Users can create and manage different types of tasks (habits, dailies, and todos) while earning XP, gold, levels, and achievements. The application features a comprehensive achievement system, player progression mechanics, and streak tracking to encourage consistent task completion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript
- **Tab-based Navigation**: Users can switch between different task categories (habits, dailies, todos)
- **Component-based Structure**: Modular JavaScript classes handle different aspects of the application
- **Local Storage Persistence**: All data is stored client-side using browser localStorage
- **Responsive Design**: CSS Grid and Flexbox layout with mobile-first approach

### Core Application Components
- **QuestMasterApp Class**: Main application controller that manages state and coordinates between components
- **Achievement System**: Separate achievement manager that tracks progress and unlocks rewards based on user activity
- **Player Progression**: Level-based system with XP requirements, gold rewards, and streak tracking
- **Task Management**: Three distinct task types with different behaviors and reward structures

### Data Management
- **Client-side Storage**: Uses localStorage for all persistence needs
- **Data Structure**: JSON-based data storage for player stats, tasks, and achievement progress
- **State Management**: Centralized state management through the main app class
- **Data Validation**: Task validation and daily reset mechanisms

### Gamification Features
- **Experience Points (XP)**: Tasks reward XP based on difficulty and type
- **Level System**: Progressive leveling with increasing XP requirements
- **Achievement System**: Milestone-based achievements with different unlock conditions
- **Streak Tracking**: Daily activity streaks with automatic reset detection
- **Currency System**: Gold rewards for task completion

### UI/UX Design Patterns
- **CSS Custom Properties**: Consistent design system using CSS variables
- **Animation System**: Smooth transitions and feedback animations
- **Icon Integration**: Font Awesome icons for visual enhancement
- **Color-coded Categories**: Different visual themes for task types and difficulty levels

## External Dependencies

### CDN-hosted Libraries
- **Font Awesome 6.4.0**: Icon library for UI elements and visual feedback
- **Google Fonts**: Poppins and Inter font families for typography
- **No Backend Dependencies**: Completely client-side application

### Browser APIs
- **localStorage**: Primary data persistence mechanism
- **Date API**: For streak tracking and daily reset functionality
- **DOM API**: For dynamic content manipulation and user interactions

### Development Dependencies
- **Standard Web Technologies**: HTML5, CSS3, ES6+ JavaScript
- **No Build Process**: Direct browser execution without compilation or bundling
- **No Framework Dependencies**: Pure vanilla JavaScript implementation