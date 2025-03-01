import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Filter, 
  Download, 
  Share2, 
  Lock, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Tag,
  X,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';
import { UploadModal } from '../components/UploadModal';

export const Documents = () => {
  const { documents, fetchDocuments, isLoading, downloadDocument, deleteDocument, approveDocument, rejectDocument } = useDocumentStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  useEffect(() => {
    let results = [...documents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        (doc.content && !doc.encrypted && doc.content.toLowerCase().includes(query)) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedFilter) {
      if (selectedFilter === 'encrypted') {
        results = results.filter(doc => doc.encrypted);
      } else if (selectedFilter === 'shared') {
        results = results.filter(doc => doc.accessLevel === 'shared');
      } else if (selectedFilter === 'private') {
        results = results.filter(doc => doc.accessLevel === 'private');
      } else if (selectedFilter === 'public') {
        results = results.filter(doc => doc.accessLevel === 'public');
      } else if (selectedFilter === 'pending') {
        results = results.filter(doc => doc.status === 'pending');
      } else if (selectedFilter === 'approved') {
        results = results.filter(doc => doc.status === 'approved');
      } else if (selectedFilter === 'draft') {
        results = results.filter(doc => doc.status === 'draft');
      } else if (selectedFilter === 'rejected') {
        results = results.filter(doc => doc.status === 'rejected');
      } else {
        // Filter by file type
        results = results.filter(doc => doc.type === selectedFilter);
      }
    }
    
    setFilteredDocuments(results);
  }, [documents, selectedFilter, searchQuery]);
  
  // Get all unique document types
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Handle document download
  const handleDownload = (id: string) => {
    downloadDocument(id);
  };
  
  // Handle document delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };
  
  // Handle document approval
  const handleApprove = (id: string) => {
    approveDocument(id);
  };
  
  // Handle document rejection
  const handleReject = (id: string) => {
    rejectDocument(id);
  };
  
  // Get status badge for document
  const getStatusBadge = (status: string) => {
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and organize your documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">Status</div>
                <button
                  onClick={() => {
                    setSelectedFilter('pending');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Pending
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
                  Draft
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter('rejected');
                    setShowFilterMenu(false);
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Rejected
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
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Documents
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <div>
            {filteredDocuments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <li key={document.id}>
                    <div className="px-6 py-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <div 
                              className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center cursor-pointer"
                              onClick={() => handleDownload(document.id)}
                            >
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 px-4">
                            <div>
                              <p 
                                className="text-base font-medium text-blue-600 truncate cursor-pointer hover:underline"
                                onClick={() => handleDownload(document.id)}
                              >
                                {document.name}
                              </p>
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
                                  <Tag className="mr-1 h-3 w-3" />
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
                            onClick={() => handleDownload(document.id)}
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
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {document.status === 'pending' && (
                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            onClick={() => handleReject(document.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(document.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No documents found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery || selectedFilter ? 
                    'Try adjusting your search or filter criteria.' : 
                    'Upload your first document to get started.'}
                </p>
                {!searchQuery && !selectedFilter && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
};