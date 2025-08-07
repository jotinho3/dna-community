"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import workshopService from '../api/workshopApiLayer';

interface EnrollButtonProps {
  workshopId: string;
  isEnrolled: boolean;
  onEnrollmentChange: () => void;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
  workshopId,
  isEnrolled,
  onEnrollmentChange,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createWorkshopNotification } = useNotifications();

  const handleEnroll = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      await workshopService.enrollInWorkshop(workshopId, user.uid);
      onEnrollmentChange();
      
      // Notification is automatically created in the service
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading || isEnrolled}
      className={isEnrolled ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'}
    >
      {loading ? 'Enrolling...' : isEnrolled ? 'Enrolled' : 'Enroll Now'}
    </Button>
  );
};

export default EnrollButton;