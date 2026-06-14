import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useBani, computeSplits } from "@/lib/baniyagiri-store";
import { computeBalances, simplifyDebts } from "@/lib/simplify-debts";
import type { Participant, SplitMethod } from "@/lib/baniyagiri-types";
import { toast } from "sonner";
import {
  LayoutGrid, Users, CalendarRange, Receipt, ArrowRightLeft,
  Plus, X, Sparkles, ChevronRight, TrendingUp, Wallet, Check,
  Settings as SettingsIcon, ChevronDown, Download, Upload,
  Trash2, Edit3, FolderPlus, History, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: BaniApp });

/* ============================================================
   Shell
============================================================ */

function WarningPill() {
  return (
    <div className="pointer-events-none sticky top-0 z-40 flex justify-center px-3 pt-3">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50/85 px-3 py-1.5 text-[11px] font-medium text-emerald-900 backdrop-blur-xl shadow-sm">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500/90 text-[9px] text-white">✓</span>
        Local-first · saved on this device only
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-8 pt-10 text-center text-[12px] text-muted-foreground">
      Made with love by{" "}
      <a
        className="font-semibold text-foreground underline-offset-4 hover:underline"
        href="https://www.linkedin.com/in/vishal-kumar-gupta-b5a664252/"
        target="_blank"
        rel="noreferrer"
      >
        Vishal
      </a>
    </footer>
  );
}

function BaniApp() {
  const stage = useBani((s) => s.stage);
  return (
    <div className="flex min-h-screen flex-col">
      {stage !== "landing" && <WarningPill />}
      <main className="flex-1">
        {stage === "landing" && <Landing />}
        {stage === "workspace-setup" && <WorkspaceSetup />}
        {stage === "dashboard" && <Dashboard />}
      </main>
      {stage !== "dashboard" && <Footer />}
    </div>
  );
}


/* ============================================================
   Landing
============================================================ */

function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-lg"
      style={{ width: size, height: size }}
    >
      <span className="font-black tracking-tight" style={{ fontSize: size * 0.5 }}>B</span>
    </div>
  );
}

