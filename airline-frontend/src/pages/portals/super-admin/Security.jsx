import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';

const Security = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/overview')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-600" />
                Security & Roles
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage security settings and role-based access control
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security Settings
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Security & Roles Page
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This page is under development. Security and role management features will be available here.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Security;
