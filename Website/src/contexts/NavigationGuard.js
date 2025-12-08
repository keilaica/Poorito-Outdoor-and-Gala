import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationGuardContext = createContext();

export const useNavigationGuard = () => {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error('useNavigationGuard must be used within NavigationGuardProvider');
  }
  return context;
};

export const NavigationGuardProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();

  const registerUnsavedChanges = useCallback((hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  const navigateWithCheck = useCallback((path, options) => {
    if (hasUnsavedChanges) {
      setPendingNavigation({ path, options });
      setShowLeaveConfirm(true);
      return false; // Prevent navigation
    }
    navigate(path, options);
    return true; // Navigation allowed
  }, [hasUnsavedChanges, navigate]);

  const handleConfirmLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      navigate(pendingNavigation.path, pendingNavigation.options);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    setPendingNavigation(null);
  }, []);

  const value = {
    hasUnsavedChanges,
    showLeaveConfirm,
    registerUnsavedChanges,
    navigateWithCheck,
    handleConfirmLeave,
    handleCancelLeave,
  };

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      {/* Global Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCancelLeave}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-primary/20 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-xl font-semibold">!</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Leave this page?
                </h3>
                <p className="text-gray-700 text-base mt-1">
                  Changes you made may not be saved.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelLeave}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-white"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
};