function Landing() {
  const [name, setName] = useState("");
  const setUsername = useBani((s) => s.setUsername);

  const features = [
    { title: "Split expenses", desc: "Equal, percentage, shares, adjustments.", tile: "tile-sky", icon: <Receipt className="h-5 w-5" /> },
    { title: "Simplify debts", desc: "Fewest possible payments, instantly.", tile: "tile-mint", icon: <ArrowRightLeft className="h-5 w-5" /> },
    { title: "Trips & occasions", desc: "Group expenses by event.", tile: "tile-peach", icon: <CalendarRange className="h-5 w-5" /> },
    { title: "Live balances", desc: "Who owes whom, in real time.", tile: "tile-lavender", icon: <Wallet className="h-5 w-5" /> },
    { title: "Instant settlements", desc: "Beautiful payment flows.", tile: "tile-rose", icon: <Check className="h-5 w-5" /> },
    { title: "Zero friction", desc: "No signup. No backend. No tracking.", tile: "tile-sand", icon: <Sparkles className="h-5 w-5" /> },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-12 pt-6">
      {/* Top nav */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-[15px] font-bold tracking-tight">Baniyagiri</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="mt-16 sm:mt-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/60 px-3 py-1 text-[11px] font-medium text-neutral-600 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          No signup · Browser-only
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black tracking-tight sm:text-7xl leading-[0.95]">
          Baniyagiri
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-neutral-700 sm:text-xl">
          The zero-friction expense splitter.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
          No signups. No logins. No tracking. Split expenses instantly with friends.
        </p>

        <form
          id="enter"
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return toast.error("Enter a name to continue");
            setUsername(name);
          }}
        >
          <input
            className="bani-input flex-1 text-center sm:text-left"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="bani-btn bani-btn-primary whitespace-nowrap">
            Enter Baniyagiri →
          </button>
        </form>
      </section>

      {/* Feature cards */}
      <section className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass animate-fade-soft p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${f.tile} text-neutral-800`}>
              {f.icon}
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ============================================================
   Workspace Setup
============================================================ */

function WorkspaceSetup() {
  const [name, setName] = useState("");
  const setWorkspace = useBani((s) => s.setWorkspace);
  const username = useBani((s) => s.username);
  const loadDemo = useBani((s) => s.loadDemo);
  const examples = ["Goa Trip", "Flat Expenses", "Office Party", "College Tour"];
  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-10 sm:pt-16">
      <div className="mb-6 flex items-center gap-2.5">
        <Logo size={32} />
        <span className="text-sm font-bold tracking-tight">Baniyagiri</span>
      </div>
      <p className="text-sm text-neutral-500">Hey {username || "there"} 👋</p>
      <h2 className="mt-2 text-[34px] font-black tracking-tight leading-tight">
        Name your workspace
      </h2>
      <p className="mt-2 text-[15px] text-neutral-600">A space for one set of shared expenses.</p>

      <form
        className="glass mt-7 p-5"
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
              className="rounded-full border border-neutral-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-white"
            >
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" className="bani-btn bani-btn-primary mt-5 w-full">
          Create workspace
        </button>
        <button
          type="button"
          onClick={() => {
            loadDemo();
            setWorkspace("Goa Trip (Demo)");
          }}
          className="mt-3 w-full text-center text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          or load sample demo data
        </button>
      </form>
    </div>
  );
}

/* ============================================================
   Dashboard
============================================================ */

type Tab = "home" | "people" | "occasions" | "expenses" | "settle";

function Dashboard() {
  const { workspaceName, participants, occasions, expenses } = useBani();
  const username = useBani((s) => s.username);
  const recordSettlements = useBani((s) => s.recordSettlements);
  const [tab, setTab] = useState<Tab>("home");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddOccasion, setShowAddOccasion] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  const balances = useMemo(
    () => computeBalances(participants.map((p) => p.id), expenses),
    [participants, expenses],
  );
  const settlements = useMemo(() => simplifyDebts(balances), [balances]);
  const isYou = (name: string) =>
    !!username && name.trim().toLowerCase() === username.trim().toLowerCase();
  const decorate = (name: string) => (isYou(name) ? `${name} (You)` : name);
  const nameOf = (id: string) => {
    const n = participants.find((p) => p.id === id)?.name ?? "—";
    return decorate(n);
  };
  const totalSpend = expenses.reduce((a, b) => a + b.amount, 0);
  const outstanding = Object.values(balances).reduce((a, b) => a + Math.max(0, b), 0);

  const editingExpense = editingExpenseId
    ? expenses.find((e) => e.id === editingExpenseId) ?? null
    : null;

  const openSimplify = () => {
    if (participants.length < 2) return toast.error("Add at least 2 people");
    setShowSettlement(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-3 sm:px-6">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Workspace
          </p>
          <button
            onClick={() => setShowWorkspaces(true)}
            className="group flex max-w-full items-center gap-1.5"
          >
            <h1 className="truncate text-[26px] font-black tracking-tight sm:text-[30px]">
              {workspaceName}
            </h1>
            <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:text-neutral-900" />
          </button>
        </div>
        <button
          className="bani-btn bani-btn-ghost shrink-0 px-3 py-2 text-xs"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-6">
        {tab === "home" && (
          <HomeView
            participants={participants}
            occasions={occasions}
            expenses={expenses}
            totalSpend={totalSpend}
            outstanding={outstanding}
            balances={balances}
            nameOf={nameOf}
            decorate={decorate}
            onSimplify={openSimplify}
            goTab={setTab}
          />
        )}
        {tab === "people" && (
          <PeopleView
            participants={participants}
            balances={balances}
            decorate={decorate}
            onAdd={() => setShowAddPerson(true)}
          />
        )}
        {tab === "occasions" && (
          <OccasionsView
            decorate={decorate}
            onAdd={() => {
              if (participants.length === 0) return toast.error("Add a person first");
              setShowAddOccasion(true);
            }}
          />
        )}
        {tab === "expenses" && (
          <ExpensesView
            nameOf={nameOf}
            occasionName={(id) => occasions.find((o) => o.id === id)?.name ?? "—"}
            onEdit={(id) => setEditingExpenseId(id)}
          />
        )}
        {tab === "settle" && (
          <SettleView
            settlements={settlements}
            nameOf={nameOf}
            balances={balances}
            canSimplify={participants.length >= 2 && settlements.length > 0}
            onSimplify={openSimplify}
          />
        )}
      </div>

      <InlineFooter />

      {/* FAB */}
      <button
        onClick={() => {
          if (participants.length < 1) return toast.error("Add a person first");
          if (occasions.length < 1) return toast.error("Create an occasion first");
          setShowAddExpense(true);
        }}
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-neutral-900 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)] transition active:scale-95 sm:bottom-28 sm:right-8"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Bottom Nav */}
      <BottomNav tab={tab} setTab={setTab} />

      {showAddPerson && <AddPersonSheet onClose={() => setShowAddPerson(false)} />}
      {showAddOccasion && <AddOccasionSheet onClose={() => setShowAddOccasion(false)} />}
      {showAddExpense && <AddExpenseSheet onClose={() => setShowAddExpense(false)} />}
      {editingExpense && (
        <AddExpenseSheet
          expense={editingExpense}
          onClose={() => setEditingExpenseId(null)}
        />
      )}
      {showSettlement && (
        <SettlementSheet
          settlements={settlements}
          nameOf={nameOf}
          onClose={() => setShowSettlement(false)}
          onConfirm={() => {
            recordSettlements(settlements);
            toast.success("Settlements recorded");
            setShowSettlement(false);
          }}
        />
      )}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
      {showWorkspaces && <WorkspacesSheet onClose={() => setShowWorkspaces(false)} />}
    </div>
  );
}

function InlineFooter() {
  return (
    <div className="mt-10 mb-2 text-center text-[12px] text-neutral-500">
      Made with love by{" "}
      <a
        className="font-semibold text-neutral-900 underline-offset-4 hover:underline"
        href="https://www.linkedin.com/in/vishal-kumar-gupta-b5a664252/"
        target="_blank"
        rel="noreferrer"
      >
        Vishal
      </a>
    </div>
  );
}


/* ---------------- Bottom Navigation ---------------- */

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <LayoutGrid className="h-5 w-5" /> },
    { id: "people", label: "People", icon: <Users className="h-5 w-5" /> },
    { id: "occasions", label: "Trips", icon: <CalendarRange className="h-5 w-5" /> },
    { id: "expenses", label: "Expenses", icon: <Receipt className="h-5 w-5" /> },
    { id: "settle", label: "Settle", icon: <ArrowRightLeft className="h-5 w-5" /> },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 pt-2 pointer-events-none">
      <div className="tabbar pointer-events-auto flex w-full max-w-md items-center justify-between rounded-[28px] px-2 py-1.5">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition " +
                (active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900")
              }
            >
              {it.icon}
              <span className="text-[10px] font-semibold tracking-tight">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------------- Home (Widgets) ---------------- */

function HomeView({
  participants, occasions, expenses, totalSpend, outstanding,
  balances, nameOf, decorate, onSimplify, goTab,
}: {
  participants: Participant[];
  occasions: { id: string; name: string; participantIds: string[] }[];
  expenses: { id: string; amount: number; createdAt: number; description: string; paidBy: string; occasionId: string }[];
  totalSpend: number;
  outstanding: number;
  balances: Record<string, number>;
  nameOf: (id: string) => string;
  decorate: (name: string) => string;
  onSimplify: () => void;
  goTab: (t: Tab) => void;
}) {

  // ring values
  const settledPct = (() => {
    const totals = Object.values(balances).reduce((a, b) => a + Math.abs(b), 0);
    if (totals < 0.01) return 1;
    // After simplification, "settled" = 0 outstanding. Use ratio of settled vs initial outstanding (simplified).
    return Math.max(0, 1 - Math.min(1, outstanding / Math.max(1, totalSpend)));
  })();

  const top = [...participants]
    .map((p) => ({ p, b: balances[p.id] ?? 0 }))
    .sort((a, b) => Math.abs(b.b) - Math.abs(a.b))
    .slice(0, 3);

  const recent = expenses.slice(0, 4);

  return (
    <div className="space-y-4 animate-fade-soft">
      {/* Hero balance widget */}
      <div className="glass-strong p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Total tracked
            </p>
            <p className="mt-1 text-[40px] font-black leading-none tracking-tight">
              ₹{totalSpend.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-[13px] text-neutral-600">
              ₹{outstanding.toFixed(2)} outstanding across {participants.length} people
            </p>
          </div>
          <FitnessRings
            size={104}
            rings={[
              { value: settledPct, color: "#22c55e" },
              { value: Math.min(1, expenses.length / 10), color: "#3b82f6" },
              { value: Math.min(1, occasions.length / 5), color: "#ef4444" },
            ]}
          />
        </div>
        <button
          onClick={onSimplify}
          className="bani-btn bani-btn-primary mt-5 w-full"
        >
          <Sparkles className="h-4 w-4" /> Simplify debts
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <Tile onClick={() => goTab("people")} accent="tile-sky" label="People" value={participants.length} icon={<Users className="h-4 w-4" />} />
        <Tile onClick={() => goTab("occasions")} accent="tile-peach" label="Occasions" value={occasions.length} icon={<CalendarRange className="h-4 w-4" />} />
        <Tile onClick={() => goTab("expenses")} accent="tile-lavender" label="Expenses" value={expenses.length} icon={<Receipt className="h-4 w-4" />} />
        <Tile onClick={() => goTab("settle")} accent="tile-mint" label="Settlements" value={Math.max(0, top.filter(t => Math.abs(t.b) > 0.005).length)} icon={<ArrowRightLeft className="h-4 w-4" />} />
      </div>

      {/* Spending trend (mini line) */}
      {expenses.length > 1 && (
        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Spending trend</p>
              <p className="mt-1 text-xl font-bold tracking-tight">₹{totalSpend.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {expenses.length} txns
            </div>
          </div>
          <div className="mt-3">
            <SparkLine values={[...expenses].reverse().map((e) => e.amount)} />
          </div>
        </div>
      )}

      <AnalyticsWidget
        expenses={expenses}
        participants={participants}
        occasions={occasions}
        nameOf={nameOf}
      />



      {/* Top balances */}
      {top.length > 0 && (
        <div className="glass p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">Top balances</h3>
            <button onClick={() => goTab("people")} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
              View all <ChevronRight className="inline h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-2">
            {top.map(({ p, b }) => <BalanceRow key={p.id} name={decorate(p.name)} balance={b} />)}
          </ul>
        </div>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="glass p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">Recent activity</h3>
            <button onClick={() => goTab("expenses")} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
              View all <ChevronRight className="inline h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-2.5">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100">
                    <Receipt className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{e.description}</p>
                    <p className="truncate text-[11px] text-neutral-500">{nameOf(e.paidBy)} paid</p>
                  </div>
                </div>
                <div className="text-sm font-bold">₹{e.amount.toLocaleString("en-IN")}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {participants.length === 0 && (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Add your first person"
          desc="Add people in your group to start splitting."
          cta="Go to People"
          onCta={() => goTab("people")}
        />
      )}
    </div>
  );
}

function Tile({ label, value, icon, accent, onClick }: { label: string; value: number; icon: React.ReactNode; accent: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="glass relative overflow-hidden p-4 text-left transition active:scale-[0.98]">
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${accent} text-neutral-800`}>
          {icon}
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-0.5 text-2xl font-black tracking-tight">{value}</p>
    </button>
  );
}

