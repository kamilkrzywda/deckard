# MTG Card Database

## How the Application Works

This application is a Magic: The Gathering deck building assistant that combines a comprehensive card database with AI-powered chat functionality. Here's how it works:

### Core Components

1. **Card Database**
   - Uses MTGJSON's AllPrintings.sqlite database for comprehensive card information
   - Prisma ORM for database queries and type safety
   - Supports complex card searches by name, type, color, mana value, and other attributes

2. **AI Chat Interface**
   - Powered by Google's Gemini AI model
   - Custom system prompt tailored for MTG deck building
   - Structured response format for consistent card suggestions and interactions

3. **Card Search Tools**
   - `cardDatabaseTool`: Searches the MTG card database with complex queries
   - `keywordTool`: Provides detailed information about MTG keywords and abilities
   - `comboSearchTool`: Searches for card combos from Commander Spellbook

4. **User Interface**
   - Chat interface for natural language interaction
   - Card display component with grouping and sorting capabilities
   - Real-time card suggestions and follow-up questions

### Workflow

1. **User Interaction**
   - Users type questions or requests in natural language
   - The chat interface sends the message to the Gemini AI model

2. **AI Processing**
   - Gemini AI processes the request and determines which tools to use
   - Tools are called automatically to search for cards, keywords, or combos
   - Results are formatted into a structured response

3. **Response Generation**
   - AI generates a response with:
     - Natural language explanation
     - Relevant cards to display
     - Follow-up suggestions for the user

4. **Card Display**
   - Cards are displayed in a grid layout
   - Users can group cards by various attributes (type, color, mana value, etc.)
   - Cards can be sorted by different criteria

### Key Features

- **Intelligent Card Suggestions**: AI suggests relevant cards based on user queries
- **Comprehensive Card Information**: Access to full card details from the MTG database
- **Keyword Lookup**: Quick access to MTG rules and keyword explanations
- **Combo Search**: Find card combinations and synergies
- **Flexible Card Organization**: Group and sort cards by various attributes
- **Natural Language Interface**: Chat-based interaction for easy use

### Technical Implementation

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini API
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS for responsive design

The application is designed to be both powerful and user-friendly, making it easy for MTG players to build and optimize their decks with AI assistance.

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



