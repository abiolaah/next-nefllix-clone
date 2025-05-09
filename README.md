# Netflix Clone

A modern Netflix clone built with Next.js, TypeScript, and Tailwind CSS. This project implements core Netflix features including movie browsing, user authentication, and a responsive UI.

## Table of Contents

- [Netflix Clone](#netflix-clone)
- [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
  - [Project Structure](#project-structure)
  - [Key Components](#key-components)
  - [API Routes](#api-routes)
  - [Contributing](#contributing)
  - [Dependencies](#dependencies)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Introduction

The Netflix Clone is a full-stack web application that replicates the core functionality and user experience of the popular streaming platform Netflix. Built with modern web technologies, this project showcases advanced frontend development techniques, seamless API integrations, and robust authentication systems.

This clone goes beyond a simple UI imitation by implementing key features like:

- Comprehensive content browsing with multiple categories
- User authentication with multiple providers
- Personalized watchlists and viewing history
- Responsive design that works across all device sizes

The application leverages The Movie Database (TMDB) API to provide an extensive library of movies and TV shows, while also supporting locally managed content through MongoDB. The clean, intuitive interface features smooth animations and hover effects that mimic the Netflix viewing experience.

Whether you're looking to explore Next.js capabilities, learn about API integrations, or understand modern authentication patterns, this project serves as an excellent educational resource and development showcase. The modular architecture and well-documented codebase make it easy to extend with additional features or customize for specific needs.

## Features

- **Authentication**

  - Email/password authentication
  - Google authentication integration
  - GitHub authentication integration
  - Protected routes and API endpoints

- **Movie & TV Show Management**

  - Browse multiple categories:
    - Popular Movies/TV Shows
    - Now Playing/On Air
    - Upcoming Movies
    - Top Rated content
    - Trending content
  - Local content management through MongoDB
  - Integration with TMDB API for extensive content library
  - Horizontal scrolling lists with smooth navigation
  - Detailed movie/show information display

- **User Experience**
  - Responsive design for all screen sizes
  - Hover effects for movie/show cards
  - Dynamic image loading with fallbacks
  - Smooth transitions and animations
  - Favorite/bookmark functionality
  - Watching/Watched functionality
  - Search functionality

## Tech Stack

- **Frontend**

  - Next.js (Pages Router)
  - TypeScript
  - Tailwind CSS
  - React Icons
  - SWR for data fetching

- **Backend**

  - Next.js API Routes
  - MongoDB with Prisma ORM
  - TMDB API integration

- **Authentication**
  - NextAuth.js
  - Google OAuth
  - GitHub OAuth

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/abiolaah/next-nefllix-clone.git
   cd netx-netflix-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE_URL="your-mongodb-url"
   NEXTAUTH_JWT_SECRET="your-jwt-secret"
   NEXTAUTH_SECRET="your-nextauth-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   TMDB_API_KEY="your-tmdb-api-key"
   ```

4. **Set up the database**

   ```bash
   npx prisma db push
   ```

5. **Add data to the database through seeding**
   - Run the command below to seed the database with data for movies and tvshows:
     ```bash
     npm run import-movie
     ```
   - Run the command below to seed the database with data for tv shows' seasons and episodes details
     ```bash
     npm run import-seasons
     ```
6. **Run the development server**

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Next.js pages and API routes
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and configurations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configurations

## Key Components

- **MovieCard** - Displays individual movie/show information with hover effects
- **MovieList** - Horizontal scrolling list of MovieCards
- **Navbar** - Navigation and user controls
- **Auth Forms** - Login and registration forms
- **SearchBar** - Search input with filtering
- **Profile** - Display media list based on Profile
- **InfoModal** - Extend feature to dynamically display media data based on media type i.e. tv or movies; for tv, displays seasons and episode info.
- **Watch** - Watch allows to watch a single video for movies and allows to watch an episode, upon ending the episode, it will automatically play the next episode.

## API Routes

- `/api/movies` - Fetch movie categories and manage local movies
- `/api/tv` - Fetch TV show categories and manage local shows
- `/api/auth/*` - Authentication endpoints
- `/api/favorites` - User favourite list endpoint
- `/api/favorite` - User favorite management endpoint: Create, Update or Delete
- `/api/watching` - User watching management endpoint: Create, Update or Delete
- `/api/watchings` - User watching list endpoint
- `/api/search` - Searching endpoint for movies and TV shows

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Dependencies

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://www.prisma.io/) for the database ORM
- [NextAuth.js](https://next-auth.js.org/getting-started/example) for Authentication
- [MongoDB](https://www.mongodb.com/docs/atlas/) for Database
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for third party authentication
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) for third party authentication

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie and TV show data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://www.prisma.io/) for the database ORM
- [Blender Foundation](https://studio.blender.org/films/?utm_medium=www-footer) for sample videos
- [Code With Antonio](https://www.youtube.com/watch?v=mqUN4N2q4qY&t=8929s) for providing guide for some of the features in the app such as `Authentication`, `Database setup`, `Billboard`, `Browse page`,`MovieCard`, `MovieList`, `Favourite functionality`, `Video playing` and `InfoModal` through the [Youtube Tutorial](<(https://www.youtube.com/watch?v=mqUN4N2q4qY&t=8929s)>)
