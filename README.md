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

| Technology      | Version | Purpose                   |
|-----------------|---------|---------------------------|
| React           | 18.x    | UI library                |
| TypeScript      | 5.x     | Type safety               |
| Tailwind CSS    | 3.x     | Utility-first styling     |
| Axios           | 1.6.x   | HTTP client for API calls |
| React Router    | 6.x     | Navigation and routing    |
| React Hot Toast | 2.x     | Toast notifications       |
| FontAwesome     | 6.x     | Icon library              |
| Vite            | 5.x     | Build tool and dev server |

### Backend

| Technology     | Version | Purpose                     |
|----------------|---------|-----------------------------|
| Node.js        | 18+     | JavaScript runtime          |
| Express        | 4.x     | Web framework               |
| TypeScript     | 5.x     | Type safety                 |
| Prisma         | 5.x     | ORM for database operations |
| PostgreSQL     | 14+     | Primary database            |
| JSON Web Token | 9.x     | Token-based authentication  |
| Axios          | 1.6.x   | HTTP client for Ollama API  |
| Bcrypt         | 5.x     | Password hashing            |

### Authentication Service

| Technology     | Version | Purpose                     |
|----------------|---------|-----------------------------|
| Node.js        | 18+     | JavaScript runtime          |
| Express        | 4.x     | Web framework               |
| TypeScript     | 5.x     | Type safety                 |
| Prisma         | 5.x     | ORM for database operations |
| PostgreSQL     | 14+     | User database               |
| JSON Web Token | 9.x     | Access and refresh tokens   |
| Passport       | 0.7.x   | OAuth strategies            |
| Bcrypt         | 5.x     | Password hashing            |

### AI Service

| Technology | Version | Purpose                |
|------------|---------|------------------------|
| Ollama     | Latest  | Local LLM runner       |
| tinyllama  |         | Code generation model  |
| Axios      | 1.6.x   | HTTP client for Ollama |

## Prerequisites

| Requirement | Version         | Notes              |
|-------------|-----------------|--------------------|
| Node.js     | 18 or higher    | JavaScript runtime |
| PostgreSQL  | 14 or higher    | Database           |
| Ollama      | Latest          | Local LLM runner   |
| npm         | 9 or higher     | Package manager    |
| Git         | Latest          | Version control    |

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/code-snippet-manager.git
cd code-snippet-manager
npm install
