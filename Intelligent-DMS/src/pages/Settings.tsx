import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Bell, 
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your document management system
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <SettingsIcon className="inline-block mr-2 h-5 w-5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Shield className="inline-block mr-2 h-5 w-5" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`${
                activeTab === 'storage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Database className="inline-block mr-2 h-5 w-5" />
              Storage
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Bell className="inline-block mr-2 h-5 w-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FileText className="inline-block mr-2 h-5 w-5" />
              Templates
            </button>
          </nav>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure general system settings
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company-name"
                      id="company-name"
                      defaultValue="Acme Inc."
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="admin-email"
                      id="admin-email"
                      defaultValue="admin@example.com"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Default Language
                  </label>
                  <div className="mt-1">
                    <select
                      id="language"
                      name="language"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <div className="mt-1">
                    <select
                      id="timezone"
                      name="timezone"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time (EST)</option>
                      <option value="CST">Central Time (CST)</option>
                      <option value="MST">Mountain Time (MST)</option>
                      <option value="PST">Pacific Time (PST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure security and access control settings
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password Policy</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="password-expiry"
                          name="password-expiry"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="password-expiry" className="font-medium text-gray-700">
                          Password Expiry
                        </label>
                        <p className="text-gray-500">Require password change every 90 days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="complex-password"
                          name="complex-password"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="complex-password" className="font-medium text-gray-700">
                          Complex Password Requirements
                        </label>
                        <p className="text-gray-500">Require minimum length and special characters</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="enable-2fa"
                          name="enable-2fa"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enable-2fa" className="font-medium text-gray-700">
                          Enable Two-Factor Authentication
                        </label>
                        <p className="text-gray-500">Require 2FA for all users</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Document Encryption</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="default-encryption"
                          name="default-encryption"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="default-encryption" className="font-medium text-gray-700">
                          Default Encryption
                        </label>
                        <p className="text-gray-500">Encrypt all documents by default</p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="encryption-algorithm" className="block text-sm font-medium text-gray-700">
                        Encryption Algorithm
                      </label>
                      <select
                        id="encryption-algorithm"
                        name="encryption-algorithm"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option>AES-256</option>
                        <option>AES-128</option>
                        <option>RSA-2048</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Storage Settings */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Storage Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure storage and backup settings
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Storage Location</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="storage-local"
                        name="storage-location"
                        type="radio"
                        defaultChecked
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="storage-local" className="ml-3 block text-sm font-medium text-gray-700">
                        Local Storage
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="storage-cloud"
                        name="storage-location"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="storage-cloud" className="ml-3 block text-sm font-medium text-gray-700">
                        Cloud Storage
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="storage-hybrid"
                        name="storage-location"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="storage-hybrid" className="ml-3 block text-sm font-medium text-gray-700">
                        Hybrid (Local + Cloud)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Backup Settings</h4>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="backup-frequency" className="block text-sm font-medium text-gray-700">
                        Backup Frequency
                      </label>
                      <select
                        id="backup-frequency"
                        name="backup-frequency"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="backup-retention" className="block text-sm font-medium text-gray-700">
                        Backup Retention Period
                      </label>
                      <select
                        id="backup-retention"
                        name="backup-retention"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                        <option>1 year</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Storage Quota</h4>
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Used: 45.5 GB of 100 GB</span>
                      <span className="text-sm font-medium text-gray-700">45.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure notification preferences
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notify-document-upload"
                          name="notify-document-upload"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notify-document-upload" className="font-medium text-gray-700">
                          Document Uploads
                        </label>
                        <p className="text-gray-500">Receive notifications when documents are uploaded</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notify-workflow"
                          name="notify-workflow"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notify-workflow" className="font-medium text-gray-700">
                          Workflow Updates
                        </label>
                        <p className="text-gray-500">Receive notifications for workflow status changes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notify-share"
                          name="notify-share"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notify-share" className="font-medium text-gray-700">
                          Document Sharing
                        </label>
                        <p className="text-gray-500">Receive notifications when documents are shared with you</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">In-App Notifications</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="in-app-notify-all"
                          name="in-app-notify-all"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="in-app-notify-all" className="font-medium text-gray-700">
                          Enable All In-App Notifications
                        </label>
                        <p className="text-gray-500">Show notifications for all system events</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notification Digest</h4>
                  <div className="mt-4">
                    <label htmlFor="digest-frequency" className="block text-sm font-medium text-gray-700">
                      Email Digest Frequency
                    </label>
                    <select
                      id="digest-frequency"
                      name="digest-frequency"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option>Immediately</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Document Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Document Templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage document templates
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">Available Templates</h4>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Template
                  </button>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    <li>
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="flex text-sm">
                              <p className="font-medium text-blue-600 truncate">Invoice Template</p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>DOCX format</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="flex text-sm">
                              <p className="font-medium text-blue-600 truncate">Contract Template</p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>PDF format</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="flex text-sm">
                              <p className="font-medium text-blue-600 truncate">Report Template</p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>XLSX format</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};