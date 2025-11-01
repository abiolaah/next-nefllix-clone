# Netflix Clone - Project Structure

```
netflix-clone/
├── .github/
│   └── workflows/
│       └── jest-tests.yml              # CI/CD workflow for Jest tests
│
├── __test__/                           # Jest Test Suite
│   ├── integration/                    # Integration Tests
│   │   ├── api/
│   │   │   ├── favourites.test.ts
│   │   │   ├── reactions.test.ts
│   │   │   ├── search.test.ts
│   │   │   └── watching.test.ts
│   │   ├── database/
│   │   │   └── prisma.test.ts
│   │   ├── external-apis/
│   │   │   └── tmdb.test.ts
│   │   └── workflows/
│   │       └── user-registration.test.ts
│   ├── units/                          # Unit Tests
│   │   ├── components/
│   │   │   ├── AccountMenu.test.tsx
│   │   │   ├── Billboard.test.tsx
│   │   │   ├── FavouriteButton.test.tsx
│   │   │   ├── InfoModal.test.tsx
│   │   │   ├── Input.test.tsx
│   │   │   ├── MobileMenu.test.tsx
│   │   │   ├── MovieCard.test.tsx
│   │   │   ├── MovieList.test.tsx
│   │   │   ├── NavBar.test.tsx
│   │   │   ├── NavBarItem.test.tsx
│   │   │   ├── PlayButton.test.tsx
│   │   │   ├── ReactionsButton.test.tsx
│   │   │   └── WatchingMovieCard.test.tsx
│   │   ├── hooks/
│   │   │   ├── useFavourites.test.ts
│   │   │   └── useProfile.test.ts
│   │   └── lib/
│   │       └── fetcher.test.ts
│   └── test.d.ts                        # Test type definitions
│
├── tests/                              # Playwright E2E Tests
│   ├── e2e/
│   │   ├── auth.setup.ts               # Authentication setup for E2E tests
│   │   ├── authenticated/               # Tests requiring authentication
│   │   │   ├── account-settings.e2e.test.ts
│   │   │   ├── content-details.e2e.test.ts
│   │   │   ├── my-list-page.e2e.test.ts
│   │   │   └── recommendations.e2e.test.ts
│   │   └── public/                      # Public/unauth tests
│   │       └── login.e2e.test.ts
│   └── example.spec.ts                  # Playwright example test
│
├── components/                          # React Components
│   ├── AccountMenu.tsx                  # User account dropdown menu
│   ├── Billboard.tsx                    # Hero banner component
│   ├── FavouriteButton.tsx              # Add/remove favorite button
│   ├── InfoModal.tsx                    # Modal for media details
│   ├── Input.tsx                        # Reusable input component
│   ├── LoadingScreen.tsx                 # Loading state component
│   ├── MobileMenu.tsx                   # Mobile navigation menu
│   ├── MovieCard.tsx                    # Individual movie/TV show card
│   ├── MovieList.tsx                     # Horizontal scrolling movie list
│   ├── Navbar.tsx                       # Main navigation bar
│   ├── NavbarItem.tsx                   # Navigation item component
│   ├── PlayButton.tsx                   # Play button component
│   ├── ReactionsButton.tsx              # Like/love/dislike button
│   ├── SettingsNavBar.tsx               # Settings navigation
│   ├── SideMenu.tsx                     # Side navigation menu
│   ├── SimilarMovieCard.tsx             # Similar content card
│   ├── TopMovieCard.tsx                 # Featured/top movie card
│   ├── TopMovieList.tsx                 # Top movies list
│   ├── WatchingMovieCard.tsx            # Currently watching card
│   └── WatchingMovieList.tsx            # Watching list component
│
├── pages/                               # Next.js Pages & API Routes
│   ├── _app.tsx                         # App wrapper/configuration
│   ├── index.tsx                        # Home page
│   ├── auth.tsx                         # Authentication page
│   ├── profiles.tsx                     # Profile selection page
│   ├── latest.tsx                       # Latest content page
│   ├── my-list.tsx                      # User's favorites list
│   ├── search.tsx                       # Search results page
│   │
│   ├── account/                         # Account management pages
│   │   ├── index.tsx                    # Account dashboard
│   │   ├── devices.tsx                 # Manage devices
│   │   ├── membership.tsx              # Membership details
│   │   ├── profiles.tsx                # Profile management
│   │   └── security.tsx                # Security settings
│   │
│   ├── api/                             # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth].ts        # NextAuth handler
│   │   ├── current.ts                   # Current user endpoint
│   │   ├── favourite.ts                # Single favorite (POST/DELETE)
│   │   ├── favourites.ts               # Favorites list (GET)
│   │   ├── profile.ts                  # User profile endpoint
│   │   ├── random.ts                   # Random content endpoint
│   │   ├── reaction.ts                 # Single reaction (POST/DELETE)
│   │   ├── reactions.ts               # Reactions list (GET)
│   │   ├── recommend.ts               # Recommendations endpoint
│   │   ├── register.ts                # User registration
│   │   ├── search.ts                  # Search endpoint
│   │   ├── watching.ts                # Single watching (POST/DELETE)
│   │   ├── watchings.ts               # Watching list (GET)
│   │   ├── movies/
│   │   │   ├── index.ts               # Movies list endpoint
│   │   │   └── [movieId].ts           # Single movie endpoint
│   │   └── tv/
│   │       ├── index.ts               # TV shows list endpoint
│   │       └── [tvId].ts              # Single TV show endpoint
│   │
│   ├── browse/                          # Browse pages
│   │   ├── index.tsx                   # Main browse page
│   │   ├── movies.tsx                  # Movies browse page
│   │   ├── original-audios.tsx         # Original audios page
│   │   └── tv-shows.tsx                # TV shows browse page
│   │
│   ├── settings/                        # Settings pages
│   │   ├── [profileId].tsx             # Profile settings
│   │   └── profile/
│   │       └── edit/
│   │           └── [profileId].tsx     # Edit profile page
│   │
│   └── watch/                           # Video player pages
│       └── [mediaId].tsx               # Watch video page
│
├── hooks/                               # Custom React Hooks
│   ├── useBillboard.ts                  # Billboard data hook
│   ├── useCurrentUser.ts                # Current user hook
│   ├── useFavourites.ts                 # Favorites management hook
│   ├── useInfoModal.ts                  # Info modal state hook
│   ├── useMovieDetails.ts               # Movie details hook
│   ├── useMovies.ts                     # Movies list hook
│   ├── useProfile.ts                    # Profile management hook
│   ├── useReactions.ts                  # Reactions hook
│   ├── useTvShowDetails.ts              # TV show details hook
│   ├── useTvShows.ts                    # TV shows list hook
│   └── useWatching.ts                  # Watching progress hook
│
├── lib/                                 # Utility Libraries
│   ├── fetcher.ts                       # SWR fetcher function
│   ├── prismadb.ts                     # Prisma client instance
│   ├── serverAuth.ts                    # Server-side auth helper
│   ├── tmdb.ts                          # TMDB API utilities
│   ├── tmdb.d.ts                        # TMDB type definitions
│   ├── transform.ts                     # Data transformation utilities
│   ├── types.ts                         # Shared type definitions
│   ├── useExpandedPosition.ts           # Position calculation hook
│   └── types/                           # Type definitions
│       ├── api.ts                       # API types
│       ├── tmdb.d.ts                    # TMDB types
│       └── tmdb.ts                      # TMDB types (extended)
│
├── prisma/                              # Database Schema
│   └── schema.prisma                    # Prisma schema definition
│
├── constants/                           # Application Constants
│   ├── data.ts                          # Static data constants
│   └── navItem.ts                       # Navigation items
│
├── scripts/                             # Utility Scripts
│   ├── import-movies.ts                 # Movie import script
│   └── import-seasons.ts                # Seasons/episodes import script
│
├── public/                              # Static Assets
│   ├── favicon.ico
│   ├── icons/
│   │   ├── device.png
│   │   ├── handshake.png
│   │   ├── heart.png
│   │   └── star.png
│   └── images/
│       ├── default-blue.png
│       ├── default-green.png
│       ├── default-red.png
│       ├── default-slate.png
│       ├── hero.jpg
│       ├── logo-2.png
│       ├── logo-white.png
│       ├── logo.png
│       ├── placeholder.jpg
│       └── symbol.png
│
├── styles/                              # Global Styles
│   └── globals.css                      # Global CSS styles
│
├── generated/                           # Generated Files (Prisma)
│   └── prisma/                          # Generated Prisma client
│
├── coverage/                            # Test Coverage Reports
│   └── lcov-report/                     # HTML coverage reports
│
├── test-results/                        # Playwright Test Results
├── playwright-report/                   # Playwright HTML Reports
│
├── .github/                             # GitHub Configuration
│   └── workflows/                       # GitHub Actions workflows
│
├── .next/                               # Next.js Build Output
├── node_modules/                        # Dependencies
│
├── Configuration Files
│   ├── package.json                     # Dependencies & scripts
│   ├── package-lock.json                # Lock file
│   ├── tsconfig.json                     # TypeScript config
│   ├── tsconfig.jest.json               # Jest TypeScript config
│   ├── jest.config.ts                   # Jest configuration
│   ├── jest.setup.ts                    # Jest setup file
│   ├── playwright.config.ts             # Playwright configuration
│   ├── next.config.ts                   # Next.js configuration
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── postcss.config.mjs               # PostCSS config
│   ├── babel.config.js                  # Babel config
│   ├── .babelrc                          # Babel config (legacy)
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── .gitignore                        # Git ignore file
│   ├── global.d.ts                      # Global type definitions
│   └── README.md                        # Project documentation
│
└── Data Files
    ├── movies.json                       # Movie seed data
    └── tvshow-seasons.json              # TV show seasons seed data
```

