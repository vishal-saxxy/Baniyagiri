import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Expense, Occasion, Participant, SplitEntry, SplitMethod } from "./baniyagiri-types";

type Stage = "landing" | "workspace-setup" | "dashboard";

export interface Workspace {
  id: string;
  name: string;
  participants: Participant[];
  occasions: Occasion[];
  expenses: Expense[];
  createdAt: number;
}

export interface SettlementLog {
  id: string;
  workspaceId: string;
  workspaceName: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  amount: number;
  at: number;
}

export interface Preferences {
  currency: string;
}

interface State {
  // session
  stage: Stage;
  username: string;
  preferences: Preferences;

  // multi-workspace
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  settlementHistory: SettlementLog[];

  // Mirrored from active workspace (computed, NOT persisted)
  workspaceName: string;
  participants: Participant[];
  occasions: Occasion[];
  expenses: Expense[];

  // session
  setUsername: (name: string) => void;
  setStage: (stage: Stage) => void;
  goToSetup: () => void;

  // workspace lifecycle
  setWorkspace: (name: string) => void; // create + activate + dashboard
  createWorkspace: (name: string) => string;
  switchWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;

  // active workspace mutations
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  addOccasion: (name: string, ids: string[]) => void;
  removeOccasion: (id: string) => void;
  addExpense: (e: {
    description: string;
    amount: number;
    paidBy: string;
    occasionId: string;
    splitMethod: SplitMethod;
    splits: SplitEntry[];
  }) => void;
  updateExpense: (
    id: string,
    e: {
      description: string;
      amount: number;
      paidBy: string;
      occasionId: string;
      splitMethod: SplitMethod;
      splits: SplitEntry[];
    },
  ) => void;
  removeExpense: (id: string) => void;

  clearSheet: () => void;

  // settlements / demo
  recordSettlements: (
    settlements: { from: string; to: string; amount: number }[],
  ) => void;
  loadDemo: () => void;

  // preferences
  setPreferences: (p: Partial<Preferences>) => void;

