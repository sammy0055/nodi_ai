import React from 'react';
import { FiAlertTriangle, FiNavigation, FiMapPin, FiGlobe, FiCompass } from 'react-icons/fi';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Error header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="text-[180px] md:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-300 leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[180px] md:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 leading-none">
                404
              </div>
            </div>
            {/* Floating icon */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
              <FiAlertTriangle className="text-red-500" size={28} />
            </div>
          </div>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-full border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium tracking-wide">PAGE NOT FOUND</span>
          </div>
        </div>

        {/* Central content card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FiNavigation className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Navigation Error</h2>
                  <p className="text-sm text-gray-600">Destination unreachable</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side - Illustration */}
              <div className="relative">
                <div className="relative h-64 md:h-80 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                  {/* Compass illustration */}
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
                    <div className="absolute inset-8 border-2 border-gray-300 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform -translate-x-1/2"></div>
                    
                    {/* Center point */}
                    <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    
                    {/* Direction indicators */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-2">
                      <span className="text-xs font-bold text-gray-700">N</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-2">
                      <span className="text-xs font-bold text-gray-700">S</span>
                    </div>
                  </div>
                  
                  {/* Floating icons */}
                  <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center">
                    <FiMapPin className="text-blue-600" size={20} />
                  </div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center">
                    <FiGlobe className="text-green-600" size={20} />
                  </div>
                </div>
                
                {/* Floating text */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">Looking for direction...</span>
                </div>
              </div>

              {/* Right side - Message */}
              <div className="lg:pl-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Lost in Digital Space
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600 leading-relaxed">
                      The coordinates you've entered don't match any known destination in our system.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      This page may have drifted into orbit or been removed during a recent update.
                    </p>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Path Status</span>
                    </div>
                    <span className="font-medium text-red-600">UNREACHABLE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Navigation</span>
                    </div>
                    <span className="font-medium text-yellow-600">REDIRECTING</span>
                  </div>
                </div>

                {/* Technical details */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <FiCompass className="text-gray-500 mr-2" size={16} />
                    <span className="text-sm font-medium text-gray-700">Technical Details</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-32">Error Code:</span>
                      <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded">404_NOT_FOUND</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-32">Timestamp:</span>
                      <span className="text-gray-800">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-32">Protocol:</span>
                      <span className="text-gray-800">HTTP/1.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative footer */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">System status: Operational</span>
              </div>
              <div className="text-sm text-gray-500">
                Request ID: <span className="font-mono">404-{Date.now().toString(36).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-gray-400">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm">The destination remains elusive</span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotFoundPage };