# AI Code Snippet Manager

A full-stack application for managing code snippets with AI-powered generation, optimization, and explanation using Ollama's CodeLlama model.

## Features

- **User Authentication** - Register, login, and manage your account
- **Snippet Management** - Create, read, update, and delete code snippets
- **AI Code Generation** - Generate code snippets from natural language descriptions
- **AI Code Optimization** - Optimize existing code for better performance
- **AI Code Explanation** - Get detailed explanations of code
- **AI Chat Assistant** - Chat with AI about code-related questions
- **Tag Filtering** - Organize and filter snippets by tags
- **Language Support** - Support for multiple programming languages
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- React Hot Toast for notifications
- FontAwesome for icons

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT for authentication
- Ollama with CodeLlama 7B for AI features

### Authentication Service
- Standalone auth service
- JWT token management
- Password reset functionality
- OAuth support (Google, GitHub)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Ollama with CodeLlama 7B model
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/code-snippet-manager.git
cd code-snippet-manager
