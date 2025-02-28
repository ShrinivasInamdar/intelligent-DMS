import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Download, Upload, Trash2, Lock, Unlock, Share2, Edit } from 'lucide-react';
import api from '../api/api';
import { format } from 'date-fns';

interface AuditRecord {
  id: string;
  document_id: string | null;
  user_id: string;
  action: string;
  timestamp: string;
  details: string | null;
  user_name?: string;
  document_name?: string;
}

export const AuditTrail: React.FC = () => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/audit/trail');
        
        // Fetch user and document details for each audit record
        const records = await Promise.all(
          response.data.map(async (record: AuditRecord) => {
            try {
              // Get user name if available
              if (record.user_id) {
                const userResponse = await api.get(`/users/me`);
                record.user_name = userResponse.data.name;
              }
              
              // Get document name if available
              if (record.document_id) {
                try {
                  const docResponse = await api.get(`/documents/${record.document_id}`);
                  record.document_name = docResponse.data.name;
                } catch (e) {
                  // Document might have been deleted
                  record.document_name = 'Deleted Document';
                }
              }
            } catch (e) {
              // Ignore errors in fetching additional details
            }
            
            return record;
          })
        );
        
        setAuditRecords(records);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch audit trail');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuditTrail();
  }, []);
  
  // Get icon for action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Upload className="h-5 w-5 text-green-500" />;
      case 'update':
        return <Edit className="h-5 w-5 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'download':
        return <Download className="h-5 w-5 text-indigo-500" />;
      case 'encrypt':
        return <Lock className="h-5 w-5 text-purple-500" />;
      case 'decrypt':
        return <Unlock className="h-5 w-5 text-orange-500" />;
      case 'share':
        return <Share2 className="h-5 w-5 text-teal-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all document activities and user actions
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Log</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Comprehensive audit trail of all system activities</p>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading audit records...</p>
          </div>
        ) : auditRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(record.action)}
                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {record.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {record.document_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {record.user_name || record.user_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(record.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {record.details || 'No additional details'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No audit records found</p>
          </div>
        )}
      </div>
    </div>
  );
};