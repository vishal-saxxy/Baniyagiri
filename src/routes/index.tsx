import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useBani, computeSplits } from "@/lib/baniyagiri-store";
import { computeBalances, simplifyDebts } from "@/lib/simplify-debts";
import type { Participant, SplitMethod } from "@/lib/baniyagiri-types";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: BaniApp });

function WarningBanner() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 py-2 text-center text-[11px] sm:text-xs leading-snug text-amber-200">
        ⚠️ <span className="font-semibold">Baniyagiri Mode Active:</span> All data exists only in this browser tab.
        Refreshing or closing the page will permanently erase all expenses, balances, groups, and history.
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-6 pt-10 text-center text-[11px] text-muted-foreground">
      made with love, by{" "}
      <a
        className="underline underline-offset-2 hover:text-foreground"
        href="https://www.linkedin.com/in/vishal-kumar-gupta-b5a664252/"
        target="_blank"
        rel="noreferrer"
      >
        vishal
      </a>
    </footer>
  );
}

function BaniApp() {
  const stage = useBani((s) => s.stage);
  return (
    <div className="flex min-h-screen flex-col">
      <WarningBanner />
      <main className="flex-1">
        {stage === "landing" && <Landing />}
        {stage === "workspace-setup" && <WorkspaceSetup />}
        {stage === "dashboard" && <Dashboard />}
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Landing ---------------- */

function Landing() {
  const [name, setName] = useState("");
  const setUsername = useBani((s) => s.setUsername);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 pb-10 pt-16 sm:pt-24">
      <div className="mb-8 flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-black">B</div>
        <span className="text-sm font-semibold tracking-widest text-muted-foreground">BANIYAGIRI</span>
      </div>
      <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
        Split expenses,{" "}
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">zero friction.</span>
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        The Zero-Friction Expense Splitter. No signup. No backend. Just you, your friends, and clean math.
      </p>

      <form
        className="mt-8 w-full bani-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Enter a username to continue");
          setUsername(name);
        }}
      >
        <label className="text-xs font-medium text-muted-foreground">Enter Username</label>
        <input
          autoFocus
          className="bani-input mt-2"
          placeholder="e.g. Rahul"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="bani-btn bani-btn-primary mt-4 w-full">
          Enter Baniyagiri →
        </button>
      </form>

      <div className="mt-10 grid w-full grid-cols-3 gap-3 text-center text-[11px] text-muted-foreground">
        <div className="bani-card p-3"><div className="text-base font-bold text-foreground">0</div>signups</div>
        <div className="bani-card p-3"><div className="text-base font-bold text-foreground">5</div>split methods</div>
        <div className="bani-card p-3"><div className="text-base font-bold text-foreground">1-tap</div>simplify</div>
      </div>
    </div>
  );
}

/* ---------------- Workspace Setup ---------------- */

function WorkspaceSetup() {
  const [name, setName] = useState("");
  const setWorkspace = useBani((s) => s.setWorkspace);
  const username = useBani((s) => s.username);
  const loadDemo = useBani((s) => s.loadDemo);
  const examples = ["Goa Trip", "Flat Expenses", "Office Party", "College Tour"];
  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-12 sm:pt-20">
      <p className="text-xs text-muted-foreground">Hey {username || "there"} 👋</p>
      <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Name your workspace</h2>
      <p className="mt-1 text-sm text-muted-foreground">A space for one set of shared expenses.</p>

      <form
        className="mt-6 bani-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Enter a workspace name");
          setWorkspace(name);
        }}
      >
        <input
          autoFocus
          className="bani-input"
          placeholder="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              type="button"
              key={ex}
              onClick={() => setName(ex)}
              className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" className="bani-btn bani-btn-primary mt-5 w-full">
          Create Workspace
        </button>
        <button
          type="button"
          onClick={() => {
            loadDemo();
            setWorkspace("Goa Trip (Demo)");
          }}
          className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          or load sample demo data
        </button>
      </form>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

type Tab = "feed" | "balances" | "settlement";

