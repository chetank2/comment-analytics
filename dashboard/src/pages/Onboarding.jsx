import { useState } from 'react';
import { Link } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to CreatorComment Compass
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get you set up in just a few steps
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Start</span>
          <span>Install</span>
          <span>Connect</span>
          <span>Done</span>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Step 1: Introduction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Welcome!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  CreatorComment Compass helps you analyze YouTube comments to improve your content
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Analyze Comments</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Extract insights from your YouTube video comments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Categorize Automatically</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      AI categorizes comments by sentiment, questions, suggestions, and more
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Get Content Ideas</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Generate new video ideas based on what your audience is asking for
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={nextStep}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Install Extension */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Install the Extension</h3>
                <p className="mt-1 text-sm text-gray-500">
                  First, you'll need to install our Chrome extension
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <img
                    src="https://www.google.com/chrome/static/images/chrome-logo.svg"
                    alt="Chrome"
                    className="h-10 w-10 mr-4"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Chrome Extension</h4>
                    <p className="text-xs text-gray-500">
                      Works with Google Chrome and other Chromium-based browsers
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <a
                    href="#"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Add to Chrome
                  </a>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    I've Installed It
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Connect YouTube */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Connect Your YouTube Channel</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sign in with Google to connect your YouTube channel
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                  <li>Open the extension by clicking its icon in your browser toolbar</li>
                  <li>Click "Sign in with Google"</li>
                  <li>Allow the requested permissions</li>
                  <li>You'll be automatically connected to this dashboard</li>
                </ol>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    I've Connected
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Ready to Go */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">You're All Set!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You're ready to start analyzing your YouTube comments
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                  <li>Go to one of your YouTube videos</li>
                  <li>Click the extension icon</li>
                  <li>Click "Analyze This Video"</li>
                  <li>View the results in your dashboard</li>
                </ol>
              </div>
              
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
