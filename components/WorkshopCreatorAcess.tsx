import React from 'react';
import { useRoles } from '../context/RoleContext';
import roleService from '../api/roleApiLayer';

interface WorkshopCreatorAccessProps {
  children: React.ReactNode;
  userId?: string;
  showRequestButton?: boolean;
}

const WorkshopCreatorAccess: React.FC<WorkshopCreatorAccessProps> = ({
  children,
  userId,
  showRequestButton = true,
}) => {
  const { permissions, userRoles, loading } = useRoles();
  const [requesting, setRequesting] = React.useState(false);
  const [requestSent, setRequestSent] = React.useState(false);

  const handleRequestAccess = async () => {
    if (!userId) return;

    setRequesting(true);
    try {
      await roleService.requestWorkshopCreatorRole(
        userId,
        'I would like to become a workshop creator to share my knowledge with the DNA Community.'
      );
      setRequestSent(true);
    } catch (error) {
      console.error('Failed to request workshop creator role:', error);
      // You might want to show a toast notification here
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User has workshop creator permissions
  if (permissions.canCreateWorkshops) {
    return <>{children}</>;
  }

  // User doesn't have permissions - show access request
  return (
    <div className="text-center py-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 rounded-full p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Workshop Creator Access Required
        </h3>

        <p className="text-gray-600 mb-6">
          To create workshops and share your knowledge with the DNA Community, you need workshop creator permissions.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Benefits of becoming a Workshop Creator:</h4>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Create and host interactive workshops</li>
            <li>• Share your expertise with the community</li>
            <li>• Earn XP and recognition</li>
            <li>• Access workshop analytics and management tools</li>
            <li>• Issue certificates to participants</li>
          </ul>
        </div>

        {showRequestButton && !requestSent && (
          <button
            onClick={handleRequestAccess}
            disabled={requesting || !userId}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requesting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Requesting Access...
              </span>
            ) : (
              'Request Workshop Creator Access'
            )}
          </button>
        )}

        {requestSent && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Request Sent!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your request has been submitted. You'll be notified when it's reviewed.
            </p>
          </div>
        )}

        {!showRequestButton && (
          <p className="text-sm text-gray-500">
            Contact an administrator to request workshop creator permissions.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkshopCreatorAccess;