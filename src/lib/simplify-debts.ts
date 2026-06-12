import type { Expense, Settlement } from "./baniyagiri-types";

export function computeBalances(
  participantIds: string[],
  expenses: Expense[],
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const id of participantIds) balances[id] = 0;

  for (const exp of expenses) {
    if (balances[exp.paidBy] === undefined) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += exp.amount;
    for (const s of exp.splits) {
      if (balances[s.participantId] === undefined) balances[s.participantId] = 0;
      balances[s.participantId] -= s.value;
    }
  }
  // Round to 2 decimals
  for (const k of Object.keys(balances)) {
    balances[k] = Math.round(balances[k] * 100) / 100;
  }
  return balances;
}

export function simplifyDebts(balances: Record<string, number>): Settlement[] {
  const creditors: { id: string; amt: number }[] = [];
  const debtors: { id: string; amt: number }[] = [];
  for (const [id, b] of Object.entries(balances)) {
    if (b > 0.005) creditors.push({ id, amt: b });
    else if (b < -0.005) debtors.push({ id, amt: -b });
  }
  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);

  const settlements: Settlement[] = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const c = creditors[i];
    const d = debtors[j];
    const m = Math.min(c.amt, d.amt);
    const amount = Math.round(m * 100) / 100;
    if (amount > 0) {
      settlements.push({ from: d.id, to: c.id, amount });
    }
    c.amt -= m;
    d.amt -= m;
    if (c.amt < 0.005) i++;
    if (d.amt < 0.005) j++;
  }
  return settlements;
}
