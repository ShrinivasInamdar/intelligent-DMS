from flask import Flask, request, jsonify, g, send_file, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import uuid
import json
import pytesseract
from PIL import Image
import io
import shutil
import typesense
import pypandoc
import PyPDF2
from google import genai
import re
# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


API_KEY = "AIzaSyDyfZKL2aJ42eQxoIlItz-U_8sUbv8--4Q"

gemi = genai.Client(api_key=API_KEY)


# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dms.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Models
class Workflow_new(db.Model):
    id = db.Column(db.String(36),primary_key=True)
    content = db.Column(db.Text)

    def to_dict(self):
        return {
            "content": self.content
        }
    
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, manager, user
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    documents = db.relationship('Document', backref='owner', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Document(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    tags = db.Column(db.String(500), default='[]')  # JSON string of tags
    encrypted = db.Column(db.Boolean, default=False)
    access_level = db.Column(db.String(20), nullable=False)  # private, shared, public
    status = db.Column(db.String(20), nullable=False)  # draft, pending, approved, rejected
    owner_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=True)
    thumbnail = db.Column(db.String(255), nullable=True)
    file_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'size': self.size,
            'tags': json.loads(self.tags),
            'encrypted': self.encrypted,
            'access_level': self.access_level,
            'status': self.status,
            'owner_id': self.owner_id,
            'content': self.content,
            'thumbnail': self.thumbnail,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WorkflowStep(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # pending, in_progress, completed, rejected
    assignee = db.Column(db.String(120), nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    workflow_id = db.Column(db.String(36), db.ForeignKey('workflow.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'assignee': self.assignee,
            'due_date': self.due_date.isoformat() if self.due_date else None
        }

class Workflow(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # active, draft, completed
    assignees = db.Column(db.String(500), default='[]')  # JSON string of assignees
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    steps = db.relationship('WorkflowStep', backref='workflow', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'assignees': json.loads(self.assignees),
            'steps': [step.to_dict() for step in self.steps],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Create database tables
with app.app_context():
    db.create_all()
    
    # Add default users if they don't exist
    admin_user = User.query.filter_by(email='admin@example.com').first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            email='admin@example.com',
            name='Admin User',
            role='admin'
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        
    regular_user = User.query.filter_by(email='user@example.com').first()
    if not regular_user:
        regular_user = User(
            id=str(uuid.uuid4()),
            email='user@example.com',
            name='Regular User',
            role='user'
        )
        regular_user.set_password('user123')
        db.session.add(regular_user)
        
    db.session.commit()

# Simple authentication middleware
def authenticate(f):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        user_id = auth_header.split(' ')[1]
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper

# Authentication routes
@app.route('/api/token', methods=['POST'])
def login():
    data = request.json
    email = data.get('username')  # Using username to match the frontend
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Simple token (just the user ID)
    return jsonify({
        'access_token': user.id,
        'token_type': 'bearer'
    })

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    role = data.get('role')
    password = data.get('password')
    
    if not email or not name or not role or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        name=name,
        role=role
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict())

@app.route('/api/users/me', methods=['GET'])
@authenticate
def get_current_user():
    return jsonify(g.current_user.to_dict())

# Document routes
@app.route('/api/documents', methods=['POST'])
@authenticate
def create_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    tags = json.loads(request.form.get('tags', '[]'))
    access_level = request.form.get('access_level', 'private')
    encrypt = request.form.get('encrypt', 'false').lower() == 'true'

    # Generate unique filename
    filename = secure_filename(file.filename)
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(filename)[1]
    unique_filename = f"{file_id}{file_ext}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

    # Save file
    file.save(file_path)

    # Get file info
    file_size = os.path.getsize(file_path)
    file_type = file_ext[1:] if file_ext else ''

    # Extract text content if possible
    content = None
    if file_type.lower() in ['doc', 'docx']:
        content = pypandoc.convert_file(file_path, 'rst')
    elif file_type.lower() in ['jpg', 'jpeg', 'png']:
        try:
            image = Image.open(file_path).convert("RGB")
            content = pytesseract.image_to_string(image)
            with open(file_path+".txt","w") as f:
                f.write(content)
        except Exception as e:
            content = f"Error extracting text: {str(e)}"
    elif file_type.lower() == 'pdf':
        with open(file_path, 'rb') as pf:
            pdfreader = PyPDF2.PdfReader(pf)
            text = ''
            for i in range(len(pdfreader.pages)):
                page = pdfreader.pages[i]
                text += page.extract_text() or ''
            content = text
    elif file_type.lower() == 'txt':
        with open(file_path, 'r') as p:
            content = p.read()

    # Create document record
    document = Document(
        id=file_id,
        name=filename,
        type=file_type,
        size=file_size,
        tags=json.dumps(tags),
        encrypted=encrypt,
        access_level=access_level,
        status='pending',
        owner_id=g.current_user.id,
        content=content,
        file_path=file_path
    )

    db.session.add(document)
    db.session.commit()

    # Use Gemini to extract project details
    gemresponse = gemi.models.generate_content(
    model="gemini-2.0-flash",
    contents=(
        "Extract and return only the project title and deadline events with their respective dates. Ignore any other information, including random or irrelevant text. If there are code snippets, return false. If no valid project title is found or no deadlines, return false. Ensure the extracted data is structured clearly. " 
        + content
    ),
)
    raw_gemini_output = gemresponse.text
    print("Gemini response:", raw_gemini_output)

# (Optionally) Remove Markdown-style code blocks if present
   
# For this example, we’ll simply store the full structured_output as text.
    if raw_gemini_output.strip().lower() == "false":
        response_data = {
        'document': document.to_dict()
    }
        return response_data

    structured_output = re.sub(r"```json|```", "", raw_gemini_output).strip()

    workflow_new_record = Workflow_new(
        id=str(uuid.uuid4()),
        content=structured_output  # Save the entire structured output as plain text
    )
    db.session.add(workflow_new_record)
    db.session.commit()

    # Only create a workflow record if valid data is available
    
    # Prepare response
    response_data = {
        'document': document.to_dict()
    }
   

    return jsonify(response_data)

@app.route('/api/workflow_news', methods=['GET'])
def get_workflow_news():
    workflows = Workflow_new.query.all()  # Replace with your actual DB query
    
    raw_response = ""
    for workflow in workflows:
        raw_response += f"{workflow.content}\n"
        raw_response += "\n"  # extra newline between records
    print(raw_response)

    return Response(raw_response, status=200, mimetype='text/plain')

@app.route('/api/documents', methods=['GET'])
@authenticate
def get_documents():
    search = request.args.get('search')
    tags = request.args.getlist('tags')
    file_type = request.args.get('file_type')
    access_level = request.args.get('access_level')
    status = request.args.get('status')
    encrypted = request.args.get('encrypted')
    
    # Start with base query
    query = Document.query
    
    # Filter by owner or public/shared access
    query = query.filter(
        (Document.owner_id == g.current_user.id) | 
        (Document.access_level != 'private')
    )
    
    # Apply filters
    if search:
        query = query.filter(
            (Document.name.ilike(f'%{search}%')) | 
            (Document.content.ilike(f'%{search}%'))
        )
    
    if file_type:
        query = query.filter_by(type=file_type)
    
    if access_level:
        query = query.filter_by(access_level=access_level)
    
    if status:
        query = query.filter_by(status=status)
    
    if encrypted is not None:
        encrypted_bool = encrypted.lower() == 'true'
        query = query.filter_by(encrypted=encrypted_bool)
    
    # Filter by tags (more complex since tags are stored as JSON)
    if tags:
        for tag in tags:
            query = query.filter(Document.tags.like(f'%{tag}%'))
    
    documents = query.all()
    return jsonify([doc.to_dict() for doc in documents])

@app.route('/api/documents/<document_id>', methods=['GET'])
@authenticate
def get_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has access
    if document.owner_id != g.current_user.id and document.access_level == 'private':
        return jsonify({'error': 'You do not have permission to access this document'}), 403
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/download', methods=['GET'])
@authenticate
def download_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has access
    if document.owner_id != g.current_user.id and document.access_level == 'private':
        return jsonify({'error': 'You do not have permission to access this document'}), 403
    
    return send_file(document.file_path, as_attachment=True, download_name=document.name)

@app.route('/api/documents/<document_id>', methods=['PUT'])
@authenticate
def update_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has permission
    if document.owner_id != g.current_user.id and g.current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to update this document'}), 403
    
    data = request.json
    
    # Update allowed fields
    if 'name' in data:
        document.name = data['name']
    
    if 'tags' in data:
        document.tags = json.dumps(data['tags'])
    
    if 'access_level' in data:
        document.access_level = data['access_level']
    
    if 'status' in data:
        document.status = data['status']
    
    if 'encrypted' in data:
        document.encrypted = data['encrypted']
    
    db.session.commit()
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>', methods=['DELETE'])
@authenticate
def delete_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has permission
    if document.owner_id != g.current_user.id and g.current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to delete this document'}), 403
    
    # Delete the file
    try:
        os.remove(document.file_path)
    except:
        pass  # Ignore if file doesn't exist
    
    # Delete the document record
    db.session.delete(document)
    db.session.commit()
    
    return '', 204

@app.route('/api/documents/<document_id>/encrypt', methods=['POST'])
@authenticate
def encrypt_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has permission
    if document.owner_id != g.current_user.id and g.current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to encrypt this document'}), 403
    
    # In a real app, you would encrypt the document content
    # For this example, we'll just mark it as encrypted
    document.encrypted = True
    db.session.commit()
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/decrypt', methods=['POST'])
@authenticate
def decrypt_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has permission
    if document.owner_id != g.current_user.id and g.current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to decrypt this document'}), 403
    
    # In a real app, you would decrypt the document content
    # For this example, we'll just mark it as not encrypted
    document.encrypted = False
    db.session.commit()
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/share', methods=['POST'])
@authenticate
def share_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Check if user has permission
    if document.owner_id != g.current_user.id and g.current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to share this document'}), 403
    
    # Update access level to shared if it's private
    if document.access_level == 'private':
        document.access_level = 'shared'
        db.session.commit()
    
    return '', 204

# Workflow routes
@app.route('/api/workflows', methods=['POST'])
@authenticate
def create_workflow():
    data = request.json
    
    workflow_id = str(uuid.uuid4())
    
    # Create workflow
    workflow = Workflow(
        id=workflow_id,
        name=data['name'],
        description=data['description'],
        status=data['status'],
        assignees=json.dumps(data.get('assignees', []))
    )
    
    db.session.add(workflow)
    
    # Create workflow steps
    for step_data in data.get('steps', []):
        step = WorkflowStep(
            id=str(uuid.uuid4()),
            name=step_data['name'],
            description=step_data['description'],
            status=step_data['status'],
            assignee=step_data.get('assignee'),
            due_date=datetime.fromisoformat(step_data['due_date']) if step_data.get('due_date') else None,
            workflow_id=workflow_id
        )
        db.session.add(step)
    
    db.session.commit()
    
    return jsonify(workflow.to_dict())

@app.route('/api/workflows', methods=['GET'])
@authenticate
def get_workflows():
    status = request.args.get('status')
    
    query = Workflow.query
    
    if status:
        query = query.filter_by(status=status)
    
    workflows = query.all()
    return jsonify([workflow for workflow in workflows])

@app.route('/api/workflows/<workflow_id>', methods=['GET'])
@authenticate
def get_workflow(workflow_id):
    workflow = Workflow.query.get_or_404(workflow_id)
    return jsonify(workflow.to_dict())

@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
@authenticate
def update_workflow(workflow_id):
    workflow = Workflow.query.get_or_404(workflow_id)
    data = request.json
    
    # Update workflow fields
    if 'name' in data:
        workflow.name = data['name']
    
    if 'description' in data:
        workflow.description = data['description']
    
    if 'status' in data:
        workflow.status = data['status']
    
    if 'assignees' in data:
        workflow.assignees = json.dumps(data['assignees'])
    
    # Update steps if provided
    if 'steps' in data:
        # Delete existing steps
        WorkflowStep.query.filter_by(workflow_id=workflow_id).delete()
        
        # Create new steps
        for step_data in data['steps']:
            step = WorkflowStep(
                id=str(uuid.uuid4()),
                name=step_data['name'],
                description=step_data['description'],
                status=step_data['status'],
                assignee=step_data.get('assignee'),
                due_date=datetime.fromisoformat(step_data['due_date']) if step_data.get('due_date') else None,
                workflow_id=workflow_id
            )
            db.session.add(step)
    
    db.session.commit()
    
    return jsonify(workflow.to_dict())

@app.route('/api/workflows/<workflow_id>/steps/<step_id>', methods=['PUT'])
@authenticate
def update_workflow_step(workflow_id, step_id):
    step = WorkflowStep.query.filter_by(id=step_id, workflow_id=workflow_id).first_or_404()
    data = request.json
    
    # Update step fields
    if 'name' in data:
        step.name = data['name']
    
    if 'description' in data:
        step.description = data['description']
    
    if 'status' in data:
        step.status = data['status']
    
    if 'assignee' in data:
        step.assignee = data['assignee']
    
    if 'due_date' in data:
        step.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    
    db.session.commit()
    
    return jsonify(step.to_dict())

@app.route('/api/workflows/<workflow_id>', methods=['DELETE'])
@authenticate
def delete_workflow(workflow_id):
    workflow = Workflow.query.get_or_404(workflow_id)
    
    db.session.delete(workflow)
    db.session.commit()
    
    return '', 204

# Dashboard routes
@app.route('/api/dashboard/stats', methods=['GET'])
@authenticate
def get_dashboard_stats():
    # Count documents
    total_documents = Document.query.count()
    encrypted_documents = Document.query.filter_by(encrypted=True).count()
    shared_documents = Document.query.filter_by(access_level='shared').count()
    pending_documents = Document.query.filter_by(status='pending').count()
    
    # Get document counts by type
    document_types = {}
    for doc in Document.query.all():
        doc_type = doc.type
        if doc_type in document_types:
            document_types[doc_type] += 1
        else:
            document_types[doc_type] = 1
    
    # Get all unique tags
    all_tags = set()
    for doc in Document.query.all():
        all_tags.update(json.loads(doc.tags))
    
    return jsonify({
        'total_documents': total_documents,
        'encrypted_documents': encrypted_documents,
        'shared_documents': shared_documents,
        'pending_documents': pending_documents,
        'document_types': document_types,
        'all_tags': list(all_tags)
    })

@app.route('/api/dashboard/recent-documents', methods=['GET'])
@authenticate
def get_recent_documents():
    limit = request.args.get('limit', 5, type=int)
    
    # Get documents accessible to the user
    query = Document.query.filter(
        (Document.owner_id == g.current_user.id) | 
        (Document.access_level != 'private')
    )
    
    # Sort by updated_at (most recent first) and limit results
    recent_docs = query.order_by(Document.updated_at.desc()).limit(limit).all()
    
    return jsonify([doc.to_dict() for doc in recent_docs])

# Settings routes
@app.route('/api/settings', methods=['GET'])
@authenticate
def get_settings():
    # In a real app, you would fetch user settings from a database
    # For this example, we'll return mock settings
    return jsonify({
        'general': {
            'company_name': 'Acme Inc.',
            'admin_email': 'admin@example.com',
            'language': 'en',
            'timezone': 'UTC'
        },
        'security': {
            'password_expiry': True,
            'complex_password': True,
            'enable_2fa': False,
            'default_encryption': True,
            'encryption_algorithm': 'AES-256'
        },
        'storage': {
            'storage_location': 'local',
            'backup_frequency': 'daily',
            'backup_retention': '30 days',
            'storage_quota': {
                'used': 45.5,
                'total': 100,
                'unit': 'GB'
            }
        },
        'notifications': {
            'notify_document_upload': True,
            'notify_workflow': True,
            'notify_share': True,
            'in_app_notify_all': True,
            'digest_frequency': 'daily'
        }
    })

@app.route('/api/settings', methods=['PUT'])
@authenticate
def update_settings():
    # In a real app, you would update user settings in a database
    # For this example, we'll just return the updated settings
    return jsonify(request.json)

# Template routes
@app.route('/api/templates', methods=['GET'])
@authenticate
def get_templates():
    # In a real app, you would fetch templates from a database
    # For this example, we'll return mock templates
    return jsonify([
        {
            'id': '1',
            'name': 'Invoice Template',
            'format': 'docx',
            'created_at': '2023-09-10T12:00:00Z',
            'updated_at': '2023-09-10T12:00:00Z'
        },
        {
            'id': '2',
            'name': 'Contract Template',
            'format': 'pdf',
            'created_at': '2023-09-05T10:30:00Z',
            'updated_at': '2023-09-05T10:30:00Z'
        },
        {
            'id': '3',
            'name': 'Report Template',
            'format': 'xlsx',
            'created_at': '2023-08-20T15:45:00Z',
            'updated_at': '2023-08-20T15:45:00Z'
        }
    ])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)