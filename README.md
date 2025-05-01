# Netflix Clone

A modern Netflix clone built with Next.js, TypeScript, and Tailwind CSS. This project implements core Netflix features including movie browsing, user authentication, and a responsive UI.

## Features

- **Authentication**

  - Email/password authentication
  - Google authentication integration
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

## Getting Started

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd netflix-clone
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

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## API Routes

- `/api/movies` - Fetch movie categories and manage local movies
- `/api/tv` - Fetch TV show categories and manage local shows
- `/api/auth/*` - Authentication endpoints
- `/api/favorites` - User favorites management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie and TV show data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://www.prisma.io/) for the database ORM
