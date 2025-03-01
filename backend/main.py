from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import uuid
from enum import Enum
import os
import shutil
import pytesseract
from PIL import Image
import io
import json

# Models
class AccessLevel(str, Enum):
    private = "private"
    shared = "shared"
    public = "public"

class DocumentStatus(str, Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class WorkflowStatus(str, Enum):
    active = "active"
    draft = "draft"
    completed = "completed"

class WorkflowStepStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"

class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class DocumentBase(BaseModel):
    name: str
    type: str
    size: int
    tags: List[str] = []
    encrypted: bool = False
    access_level: AccessLevel
    status: DocumentStatus

class DocumentCreate(DocumentBase):
    content: Optional[str] = None
    owner_id: str

class Document(DocumentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    owner_id: str
    content: Optional[str] = None
    thumbnail: Optional[str] = None

    class Config:
        orm_mode = True

class WorkflowStepBase(BaseModel):
    name: str
    description: str
    status: WorkflowStepStatus
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None

class WorkflowStepCreate(WorkflowStepBase):
    pass

class WorkflowStep(WorkflowStepBase):
    id: str

    class Config:
        orm_mode = True

class WorkflowBase(BaseModel):
    name: str
    description: str
    status: WorkflowStatus
    assignees: List[str] = []

class WorkflowCreate(WorkflowBase):
    steps: List[WorkflowStepCreate]

class Workflow(WorkflowBase):
    id: str
    steps: List[WorkflowStep]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Security
SECRET_KEY = "YOUR_SECRET_KEY"  # In production, use a secure key and store it in environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except jwt.PyJWTError:
        raise credentials_exception
    
    # In a real app, you would fetch the user from a database
    # For this example, we'll use a mock user
    user = get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

# Mock database (in a real app, you would use a proper database)
users_db = {
    "1": {
        "id": "1",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "admin",
        "hashed_password": get_password_hash("admin123"),
        "created_at": datetime.now()
    },
    "2": {
        "id": "2",
        "email": "user@example.com",
        "name": "Regular User",
        "role": "user",
        "hashed_password": get_password_hash("user123"),
        "created_at": datetime.now()
    }
}

documents_db = {}
workflows_db = {}

# Mock database functions
def get_user_by_email(email: str):
    for user_id, user in users_db.items():
        if user["email"] == email:
            return user
    return None

def get_user_by_id(user_id: str):
    if user_id in users_db:
        return users_db[user_id]
    return None

def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

# FastAPI app
app = FastAPI(title="Intelligent DMS API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/api/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register", response_model=User)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "hashed_password": hashed_password,
        "created_at": datetime.now()
    }
    
    users_db[user_id] = new_user
    
    # Return user without password
    return {
        "id": new_user["id"],
        "email": new_user["email"],
        "name": new_user["name"],
        "role": new_user["role"],
        "created_at": new_user["created_at"]
    }

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Document endpoints
@app.post("/api/documents", response_model=Document)
async def create_document(
    file: UploadFile = File(...),
    tags: str = Form("[]"),
    access_level: AccessLevel = Form(AccessLevel.private),
    encrypt: bool = Form(False),
    current_user: User = Depends(get_current_user)
):
    # Parse tags from JSON string
    tags_list = json.loads(tags)
    
    # Generate unique ID
    doc_id = str(uuid.uuid4())
    
    # Get file info
    file_content = await file.read()
    file_size = len(file_content)
    file_type = file.filename.split('.')[-1] if '.' in file.filename else ''
    
    # Extract text content if possible (for searchability)
    content = None
    if file_type.lower() in ['txt', 'pdf', 'doc', 'docx']:
        # In a real app, you would use appropriate libraries for each file type
        # For this example, we'll just use a placeholder
        content = "Extracted text content would go here"
    elif file_type.lower() in ['jpg', 'jpeg', 'png']:
        # Use OCR for images
        try:
            image = Image.open(io.BytesIO(file_content))
            content = pytesseract.image_to_string(image)
        except Exception as e:
            content = f"Error extracting text: {str(e)}"
    
    # Create document record
    now = datetime.now()
    document = {
        "id": doc_id,
        "name": file.filename,
        "type": file_type,
        "size": file_size,
        "tags": tags_list,
        "encrypted": encrypt,
        "access_level": access_level,
        "status": DocumentStatus.pending,
        "owner_id": current_user["id"],
        "content": content,
        "created_at": now,
        "updated_at": now
    }
    
    # In a real app, you would save the file to storage
    # For this example, we'll just store the document metadata
    documents_db[doc_id] = document
    
    return document

@app.get("/api/documents", response_model=List[Document])
async def get_documents(
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    file_type: Optional[str] = None,
    access_level: Optional[AccessLevel] = None,
    status: Optional[DocumentStatus] = None,
    encrypted: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    # Filter documents based on query parameters
    results = []
    
    for doc_id, doc in documents_db.items():
        # Check if user has access to the document
        if doc["owner_id"] != current_user["id"] and doc["access_level"] == AccessLevel.private:
            continue
            
        # Apply filters
        if search and search.lower() not in doc["name"].lower() and (not doc["content"] or search.lower() not in doc["content"].lower()):
            continue
            
        if tags and not any(tag in doc["tags"] for tag in tags):
            continue
            
        if file_type and doc["type"] != file_type:
            continue
            
        if access_level and doc["access_level"] != access_level:
            continue
            
        if status and doc["status"] != status:
            continue
            
        if encrypted is not None and doc["encrypted"] != encrypted:
            continue
            
        results.append(doc)
    
    return results

@app.get("/api/documents/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has access to the document
    if doc["owner_id"] != current_user["id"] and doc["access_level"] == AccessLevel.private:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this document"
        )
        
    return doc

@app.put("/api/documents/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has permission to update the document
    if doc["owner_id"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this document"
        )
        
    # Update document fields
    allowed_fields = ["name", "tags", "access_level", "status", "encrypted"]
    for field in allowed_fields:
        if field in document_update:
            doc[field] = document_update[field]
            
    # Update timestamp
    doc["updated_at"] = datetime.now()
    
    # Save updated document
    documents_db[document_id] = doc
    
    return doc

@app.delete("/api/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has permission to delete the document
    if doc["owner_id"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this document"
        )
        
    # Delete document
    del documents_db[document_id]
    
    # In a real app, you would also delete the file from storage
    
    return None

@app.post("/api/documents/{document_id}/encrypt", response_model=Document)
async def encrypt_document(
    document_id: str,
    secret_key: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has permission to encrypt the document
    if doc["owner_id"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to encrypt this document"
        )
        
    # In a real app, you would encrypt the document content
    # For this example, we'll just mark it as encrypted
    doc["encrypted"] = True
    doc["updated_at"] = datetime.now()
    
    # Save updated document
    documents_db[document_id] = doc
    
    return doc

@app.post("/api/documents/{document_id}/decrypt", response_model=Document)
async def decrypt_document(
    document_id: str,
    secret_key: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has permission to decrypt the document
    if doc["owner_id"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to decrypt this document"
        )
        
    # In a real app, you would decrypt the document content
    # For this example, we'll just mark it as not encrypted
    doc["encrypted"] = False
    doc["updated_at"] = datetime.now()
    
    # Save updated document
    documents_db[document_id] = doc
    
    return doc

@app.post("/api/documents/{document_id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def share_document(
    document_id: str,
    user_emails: List[str] = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    if document_id not in documents_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    doc = documents_db[document_id]
    
    # Check if user has permission to share the document
    if doc["owner_id"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to share this document"
        )
        
    # In a real app, you would implement document sharing logic
    # For this example, we'll just update the access level
    if doc["access_level"] == AccessLevel.private:
        doc["access_level"] = AccessLevel.shared
        doc["updated_at"] = datetime.now()
        documents_db[document_id] = doc
    
    # In a real app, you would send email notifications to shared users
    
    return None

# Workflow endpoints
@app.post("/api/workflows", response_model=Workflow)
async def create_workflow(
    workflow: WorkflowCreate,
    current_user: User = Depends(get_current_user)
):
    # Generate unique ID
    workflow_id = str(uuid.uuid4())
    
    # Create workflow steps
    steps = []
    for step in workflow.steps:
        step_id = str(uuid.uuid4())
        steps.append({
            "id": step_id,
            "name": step.name,
            "description": step.description,
            "status": step.status,
            "assignee": step.assignee,
            "due_date": step.due_date
        })
    
    # Create workflow record
    now = datetime.now()
    new_workflow = {
        "id": workflow_id,
        "name": workflow.name,
        "description": workflow.description,
        "status": workflow.status,
        "steps": steps,
        "assignees": workflow.assignees,
        "created_at": now,
        "updated_at": now
    }
    
    # Save workflow
    workflows_db[workflow_id] = new_workflow
    
    return new_workflow

@app.get("/api/workflows", response_model=List[Workflow])
async def get_workflows(
    status: Optional[WorkflowStatus] = None,
    current_user: User = Depends(get_current_user)
):
    # Filter workflows based on query parameters
    results = []
    
    for workflow_id, workflow in workflows_db.items():
        # Apply filters
        if status and workflow["status"] != status:
            continue
            
        results.append(workflow)
    
    return results

@app.get("/api/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    if workflow_id not in workflows_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
        
    return workflows_db[workflow_id]

@app.put("/api/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_update: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    if workflow_id not in workflows_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
        
    workflow = workflows_db[workflow_id]
    
    # Update workflow fields
    allowed_fields = ["name", "description", "status", "assignees"]
    for field in allowed_fields:
        if field in workflow_update:
            workflow[field] = workflow_update[field]
            
    # Update steps if provided
    if "steps" in workflow_update:
        workflow["steps"] = workflow_update["steps"]
            
    # Update timestamp
    workflow["updated_at"] = datetime.now()
    
    # Save updated workflow
    workflows_db[workflow_id] = workflow
    
    return workflow

@app.put("/api/workflows/{workflow_id}/steps/{step_id}", response_model=WorkflowStep)
async def update_workflow_step(
    workflow_id: str,
    step_id: str,
    step_update: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    if workflow_id not in workflows_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
        
    workflow = workflows_db[workflow_id]
    
    # Find the step
    step_index = None
    for i, step in enumerate(workflow["steps"]):
        if step["id"] == step_id:
            step_index = i
            break
            
    if step_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow step not found"
        )
        
    # Update step fields
    allowed_fields = ["name", "description", "status", "assignee", "due_date"]
    for field in allowed_fields:
        if field in step_update:
            workflow["steps"][step_index][field] = step_update[field]
            
    # Update workflow timestamp
    workflow["updated_at"] = datetime.now()
    
    # Save updated workflow
    workflows_db[workflow_id] = workflow
    
    return workflow["steps"][step_index]

@app.delete("/api/workflows/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
):
    if workflow_id not in workflows_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
        
    # Delete workflow
    del workflows_db[workflow_id]
    
    return None

# Dashboard endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    # Calculate statistics
    total_documents = len(documents_db)
    encrypted_documents = sum(1 for doc in documents_db.values() if doc["encrypted"])
    shared_documents = sum(1 for doc in documents_db.values() if doc["access_level"] == AccessLevel.shared)
    pending_documents = sum(1 for doc in documents_db.values() if doc["status"] == DocumentStatus.pending)
    
    # Get document counts by type
    document_types = {}
    for doc in documents_db.values():
        doc_type = doc["type"]
        if doc_type in document_types:
            document_types[doc_type] += 1
        else:
            document_types[doc_type] = 1
            
    # Get all unique tags
    all_tags = set()
    for doc in documents_db.values():
        all_tags.update(doc["tags"])
    
    return {
        "total_documents": total_documents,
        "encrypted_documents": encrypted_documents,
        "shared_documents": shared_documents,
        "pending_documents": pending_documents,
        "document_types": document_types,
        "all_tags": list(all_tags)
    }

@app.get("/api/dashboard/recent-documents", response_model=List[Document])
async def get_recent_documents(
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    # Get documents accessible to the user
    accessible_docs = [
        doc for doc in documents_db.values()
        if doc["owner_id"] == current_user["id"] or doc["access_level"] != AccessLevel.private
    ]
    
    # Sort by updated_at (most recent first) and limit results
    recent_docs = sorted(
        accessible_docs,
        key=lambda x: x["updated_at"],
        reverse=True
    )[:limit]
    
    return recent_docs

# Settings endpoints
@app.get("/api/settings")
async def get_settings(current_user: User = Depends(get_current_user)):
    # In a real app, you would fetch user settings from a database
    # For this example, we'll return mock settings
    return {
        "general": {
            "company_name": "Acme Inc.",
            "admin_email": "admin@example.com",
            "language": "en",
            "timezone": "UTC"
        },
        "security": {
            "password_expiry": True,
            "complex_password": True,
            "enable_2fa": False,
            "default_encryption": True,
            "encryption_algorithm": "AES-256"
        },
        "storage": {
            "storage_location": "local",
            "backup_frequency": "daily",
            "backup_retention": "30 days",
            "storage_quota": {
                "used": 45.5,
                "total": 100,
                "unit": "GB"
            }
        },
        "notifications": {
            "notify_document_upload": True,
            "notify_workflow": True,
            "notify_share": True,
            "in_app_notify_all": True,
            "digest_frequency": "daily"
        }
    }

@app.put("/api/settings")
async def update_settings(
    settings: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    # In a real app, you would update user settings in a database
    # For this example, we'll just return the updated settings
    return settings

# Template endpoints
@app.get("/api/templates")
async def get_templates(current_user: User = Depends(get_current_user)):
    # In a real app, you would fetch templates from a database
    # For this example, we'll return mock templates
    return [
        {
            "id": "1",
            "name": "Invoice Template",
            "format": "docx",
            "created_at": "2023-09-10T12:00:00Z",
            "updated_at": "2023-09-10T12:00:00Z"
        },
        {
            "id": "2",
            "name": "Contract Template",
            "format": "pdf",
            "created_at": "2023-09-05T10:30:00Z",
            "updated_at": "2023-09-05T10:30:00Z"
        },
        {
            "id": "3",
            "name": "Report Template",
            "format": "xlsx",
            "created_at": "2023-08-20T15:45:00Z",
            "updated_at": "2023-08-20T15:45:00Z"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)