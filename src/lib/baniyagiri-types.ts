export type SplitMethod = "equal" | "unequal" | "percentage" | "shares" | "adjustment";

export interface Participant {
  id: string;
  name: string;
}

export interface Occasion {
  id: string;
  name: string;
  participantIds: string[];
}

export interface SplitEntry {
  participantId: string;
  // for unequal: amount; percentage: percent; shares: share count; adjustment: +/- delta
  value: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // participantId
  occasionId: string;
  splitMethod: SplitMethod;
  splits: SplitEntry[]; // resolved per-participant owed amounts
  createdAt: number;
}

export interface Settlement {
  from: string; // participantId
  to: string;   // participantId
  amount: number;
}
