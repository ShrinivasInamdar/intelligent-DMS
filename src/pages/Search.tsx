import React, { useState } from 'react';
import { Search as SearchIcon, FileText, Tag, Filter } from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';

export const Search = () => {
  const { documents, searchDocuments } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(documents);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Get all unique tags
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));
  
  // Get all unique document types
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(documents);
      return;
    }
    
    let results = searchDocuments(searchQuery);
    
    // Apply filters if selected
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
      } else if (allTags.includes(selectedFilter)) {
        results = results.filter(doc => doc.tags.includes(selectedFilter));
      } else if (documentTypes.includes(selectedFilter)) {
        results = results.filter(doc => doc.type === selectedFilter);
      }
    }
    
    setSearchResults(results);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
        <p className="mt-2 text-sm text-gray-600">
          Search for documents by name, content, or metadata
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search by document name, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <button
          onClick={handleSearch}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          Search
        </button>
        
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
                    handleSearch();
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
                    handleSearch();
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
                    handleSearch();
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
                    handleSearch();
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
                    handleSearch();
                  }}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  Public
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">Tags</div>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedFilter(tag);
                      setShowFilterMenu(false);
                      handleSearch();
                    }}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    {tag}
                  </button>
                ))}
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">File Types</div>
                {documentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedFilter(type);
                      setShowFilterMenu(false);
                      handleSearch();
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
      
      {/* Search Results */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Search Results
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchResults.length} document{searchResults.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {searchResults.length > 0 ? (
            searchResults.map((document) => (
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
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        {document.content && !document.encrypted && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {document.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-8 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <SearchIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No documents found matching your search criteria.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};