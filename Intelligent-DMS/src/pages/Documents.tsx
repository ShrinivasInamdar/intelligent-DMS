import React, { useState } from 'react';
import { 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Trash2, 
  Download, 
  Share2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useDocumentStore, Document } from '../stores/documentStore';
import { UploadModal } from '../components/UploadModal';

export const Documents = () => {
  const { documents, deleteDocument } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Filter documents based on search query and selected filter
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter) {
      if (selectedFilter === 'encrypted') {
        return matchesSearch && doc.encrypted;
      } else if (selectedFilter === 'shared') {
        return matchesSearch && doc.accessLevel === 'shared';
      } else if (selectedFilter === 'private') {
        return matchesSearch && doc.accessLevel === 'private';
      } else if (selectedFilter === 'public') {
        return matchesSearch && doc.accessLevel === 'public';
      } else if (selectedFilter === 'pending') {
        return matchesSearch && doc.status === 'pending';
      } else if (selectedFilter === 'approved') {
        return matchesSearch && doc.status === 'approved';
      } else if (selectedFilter === 'draft') {
        return matchesSearch && doc.status === 'draft';
      } else {
        // Filter by file type
        return matchesSearch && doc.type === selectedFilter;
      }
    }
    
    return matchesSearch;
  });
  
  // Get unique document types for filter
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Get status badge for document
  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="mr-1 h-3 w-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your documents
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              id="filter-menu-button"
              aria-expanded="true"
              aria-haspopup="true"
            >
              <Filter className="mr-2 h-5 w-5 text-gray-400" />
              {selectedFilter ? `Filter: ${selectedFilter}` : 'Filter'}
            </button>
          </div>
          
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="filter-menu-button">
              <button
                onClick={() => setSelectedFilter(null)}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                All Documents
              </button>
              <button
                onClick={() => setSelectedFilter('encrypted')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Encrypted
              </button>
              <button
                onClick={() => setSelectedFilter('shared')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Shared
              </button>
              <button
                onClick={() => setSelectedFilter('private')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Private
              </button>
              <button
                onClick={() => setSelectedFilter('public')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Public
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Pending Approval
              </button>
              <button
                onClick={() => setSelectedFilter('approved')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Approved
              </button>
              <button
                onClick={() => setSelectedFilter('draft')}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                Drafts
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">File Types</div>
              {documentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  role="menuitem"
                >
                  .{type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Document List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <li key={document.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">{document.name}</p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="truncate">
                              {formatFileSize(document.size)} • {document.updatedAt}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {document.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {document.encrypted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Lock className="mr-1 h-3 w-3" />
                              Encrypted
                            </span>
                          )}
                          {getStatusBadge(document.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title={document.encrypted ? "Decrypt" : "Encrypt"}
                      >
                        {document.encrypted ? (
                          <Unlock className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteDocument(document.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 sm:px-6 text-center">
              <p className="text-gray-500">No documents found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </li>
          )}
        </ul>
      </div>
      
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
};