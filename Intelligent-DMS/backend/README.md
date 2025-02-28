# Intelligent DMS Backend API

This is the backend API for the Intelligent Document Management System built with FastAPI.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   uvicorn main:app --reload
   ```

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

- **POST /api/token** - Get access token (login)
- **POST /api/register** - Register a new user
- **GET /api/users/me** - Get current user information

### Documents

- **POST /api/documents** - Upload a new document
- **GET /api/documents** - List documents with filtering options
- **GET /api/documents/{document_id}** - Get a specific document
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

The API uses JWT tokens for authentication. To access protected endpoints:

1. Get a token by sending a POST request to `/api/token` with your credentials
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer your_token_here
   ```

## Models

### User

```json
{
  "id": "string",
  "email": "user@example.com",
  "name": "string",
  "role": "admin | manager | user",
  "created_at": "datetime"
}
```

### Document

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "size": 0,
  "tags": ["string"],
  "encrypted": false,
  "access_level": "private | shared | public",
  "status": "draft | pending | approved | rejected",
  "owner_id": "string",
  "content": "string",
  "thumbnail": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Workflow

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active | draft | completed",
  "steps": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "pending | in-progress | completed | rejected",
      "assignee": "string",
      "due_date": "datetime"
    }
  ],
  "assignees": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```