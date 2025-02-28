import { create } from 'zustand';
import { format } from 'date-fns';
import api from '../api/api';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  content?: string;
  encrypted: boolean;
  ownerId: string;
  accessLevel: 'private' | 'shared' | 'public';
  requiredPrivilege: 'user' | 'manager' | 'admin';
  thumbnail?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: FormData) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  encryptDocument: (id: string, secretKey: string) => Promise<void>;
  decryptDocument: (id: string, secretKey: string) => Promise<boolean>;
  approveDocument: (id: string) => Promise<void>;
  rejectDocument: (id: string) => Promise<void>;
  getDocumentById: (id: string) => Document | undefined;
  searchDocuments: (query: string) => Document[];
  filterDocumentsByTag: (tag: string) => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/documents');
      
      // Transform the response data to match our Document interface
      const documents = response.data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        tags: doc.tags,
        content: doc.content,
        encrypted: doc.encrypted,
        ownerId: doc.owner_id,
        accessLevel: doc.access_level,
        requiredPrivilege: doc.required_privilege || 'user',
        thumbnail: doc.thumbnail,
        status: doc.status
      }));
      
      set({ documents, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to fetch documents'
      });
    }
  },
  
  addDocument: async (formData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newDoc = {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        size: response.data.size,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        tags: response.data.tags,
        content: response.data.content,
        encrypted: response.data.encrypted,
        ownerId: response.data.owner_id,
        accessLevel: response.data.access_level,
        requiredPrivilege: response.data.required_privilege || 'user',
        thumbnail: response.data.thumbnail,
        status: response.data.status
      };
      
      set((state) => ({
        documents: [...state.documents, newDoc],
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to upload document'
      });
    }
  },
  
  updateDocument: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      // Convert frontend model to backend model
      const backendUpdates: any = {};
      
      if (updates.name) backendUpdates.name = updates.name;
      if (updates.tags) backendUpdates.tags = updates.tags;
      if (updates.accessLevel) backendUpdates.access_level = updates.accessLevel;
      if (updates.status) backendUpdates.status = updates.status;
      if (updates.encrypted !== undefined) backendUpdates.encrypted = updates.encrypted;
      if (updates.requiredPrivilege) backendUpdates.required_privilege = updates.requiredPrivilege;
      
      const response = await api.put(`/documents/${id}`, backendUpdates);
      
      // Transform response to frontend model
      const updatedDoc = {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        size: response.data.size,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        tags: response.data.tags,
        content: response.data.content,
        encrypted: response.data.encrypted,
        ownerId: response.data.owner_id,
        accessLevel: response.data.access_level,
        requiredPrivilege: response.data.required_privilege || 'user',
        thumbnail: response.data.thumbnail,
        status: response.data.status
      };
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id ? updatedDoc : doc
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to update document'
      });
    }
  },
  
  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.delete(`/documents/${id}`);
      
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to delete document'
      });
    }
  },
  
  encryptDocument: async (id, secretKey) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/documents/${id}/encrypt`, { secret_key: secretKey });
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                encrypted: true,
                updatedAt: response.data.updated_at
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to encrypt document'
      });
    }
  },
  
  decryptDocument: async (id, secretKey) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/documents/${id}/decrypt`, { secret_key: secretKey });
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                encrypted: false,
                updatedAt: response.data.updated_at
              } 
            : doc
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to decrypt document'
      });
      return false;
    }
  },
  
  approveDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/documents/${id}`, { status: 'approved' });
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                status: 'approved',
                updatedAt: response.data.updated_at
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to approve document'
      });
    }
  },
  
  rejectDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/documents/${id}`, { status: 'rejected' });
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                status: 'rejected',
                updatedAt: response.data.updated_at
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error || 'Failed to reject document'
      });
    }
  },
  
  getDocumentById: (id) => {
    return get().documents.find((doc) => doc.id === id);
  },
  
  searchDocuments: (query) => {
    const { documents } = get();
    const lowerCaseQuery = query.toLowerCase();
    
    return documents.filter((doc) => 
      doc.name.toLowerCase().includes(lowerCaseQuery) || 
      doc.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) ||
      (doc.content && !doc.encrypted && doc.content.toLowerCase().includes(lowerCaseQuery))
    );
  },
  
  filterDocumentsByTag: (tag) => {
    const { documents } = get();
    return documents.filter((doc) => doc.tags.includes(tag));
  }
}));