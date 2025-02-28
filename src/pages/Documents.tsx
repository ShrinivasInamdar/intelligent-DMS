import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useDocumentStore, Document } from '../stores/documentStore';
import { UploadModal } from '../components/UploadModal';
import { useAuthStore } from '../stores/authStore';

export const Documents = () => {
  const { documents, fetchDocuments, deleteDocument, approveDocument, rejectDocument, isLoading } = useDocumentStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
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

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/[0.2]"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Documents</h1>
            <p className="mt-2 text-blue-100">
              Manage and organize your documents
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              id="filter-menu-button"
              aria-expanded={showFilterMenu}
              aria-haspopup="true"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="mr-2 h-5 w-5 text-gray-400" />
              {selectedFilter ? `Filter: ${selectedFilter}` : 'Filter'}
            </button>
          </div>
          
          {showFilterMenu && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="filter-menu-button">
                <button
                  onClick={() => {
                    setSelectedFilter(null);
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  All Documents
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('encrypted');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Encrypted
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('shared');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Shared
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('private');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Private
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('public');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Public
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('pending');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Pending Approval
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('approved');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Approved
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('draft');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Drafts
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">File Types</div>
                {documentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedFilter(type);
                      setShowFilterMenu(false);
                    }}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    .{type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Document List */}
      <div className="bg-white shadow-md overflow-hidden sm:rounded-xl">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <li key={document.id}>
                  <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <p className="text-base font-medium text-blue-600 truncate">{document.name}</p>
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
                        {/* Admin approval buttons for pending documents */}
                        {isAdmin && document.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveDocument(document.id)}
                              className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-50 transition-colors"
                              title="Approve Document"
                            >
                              <ThumbsUp className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => rejectDocument(document.id)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Reject Document"
                            >
                              <ThumbsDown className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-50 transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-purple-500 rounded-full hover:bg-purple-50 transition-colors"
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
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
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
              <li className="px-6 py-8 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No documents found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload a Document
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
      
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
};