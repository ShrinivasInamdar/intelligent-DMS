import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, Tag as TagIcon } from 'lucide-react';
import { useDocumentStore } from '../stores/documentStore';

interface UploadModalProps {
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
  const { addDocument } = useDocumentStore();
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [accessLevel, setAccessLevel] = useState<'private' | 'shared' | 'public'>('private');
  const [encrypt, setEncrypt] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  const handleUpload = () => {
    files.forEach(file => {
      // In a real app, we would upload the file to a server
      // For now, we'll just add it to our store
      addDocument({
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        tags,
        encrypted: encrypt,
        ownerId: '1', // Current user ID
        accessLevel,
        status: 'pending'
      });
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upload Documents
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 text-center ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs text-gray-500">
                Supported file types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
              </p>
            </div>
          </div>
          
          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {files.map((file, index) => (
                  <li key={index} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Document Metadata */}
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center">
                <div className="flex-grow relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="tags"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add tags..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                      >
                        <span className="sr-only">Remove {tag}</span>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="access" className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select
                id="access"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as any)}
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="public">Public</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="encrypt"
                name="encrypt"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
              />
              <label htmlFor="encrypt" className="ml-2 block text-sm text-gray-700">
                Encrypt document
              </label>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};