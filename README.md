# MTG Card Database

This project uses the MTGJSON database to provide comprehensive Magic: The Gathering card information. To get started, you'll need to download the AllPrintings.sqlite database file from the MTGJSON website (https://mtgjson.com/downloads/all-files/#allprintings).

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- SQLite database file (AllPrintings.sqlite)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd deckard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Database Setup:
   - Visit [MTGJSON](https://mtgjson.com/downloads/all-files/#allprintings)
   - Download the `AllPrintings.sqlite` file
   - Place the downloaded file in the `./prisma` directory of this project

4. Initialize Prisma:
   ```bash
   npx prisma generate
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

## Project Structure

- `/src` - Source code directory
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/.next` - Next.js build output

The database will be used to provide card information and search functionality throughout the application.



