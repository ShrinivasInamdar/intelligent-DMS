from flask import Flask, request, jsonify, g, send_file
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

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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
    # New field: required_privilege (minimum role required to access this document)
    required_privilege = db.Column(db.String(20), nullable=False, default='user')
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
            'required_privilege': self.required_privilege,
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

# New Model for Audit Trail
class AuditTrail(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    document_id = db.Column(db.String(36), db.ForeignKey('document.id'), nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # e.g., download, create, update, delete, share
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'user_id': self.user_id,
            'action': self.action,
            'timestamp': self.timestamp.isoformat(),
            'details': self.details
        }

# Create database tables
with app.app_context():
    db.create_all()
    
    # Add default admin and regular user if they don't exist
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

# Helper function to check document access based on privilege levels
def can_access_document(document, user):
    role_rank = {'user': 1, 'manager': 2, 'admin': 3}
    # Admin always has access.
    if user.role == 'admin':
        return True
    # Owner always has access.
    if document.owner_id == user.id:
        return True
    # If document is shared or public, allow access.
    if document.access_level in ['shared', 'public']:
        return True
    # Only allow if current user's role is strictly higher than the document's required privilege.
    if role_rank.get(user.role, 0) > role_rank.get(document.required_privilege, 1):
        return True
    return False

# Helper function to log audit events.
def log_audit(action, document_id, details=""):
    audit = AuditTrail(
        id=str(uuid.uuid4()),
        document_id=document_id,
        user_id=g.current_user.id,
        action=action,
        details=details
    )
    db.session.add(audit)
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

# Authentication routes (login remains unchanged)
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

# ===============================
# Admin User Management Endpoints
# ===============================
@app.route('/api/admin/users', methods=['POST'])
@authenticate
def admin_create_user():
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403

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

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@authenticate
def admin_delete_user(user_id):
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required'}), 403
    
    user = User.query.get_or_404(user_id)
    if user.id == g.current_user.id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return '', 204

# ======================
# Document Endpoints
# ======================
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
    # New: Accept required_privilege from form; default to uploader's role if not provided.
    required_privilege = request.form.get('required_privilege', g.current_user.role)
    
    filename = secure_filename(file.filename)
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(filename)[1]
    unique_filename = f"{file_id}{file_ext}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    
    file.save(file_path)
    
    file_size = os.path.getsize(file_path)
    file_type = file_ext[1:] if file_ext else ''
    
    content = None
    if file_type.lower() in ['txt', 'pdf', 'doc', 'docx']:
        content = "Extracted text content would go here"
    elif file_type.lower() in ['jpg', 'jpeg', 'png']:
        try:
            image = Image.open(file_path)
            content = pytesseract.image_to_string(image)
        except Exception as e:
            content = f"Error extracting text: {str(e)}"
    
    document = Document(
        id=file_id,
        name=filename,
        type=file_type,
        size=file_size,
        tags=json.dumps(tags),
        encrypted=encrypt,
        access_level=access_level,
        required_privilege=required_privilege,
        status='pending',
        owner_id=g.current_user.id,
        content=content,
        file_path=file_path
    )
    
    db.session.add(document)
    db.session.commit()
    
    # Log audit trail for document creation
    log_audit("create", document.id, details="Document created.")
    
    return jsonify(document.to_dict())

@app.route('/api/documents', methods=['GET'])
@authenticate
def get_documents():
    # Start with base query applying search filters
    query = Document.query

    search = request.args.get('search')
    tags = request.args.getlist('tags')
    file_type = request.args.get('file_type')
    access_level = request.args.get('access_level')
    status = request.args.get('status')
    encrypted = request.args.get('encrypted')
    
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
    
    # Fix tag search: search for each tag with quotes to match JSON strings.
    if tags:
        for tag in tags:
            query = query.filter(Document.tags.like(f'%"{tag}"%'))
    
    # After query filters, only return documents the current user can access
    all_docs = query.all()
    filtered_docs = [doc for doc in all_docs if can_access_document(doc, g.current_user)]
    
    return jsonify([doc.to_dict() for doc in filtered_docs])

@app.route('/api/documents/<document_id>', methods=['GET'])
@authenticate
def get_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to access this document'}), 403
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/download', methods=['GET'])
@authenticate
def download_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to access this document'}), 403
    
    # Log audit trail for download action.
    log_audit("download", document.id, details="Document downloaded.")
    
    return send_file(document.file_path, as_attachment=True, download_name=document.name)

@app.route('/api/documents/<document_id>', methods=['PUT'])
@authenticate
def update_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to update this document'}), 403
    
    data = request.json
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
    if 'required_privilege' in data:
        document.required_privilege = data['required_privilege']
    
    db.session.commit()
    
    log_audit("update", document.id, details="Document updated.")
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>', methods=['DELETE'])
@authenticate
def delete_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to delete this document'}), 403
    
    try:
        os.remove(document.file_path)
    except:
        pass
    
    db.session.delete(document)
    db.session.commit()
    
    log_audit("delete", document.id, details="Document deleted.")
    
    return '', 204

@app.route('/api/documents/<document_id>/encrypt', methods=['POST'])
@authenticate
def encrypt_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to encrypt this document'}), 403
    
    document.encrypted = True
    db.session.commit()
    
    log_audit("encrypt", document.id, details="Document encrypted.")
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/decrypt', methods=['POST'])
@authenticate
def decrypt_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to decrypt this document'}), 403
    
    document.encrypted = False
    db.session.commit()
    
    log_audit("decrypt", document.id, details="Document decrypted.")
    
    return jsonify(document.to_dict())

@app.route('/api/documents/<document_id>/share', methods=['POST'])
@authenticate
def share_document(document_id):
    document = Document.query.get_or_404(document_id)
    if not can_access_document(document, g.current_user):
        return jsonify({'error': 'You do not have permission to share this document'}), 403
    
    if document.access_level == 'private':
        document.access_level = 'shared'
        db.session.commit()
        log_audit("share", document.id, details="Document shared.")
    
    return '', 204

# ======================
# Workflow Endpoints (unchanged from previous admin-only modifications)
# ======================
@app.route('/api/workflows', methods=['POST'])
@authenticate
def create_workflow():
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required to create workflows'}), 403
    
    data = request.json
    workflow_id = str(uuid.uuid4())
    workflow = Workflow(
        id=workflow_id,
        name=data['name'],
        description=data['description'],
        status=data['status'],
        assignees=json.dumps(data.get('assignees', []))
    )
    db.session.add(workflow)
    
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
    return jsonify([workflow.to_dict() for workflow in workflows])

@app.route('/api/workflows/<workflow_id>', methods=['GET'])
@authenticate
def get_workflow(workflow_id):
    workflow = Workflow.query.get_or_404(workflow_id)
    return jsonify(workflow.to_dict())

@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
@authenticate
def update_workflow(workflow_id):
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required to update workflows'}), 403
    
    workflow = Workflow.query.get_or_404(workflow_id)
    data = request.json
    if 'name' in data:
        workflow.name = data['name']
    if 'description' in data:
        workflow.description = data['description']
    if 'status' in data:
        workflow.status = data['status']
    if 'assignees' in data:
        workflow.assignees = json.dumps(data['assignees'])
    
    if 'steps' in data:
        WorkflowStep.query.filter_by(workflow_id=workflow_id).delete()
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
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required to update workflow steps'}), 403
    
    step = WorkflowStep.query.filter_by(id=step_id, workflow_id=workflow_id).first_or_404()
    data = request.json
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
    if g.current_user.role != 'admin':
        return jsonify({'error': 'Admin privileges required to delete workflows'}), 403
    
    workflow = Workflow.query.get_or_404(workflow_id)
    db.session.delete(workflow)
    db.session.commit()
    return '', 204

# ======================
# Audit Trail Endpoint
# ======================
@app.route('/api/audit/trail', methods=['GET'])
@authenticate
def get_audit_trail():
    # Admin users see all records; others see only their own audit records.
    if g.current_user.role == 'admin':
        audits = AuditTrail.query.all()
    else:
        audits = AuditTrail.query.filter_by(user_id=g.current_user.id).all()
    return jsonify([audit.to_dict() for audit in audits])

# ======================
# Dashboard and Settings Endpoints
# ======================
@app.route('/api/dashboard/stats', methods=['GET'])
@authenticate
def get_dashboard_stats():
    total_documents = Document.query.count()
    encrypted_documents = Document.query.filter_by(encrypted=True).count()
    shared_documents = Document.query.filter_by(access_level='shared').count()
    pending_documents = Document.query.filter_by(status='pending').count()
    
    document_types = {}
    for doc in Document.query.all():
        doc_type = doc.type
        document_types[doc_type] = document_types.get(doc_type, 0) + 1
    
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
    docs = Document.query.order_by(Document.updated_at.desc()).limit(limit).all()
    # Only return documents that the current user can access.
    accessible_docs = [doc for doc in docs if can_access_document(doc, g.current_user)]
    return jsonify([doc.to_dict() for doc in accessible_docs])

@app.route('/api/settings', methods=['GET'])
@authenticate
def get_settings():
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
    return jsonify(request.json)

@app.route('/api/templates', methods=['GET'])
@authenticate
def get_templates():
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