
# Learning Path Generator

An interactive web application that generates personalized learning paths and educational content for any topic using AI.

## Features

- Topic-based learning path generation
- Trending topics discovery
- Interactive timeline view
- Switch between OpenAI and DeepSeek models
- Real-time content generation with progress updates
- Light/Dark theme support

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Express.js
- Styling: Tailwind CSS + shadcn/ui
- AI: OpenAI and DeepSeek integrations
- State Management: TanStack Query

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- `OPENAI_API_KEY`
- `DEEPSEEK_API_KEY`
- `SERPAPI_KEY`

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend
- `/db` - Database configuration and schemas
