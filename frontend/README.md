# Search API Frontend

A simple frontend application for testing the Live Search API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the frontend server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Features

- **Real-time search**: Results update as you type with configurable debounce time
- Search across all content types
- Filter by entity type, category, tags, price range
- Sort results by different criteria
- Display search results in a clean interface

## Available Versions

### Full Version (Default)
Available at `http://localhost:8080`
- Complete UI with all filtering and sorting options
- Real-time search with configurable debounce settings
- Detailed result display with all metadata

### Minimal Version
Available at `http://localhost:8080/minimal`
- Simplified UI focused on core search functionality
- Still includes real-time search capability
- Basic result display with essential information

## Note

This frontend expects the backend API to be running at `http://localhost:3000`.

Make sure your NestJS backend server is running before using this frontend. 