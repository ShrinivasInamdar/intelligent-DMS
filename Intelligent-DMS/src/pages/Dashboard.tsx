import React from 'react';
import { 
  FileText, 
  Clock, 
  Tag, 
  Lock, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';

export const Dashboard = () => {
  const { documents } = useDocumentStore();
  
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your document management system
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Encrypted Documents
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{encryptedDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Shared Documents
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{sharedDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{pendingDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Documents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Documents
          </h3>
        </div>
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentDocuments.map((doc) => (
              <li key={doc.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">{doc.name}</div>
                        <div className="text-sm text-gray-500">
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
            ))}
          </ul>
        </div>
      </div>
      
      {/* Document Types and Tags */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Document Types */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Document Types
            </h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {Object.entries(documentTypes).map(([type, count]) => (
                <li key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">.{type}</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {count} document{count !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Tags */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Popular Tags
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                >
                  <Tag className="mr-1 h-4 w-4" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};