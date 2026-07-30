import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, UserPlus, UserMinus } from 'lucide-react';

interface Participant {
  userId: number;
  userName: string;
  email: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  cursorPosition?: number;
  lastSeen?: Date;
}

interface CollaborativePresenceProps {
  participants: Participant[];
  currentUserId: number;
  onParticipantJoin?: (participant: Participant) => void;
  onParticipantLeave?: (userId: number) => void;
}

const generateAvatarColor = (userId: number): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
  ];
  return colors[userId % colors.length];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function CollaborativePresence({
  participants,
  currentUserId,
  onParticipantJoin,
  onParticipantLeave,
}: CollaborativePresenceProps) {
  const [displayParticipants, setDisplayParticipants] = useState<Participant[]>(participants);
  const activeParticipants = displayParticipants.filter(p => p.isActive);
  const inactiveParticipants = displayParticipants.filter(p => !p.isActive);

  useEffect(() => {
    setDisplayParticipants(participants);
  }, [participants]);

  const handleParticipantJoin = (participant: Participant) => {
    if (onParticipantJoin) {
      onParticipantJoin(participant);
    }
  };

  const handleParticipantLeave = (userId: number) => {
    if (onParticipantLeave) {
      onParticipantLeave(userId);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Collaborators ({activeParticipants.length})
          </h3>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {activeParticipants.length} active
        </Badge>
      </div>

      {/* Active Participants */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Active Now</h4>
        <div className="grid grid-cols-1 gap-2">
          {activeParticipants.length > 0 ? (
            activeParticipants.map(participant => (
              <TooltipProvider key={participant.userId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: participant.color }}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} alt={participant.userName} />
                          <AvatarFallback style={{ backgroundColor: participant.color }}>
                            <span className="text-white text-xs font-semibold">
                              {getInitials(participant.userName)}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {participant.userId === currentUserId ? 'You' : participant.userName}
                          </p>
                          <p className="text-xs text-gray-600">{participant.email}</p>
                        </div>
                      </div>
                      {participant.userId !== currentUserId && (
                        <button
                          onClick={() => handleParticipantLeave(participant.userId)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Remove participant"
                        >
                          <UserMinus className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{participant.userName} is editing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <p className="text-sm text-gray-500 py-2">No active collaborators</p>
          )}
        </div>
      </div>

      {/* Inactive Participants */}
      {inactiveParticipants.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Recent Collaborators</h4>
          <div className="grid grid-cols-1 gap-2">
            {inactiveParticipants.map(participant => (
              <TooltipProvider key={participant.userId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors opacity-75">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} alt={participant.userName} />
                          <AvatarFallback style={{ backgroundColor: participant.color }}>
                            <span className="text-white text-xs font-semibold">
                              {getInitials(participant.userName)}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{participant.userName}</p>
                          <p className="text-xs text-gray-500">
                            Last seen{' '}
                            {participant.lastSeen
                              ? new Date(participant.lastSeen).toLocaleTimeString()
                              : 'recently'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleParticipantJoin(participant)}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                        title="Invite to collaborate"
                      >
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Invite {participant.userName} to collaborate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Cursor Indicators */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Live Cursor Positions</h4>
        <div className="space-y-2">
          {activeParticipants
            .filter(p => p.cursorPosition !== undefined && p.userId !== currentUserId)
            .map(participant => (
              <div key={participant.userId} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-gray-600">
                  {participant.userName} at position {participant.cursorPosition}
                </span>
              </div>
            ))}
          {activeParticipants.filter(p => p.cursorPosition !== undefined && p.userId !== currentUserId)
            .length === 0 && (
            <p className="text-xs text-gray-500">No active cursors</p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> You can see who's editing in real-time. Changes are automatically synced.
        </p>
      </div>
    </div>
  );
}

export default CollaborativePresence;