## Key Directories Overview

### 🧪 **Testing Structure**
- **`__test__/units/`**: Unit tests for components, hooks, and utilities
- **`__test__/integration/`**: Integration tests for API routes, database, and workflows
- **`tests/e2e/`**: Playwright end-to-end tests

### 📦 **Application Code**
- **`components/`**: Reusable React components
- **`pages/`**: Next.js pages and API routes
- **`hooks/`**: Custom React hooks for data fetching and state management
- **`lib/`**: Utility functions, configurations, and type definitions

### 🗄️ **Database & Configuration**
- **`prisma/`**: Database schema and migrations
- **`constants/`**: Application-wide constants
- **`scripts/`**: Database seeding and utility scripts

### 🎨 **Assets & Styling**
- **`public/`**: Static assets (images, icons, etc.)
- **`styles/`**: Global CSS styles

## Test Commands

```bash
# Unit Tests
npm run test:unit
npm run test:watch:unit
npm run test:coverage:unit

# Integration Tests
npm run test:integration
npm run test:watch:integration
npm run test:coverage:integration

# E2E Tests (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report

# All Tests
npm run test:all
npm run test:ci
```

## Technology Stack

- **Framework**: Next.js 15.2.4 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: SWR, Zustand
- **Testing**: Jest, React Testing Library, Playwright

