import { useState, useCallback, useMemo, useContext } from 'react';
import {
  useSummary, useCategoryBreakdown, useTrends, useBudgetStatus,
  useGoals, useRecurring
} from '../hooks/useData';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getCategoryInfo } from '../utils/format';
import {
  Wallet, Receipt, Target, ArrowUpRight, ArrowDownRight,
  RotateCcw, Sparkles, Plus, CheckCircle, Clock, ShieldAlert,
  GraduationCap, TrendingUp, PiggyBank, Calendar, X,
  ArrowDownLeft, DollarSign, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import DashboardWidget, { WidgetDef, DEFAULT_WIDGET_ORDER } from '../components/DashboardWidget';
import InsightsPanel from '../components/InsightsPanel';
import ActivityFeed from '../components/ActivityFeed';
import { api } from '../utils/api';

function loadLayout(): WidgetDef[] {
  try {
    const stored = localStorage.getItem('dashboard-layout');
    if (stored) {
      const parsed: WidgetDef[] = JSON.parse(stored);
      const storedIds = new Set(parsed.map(w => w.id));
      const missing = DEFAULT_WIDGET_ORDER.filter(w => !storedIds.has(w.id));
      return [...parsed, ...missing];
    }
  } catch {}
  return DEFAULT_WIDGET_ORDER;
}

export default function Dashboard() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useSummary();
  const { data: categoryData, refetch: refetchCategory } = useCategoryBreakdown(1);
  const { data: trendsData, refetch: refetchTrends } = useTrends(30);
  const { data: budgetData, refetch: refetchBudgets } = useBudgetStatus();
  const { data: goalsData, refetch: refetchGoals } = typeof useGoals === 'function' ? useGoals() : { data: null, refetch: () => {} };
  const { data: recurringData } = typeof useRecurring === 'function' ? useRecurring() : { data: null };

  const [widgets, setWidgets] = useState<WidgetDef[]>(loadLayout);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [quickActionSuccess, setQuickActionSuccess] = useState<string | null>(null);
  const [quickActionLoading, setQuickActionLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<'expense' | 'income' | 'goal' | null>(null);
  const [modalForm, setModalForm] = useState({
    amount: '',
    description: '',
    category: 'food',
    paymentMethod: 'cash',
    notes: '',
    targetAmount: '',
    targetDate: ''
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => setDragging(id), []);

  const handleDragOver = useCallback((_e: React.DragEvent, id: string) => {
    if (dragging && dragging !== id) setDragOver(id);
  }, [dragging]);

  const handleDrop = useCallback((_e: React.DragEvent, targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setWidgets(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(w => w.id === dragging);
      const toIdx = next.findIndex(w => w.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      localStorage.setItem('dashboard-layout', JSON.stringify(next));
      return next;
    });
    setDragging(null);
    setDragOver(null);
  }, [dragging]);

  const resetLayout = () => {
    localStorage.removeItem('dashboard-layout');
    setWidgets(DEFAULT_WIDGET_ORDER);
  };

  // Student Daily Safe-to-Spend calculations
  const studentMetrics = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
    const budget = summary?.currentMonth.budget || 15000;
    const spent = summary?.currentMonth.total || 0;
    const remaining = Math.max(0, budget - spent);
    const dailySafeSpend = remaining > 0 ? +(remaining / daysLeft).toFixed(0) : 0;
    const income = summary?.totalIncome || summary?.currentMonth.income || 23500;
    const netSavings = +(income - spent).toFixed(2);
    const savingsRate = income > 0 ? +((netSavings / income) * 100).toFixed(1) : 0;
    return { daysInMonth, daysLeft, budget, remaining, dailySafeSpend, income, netSavings, savingsRate };
  }, [summary]);

  // Quick Student Expense Logger
  const handleQuickAdd = async (description: string, amount: number, category: string) => {
    try {
      setQuickActionLoading(true);
      await api.post('/expenses', {
        description,
        amount,
        category,
        paymentMethod: 'cash',
        date: new Date().toISOString()
      });
      setQuickActionSuccess(`Added ₹${amount} for ${description}!`);
      setTimeout(() => setQuickActionSuccess(null), 3000);
      refetchSummary?.();
      refetchCategory?.();
      refetchTrends?.();
      refetchBudgets?.();
    } catch {
      // silently handle
    } finally {
      setQuickActionLoading(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSaving(true);
    try {
      if (showAddModal === 'expense' || showAddModal === 'income') {
        await api.post('/expenses', {
          description: modalForm.description,
          amount: parseFloat(modalForm.amount),
          type: showAddModal,
          category: modalForm.category,
          paymentMethod: modalForm.paymentMethod,
          notes: modalForm.notes,
          date: new Date().toISOString()
        });
        setQuickActionSuccess(`Successfully logged ${showAddModal === 'income' ? 'income' : 'expense'}: ${modalForm.description}`);
      } else if (showAddModal === 'goal') {
        await api.post('/goals', {
          name: modalForm.description,
          targetAmount: parseFloat(modalForm.targetAmount),
          currentAmount: parseFloat(modalForm.amount) || 0,
          targetDate: modalForm.targetDate || undefined,
          category: modalForm.category
        });
        setQuickActionSuccess(`Created savings goal: ${modalForm.description}`);
      }

      setShowAddModal(null);
      setModalForm({
        amount: '',
        description: '',
        category: 'food',
        paymentMethod: 'cash',
        notes: '',
        targetAmount: '',
        targetDate: ''
      });
      setTimeout(() => setQuickActionSuccess(null), 3500);

      // Refresh relevant data
      refetchSummary?.();
      refetchCategory?.();
      refetchTrends?.();
      refetchBudgets?.();
      refetchGoals?.();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setModalSaving(false);
    }
  };

  if (summaryLoading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-10 h-10 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">
          Loading student financial dashboard...
        </span>
      </div>
    );
  }

  const s = summary;
  const isOverBudget = s.currentMonth.budgetUsed > 100;
  const momChange = s.monthOverMonthChange;
  const incomeAmount = s.totalIncome ?? s.currentMonth.income ?? 23500;
  const netSavingsAmount = +(incomeAmount - s.currentMonth.total).toFixed(2);
  const savingsRatePct = incomeAmount > 0 ? +((netSavingsAmount / incomeAmount) * 100).toFixed(1) : 0;

  const widgetContent: Record<string, React.ReactNode> = {
    summary: (
      <div className="space-y-4">
        {/* Top 4 Core Financial SaaS Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: This Month Total Expenses */}
          <SummaryCard
            label="This Month"
            value={formatCurrency(s.currentMonth.total)}
            sub={`${s.currentMonth.count} transactions`}
            icon={<Wallet className="w-4 h-4" />}
            accent="bg-[#0f3424] text-emerald-300 shadow-sm"
            highlight="Total Expenses"
          />

          {/* Card 2: Total Income / Allowance */}
          <SummaryCard
            label="Total Income"
            value={formatCurrency(incomeAmount)}
            sub={`Allowance, scholarship & tutoring`}
            icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50"
            highlight="Monthly Inflows"
          />

          {/* Card 3: Month-over-Month Comparison */}
          <SummaryCard
            label="Month-over-Month"
            value={`${momChange > 0 ? '+' : ''}${momChange}%`}
            sub={`vs ${formatCurrency(s.lastMonth.total)} last month`}
            icon={momChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            accent={momChange > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50'}
            highlight={momChange > 0 ? 'Increased Spend' : 'Reduced Spend'}
          />

          {/* Card 4: Budget Used & Remaining */}
          <SummaryCard
            label="Budget Used"
            value={`${s.currentMonth.budgetUsed}%`}
            sub={`${formatCurrency(s.currentMonth.budget - s.currentMonth.total)} remaining`}
            icon={<Target className="w-4 h-4" />}
            accent={isOverBudget ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50'}
            highlight={isOverBudget ? 'Over Budget' : 'Within Limit'}
          />
        </div>

        {/* Secondary Row: Savings Rate, Available Balance, Today's Spend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between border-gray-200/70">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Available Balance
              </span>
              <div className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(netSavingsAmount)}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Total Income minus Expenses</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>

          <div className="card p-4 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between border-gray-200/70">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Student Savings Rate
              </span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {savingsRatePct}%
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Net savings / total allowance</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div className="card p-4 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between border-gray-200/70">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                Today
              </span>
              <div className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(s.today.total)}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.today.count} transactions today</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    ),

    insights: <InsightsPanel />,

    trend: (
      <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Daily Spending Trend (30 Days)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daily campus expense history formatted in INR (₹)</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
            ₹ Daily Pacing
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsData?.trends || []} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="studentTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), 'dd MMM')}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false} tickLine={false} width={60}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Spent']}
                labelFormatter={(d) => format(parseISO(d as string), 'dd MMM yyyy')}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              />
              <Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} fill="url(#studentTrendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),

    category: (
      <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">By Category</h3>
          <span className="text-[11px] text-gray-400">Current Month</span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData?.breakdown || []}
                dataKey="total" nameKey="category"
                cx="50%" cy="50%"
                innerRadius={46} outerRadius={70} paddingAngle={3}
              >
                {(categoryData?.breakdown || []).map(entry => (
                  <Cell key={entry.category} fill={getCategoryInfo(entry.category).color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), getCategoryInfo(name).label]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 mt-2 max-h-44 overflow-y-auto pr-1">
          {(categoryData?.breakdown || []).slice(0, 5).map(b => {
            const info = getCategoryInfo(b.category);
            return (
              <div key={b.category} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{info.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{info.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">{formatCurrency(b.total)}</span>
                  <span className="text-[10px] text-gray-400 w-8 text-right font-medium">{b.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),

    budget: budgetData?.budgetStatus?.length ? (
      <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Student Category Budgets</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep monthly allowances on track</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50">
            <span>{budgetData.budgetStatus.filter(b => !b.isOverBudget).length} / {budgetData.budgetStatus.length} Safe</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetData.budgetStatus.map(b => {
            const info = getCategoryInfo(b.category);
            const pct = Math.min(b.percentUsed, 100);
            return (
              <div key={b.category} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200 truncate">
                    <span>{info.icon}</span>
                    <span className="truncate">{info.label}</span>
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                    b.isOverBudget
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      : b.percentUsed > 80
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  }`}>
                    {b.percentUsed}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.isOverBudget ? 'bg-rose-500' : b.percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Spent: {formatCurrency(b.spent)}</span>
                  <span>Limit: {formatCurrency(b.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null,

    // Upcoming Recurring Payments & Student Savings Goals
    activity: (
      <div className="space-y-6">
        {/* Savings Goals widget */}
        {goalsData?.goals && goalsData.goals.length > 0 && (
          <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  <span>Student Savings Goals</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Target savings for tuition, gadgets, and contingency</p>
              </div>
              <button
                onClick={() => setShowAddModal('goal')}
                className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Goal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {goalsData.goals.map(g => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g._id} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{g.name}</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      <span>Saved: {formatCurrency(g.currentAmount)}</span>
                      <span>Goal: {formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Recurring Payments */}
        {recurringData?.recurring && recurringData.recurring.length > 0 && (
          <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Upcoming Recurring Payments</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automated student bills & recharge cycles</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recurringData.recurring.slice(0, 4).map(r => (
                <div key={r._id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-sm">
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{r.description}</div>
                  <div className="text-base font-black text-gray-900 dark:text-white font-mono mt-0.5">
                    {formatCurrency(r.amount)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 capitalize flex items-center justify-between">
                    <span>{r.frequency}</span>
                    <span>Due: {format(parseISO(r.nextDueDate), 'dd MMM')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ActivityFeed />
      </div>
    )
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Student Welcome Header — Forest Green Academic Aesthetic */}
      <div className="rounded-2xl p-6 md:p-7 bg-gradient-to-r from-[#071c13] via-[#0a271b] to-[#0f3424] text-white shadow-md border border-[#143e2b] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 flex items-center gap-1 font-mono">
                <GraduationCap className="w-3 h-3 text-emerald-400" /> expensetracker · Student Finance
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Sowmya'}
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 max-w-xl">
              Spend wisely. Save confidently. Manage canteen snacks, transit, room rent, and shared tabs in Indian Rupees (₹).
            </p>
          </div>

          {/* Student Safe-to-Spend & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#0e3021]/80 backdrop-blur-md rounded-xl p-4 border border-[#1b4d36] flex items-center gap-3.5 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">
                  Daily Safe-to-Spend
                </div>
                <div className="text-xl font-black font-mono text-emerald-300">
                  ₹{studentMetrics.dailySafeSpend} <span className="text-xs font-normal text-white/70">/ day</span>
                </div>
                <div className="text-[10px] text-emerald-200/70 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {studentMetrics.daysLeft} days remaining in month
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => setShowAddModal('income')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Add Income
              </button>
              <button
                onClick={() => setShowAddModal('expense')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Student Spends Shortcut Bar */}
        <div className="mt-5 pt-4 border-t border-[#16432f] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1 mr-1">
            <Plus className="w-3 h-3 text-emerald-400" /> Quick Log:
          </span>
          {[
            { label: '☕ Canteen Chai', desc: 'Campus Canteen Chai & Samosa', amt: 50, cat: 'food' },
            { label: '🚌 Metro Ticket', desc: 'Metro Transit Smartcard', amt: 40, cat: 'transport' },
            { label: '📄 Assignment Xerox', desc: 'Lab Record Xerox', amt: 25, cat: 'shopping' },
            { label: '🥪 Mess Meal', desc: 'Hostel Mess Dinner', amt: 110, cat: 'food' }
          ].map(shortcut => (
            <button
              key={shortcut.label}
              onClick={() => handleQuickAdd(shortcut.desc, shortcut.amt, shortcut.cat)}
              disabled={quickActionLoading}
              className="text-xs bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 font-medium disabled:opacity-50"
            >
              <span>{shortcut.label}</span>
              <span className="text-emerald-300 font-mono font-bold">₹{shortcut.amt}</span>
            </button>
          ))}
          {quickActionSuccess && (
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1 ml-2 animate-fade-in bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-600/50">
              <CheckCircle className="w-3.5 h-3.5" /> {quickActionSuccess}
            </span>
          )}
        </div>
      </div>

      {/* Reset layout bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span className="font-medium">Widgets are draggable — arrange your preferred dashboard layout</span>
        <button
          onClick={resetLayout}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
          title="Reset dashboard layout"
        >
          <RotateCcw className="w-3 h-3" /> Reset layout
        </button>
      </div>

      {/* Widgets Grid */}
      {widgets.map(widget => {
        const content = widgetContent[widget.id];
        if (!content) return null;
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragOver={dragOver === widget.id}
          >
            {/* Two-column layout for trend+category side by side */}
            {widget.id === 'trend' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">{widgetContent['trend']}</div>
                <div>{widgetContent['category']}</div>
              </div>
            ) : widget.id === 'category' ? null : content}
          </DashboardWidget>
        );
      })}

      {/* Modal for Quick Logging Income, Expense, or Goal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {showAddModal === 'income' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                {showAddModal === 'expense' && <Receipt className="w-4 h-4 text-emerald-600" />}
                {showAddModal === 'goal' && <PiggyBank className="w-4 h-4 text-emerald-600" />}
                <span>
                  {showAddModal === 'income' ? 'Log Student Income / Allowance' : showAddModal === 'expense' ? 'Log Student Expense' : 'Create Savings Goal'}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              <div>
                <label className="label">
                  {showAddModal === 'goal' ? 'Goal Name' : 'Description'}
                </label>
                <input
                  className="input"
                  value={modalForm.description}
                  onChange={e => setModalForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={
                    showAddModal === 'income'
                      ? 'e.g. Monthly Allowance from Parents'
                      : showAddModal === 'goal'
                      ? 'e.g. Semester Exam Fee Fund'
                      : 'e.g. Canteen Dosa & Chai'
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">
                    {showAddModal === 'goal' ? 'Target Amount (₹)' : 'Amount (₹)'}
                  </label>
                  <input
                    className="input font-mono"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={showAddModal === 'goal' ? modalForm.targetAmount : modalForm.amount}
                    onChange={e =>
                      showAddModal === 'goal'
                        ? setModalForm(f => ({ ...f, targetAmount: e.target.value }))
                        : setModalForm(f => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={modalForm.category}
                    onChange={e => setModalForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {showAddModal === 'income' ? (
                      <>
                        <option value="allowance">Monthly Allowance</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="part_time">Part-Time / Tutoring</option>
                        <option value="stipend">Internship Stipend</option>
                        <option value="freelance">Freelance</option>
                        <option value="gift">Gifts & Awards</option>
                        <option value="other_income">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="food">Canteen, Mess & Food</option>
                        <option value="transport">Bus, Metro & Commute</option>
                        <option value="housing">Hostel & PG Rent</option>
                        <option value="utilities">Wi-Fi & Recharge</option>
                        <option value="shopping">Stationery & Xerox</option>
                        <option value="education">Tuition & Books</option>
                        <option value="entertainment">Outings & Movies</option>
                        <option value="healthcare">Health & Wellness</option>
                        <option value="subscriptions">EdTech & OTT</option>
                        <option value="other">Other Campus Misc</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {showAddModal !== 'goal' && (
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    className="input"
                    value={modalForm.paymentMethod}
                    onChange={e => setModalForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="debit_card">Debit Card / UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
              )}

              {showAddModal === 'goal' && (
                <div>
                  <label className="label">Target Date (Optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={modalForm.targetDate}
                    onChange={e => setModalForm(f => ({ ...f, targetDate: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="label">Notes (Optional)</label>
                <input
                  className="input"
                  value={modalForm.notes}
                  onChange={e => setModalForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional context or comments"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                >
                  {modalSaving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, icon, accent, highlight }: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; accent: string; highlight?: string;
}) {
  return (
    <div className="card p-5 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
          {highlight && (
            <span className="block text-[10px] font-medium text-emerald-700 dark:text-emerald-400">{highlight}</span>
          )}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${accent}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white font-mono">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{sub}</div>
    </div>
  );
}