function Dashboard() {
  const { workspaceName, participants, occasions, expenses, clearSheet } = useBani();
  const [tab, setTab] = useState<Tab>("feed");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddOccasion, setShowAddOccasion] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);

  const balances = useMemo(
    () => computeBalances(participants.map((p) => p.id), expenses),
    [participants, expenses],
  );
  const settlements = useMemo(() => simplifyDebts(balances), [balances]);
  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 pb-24 pt-4">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">Workspace</p>
          <h1 className="truncate text-xl font-extrabold sm:text-2xl">{workspaceName}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="bani-btn bani-btn-ghost text-xs sm:text-sm"
            onClick={() => {
              if (participants.length < 2) return toast.error("Add at least 2 people");
              setShowSettlement(true);
            }}
          >
            <span className="hidden sm:inline">Simplify</span> Debts
          </button>
          <button
            className="bani-btn bani-btn-danger text-xs sm:text-sm"
            onClick={() => {
              if (confirm("Clear the entire sheet? Everything will be erased.")) {
                clearSheet();
                toast.success("Sheet cleared");
              }
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="People" value={participants.length} />
        <Stat label="Occasions" value={occasions.length} />
        <Stat
          label="Total"
          value={"₹" + expenses.reduce((a, b) => a + b.amount, 0).toLocaleString("en-IN")}
        />
      </div>

      {/* Sidebar + main on desktop, stacked on mobile */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <SidebarSection
            title="Participants"
            count={participants.length}
            action={{ label: "+ Add", onClick: () => setShowAddPerson(true) }}
          >
            {participants.length === 0 ? (
              <Empty hint="No one yet" />
            ) : (
              <ul className="space-y-1">
                {participants.map((p) => (
                  <ParticipantRow key={p.id} p={p} balance={balances[p.id] ?? 0} />
                ))}
              </ul>
            )}
          </SidebarSection>

          <SidebarSection
            title="Occasions"
            count={occasions.length}
            action={{
              label: "+ Add",
              onClick: () => {
                if (participants.length === 0) return toast.error("Add a person first");
                setShowAddOccasion(true);
              },
            }}
          >
            {occasions.length === 0 ? (
              <Empty hint="No occasions yet" />
            ) : (
              <ul className="space-y-1">
                {occasions.map((o) => (
                  <li key={o.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{o.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {o.participantIds.length} people
                      </div>
                    </div>
                    <button
                      onClick={() => useBani.getState().removeOccasion(o.id)}
                      className="text-xs text-muted-foreground hover:text-danger"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SidebarSection>
        </aside>

        <section className="min-w-0">
          {/* Tabs */}
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-muted/50 p-1">
            {(["feed", "balances", "settlement"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold capitalize sm:text-sm " +
                  (tab === t ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground")
                }
              >
                {t === "feed" ? "Expense Feed" : t === "balances" ? "Balances" : "Settlement"}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === "feed" && (
              <FeedView nameOf={nameOf} occasionName={(id) => occasions.find((o) => o.id === id)?.name ?? "—"} />
            )}
            {tab === "balances" && <BalancesView balances={balances} nameOf={nameOf} />}
            {tab === "settlement" && (
              <SettlementView settlements={settlements} nameOf={nameOf} />
            )}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          if (participants.length < 1) return toast.error("Add a person first");
          if (occasions.length < 1) return toast.error("Create an occasion first");
          setShowAddExpense(true);
        }}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-2xl sm:bottom-8 sm:right-8"
        aria-label="Add expense"
      >
        +
      </button>

      {showAddPerson && <AddPersonModal onClose={() => setShowAddPerson(false)} />}
      {showAddOccasion && <AddOccasionModal onClose={() => setShowAddOccasion(false)} />}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
      {showSettlement && (
        <SettlementModal
          settlements={settlements}
          nameOf={nameOf}
          onClose={() => setShowSettlement(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bani-card px-3 py-3 sm:px-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-bold sm:text-lg">{value}</div>
    </div>
  );
}

function SidebarSection({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count: number;
  action: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="bani-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title} <span className="text-foreground/60">({count})</span>
        </h3>
        <button onClick={action.onClick} className="text-xs font-semibold text-primary hover:underline">
          {action.label}
        </button>
      </div>
      {children}
    </div>
  );
}

function Empty({ hint }: { hint: string }) {
  return <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">{hint}</div>;
}

function ParticipantRow({ p, balance }: { p: Participant; balance: number }) {
  const color = balance > 0.005 ? "text-emerald-400" : balance < -0.005 ? "text-rose-400" : "text-muted-foreground";
  const label = balance > 0.005 ? `+₹${balance.toFixed(2)}` : balance < -0.005 ? `-₹${Math.abs(balance).toFixed(2)}` : "settled";
  return (
    <li className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-[11px] font-bold text-primary-foreground">
          {p.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="truncate font-medium">{p.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={"text-xs font-semibold " + color}>{label}</span>
        <button
          onClick={() => useBani.getState().removeParticipant(p.id)}
          className="text-xs text-muted-foreground hover:text-danger"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

/* ---------------- Views ---------------- */

function FeedView({ nameOf, occasionName }: { nameOf: (id: string) => string; occasionName: (id: string) => string }) {
  const expenses = useBani((s) => s.expenses);
  const removeExpense = useBani((s) => s.removeExpense);
  if (expenses.length === 0) {
    return (
      <div className="bani-card p-10 text-center text-sm text-muted-foreground">
        No expenses yet. Tap the <span className="text-primary">+</span> button to add one.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {expenses.map((e) => (
        <li key={e.id} className="bani-card p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold sm:text-base">{e.description}</h4>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {e.splitMethod}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {nameOf(e.paidBy)} paid · {occasionName(e.occasionId)} · {new Date(e.createdAt).toLocaleString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.splits.map((s) => (
                  <span key={s.participantId} className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px]">
                    {nameOf(s.participantId)}: ₹{s.value.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold sm:text-lg">₹{e.amount.toLocaleString("en-IN")}</div>
              <button
                onClick={() => removeExpense(e.id)}
                className="mt-1 text-[11px] text-muted-foreground hover:text-danger"
              >
                remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BalancesView({ balances, nameOf }: { balances: Record<string, number>; nameOf: (id: string) => string }) {
  const entries = Object.entries(balances).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <div className="bani-card p-10 text-center text-sm text-muted-foreground">No participants yet.</div>;
  return (
    <ul className="space-y-2">
      {entries.map(([id, bal]) => {
        const positive = bal > 0.005;
        const negative = bal < -0.005;
        return (
          <li key={id} className="bani-card flex items-center justify-between p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-sm font-bold text-primary-foreground">
                {nameOf(id).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{nameOf(id)}</div>
                <div className="text-[11px] text-muted-foreground">
                  {positive ? "gets back" : negative ? "owes" : "all settled"}
                </div>
              </div>
            </div>
            <div className={"text-lg font-extrabold " + (positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-muted-foreground")}>
              {positive && "+"}
              ₹{Math.abs(bal).toFixed(2)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SettlementView({ settlements, nameOf }: { settlements: { from: string; to: string; amount: number }[]; nameOf: (id: string) => string }) {
  if (settlements.length === 0) return <div className="bani-card p-10 text-center text-sm text-muted-foreground">Everyone is settled. 🎉</div>;
  return (
    <ul className="space-y-2">
      {settlements.map((s, i) => (
        <li key={i} className="bani-card flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{nameOf(s.from)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{nameOf(s.to)}</span>
          </div>
          <div className="text-base font-extrabold text-emerald-400">₹{s.amount.toFixed(2)}</div>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Modals ---------------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="bani-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-xl text-muted-foreground hover:text-foreground">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddPersonModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const addParticipant = useBani((s) => s.addParticipant);
  return (
    <Modal title="Add a person" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addParticipant(name);
          setName("");
          toast.success("Added");
          onClose();
        }}
      >
        <input autoFocus className="bani-input" placeholder="Name e.g. Priya" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="bani-btn bani-btn-primary mt-4 w-full" type="submit">Add</button>
      </form>
    </Modal>
  );
}

function AddOccasionModal({ onClose }: { onClose: () => void }) {
  const participants = useBani((s) => s.participants);
  const addOccasion = useBani((s) => s.addOccasion);
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>(participants.map((p) => p.id));
  const toggle = (id: string) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <Modal title="New occasion" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Name required");
          if (ids.length === 0) return toast.error("Select at least one person");
          addOccasion(name, ids);
          toast.success("Occasion added");
          onClose();
        }}
      >
        <input autoFocus className="bani-input" placeholder="e.g. Scuba Diving" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Included participants</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {participants.map((p) => (
            <label key={p.id} className={"flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm " + (ids.includes(p.id) ? "border-primary bg-primary/10" : "border-border bg-muted/40")}>
              <input type="checkbox" checked={ids.includes(p.id)} onChange={() => toggle(p.id)} />
              <span className="truncate">{p.name}</span>
            </label>
          ))}
        </div>
        <button className="bani-btn bani-btn-primary mt-5 w-full" type="submit">Create</button>
      </form>
    </Modal>
  );
}

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { participants, occasions, addExpense } = useBani();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [occasionId, setOccasionId] = useState(occasions[0]?.id ?? "");
  const occ = useMemo(() => occasions.find((o) => o.id === occasionId), [occasions, occasionId]);
  const occParticipants = occ ? participants.filter((p) => occ.participantIds.includes(p.id)) : [];
  const [paidBy, setPaidBy] = useState(occParticipants[0]?.id ?? "");
  const [includedIds, setIncludedIds] = useState<string[]>(occParticipants.map((p) => p.id));
  const [method, setMethod] = useState<SplitMethod>("equal");
  const [raw, setRaw] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids = occ ? occ.participantIds : [];
    setIncludedIds(ids);
    if (!ids.includes(paidBy)) setPaidBy(ids[0] ?? "");
  }, [occasionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const amt = Number(amount) || 0;
  const { splits, error } = useMemo(
    () => computeSplits(method, amt, includedIds, raw),
    [method, amt, includedIds, raw],
  );

  const toggleInclude = (id: string) =>
    setIncludedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Modal title="Add expense" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!description.trim()) return toast.error("Description required");
          if (!amt || amt <= 0) return toast.error("Amount must be > 0");
          if (!occasionId) return toast.error("Pick an occasion");
          if (!paidBy) return toast.error("Pick who paid");
          if (error) return toast.error(error);
          addExpense({ description, amount: amt, paidBy, occasionId, splitMethod: method, splits });
          toast.success("Expense added");
          onClose();
        }}
        className="space-y-3"
      >
        <input className="bani-input" placeholder="Description e.g. Dinner" value={description} onChange={(e) => setDescription(e.target.value)} autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <input className="bani-input" inputMode="decimal" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="bani-input" value={occasionId} onChange={(e) => setOccasionId(e.target.value)}>
            {occasions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Paid by</p>
          <select className="bani-input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {occParticipants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Split method</p>
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-muted/50 p-1">
            {(["equal", "unequal", "percentage", "shares", "adjustment"] as SplitMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold capitalize " +
                  (method === m ? "bg-background text-foreground" : "text-muted-foreground")
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Included {method !== "equal" && `· enter ${method === "percentage" ? "%" : method === "shares" ? "shares" : method === "adjustment" ? "+/- adj" : "amounts"}`}
          </p>
          <div className="space-y-1.5">
            {occParticipants.map((p) => {
              const included = includedIds.includes(p.id);
              const share = splits.find((s) => s.participantId === p.id)?.value ?? 0;
              return (
                <div key={p.id} className={"flex items-center gap-2 rounded-lg border px-3 py-2 text-sm " + (included ? "border-border bg-muted/50" : "border-border/40 bg-transparent opacity-60")}>
                  <input type="checkbox" checked={included} onChange={() => toggleInclude(p.id)} />
                  <span className="flex-1 truncate">{p.name}</span>
                  {method === "equal" ? (
                    <span className="text-xs text-muted-foreground">₹{included ? share.toFixed(2) : "0.00"}</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        disabled={!included}
                        className="bani-input !w-24 !py-1 !px-2 text-right text-xs"
                        inputMode="decimal"
                        value={raw[p.id] ?? ""}
                        onChange={(e) => setRaw((r) => ({ ...r, [p.id]: Number(e.target.value) }))}
                      />
                      {included && <span className="w-16 text-right text-[11px] text-muted-foreground">₹{share.toFixed(2)}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <button type="submit" className="bani-btn bani-btn-primary w-full" disabled={!!error}>
          Add expense
        </button>
      </form>
    </Modal>
  );
}

function SettlementModal({
  settlements,
  nameOf,
  onClose,
}: {
  settlements: { from: string; to: string; amount: number }[];
  nameOf: (id: string) => string;
  onClose: () => void;
}) {
  return (
    <Modal title="Simplified settlements" onClose={onClose}>
      {settlements.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Everyone is settled. 🎉</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">The minimum number of payments to settle everyone:</p>
          <ul className="space-y-2">
            {settlements.map((s, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                <div className="text-sm">
                  <span className="font-semibold">{nameOf(s.from)}</span>{" "}
                  <span className="text-muted-foreground">pays</span>{" "}
                  <span className="font-semibold">{nameOf(s.to)}</span>
                </div>
                <div className="text-base font-extrabold text-emerald-400">₹{s.amount.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </>
      )}
      <button onClick={onClose} className="bani-btn bani-btn-ghost mt-5 w-full">Close</button>
    </Modal>
  );
}
