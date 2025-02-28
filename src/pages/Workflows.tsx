import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Plus, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Users,
  FileText,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed';
  steps: WorkflowStep[];
  assignees: string[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  assignee?: string;
  dueDate?: string;
}

export const Workflows = () => {
  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Document Approval Process',
      description: 'Standard approval workflow for new documents',
      status: 'active',
      steps: [
        {
          id: '1-1',
          name: 'Initial Review',
          description: 'First review by department manager',
          status: 'completed',
          assignee: 'Jane Smith',
          dueDate: '2023-09-15'
        },
        {
          id: '1-2',
          name: 'Legal Review',
          description: 'Review by legal department',
          status: 'in-progress',
          assignee: 'Robert Johnson',
          dueDate: '2023-09-20'
        },
        {
          id: '1-3',
          name: 'Final Approval',
          description: 'Final approval by executive team',
          status: 'pending',
          assignee: 'Michael Chen',
          dueDate: '2023-09-25'
        }
      ],
      assignees: ['Jane Smith', 'Robert Johnson', 'Michael Chen'],
      createdAt: '2023-09-10',
      updatedAt: '2023-09-16'
    },
    {
      id: '2',
      name: 'Contract Review Process',
      description: 'Workflow for reviewing and approving contracts',
      status: 'active',
      steps: [
        {
          id: '2-1',
          name: 'Initial Draft Review',
          description: 'Review of initial contract draft',
          status: 'completed',
          assignee: 'Sarah Williams',
          dueDate: '2023-09-12'
        },
        {
          id: '2-2',
          name: 'Negotiation Phase',
          description: 'Contract negotiation with counterparty',
          status: 'completed',
          assignee: 'David Miller',
          dueDate: '2023-09-18'
        },
        {
          id: '2-3',
          name: 'Legal Department Review',
          description: 'Final review by legal department',
          status: 'in-progress',
          assignee: 'Robert Johnson',
          dueDate: '2023-09-22'
        },
        {
          id: '2-4',
          name: 'CEO Approval',
          description: 'Final approval by CEO',
          status: 'pending',
          assignee: 'Emily Davis',
          dueDate: '2023-09-28'
        }
      ],
      assignees: ['Sarah Williams', 'David Miller', 'Robert Johnson', 'Emily Davis'],
      createdAt: '2023-09-05',
      updatedAt: '2023-09-18'
    },
    {
      id: '3',
      name: 'New Employee Onboarding',
      description: 'Document collection and processing for new hires',
      status: 'draft',
      steps: [
        {
          id: '3-1',
          name: 'Personal Information Collection',
          description: 'Collect personal information and identification',
          status: 'pending',
          assignee: 'HR Department',
          dueDate: '2023-10-05'
        },
        {
          id: '3-2',
          name: 'Equipment Assignment',
          description: 'Assign and document company equipment',
          status: 'pending',
          assignee: 'IT Department',
          dueDate: '2023-10-07'
        },
        {
          id: '3-3',
          name: 'Training Documentation',
          description: 'Complete and file training certificates',
          status: 'pending',
          assignee: 'Training Department',
          dueDate: '2023-10-15'
        }
      ],
      assignees: ['HR Department', 'IT Department', 'Training Department'],
      createdAt: '2023-09-20',
      updatedAt: '2023-09-20'
    }
  ]);
  
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  
  // Get status badge for workflow step
  const getStatusBadge = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
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
            <X className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };
  
  // Get workflow status badge
  const getWorkflowStatusBadge = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="mr-1 h-3 w-3" />
            Draft
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Check className="mr-1 h-3 w-3" />
            Completed
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
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage document approval workflows
          </p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </button>
      </div>
      
      {/* Workflow List */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <ul className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <li key={workflow.id}>
              <div 
                className="block hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setActiveWorkflow(activeWorkflow === workflow.id ? null : workflow.id)}
              >
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <GitPullRequest className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-base font-medium text-blue-600 truncate">{workflow.name}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      {getWorkflowStatusBadge(workflow.status)}
                      <ChevronRight className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${activeWorkflow === workflow.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {workflow.assignees.length} assignees
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {workflow.steps.length} steps
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        Updated on {workflow.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Workflow Details */}
                {activeWorkflow === workflow.id && (
                  <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Description</h4>
                      <p className="mt-1 text-sm text-gray-600">{workflow.description}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Workflow Steps</h4>
                      <div className="mt-4 flow-root">
                        <ul className="-mb-8">
                          {workflow.steps.map((step, stepIdx) => (
                            <li key={step.id}>
                              <div className="relative pb-8">
                                {stepIdx !== workflow.steps.length - 1 ? (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                      step.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : step.status === 'in-progress' 
                                          ? 'bg-blue-500' 
                                          : step.status === 'rejected' 
                                            ? 'bg-red-500' 
                                            : 'bg-gray-300'
                                    }`}>
                                      {step.status === 'completed' ? (
                                        <Check className="h-5 w-5 text-white" />
                                      ) : step.status === 'rejected' ? (
                                        <X className="h-5 w-5 text-white" />
                                      ) : (
                                        <span className="text-white text-sm font-medium">{stepIdx + 1}</span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                      <p className="text-sm text-gray-500">{step.description}</p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap">
                                      <div className="flex flex-col items-end space-y-1">
                                        {getStatusBadge(step.status)}
                                        {step.assignee && (
                                          <span className="text-gray-600">
                                            Assigned to: {step.assignee}
                                          </span>
                                        )}
                                        {step.dueDate && (
                                          <span className="text-gray-600">
                                            Due: {step.dueDate}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Edit Workflow
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <ArrowRight className="mr-1 h-3 w-3" /> <ArrowRight className="mr-1 h-3 w-3" />
                        Advance Workflow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Workflow Templates */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Workflow Templates
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start with a pre-configured workflow template
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          <li>
            <div className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="flex text-sm">
                    <p className="font-medium text-blue-600 truncate">Document Approval</p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>3-step approval process</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="flex text-sm">
                    <p className="font-medium text-blue-600 truncate">Contract Review</p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>4-step legal review process</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <div className="flex text-sm">
                    <p className="font-medium text-blue-600 truncate">Employee Onboarding</p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>5-step HR document collection</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};