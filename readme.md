# TukTuk - Task Deconstruction and Focus Engine

TukTuk is a productivity web application designed to simplify complex goals into actionable micro-tasks. Built with a responsive shell architecture, it provides a seamless transition between laptop and mobile interfaces, featuring customized aesthetic workspaces and advanced dark mode capabilities.

## Core Features

### 1. Goal Deconstruction Engine
* **Atomic Task Breakdown:** Converts ambitious high-level objectives into sequential, discrete micro-actions.
* **Granular Time Allocations:** Assigns optimal estimated execution intervals to individual action steps.
* **Progress Calibration:** Tracks completion metrics dynamically with an integrated master progress visualization.

### 2. Layout Architecture
* **Symmetric Containment:** Employs precise geometric alignments to ensure uniform margins and center-balanced reading zones on large viewports.
* **Persistent Sidebar Interface:** Includes a structured side navigation utility featuring strict element-to-icon aspect boundaries.
* **Mobile Viewport Optimization:** Automatically shifts into an overlay layout on small screens to eliminate textual overlap and crowding.

### 3. Workspace Themes
* **Masculine Palette:** Structured around high-contrast cool slates and desaturated dark undertones.
* **Feminine Palette:** Styled with muted rose tones and deep berry accents.
* **Adaptive Contrast Matrix:** Full integration with independent dark and light operating profiles.

## Technical Architecture

The application is engineered strictly around a modular vanilla web environment:

* **Markup Layer (`index.html`):** Establishes the primary layout container and responsive viewports.
* **Styling Matrix (`style.css`):** Controls fluid responsiveness, precise spatial padding, and runtime variable transitions across themes.
* **Theme Management Engine (`JS/theme.js`):** Intercepts selections, synchronizes configuration states, and manages configurations locally.
* **Core Operations Engine (`JS/app.js`):** Drives asynchronous component loading, view transformations, state storage, and custom timer interactions.

## Deployment and Setup

1. Clone or download the project repository into your local workspace.
2. Ensure the following file structure is preserved:
   ```text
   ├── index.html
   ├── style.css
   ├── JS/
   │   ├── app.js
   │   └── theme.js
   ├── components/
   │   ├── header.html
   │   └── sidebar.html
   └── views/
       ├── dashboard.html
       ├── tasks.html
       ├── analytics.html
       ├── history.html
       ├── profile.html
       └── settings.html
