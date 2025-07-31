import React from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  Video,
  Award,
  ExternalLink,
} from "lucide-react";
import { Workshop } from "../types/workshop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WorkshopCardProps {
  workshop: Workshop;
  isEnrolled: boolean;
  canEnroll: boolean;
  onEnroll: () => Promise<void>;
  onUnenroll: () => Promise<void>;
  onViewDetails: () => void;
  status: string;
  formattedDate: string;
  formattedTime: string;
  enrollmentLoading: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({
  workshop,
  isEnrolled,
  canEnroll,
  onEnroll,
  onUnenroll,
  onViewDetails,
  status,
  formattedDate,
  formattedTime,
  enrollmentLoading,
}) => {

    
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "online":
        return <Video className="w-4 h-4" />;
      case "in_person":
        return <MapPin className="w-4 h-4" />;
      case "hybrid":
        return <Video className="w-4 h-4" />; // or a hybrid icon
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const availableSpots = workshop.maxParticipants - workshop.currentEnrollments;
  const isNearCapacity =
    availableSpots <= Math.ceil(workshop.maxParticipants * 0.2); // 20% or less remaining
  const isFull = availableSpots <= 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
            {workshop.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={workshop.creatorAvatar}
                alt={workshop.creatorName}
              />
              <AvatarFallback className="text-xs">
                {workshop.creatorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{workshop.creatorName}</span>
          </div>
        </div>

        {workshop.thumbnailUrl && (
          <img
            src={workshop.thumbnailUrl}
            alt={workshop.title}
            className="w-16 h-16 object-cover rounded-lg ml-4"
          />
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-2">
        {workshop.shortDescription || workshop.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="secondary"
          className={getDifficultyColor(workshop.difficulty)}
        >
          {workshop.difficulty}
        </Badge>
        <Badge variant="secondary" className="bg-slate-100 text-slate-800">
          {workshop.category.replace("_", " ")}
        </Badge>
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status}
        </Badge>
        {workshop.price === 0 && (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800"
          >
            Free
          </Badge>
        )}
        {workshop.issuesCertificate && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Award className="w-3 h-3 mr-1" />
            Certificate
          </Badge>
        )}
      </div>

      {/* Workshop Details */}
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
          <span className="text-slate-400">•</span>
          <span>{workshop.duration || 0} min</span>
        </div>
        <div className="flex items-center space-x-2">
          {getFormatIcon(workshop.format || "online")}
          <span className="capitalize">
            {workshop.format?.replace("_", " ") || "Online"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>
            {workshop.currentEnrollments || 0}/{workshop.maxParticipants || 0}{" "}
            enrolled
          </span>
          {isFull && workshop.allowWaitlist && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800 text-xs"
            >
              Waitlist Available
            </Badge>
          )}
        </div>
      </div>

      {/* Enrollment Status */}
      {availableSpots > 0 && isNearCapacity && !isFull && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
          <p className="text-xs text-yellow-800">
            Only {availableSpots} spot{availableSpots !== 1 ? "s" : ""}{" "}
            remaining!
          </p>
        </div>
      )}

      {isFull && !workshop.allowWaitlist && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-xs text-red-800">
            This workshop is full and waitlist is not available.
          </p>
        </div>
      )}

      {/* Learning Objectives Preview */}
      {workshop.learningObjectives &&
        workshop.learningObjectives.length > 0 && (
          <div className="bg-slate-50 rounded-md p-3">
            <h4 className="text-xs font-medium text-slate-700 mb-2">
              What you'll learn:
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {workshop.learningObjectives
                .slice(0, 2)
                .map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span className="line-clamp-1">{objective}</span>
                  </li>
                ))}
              {workshop.learningObjectives.length > 2 && (
                <li className="text-slate-400 text-xs">
                  +{workshop.learningObjectives.length - 2} more objectives
                </li>
              )}
            </ul>
          </div>
        )}

      {/* Rating */}
      {workshop.stats?.averageRating && workshop.stats.averageRating > 0 && (
        <div className="flex items-center space-x-1 text-sm">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(workshop.stats!.averageRating)
                    ? "text-yellow-400 fill-current"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="text-slate-600">
            {workshop.stats.averageRating.toFixed(1)} (
            {workshop.stats.totalRatings})
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </Button>

        {isEnrolled ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={onUnenroll}
            disabled={enrollmentLoading}
            className="flex-1"
          >
            {enrollmentLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Unenrolling...
              </>
            ) : (
              "Unenroll"
            )}
          </Button>
        ) : canEnroll ? (
          <Button
            size="sm"
            onClick={onEnroll}
            disabled={enrollmentLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {enrollmentLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Enrolling...
              </>
            ) : isFull && workshop.allowWaitlist ? (
              "Join Waitlist"
            ) : (
              "Enroll Now"
            )}
          </Button>
        ) : (
          <Button size="sm" disabled variant="secondary" className="flex-1">
            {isFull ? "Full" : "Unavailable"}
          </Button>
        )}
      </div>

      {/* Price Display */}
      {workshop.price > 0 && (
        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-lg font-semibold text-slate-900">
            {workshop.currency} {workshop.price}
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkshopCard;
