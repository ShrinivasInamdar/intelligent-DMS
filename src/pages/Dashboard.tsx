import React, { useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Tag, 
  Lock, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  BarChart,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';

export const Dashboard = () => {
  const { documents, fetchDocuments, isLoading } = useDocumentStore();
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Calculate statistics
  const totalDocuments = documents.length;
  const encryptedDocuments = documents.filter(doc => doc.encrypted).length;
  const sharedDocuments = documents.filter(doc => doc.accessLevel === 'shared').length;
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length;
  
  // Get recent documents (last 5)
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Get all unique tags
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));
  
  // Get document counts by type
  const documentTypes = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/[0.2]"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-blue-100">
            Welcome to your document management system
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">{totalDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-2">
            <div className="text-xs text-blue-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>12% increase this month</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Encrypted Documents
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">{encryptedDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-2">
            <div className="text-xs text-purple-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{Math.round((encryptedDocuments / totalDocuments) * 100) || 0}% of total documents</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Shared Documents
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">{sharedDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-2">
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>3 new shares this week</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">{pendingDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 px-5 py-2">
            <div className="text-xs text-amber-600 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>2 require urgent attention</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Documents */}
      <div className="bg-white shadow-md rounded-xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Documents
          </h3>
          <a href="/documents" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
            View all
          </a>
        </div>
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentDocuments.length > 0 ? (
                recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-blue-600">{doc.name}</div>
                            <div className="text-xs text-gray-500">
                              Updated {doc.updatedAt}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.encrypted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Lock className="mr-1 h-3 w-3" />
                              Encrypted
                            </span>
                          )}
                          {doc.status === 'approved' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approved
                            </span>
                          )}
                          {doc.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </span>
                          )}
                          {doc.status === 'rejected' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-4 text-center">
                  <p className="text-gray-500">No documents found.</p>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      
      {/* Document Types and Tags */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Document Types */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Document Types
            </h3>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ul className="space-y-4">
                {Object.entries(documentTypes).map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">.{type}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(count / totalDocuments) * 100}%` }}
                        ></div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {count} document{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Popular Tags
            </h3>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
                  >
                    <Tag className="mr-1 h-4 w-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};