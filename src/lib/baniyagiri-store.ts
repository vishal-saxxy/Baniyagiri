import { create } from "zustand";
import type { Expense, Occasion, Participant, SplitEntry, SplitMethod } from "./baniyagiri-types";

type Stage = "landing" | "workspace-setup" | "dashboard";

interface State {
  stage: Stage;
  username: string;
  workspaceName: string;
  participants: Participant[];
  occasions: Occasion[];
  expenses: Expense[];

  setUsername: (name: string) => void;
  setWorkspace: (name: string) => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  addOccasion: (name: string, participantIds: string[]) => void;
  removeOccasion: (id: string) => void;
  addExpense: (e: {
    description: string;
    amount: number;
    paidBy: string;
    occasionId: string;
    splitMethod: SplitMethod;
    splits: SplitEntry[];
  }) => void;
  removeExpense: (id: string) => void;
  clearSheet: () => void;
  loadDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useBani = create<State>((set) => ({
  stage: "landing",
  username: "",
  workspaceName: "",
  participants: [],
  occasions: [],
  expenses: [],

  setUsername: (name) => set({ username: name.trim(), stage: "workspace-setup" }),
  setWorkspace: (name) =>
    set((s) => ({
      workspaceName: name.trim(),
      stage: "dashboard",
      participants: s.participants.length
        ? s.participants
        : [{ id: uid(), name: s.username || "You" }],
    })),
  addParticipant: (name) =>
    set((s) => ({ participants: [...s.participants, { id: uid(), name: name.trim() }] })),
  removeParticipant: (id) =>
    set((s) => ({
      participants: s.participants.filter((p) => p.id !== id),
      occasions: s.occasions.map((o) => ({ ...o, participantIds: o.participantIds.filter((x) => x !== id) })),
      expenses: s.expenses.filter((e) => e.paidBy !== id && !e.splits.some((sp) => sp.participantId === id)),
    })),
  addOccasion: (name, participantIds) =>
    set((s) => ({ occasions: [...s.occasions, { id: uid(), name: name.trim(), participantIds }] })),
  removeOccasion: (id) =>
    set((s) => ({
      occasions: s.occasions.filter((o) => o.id !== id),
      expenses: s.expenses.filter((e) => e.occasionId !== id),
    })),
  addExpense: (e) =>
    set((s) => ({
      expenses: [
        { id: uid(), createdAt: Date.now(), ...e },
        ...s.expenses,
      ],
    })),
  removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
  clearSheet: () =>
    set({
      stage: "workspace-setup",
      workspaceName: "",
      participants: [],
      occasions: [],
      expenses: [],
    }),
  loadDemo: () =>
    set(() => {
      const p = [
        { id: uid(), name: "Rahul" },
        { id: uid(), name: "Priya" },
        { id: uid(), name: "Amit" },
        { id: uid(), name: "Rohit" },
      ];
      const occ = { id: uid(), name: "Entire Trip", participantIds: p.map((x) => x.id) };
      const split = (amt: number) =>
        p.map((x) => ({ participantId: x.id, value: Math.round((amt / p.length) * 100) / 100 }));
      const expenses: Expense[] = [
        {
          id: uid(),
          createdAt: Date.now() - 30000,
          description: "Hotel",
          amount: 4000,
          paidBy: p[0].id,
          occasionId: occ.id,
          splitMethod: "equal",
          splits: split(4000),
        },
        {
          id: uid(),
          createdAt: Date.now() - 20000,
          description: "Dinner",
          amount: 1200,
          paidBy: p[1].id,
          occasionId: occ.id,
          splitMethod: "equal",
          splits: split(1200),
        },
        {
          id: uid(),
          createdAt: Date.now() - 10000,
          description: "Fuel",
          amount: 800,
          paidBy: p[2].id,
          occasionId: occ.id,
          splitMethod: "equal",
          splits: split(800),
        },
      ];
      return {
        participants: p,
        occasions: [occ],
        expenses,
      };
    }),
}));

export function computeSplits(
  method: SplitMethod,
  amount: number,
  participantIds: string[],
  raw: Record<string, number>,
): { splits: SplitEntry[]; error: string | null } {
  if (participantIds.length === 0) return { splits: [], error: "No participants selected" };
  if (method === "equal") {
    const per = Math.round((amount / participantIds.length) * 100) / 100;
    const splits = participantIds.map((id, i) => ({
      participantId: id,
      // give remainder to last
      value: i === participantIds.length - 1
        ? Math.round((amount - per * (participantIds.length - 1)) * 100) / 100
        : per,
    }));
    return { splits, error: null };
  }
  if (method === "unequal") {
    const splits = participantIds.map((id) => ({ participantId: id, value: Number(raw[id] || 0) }));
    const sum = splits.reduce((a, b) => a + b.value, 0);
    if (Math.abs(sum - amount) > 0.01) return { splits, error: `Sum (${sum.toFixed(2)}) must equal total (${amount.toFixed(2)})` };
    return { splits, error: null };
  }
  if (method === "percentage") {
    const total = participantIds.reduce((a, id) => a + Number(raw[id] || 0), 0);
    if (Math.abs(total - 100) > 0.01) return { splits: [], error: `Percentages must total 100% (current ${total.toFixed(2)}%)` };
    const splits = participantIds.map((id) => ({
      participantId: id,
      value: Math.round((amount * Number(raw[id] || 0)) / 100 * 100) / 100,
    }));
    return { splits, error: null };
  }
  if (method === "shares") {
    const total = participantIds.reduce((a, id) => a + Number(raw[id] || 0), 0);
    if (total <= 0) return { splits: [], error: "Total shares must be > 0" };
    const splits = participantIds.map((id) => ({
      participantId: id,
      value: Math.round((amount * Number(raw[id] || 0) / total) * 100) / 100,
    }));
    return { splits, error: null };
  }
  if (method === "adjustment") {
    const adjTotal = participantIds.reduce((a, id) => a + Number(raw[id] || 0), 0);
    const base = (amount - adjTotal) / participantIds.length;
    if (base < 0) return { splits: [], error: "Adjustments exceed total amount" };
    const splits = participantIds.map((id) => ({
      participantId: id,
      value: Math.round((base + Number(raw[id] || 0)) * 100) / 100,
    }));
    return { splits, error: null };
  }
  return { splits: [], error: "Unknown method" };
}
