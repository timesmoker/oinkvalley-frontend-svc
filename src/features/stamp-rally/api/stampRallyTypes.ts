/** GET /stamp-rallies/me, POST /stamp-rallies/me/check-ins */
export type RallyViewResponse = {
  rallyId: number | null;
  title: string;
  totalSlots: number;
  rewardLink: string | null;
  filledSlots: number[];
  checkInsThisMonth: string[];
  slotsUntilGift: number;
  streakDays: number;
  completedToday: boolean;
};

export type ApiErrorBody = {
  message?: string;
  errors?: string[];
};