  // data
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyMirror = {
  workspaceName: "",
  participants: [] as Participant[],
  occasions: [] as Occasion[],
  expenses: [] as Expense[],
};

function mirrorFrom(ws: Workspace | undefined) {
  if (!ws) return emptyMirror;
  return {
    workspaceName: ws.name,
    participants: ws.participants,
    occasions: ws.occasions,
    expenses: ws.expenses,
  };
}

function findActive(workspaces: Workspace[], id: string | null) {
  return workspaces.find((w) => w.id === id);
}

function updateActive(
  state: State,
  updater: (w: Workspace) => Workspace,
): Partial<State> {
  const idx = state.workspaces.findIndex((w) => w.id === state.activeWorkspaceId);
  if (idx === -1) return {};
  const next = [...state.workspaces];
  next[idx] = updater(next[idx]);
  return { workspaces: next, ...mirrorFrom(next[idx]) };
}

export const useBani = create<State>()(
  persist(
    (set, get) => ({
      stage: "landing",
      username: "",
      preferences: { currency: "₹" },
      workspaces: [],
      activeWorkspaceId: null,
      settlementHistory: [],
      ...emptyMirror,

      setUsername: (name) => {
        const trimmed = name.trim();
        const state = get();
        // If user already has workspaces, jump straight to dashboard
        if (state.workspaces.length > 0 && state.activeWorkspaceId) {
          set({ username: trimmed, stage: "dashboard" });
        } else {
          set({ username: trimmed, stage: "workspace-setup" });
        }
      },
      setStage: (stage) => set({ stage }),
      goToSetup: () => set({ stage: "workspace-setup" }),

      setWorkspace: (name) => {
        const id = uid();
        const username = get().username || "You";
        const ws: Workspace = {
          id,
          name: name.trim() || "My Workspace",
          participants: [{ id: uid(), name: username }],
          occasions: [],
          expenses: [],
          createdAt: Date.now(),
        };
        set((s) => ({
          workspaces: [...s.workspaces, ws],
          activeWorkspaceId: id,
          stage: "dashboard",
          ...mirrorFrom(ws),
        }));
      },

      createWorkspace: (name) => {
        const id = uid();
        const username = get().username || "You";
        const ws: Workspace = {
          id,
          name: name.trim() || "New Workspace",
          participants: [{ id: uid(), name: username }],
          occasions: [],
          expenses: [],
          createdAt: Date.now(),
        };
        set((s) => ({
          workspaces: [...s.workspaces, ws],
          activeWorkspaceId: id,
          ...mirrorFrom(ws),
        }));
        return id;
      },

      switchWorkspace: (id) => {
        const ws = findActive(get().workspaces, id);
        if (!ws) return;
        set({ activeWorkspaceId: id, ...mirrorFrom(ws) });
      },

      renameWorkspace: (id, name) => {
        set((s) => {
          const workspaces = s.workspaces.map((w) =>
            w.id === id ? { ...w, name: name.trim() || w.name } : w,
          );
          return {
            workspaces,
            ...(s.activeWorkspaceId === id
              ? mirrorFrom(findActive(workspaces, id))
              : {}),
          };
        });
      },

      deleteWorkspace: (id) => {
        set((s) => {
          const workspaces = s.workspaces.filter((w) => w.id !== id);
          if (workspaces.length === 0) {
            return {
              workspaces,
              activeWorkspaceId: null,
              stage: "workspace-setup" as Stage,
              ...emptyMirror,
            };
          }
          if (s.activeWorkspaceId === id) {
            const next = workspaces[0];
            return {
              workspaces,
              activeWorkspaceId: next.id,
              ...mirrorFrom(next),
            };
          }
          return { workspaces };
        });
      },

      addParticipant: (name) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            participants: [...w.participants, { id: uid(), name: name.trim() }],
          })),
        ),
      removeParticipant: (id) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            participants: w.participants.filter((p) => p.id !== id),
            occasions: w.occasions.map((o) => ({
              ...o,
              participantIds: o.participantIds.filter((x) => x !== id),
            })),
            expenses: w.expenses.filter(
              (e) =>
                e.paidBy !== id && !e.splits.some((sp) => sp.participantId === id),
            ),
          })),
        ),
      addOccasion: (name, ids) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            occasions: [
              ...w.occasions,
              { id: uid(), name: name.trim(), participantIds: ids },
            ],
          })),
        ),
      removeOccasion: (id) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            occasions: w.occasions.filter((o) => o.id !== id),
            expenses: w.expenses.filter((e) => e.occasionId !== id),
          })),
        ),
      addExpense: (e) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            expenses: [
              { id: uid(), createdAt: Date.now(), ...e },
              ...w.expenses,
            ],
          })),
        ),
      updateExpense: (id, e) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            expenses: w.expenses.map((x) =>
              x.id === id ? { ...x, ...e } : x,
            ),
          })),
        ),
      removeExpense: (id) =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            expenses: w.expenses.filter((e) => e.id !== id),
          })),
        ),
      clearSheet: () =>
        set((s) =>
          updateActive(s, (w) => ({
            ...w,
            participants: [],
            occasions: [],
            expenses: [],
          })),
        ),

      recordSettlements: (settlements) => {
        const s = get();
        const ws = findActive(s.workspaces, s.activeWorkspaceId);
        if (!ws || settlements.length === 0) return;
        const nameOf = (id: string) =>
          ws.participants.find((p) => p.id === id)?.name ?? "—";
        const at = Date.now();
        const logs: SettlementLog[] = settlements.map((x) => ({
          id: uid(),
          workspaceId: ws.id,
          workspaceName: ws.name,
          from: x.from,
          to: x.to,
          fromName: nameOf(x.from),
          toName: nameOf(x.to),
          amount: x.amount,
          at,
        }));
        set({ settlementHistory: [...logs, ...s.settlementHistory].slice(0, 500) });
      },

      loadDemo: () => {
        const p: Participant[] = [
          { id: uid(), name: "Rahul" },
          { id: uid(), name: "Priya" },
          { id: uid(), name: "Amit" },
          { id: uid(), name: "Rohit" },
        ];
        const occ: Occasion = {
          id: uid(),
          name: "Entire Trip",
          participantIds: p.map((x) => x.id),
        };
        const split = (amt: number) =>
          p.map((x) => ({
            participantId: x.id,
            value: Math.round((amt / p.length) * 100) / 100,
          }));
        const expenses: Expense[] = [
          { id: uid(), createdAt: Date.now() - 30000, description: "Hotel", amount: 4000, paidBy: p[0].id, occasionId: occ.id, splitMethod: "equal", splits: split(4000) },
          { id: uid(), createdAt: Date.now() - 20000, description: "Dinner", amount: 1200, paidBy: p[1].id, occasionId: occ.id, splitMethod: "equal", splits: split(1200) },
          { id: uid(), createdAt: Date.now() - 10000, description: "Fuel", amount: 800, paidBy: p[2].id, occasionId: occ.id, splitMethod: "equal", splits: split(800) },
        ];
        const id = uid();
        const ws: Workspace = {
          id,
          name: "Goa Trip (Demo)",
          participants: p,
          occasions: [occ],
          expenses,
          createdAt: Date.now(),
        };
        set((s) => ({
          workspaces: [...s.workspaces, ws],
          activeWorkspaceId: id,
          stage: "dashboard",
          ...mirrorFrom(ws),
        }));
      },

      setPreferences: (p) =>
        set((s) => ({ preferences: { ...s.preferences, ...p } })),

      exportData: () => {
        const s = get();
        return JSON.stringify(
          {
            version: 1,
            exportedAt: Date.now(),
            username: s.username,
            preferences: s.preferences,
            workspaces: s.workspaces,
            activeWorkspaceId: s.activeWorkspaceId,
            settlementHistory: s.settlementHistory,
          },
          null,
          2,
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data || !Array.isArray(data.workspaces)) return false;
          const workspaces: Workspace[] = data.workspaces;
          const activeWorkspaceId =
            data.activeWorkspaceId && workspaces.find((w) => w.id === data.activeWorkspaceId)
              ? data.activeWorkspaceId
              : workspaces[0]?.id ?? null;
          const active = findActive(workspaces, activeWorkspaceId);
          set({
            username: data.username ?? get().username,
            preferences: { ...get().preferences, ...(data.preferences ?? {}) },
            workspaces,
            activeWorkspaceId,
            settlementHistory: Array.isArray(data.settlementHistory)
              ? data.settlementHistory
              : [],
            stage: active ? "dashboard" : "workspace-setup",
            ...mirrorFrom(active),
          });
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () => {
        set({
          stage: "landing",
          username: "",
          preferences: { currency: "₹" },
          workspaces: [],
          activeWorkspaceId: null,
          settlementHistory: [],
          ...emptyMirror,
        });
      },
    }),
    {
      name: "baniyagiri-state-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        stage: s.stage,
        username: s.username,
        preferences: s.preferences,
        workspaces: s.workspaces,
        activeWorkspaceId: s.activeWorkspaceId,
        settlementHistory: s.settlementHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const ws = findActive(state.workspaces, state.activeWorkspaceId);
        Object.assign(state, mirrorFrom(ws));
      },
    },
  ),
);

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
