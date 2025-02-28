import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import { format } from 'date-fns';

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
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  encryptDocument: (id: string, secretKey: string) => void;
  decryptDocument: (id: string, secretKey: string) => boolean;
  getDocumentById: (id: string) => Document | undefined;
  searchDocuments: (query: string) => Document[];
  filterDocumentsByTag: (tag: string) => Document[];
}

// Mock encryption/decryption functions
const encryptContent = (content: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(content, secretKey).toString();
};

const decryptContent = (encryptedContent: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Sample documents for demonstration
const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Project Proposal.docx',
    type: 'docx',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    createdAt: format(new Date(2023, 5, 15), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(2023, 6, 20), 'yyyy-MM-dd HH:mm:ss'),
    tags: ['proposal', 'project', 'important'],
    content: 'This is a sample project proposal document content.',
    encrypted: false,
    ownerId: '1',
    accessLevel: 'shared',
    status: 'approved'
  },
  {
    id: '2',
    name: 'Financial Report Q2.pdf',
    type: 'pdf',
    size: 1024 * 1024 * 5.7, // 5.7 MB
    createdAt: format(new Date(2023, 3, 10), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(2023, 3, 10), 'yyyy-MM-dd HH:mm:ss'),
    tags: ['financial', 'report', 'quarterly'],
    encrypted: true,
    ownerId: '1',
    accessLevel: 'private',
    status: 'approved'
  },
  {
    id: '3',
    name: 'Meeting Minutes.txt',
    type: 'txt',
    size: 1024 * 15, // 15 KB
    createdAt: format(new Date(2023, 7, 5), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(2023, 7, 6), 'yyyy-MM-dd HH:mm:ss'),
    tags: ['meeting', 'minutes'],
    content: 'Minutes from the team meeting on August 5th, 2023.',
    encrypted: false,
    ownerId: '1',
    accessLevel: 'public',
    status: 'approved'
  },
  {
    id: '4',
    name: 'Product Roadmap.xlsx',
    type: 'xlsx',
    size: 1024 * 1024 * 1.2, // 1.2 MB
    createdAt: format(new Date(2023, 6, 28), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(2023, 7, 15), 'yyyy-MM-dd HH:mm:ss'),
    tags: ['product', 'roadmap', 'planning'],
    encrypted: false,
    ownerId: '1',
    accessLevel: 'shared',
    status: 'draft'
  },
  {
    id: '5',
    name: 'Legal Contract.pdf',
    type: 'pdf',
    size: 1024 * 1024 * 3.8, // 3.8 MB
    createdAt: format(new Date(2023, 4, 12), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(2023, 4, 12), 'yyyy-MM-dd HH:mm:ss'),
    tags: ['legal', 'contract', 'confidential'],
    encrypted: true,
    ownerId: '1',
    accessLevel: 'private',
    status: 'pending'
  }
];

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: sampleDocuments,
  isLoading: false,
  error: null,
  
  addDocument: (doc) => {
    const newDoc: Document = {
      ...doc,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    set((state) => ({
      documents: [...state.documents, newDoc]
    }));
  },
  
  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) => 
        doc.id === id 
          ? { 
              ...doc, 
              ...updates, 
              updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
            } 
          : doc
      )
    }));
  },
  
  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id)
    }));
  },
  
  encryptDocument: (id, secretKey) => {
    const { documents } = get();
    const document = documents.find((doc) => doc.id === id);
    
    if (document && document.content && !document.encrypted) {
      const encryptedContent = encryptContent(document.content, secretKey);
      
      set((state) => ({
        documents: state.documents.map((doc) => 
          doc.id === id 
            ? { 
                ...doc, 
                content: encryptedContent, 
                encrypted: true,
                updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
              } 
            : doc
        )
      }));
    }
  },
  
  decryptDocument: (id, secretKey) => {
    const { documents } = get();
    const document = documents.find((doc) => doc.id === id);
    
    if (document && document.content && document.encrypted) {
      try {
        const decryptedContent = decryptContent(document.content, secretKey);
        
        set((state) => ({
          documents: state.documents.map((doc) => 
            doc.id === id 
              ? { 
                  ...doc, 
                  content: decryptedContent, 
                  encrypted: false,
                  updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') 
                } 
              : doc
          )
        }));
        
        return true;
      } catch (error) {
        return false;
      }
    }
    
    return false;
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