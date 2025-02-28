# Intelligent DMS Backend API

This is the backend API for the Intelligent Document Management System built with Flask and SQLite.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   python app.py
   ```

3. Access the API at http://localhost:8000/api

## API Endpoints

### Authentication

- **POST /api/token** - Get access token (login)
- **POST /api/register** - Register a new user
- **GET /api/users/me** - Get current user information

### Documents

- **POST /api/documents** - Upload a new document
- **GET /api/documents** - List documents with filtering options
- **GET /api/documents/{document_id}** - Get a specific document
- **GET /api/documents/{document_id}/download** - Download a document
- **PUT /api/documents/{document_id}** - Update a document
- **DELETE /api/documents/{document_id}** - Delete a document
- **POST /api/documents/{document_id}/encrypt** - Encrypt a document
- **POST /api/documents/{document_id}/decrypt** - Decrypt a document
- **POST /api/documents/{document_id}/share** - Share a document with other users

### Workflows

- **POST /api/workflows** - Create a new workflow
- **GET /api/workflows** - List workflows
- **GET /api/workflows/{workflow_id}** - Get a specific workflow
- **PUT /api/workflows/{workflow_id}** - Update a workflow
- **PUT /api/workflows/{workflow_id}/steps/{step_id}** - Update a workflow step
- **DELETE /api/workflows/{workflow_id}** - Delete a workflow

### Dashboard

- **GET /api/dashboard/stats** - Get dashboard statistics
- **GET /api/dashboard/recent-documents** - Get recent documents

### Settings

- **GET /api/settings** - Get user settings
- **PUT /api/settings** - Update user settings

### Templates

- **GET /api/templates** - Get document templates

## Authentication

The API uses a simplified token-based authentication. To access protected endpoints:

1. Get a token by sending a POST request to `/api/token` with your credentials
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer your_token_here
   ```

## Database

The application uses SQLite with SQLAlchemy ORM. The database file `dms.db` will be created automatically when you run the application for the first time.

## File Storage

Uploaded files are stored in the `uploads` directory. Each file is given a unique UUID filename to prevent collisions.

## Default Users

The system comes with two default users:

1. Admin User
   - Email: admin@example.com
   - Password: admin123
   - Role: admin

2. Regular User
   - Email: user@example.com
   - Password: user123
   - Role: user