function BalanceRow({ name, balance }: { name: string; balance: number }) {
  const positive = balance > 0.005;
  const negative = balance < -0.005;
  return (
    <li className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-[11px] text-neutral-500">
            {positive ? "gets back" : negative ? "owes" : "all settled"}
          </p>
        </div>
      </div>
      <div className={
        "text-sm font-bold " +
        (positive ? "text-emerald-600" : negative ? "text-rose-600" : "text-neutral-400")
      }>
        {positive && "+"}
        ₹{Math.abs(balance).toFixed(2)}
      </div>
    </li>
  );
}

function Avatar({ name }: { name: string }) {
  const palettes = [
    "from-sky-200 to-sky-400",
    "from-rose-200 to-rose-400",
    "from-emerald-200 to-emerald-400",
    "from-amber-200 to-amber-400",
    "from-violet-200 to-violet-400",
    "from-cyan-200 to-cyan-400",
  ];
  const idx = name.charCodeAt(0) % palettes.length;
  return (
    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${palettes[idx]} text-sm font-bold text-neutral-900 shadow-inner`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

/* ---------------- Fitness Rings ---------------- */

function FitnessRings({ size = 96, rings }: { size?: number; rings: { value: number; color: string }[] }) {
  const stroke = Math.max(6, size * 0.085);
  const gap = stroke * 0.4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {rings.map((r, i) => {
        const radius = size / 2 - stroke / 2 - i * (stroke + gap);
        if (radius <= 0) return null;
        const C = 2 * Math.PI * radius;
        const offset = C * (1 - Math.min(1, Math.max(0, r.value)));
        return (
          <g key={i} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={r.color} opacity={0.18} strokeWidth={stroke}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={r.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- Analytics Widget ---------------- */

function AnalyticsWidget({
  expenses, participants, occasions, nameOf,
}: {
  expenses: { id: string; amount: number; createdAt: number; description: string; paidBy: string; occasionId: string }[];
  participants: Participant[];
  occasions: { id: string; name: string; participantIds: string[] }[];
  nameOf: (id: string) => string;
}) {
  const workspaces = useBani((s) => s.workspaces);
  const settlementHistory = useBani((s) => s.settlementHistory);
  const currency = useBani((s) => s.preferences.currency);

  if (expenses.length === 0) return null;

  const largestExpense = expenses.reduce((a, b) => (b.amount > a.amount ? b : a), expenses[0]);
  const largestSettlement = settlementHistory[0]
    ? settlementHistory.reduce((a, b) => (b.amount > a.amount ? b : a), settlementHistory[0])
    : null;

  // Most active = paid most expenses
  const counts: Record<string, number> = {};
  for (const e of expenses) counts[e.paidBy] = (counts[e.paidBy] ?? 0) + 1;
  const topPayerId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Spending by occasion
  const byOcc: Record<string, number> = {};
  for (const e of expenses) byOcc[e.occasionId] = (byOcc[e.occasionId] ?? 0) + e.amount;
  const occTotal = Object.values(byOcc).reduce((a, b) => a + b, 0) || 1;
  const occSorted = Object.entries(byOcc).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const stats: { label: string; value: string }[] = [
    { label: "Workspaces", value: String(workspaces.length) },
    { label: "Participants", value: String(participants.length) },
    { label: "Transactions", value: String(expenses.length) },
    { label: "Settlements", value: String(settlementHistory.length) },
  ];

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight">
          <BarChart3 className="h-4 w-4 text-neutral-500" /> Analytics
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-neutral-50 p-3 text-center">
            <p className="text-lg font-black tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-neutral-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Largest expense</p>
          <p className="mt-0.5 truncate text-sm font-bold">{largestExpense.description}</p>
          <p className="text-xs text-neutral-500">{currency}{largestExpense.amount.toLocaleString("en-IN")} · {nameOf(largestExpense.paidBy)}</p>
        </div>
        <div className="rounded-2xl bg-neutral-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Most active</p>
          <p className="mt-0.5 truncate text-sm font-bold">{topPayerId ? nameOf(topPayerId) : "—"}</p>
          <p className="text-xs text-neutral-500">{topPayerId ? `${counts[topPayerId]} expense${counts[topPayerId] === 1 ? "" : "s"} paid` : ""}</p>
        </div>
        {largestSettlement && (
          <div className="rounded-2xl bg-neutral-50 p-3 sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Largest settlement</p>
            <p className="mt-0.5 truncate text-sm font-bold">{largestSettlement.fromName} → {largestSettlement.toName}</p>
            <p className="text-xs text-neutral-500">{currency}{largestSettlement.amount.toFixed(2)} · {largestSettlement.workspaceName}</p>
          </div>
        )}
      </div>

      {occSorted.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Spending by occasion</p>
          <ul className="space-y-2">
            {occSorted.map(([occId, amt]) => {
              const occ = occasions.find((o) => o.id === occId);
              const pct = (amt / occTotal) * 100;
              return (
                <li key={occId}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-semibold">{occ?.name ?? "—"}</span>
                    <span className="shrink-0 text-neutral-500">{currency}{amt.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-neutral-900" style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Sparkline ---------------- */


function SparkLine({ values }: { values: number[] }) {
  const w = 320, h = 70, pad = 6;
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} Q ${px} ${py} ${cx} ${(py + y) / 2} T ${x} ${y}`;
  }, "");
  const area = `${path} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 70 }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-grad)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- People View ---------------- */

function PeopleView({ participants, balances, decorate, onAdd }: { participants: Participant[]; balances: Record<string, number>; decorate: (name: string) => string; onAdd: () => void }) {
  const totals = Object.values(balances).reduce((a, b) => a + Math.abs(b), 0);
  return (
    <div className="animate-fade-soft space-y-4">
      <SectionHeader title="People" subtitle={`${participants.length} in this workspace`} action={{ label: "Add", onClick: onAdd }} />
      {participants.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No one here yet"
          desc="Add people to start splitting expenses."
          cta="Add person"
          onCta={onAdd}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {participants.map((p) => {
            const b = balances[p.id] ?? 0;
            const positive = b > 0.005, negative = b < -0.005;
            const share = totals > 0 ? Math.abs(b) / totals : 0;
            return (
              <li key={p.id} className="glass relative overflow-hidden p-5">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/0 to-white/40 blur-xl" />
                <div className="flex items-start justify-between">
                  <Avatar name={p.name} />
                  <button
                    onClick={() => useBani.getState().removeParticipant(p.id)}
                    className="text-xs text-neutral-400 hover:text-rose-600"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="mt-4 text-lg font-bold tracking-tight">{decorate(p.name)}</h4>

                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {positive ? "Gets back" : negative ? "Owes" : "Settled"}
                </p>
                <p className={
                  "mt-1 text-2xl font-black tracking-tight " +
                  (positive ? "text-emerald-600" : negative ? "text-rose-600" : "text-neutral-400")
                }>
                  {positive && "+"}
                  ₹{Math.abs(b).toFixed(2)}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={
                      "h-full rounded-full " +
                      (positive ? "bg-emerald-500" : negative ? "bg-rose-500" : "bg-neutral-300")
                    }
                    style={{ width: `${Math.max(6, share * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Occasions View ---------------- */

function OccasionsView({ decorate, onAdd }: { decorate: (name: string) => string; onAdd: () => void }) {
  const occasions = useBani((s) => s.occasions);
  const expenses = useBani((s) => s.expenses);
  const removeOccasion = useBani((s) => s.removeOccasion);

  return (
    <div className="animate-fade-soft space-y-4">
      <SectionHeader title="Occasions" subtitle={`${occasions.length} group${occasions.length === 1 ? "" : "s"}`} action={{ label: "Add", onClick: onAdd }} />
      {occasions.length === 0 ? (
        <EmptyState
          icon={<CalendarRange className="h-6 w-6" />}
          title="No occasions yet"
          desc="Create an occasion to group expenses."
          cta="Create occasion"
          onCta={onAdd}
        />
      ) : (
        <ul className="space-y-3">
          {occasions.map((o) => {
            const occExp = expenses.filter((e) => e.occasionId === o.id);
            const total = occExp.reduce((a, b) => a + b.amount, 0);
            return (
              <li key={o.id} className="glass p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-lg font-bold tracking-tight">{o.name}</h4>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {o.participantIds.length} people · {occExp.length} expense{occExp.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button onClick={() => removeOccasion(o.id)} className="text-neutral-400 hover:text-rose-600" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Total</p>
                    <p className="text-2xl font-black tracking-tight">₹{total.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {o.participantIds.slice(0, 4).map((pid) => {
                      const name = useBani.getState().participants.find((p) => p.id === pid)?.name ?? "?";
                      return (
                        <div key={pid} className="ring-2 ring-white rounded-full">
                          <Avatar name={name} />
                        </div>
                      );
                    })}
                    {o.participantIds.length > 4 && (
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-600 ring-2 ring-white">
                        +{o.participantIds.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Expenses View ---------------- */

function ExpensesView({ nameOf, occasionName, onEdit }: { nameOf: (id: string) => string; occasionName: (id: string) => string; onEdit: (id: string) => void }) {
  const expenses = useBani((s) => s.expenses);
  const removeExpense = useBani((s) => s.removeExpense);
  return (
    <div className="animate-fade-soft space-y-4">
      <SectionHeader title="Expenses" subtitle={`${expenses.length} entr${expenses.length === 1 ? "y" : "ies"}`} />
      {expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No expenses yet"
          desc="Tap the + button to add your first expense."
        />
      ) : (
        <ul className="space-y-3">
          {expenses.map((e) => (
            <li key={e.id} className="glass p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-base font-semibold tracking-tight">{e.description}</h4>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                      {e.splitMethod}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-700">{nameOf(e.paidBy)}</span> paid · {occasionName(e.occasionId)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xl font-black tracking-tight">₹{e.amount.toLocaleString("en-IN")}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <button onClick={() => onEdit(e.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                    <span className="text-neutral-300">·</span>
                    <button onClick={() => removeExpense(e.id)} className="text-[11px] text-neutral-400 hover:text-rose-600">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.splits.map((s) => (
                  <span key={s.participantId} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                    {nameOf(s.participantId)} · ₹{s.value.toFixed(2)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Settle View ---------------- */

function SettleView({ settlements, nameOf, balances, canSimplify, onSimplify }: { settlements: { from: string; to: string; amount: number }[]; nameOf: (id: string) => string; balances: Record<string, number>; canSimplify: boolean; onSimplify: () => void }) {
  const entries = Object.entries(balances).sort((a, b) => b[1] - a[1]);
  return (
    <div className="animate-fade-soft space-y-5">
      <SectionHeader title="Settle up" subtitle={settlements.length === 0 ? "Everyone is squared up" : `${settlements.length} payment${settlements.length === 1 ? "" : "s"} to clear all debts`} />

      {canSimplify && (
        <button onClick={onSimplify} className="bani-btn bani-btn-primary w-full">
          <Sparkles className="h-4 w-4" /> Simplify debts
        </button>
      )}



      {/* Settlements */}
      {settlements.length === 0 ? (
        <EmptyState
          icon={<Check className="h-6 w-6" />}
          title="All settled 🎉"
          desc="Nothing to pay. Everyone's even."
        />
      ) : (
        <ul className="space-y-3">
          {settlements.map((s, i) => (
            <li key={i} className="glass-strong relative overflow-hidden p-5 animate-fade-soft" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={nameOf(s.from)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{nameOf(s.from)}</p>
                    <p className="text-[11px] text-neutral-500">pays</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-center">
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-base font-black tracking-tight text-emerald-700">
                    ₹{s.amount.toFixed(2)}
                  </div>
                  <div className="mt-1 text-neutral-300">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{nameOf(s.to)}</p>
                    <p className="text-[11px] text-neutral-500">receives</p>
                  </div>
                  <Avatar name={nameOf(s.to)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Balances summary */}
      {entries.length > 0 && (
        <div className="glass p-5">
          <h3 className="mb-3 text-[15px] font-semibold tracking-tight">All balances</h3>
          <ul className="space-y-2.5">
            {entries.map(([id, b]) => (
              <BalanceRow key={id} name={nameOf(id)} balance={b} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Section header / Empty ---------------- */

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-[24px] font-black tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="bani-btn bani-btn-primary px-4 py-2 text-xs">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          {action.label}
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, onCta }: { icon: React.ReactNode; title: string; desc: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="glass flex flex-col items-center px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">{desc}</p>
      {cta && onCta && (
        <button onClick={onCta} className="bani-btn bani-btn-primary mt-5">
          <Plus className="h-4 w-4" strokeWidth={2.5} /> {cta}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   Bottom Sheets
============================================================ */

function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-neutral-900/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="animate-sheet w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2.5">
          <div className="h-1.5 w-10 rounded-full bg-neutral-200" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-3">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}

function AddPersonSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const addParticipant = useBani((s) => s.addParticipant);
  return (
    <BottomSheet title="Add a person" onClose={onClose}>
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
        <button className="bani-btn bani-btn-primary mt-4 w-full" type="submit">Add person</button>
      </form>
    </BottomSheet>
  );
}

function AddOccasionSheet({ onClose }: { onClose: () => void }) {
  const participants = useBani((s) => s.participants);
  const addOccasion = useBani((s) => s.addOccasion);
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>(participants.map((p) => p.id));
  const toggle = (id: string) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <BottomSheet title="New occasion" onClose={onClose}>
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
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Included participants</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {participants.map((p) => (
            <label
              key={p.id}
              className={
                "flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition " +
                (ids.includes(p.id)
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700")
              }
            >
              <input type="checkbox" className="sr-only" checked={ids.includes(p.id)} onChange={() => toggle(p.id)} />
              <span className={"grid h-4 w-4 place-items-center rounded-full border " + (ids.includes(p.id) ? "border-white bg-white text-neutral-900" : "border-neutral-300")}>
                {ids.includes(p.id) && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="truncate font-medium">{p.name}</span>
            </label>
          ))}
        </div>
        <button className="bani-btn bani-btn-primary mt-5 w-full" type="submit">Create occasion</button>
      </form>
    </BottomSheet>
  );
}

function AddExpenseSheet({ onClose }: { onClose: () => void }) {
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
    <BottomSheet title="Add expense" onClose={onClose}>
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

        {/* big amount */}
        <div className="rounded-2xl bg-neutral-50 px-4 py-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Amount</p>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black text-neutral-400">₹</span>
            <input
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-40 bg-transparent text-center text-4xl font-black tracking-tight outline-none placeholder:text-neutral-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Occasion</p>
            <select className="bani-input" value={occasionId} onChange={(e) => setOccasionId(e.target.value)}>
              {occasions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Paid by</p>
            <select className="bani-input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {occParticipants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Split method</p>
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1">
            {(["equal", "unequal", "percentage", "shares", "adjustment"] as SplitMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition " +
                  (method === m ? "bg-white text-neutral-900 shadow" : "text-neutral-500")
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Included {method !== "equal" && `· enter ${method === "percentage" ? "%" : method === "shares" ? "shares" : method === "adjustment" ? "+/- adj" : "amounts"}`}
          </p>
          <div className="space-y-1.5">
            {occParticipants.map((p) => {
              const included = includedIds.includes(p.id);
              const share = splits.find((s) => s.participantId === p.id)?.value ?? 0;
              return (
                <div key={p.id} className={"flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition " + (included ? "border-neutral-200 bg-white" : "border-neutral-100 bg-neutral-50/50 opacity-60")}>
                  <input type="checkbox" className="h-4 w-4 accent-neutral-900" checked={included} onChange={() => toggleInclude(p.id)} />
                  <Avatar name={p.name} />
                  <span className="flex-1 truncate font-medium">{p.name}</span>
                  {method === "equal" ? (
                    <span className="text-xs font-semibold text-neutral-600">₹{included ? share.toFixed(2) : "0.00"}</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        disabled={!included}
                        className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-right text-xs font-semibold outline-none focus:border-neutral-400"
                        inputMode="decimal"
                        value={raw[p.id] ?? ""}
                        onChange={(e) => setRaw((r) => ({ ...r, [p.id]: Number(e.target.value) }))}
                      />
                      {included && <span className="w-16 text-right text-[11px] font-semibold text-neutral-500">₹{share.toFixed(2)}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

        <button type="submit" className="bani-btn bani-btn-primary sticky bottom-0 w-full" disabled={!!error}>
          Add expense
        </button>
      </form>
    </BottomSheet>
  );
}

function SettlementSheet({
  settlements,
  nameOf,
  onClose,
  onConfirm,
}: {
  settlements: { from: string; to: string; amount: number }[];
  nameOf: (id: string) => string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet title="Simplified settlements" onClose={onClose}>
      {settlements.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-700">Everyone is settled 🎉</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-neutral-500">
            Minimum payments to settle everyone:
          </p>
          <ul className="space-y-3">
            {settlements.map((s, i) => (
              <li
                key={i}
                className="animate-fade-soft rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={nameOf(s.from)} />
                    <div>
                      <p className="text-sm font-semibold">{nameOf(s.from)}</p>
                      <p className="text-[11px] text-neutral-500">pays</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-neutral-900 px-3 py-1 text-sm font-black text-white">
                      ₹{s.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{nameOf(s.to)}</p>
                      <p className="text-[11px] text-neutral-500">receives</p>
                    </div>
                    <Avatar name={nameOf(s.to)} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="bani-btn bani-btn-ghost flex-1">Close</button>
        {settlements.length > 0 && (
          <button onClick={onConfirm} className="bani-btn bani-btn-primary flex-1">
            <Check className="h-4 w-4" /> Mark as paid
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

/* ============================================================
   Workspaces sheet
============================================================ */

function WorkspacesSheet({ onClose }: { onClose: () => void }) {
  const workspaces = useBani((s) => s.workspaces);
  const activeId = useBani((s) => s.activeWorkspaceId);
  const switchWorkspace = useBani((s) => s.switchWorkspace);
  const createWorkspace = useBani((s) => s.createWorkspace);
  const renameWorkspace = useBani((s) => s.renameWorkspace);
  const deleteWorkspace = useBani((s) => s.deleteWorkspace);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <BottomSheet title="Your workspaces" onClose={onClose}>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return toast.error("Name required");
          createWorkspace(newName);
          setNewName("");
          toast.success("Workspace created");
          onClose();
        }}
      >
        <input
          className="bani-input"
          placeholder="New workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="bani-btn bani-btn-primary shrink-0">
          <FolderPlus className="h-4 w-4" /> Create
        </button>
      </form>

      <ul className="space-y-2">
        {workspaces.map((w) => {
          const isActive = w.id === activeId;
          const isEditing = editingId === w.id;
          return (
            <li key={w.id} className={"rounded-2xl border p-3 " + (isActive ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white")}>
              <div className="flex items-center justify-between gap-2">
                {isEditing ? (
                  <input
                    autoFocus
                    className="bani-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameWorkspace(w.id, editName);
                        setEditingId(null);
                        toast.success("Renamed");
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <button
                    onClick={() => { switchWorkspace(w.id); onClose(); }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-semibold">
                      {w.name} {isActive && <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</span>}
                    </p>
                    <p className="truncate text-[11px] text-neutral-500">
                      {w.participants.length} people · {w.expenses.length} expense{w.expenses.length === 1 ? "" : "s"}
                    </p>
                  </button>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <button
                      onClick={() => {
                        renameWorkspace(w.id, editName);
                        setEditingId(null);
                        toast.success("Renamed");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white"
                      aria-label="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditingId(w.id); setEditName(w.name); }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      aria-label="Rename"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${w.name}" and all its data?`)) {
                        deleteWorkspace(w.id);
                        toast.success("Workspace deleted");
                      }
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-rose-500 hover:bg-rose-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

/* ============================================================
   Settings sheet
============================================================ */

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const username = useBani((s) => s.username);
  const preferences = useBani((s) => s.preferences);
  const setPreferences = useBani((s) => s.setPreferences);
  const exportData = useBani((s) => s.exportData);
  const importData = useBani((s) => s.importData);
  const clearAllData = useBani((s) => s.clearAllData);
  const clearSheet = useBani((s) => s.clearSheet);
  const workspaces = useBani((s) => s.workspaces);
  const settlementHistory = useBani((s) => s.settlementHistory);

  const onExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baniyagiri-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(String(reader.result || ""));
      if (ok) {
        toast.success("Data imported");
        onClose();
      } else {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <BottomSheet title="Settings" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl bg-neutral-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Signed in as</p>
          <p className="mt-1 text-base font-bold">{username || "Guest"}</p>
          <p className="mt-2 text-[11px] text-neutral-500">
            {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"} · {settlementHistory.length} settlement{settlementHistory.length === 1 ? "" : "s"} on record
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Currency symbol</p>
          <input
            className="bani-input"
            value={preferences.currency}
            maxLength={3}
            onChange={(e) => setPreferences({ currency: e.target.value })}
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Data</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={onExport} className="bani-btn bani-btn-ghost w-full justify-start">
              <Download className="h-4 w-4" /> Export all data (JSON)
            </button>
            <label className="bani-btn bani-btn-ghost w-full cursor-pointer justify-start">
              <Upload className="h-4 w-4" /> Import data (JSON)
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>
            <button
              onClick={() => {
                if (confirm("Clear the current workspace? Everyone, occasions, and expenses will be erased.")) {
                  clearSheet();
                  toast.success("Workspace cleared");
                  onClose();
                }
              }}
              className="bani-btn bani-btn-ghost w-full justify-start text-amber-700"
            >
              <Trash2 className="h-4 w-4" /> Clear current workspace
            </button>
            <button
              onClick={() => {
                if (confirm("Delete EVERYTHING — workspaces, settlement history, preferences? This cannot be undone.")) {
                  clearAllData();
                  toast.success("All data cleared");
                  onClose();
                }
              }}
              className="bani-btn bani-btn-ghost w-full justify-start text-rose-600"
            >
              <Trash2 className="h-4 w-4" /> Clear all data
            </button>
          </div>
        </div>

        {settlementHistory.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              <History className="mr-1 inline h-3 w-3" /> Recent settlements
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {settlementHistory.slice(0, 12).map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 text-xs">
                  <span className="truncate">
                    <span className="font-semibold">{s.fromName}</span> → <span className="font-semibold">{s.toName}</span>
                    <span className="ml-1 text-neutral-400">· {s.workspaceName}</span>
                  </span>
                  <span className="shrink-0 font-bold">{preferences.currency}{s.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center text-[11px] text-neutral-400">
          Local-first · runs entirely in your browser. No backend, no tracking.
        </p>
      </div>
    </BottomSheet>
  );
}
