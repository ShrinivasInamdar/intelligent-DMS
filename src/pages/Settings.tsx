import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Bell, 
  FileText,
  Save,
  RefreshCw,
  Plus
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
          </nav>
        </div>
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company-name"
                    id="company-name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="Acme Inc."
                  />
                </div>
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="admin-email"
                    id="admin-email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="admin@example.com"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Localization</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="UTC"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="MST">Mountain Standard Time (MST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Password Policy</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="password-expiry"
                      name="password-expiry"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="password-expiry" className="font-medium text-gray-700">
                      Password Expiry
                    </label>
                    <p className="text-gray-500">Require users to change passwords every 90 days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="complex-password"
                      name="complex-password"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Two-Factor Authentication</h3>
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Document Encryption</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="default-encryption"
                      name="default-encryption"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="AES-256"
                  >
                    <option value="AES-256">AES-256</option>
                    <option value="AES-128">AES-128</option>
                    <option value="RSA-2048">RSA-2048</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {/* Storage Settings */}
        {activeTab === 'storage' && (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Storage Location</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="storage-location" className="block text-sm font-medium text-gray-700">
                    Primary Storage
                  </label>
                  <select
                    id="storage-location"
                    name="storage-location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="local"
                  >
                    <option value="local">Local Storage</option>
                    <option value="s3">Amazon S3</option>
                    <option value="azure">Azure Blob Storage</option>
                    <option value="gcs">Google Cloud Storage</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Backup Configuration</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="backup-frequency" className="block text-sm font-medium text-gray-700">
                    Backup Frequency
                  </label>
                  <select
                    id="backup-frequency"
                    name="backup-frequency"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="daily"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="backup-retention" className="block text-sm font-medium text-gray-700">
                    Backup Retention
                  </label>
                  <select
                    id="backup-retention"
                    name="backup-retention"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="30 days"
                  >
                    <option value="7 days">7 days</option>
                    <option value="30 days">30 days</option>
                    <option value="90 days">90 days</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Storage Quota</h3>
              <div className="mt-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      45.5 GB used of 100 GB
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      45.5%
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45.5%' }}></div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Increase Quota
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Backup Now
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Email Notifications</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notify-document-upload"
                      name="notify-document-upload"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notify-document-upload" className="font-medium text-gray-700">
                      Document Upload
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
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
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
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">In-App Notifications</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="in-app-notify-all"
                      name="in-app-notify-all"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      defaultChecked
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Digest</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="digest-frequency" className="block text-sm font-medium text-gray-700">
                    Digest Frequency
                  </label>
                  <select
                    id="digest-frequency"
                    name="digest-frequency"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="daily"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};