import { create } from 'zustand';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuthStore } from './authStore';

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

// API base URL
const API_URL = 'http://localhost:8000/api';

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform API response to match our Document interface
      const documents = response.data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        createdAt: format(new Date(doc.created_at), 'yyyy-MM-dd HH:mm:ss'),
        updatedAt: format(new Date(doc.updated_at), 'yyyy-MM-dd HH:mm:ss'),
        tags: doc.tags,
        content: doc.content,
        encrypted: doc.encrypted,
        ownerId: doc.owner_id,
        accessLevel: doc.access_level,
        thumbnail: doc.thumbnail,
        status: doc.status
      }));
      
      set({ documents, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to fetch documents. Please try again.' 
      });
    }
  },
  
  addDocument: async (formData) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.post(`${API_URL}/documents`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new document to the state
      const newDoc = {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        size: response.data.size,
        createdAt: format(new Date(response.data.created_at), 'yyyy-MM-dd HH:mm:ss'),
        updatedAt: format(new Date(response.data.updated_at), 'yyyy-MM-dd HH:mm:ss'),
        tags: response.data.tags,
        content: response.data.content,
        encrypted: response.data.encrypted,
        ownerId: response.data.owner_id,
        accessLevel: response.data.access_level,
        thumbnail: response.data.thumbnail,
        status: response.data.status
      };
      
      set((state) => ({
        documents: [...state.documents, newDoc],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to upload document. Please try again.' 
      });
    }
  },
  
  updateDocument: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.put(`${API_URL}/documents/${id}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                ...updates, 
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to update document. Please try again.' 
      });
    }
  },
  
  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.delete(`${API_URL}/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to delete document. Please try again.' 
      });
    }
  },
  
  encryptDocument: async (id, secretKey) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.post(`${API_URL}/documents/${id}/encrypt`, 
        { secret_key: secretKey },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                encrypted: true,
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to encrypt document. Please try again.' 
      });
    }
  },
  
  decryptDocument: async (id, secretKey) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.post(`${API_URL}/documents/${id}/decrypt`, 
        { secret_key: secretKey },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                encrypted: false,
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to decrypt document. Please try again.' 
      });
      return false;
    }
  },
  
  approveDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.put(`${API_URL}/documents/${id}`, 
        { status: 'approved' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                status: 'approved',
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to approve document. Please try again.' 
      });
    }
  },
  
  rejectDocument: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.put(`${API_URL}/documents/${id}`, 
        { status: 'rejected' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                status: 'rejected',
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'Failed to reject document. Please try again.' 
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