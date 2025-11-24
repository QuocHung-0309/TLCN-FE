export type BadgeCondition = {
  count: number;
  points: number;
};

export type BadgeType = {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'points' | 'special';
  pointsRequired: number;
  isActive: boolean;
  condition: Record<string, BadgeCondition>;
  userProgress: {
    status: string;
    currentPoints: number;
    achievedAt: string | null;
  };
   activityPoints?: Record<string, number>; 
};
export type Milestone = {
  title: string;
  points: number;
  color: string;
  className: string;
};
export type UserAction = {
  _id: string;
  userId: string;
  badgeId: string;
  action: string;
  points: number;
  currentPoints?: number;   
  requiredPoints?: number;  
  createdAt: string;
};


