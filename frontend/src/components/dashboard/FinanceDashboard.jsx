import { useState } from 'react'
import { Camera, LogOut, Mail, Moon, RefreshCw, Sun, User, X } from 'lucide-react'
import { clampPercent, formatCurrency } from '../../utils/financeHelpers'

function FinanceDashboard({
  dashboardData,
  financeSummary,
  addGoalData,
  error,
  user,
  message,
  onAddGoal,
  onGoalChange,
  onProfileFinanceChange,
  onProfileFinanceSubmit,
  onRefresh,
  onLogout,
  onToggleTheme,
  profileFinanceData,
  isLoading,
  isDarkMode,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profilePhotoKey = `profilePhoto:${user.email || user.name || 'user'}`
  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem(profilePhotoKey) || '',
  )
  const latestFinance = dashboardData?.entries?.[0] || financeSummary
  const dashboardSummary = dashboardData?.summary
  const goals = latestFinance.goals?.length ? latestFinance.goals : [latestFinance.goal]
  const canAddGoal = goals.length < 3
  const salary = Number(latestFinance.salary || 0)
  const expense = Number(latestFinance.expense || 0)
  const remaining = Number(latestFinance.remainingAmount || 0)
  const goalAmount = Number(
    latestFinance.totalGoalAmount ??
      goals.reduce((total, goal) => total + Number(goal?.amount || 0), 0),
  )
  const monthlyGoalAmount = Number(latestFinance.monthlyGoalAmount || 0)
  const longestGoalTimeInMonths = Number(
    latestFinance.longestGoalTimeInMonths ||
      goals.reduce(
        (longestTime, goal) => Math.max(longestTime, Number(goal?.timeInMonths || 0)),
        0,
      ),
  )
  const goalSummaryLabel =
    goals.length > 1 ? `${goals.length} goals total` : latestFinance.goal?.name
  const expensePercent = salary === 0 ? 0 : clampPercent((expense / salary) * 100)
  const remainingPercent = salary === 0 ? 0 : clampPercent((remaining / salary) * 100)
  const goalProgress = clampPercent(latestFinance.goalProgress)
  const monthlyProgress =
    monthlyGoalAmount === 0 ? 100 : clampPercent((remaining / monthlyGoalAmount) * 100)
  const circle = 2 * Math.PI * 44

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const image = String(reader.result || '')

      setProfilePhoto(image)
      localStorage.setItem(profilePhotoKey, image)
    }

    reader.readAsDataURL(file)
  }

  return (
    <main className={`dashboard-shell min-h-screen text-slate-950 ${isDarkMode ? 'theme-dark' : ''}`}>
      <section className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8">
        <header className="finance-hero flex flex-col gap-4 rounded-lg bg-[#0f766e] p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              className="profile-pulse relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-lg font-bold text-[#0f766e] transition hover:bg-teal-50"
              onClick={() => setIsProfileOpen((current) => !current)}
              title="View profile"
              type="button"
            >
              {profilePhoto ? (
                <img
                  alt={user.name}
                  className="size-full object-cover"
                  src={profilePhoto}
                />
              ) : (
                user.name?.slice(0, 1)?.toUpperCase() || 'U'
              )}
              <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-orange-500 text-white">
                <Camera size={11} />
              </span>
            </button>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Finance Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Hi {user.name}, here is your analysis</h1>
              <p className="mt-2 text-sm text-teal-50">
                Your latest salary, expense, and goal plan turned into readable insights.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="grid size-10 place-items-center rounded-md bg-white text-[#0f766e] transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              onClick={onRefresh}
              title="Refresh dashboard"
              type="button"
            >
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
            </button>
            <button
              className="grid size-10 place-items-center rounded-md border border-white/30 text-white transition hover:bg-white/10"
              onClick={onToggleTheme}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {isProfileOpen && (
          <>
            <button
              aria-label="Close profile"
              className="profile-scrim fixed inset-0 z-30 bg-slate-950/30"
              onClick={() => setIsProfileOpen(false)}
              type="button"
            />
            <aside className="profile-drawer fixed left-0 top-0 z-40 flex h-dvh w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl">
              <div className="profile-drawer-top relative bg-[#0f766e] px-6 pb-8 pt-6 text-white">
                <button
                  className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  onClick={() => setIsProfileOpen(false)}
                  title="Close profile"
                  type="button"
                >
                  <X size={18} />
                </button>

                <div className="mt-10 flex flex-col items-center text-center">
                  <label className="profile-photo-label group relative block size-28 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-teal-50 shadow-xl">
                    {profilePhoto ? (
                      <img
                        alt={user.name}
                        className="size-full object-cover"
                        src={profilePhoto}
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-4xl font-bold text-[#0f766e]">
                        {user.name?.slice(0, 1)?.toUpperCase() || 'U'}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/65 py-2 text-xs font-semibold text-white opacity-100 transition group-hover:bg-slate-950/80">
                      <Camera size={14} />
                      Photo
                    </span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={handleProfilePhotoChange}
                      type="file"
                    />
                  </label>

                  <h2 className="mt-4 text-2xl font-semibold">{user.name}</h2>
                  <p className="mt-1 max-w-full wrap-break-word text-sm text-teal-50">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <section className="profile-info-card rounded-md border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Profile
                  </h3>
                  <div className="mt-4 flex items-start gap-4">
                    <label className="profile-photo-label group relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md bg-teal-50 text-xl font-bold text-[#0f766e]">
                      {profilePhoto ? (
                        <img
                          alt={user.name}
                          className="size-full object-cover"
                          src={profilePhoto}
                        />
                      ) : (
                        user.name?.slice(0, 1)?.toUpperCase() || 'U'
                      )}
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-slate-950/65 py-1 text-[10px] font-semibold text-white opacity-100 transition group-hover:bg-slate-950/80">
                        Edit
                      </span>
                      <input
                        accept="image/*"
                        className="sr-only"
                        onChange={handleProfilePhotoChange}
                        type="file"
                      />
                    </label>
                    <div className="grid min-w-0 flex-1 gap-3">
                      <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-teal-50 text-[#0f766e]">
                          <User size={17} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Name
                          </p>
                          <p className="mt-1 wrap-break-word font-semibold text-slate-950">
                            {user.name || 'User'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-orange-50 text-orange-600">
                          <Mail size={17} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Email
                          </p>
                          <p className="mt-1 wrap-break-word font-semibold text-slate-950">
                            {user.email || 'No email added'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <form
                  className="profile-stat-card grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4"
                  onSubmit={onProfileFinanceSubmit}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Finance
                    </h3>
                    <button
                      className="h-9 rounded-md bg-[#0f766e] px-4 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-400"
                      disabled={isLoading}
                      type="submit"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Salary
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      min="0"
                      name="salary"
                      onChange={onProfileFinanceChange}
                      required
                      type="number"
                      value={profileFinanceData.salary}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Expense
                    <input
                      className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      min="0"
                      name="expense"
                      onChange={onProfileFinanceChange}
                      required
                      type="number"
                      value={profileFinanceData.expense}
                    />
                  </label>
                  <p className="rounded-md bg-white p-3 text-sm text-slate-600">
                    Remaining after update: {formatCurrency(
                      Number(profileFinanceData.salary || 0) -
                        Number(profileFinanceData.expense || 0),
                    )}
                  </p>
                </form>
                <div className="profile-stat-card rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Goals</p>
                  <p className="mt-1 text-xl font-semibold">{goals.length}/3</p>
                </div>
              </div>

              <div className="px-5 pb-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Goal list
                </h3>
                <div className="mt-4 grid gap-3">
                  {goals.map((goal, index) => (
                    <div
                      className="profile-goal-card rounded-md border border-slate-200 p-4"
                      key={`${goal.name}-${index}`}
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      <p className="text-sm text-slate-500">Goal {index + 1}</p>
                      <p className="mt-1 font-semibold text-slate-950">{goal.name}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatCurrency(goal.amount)} in {goal.timeInMonths} months
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto border-t border-slate-200 p-5">
                <button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={onLogout}
                  type="button"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ['Salary', salary, 'Total income added by you'],
            ['Expense', expense, `${expensePercent.toFixed(1)}% of salary used`],
            ['Remaining', remaining, `${remainingPercent.toFixed(1)}% of salary left`],
            ['Goal Amount', goalAmount, goalSummaryLabel],
          ].map(([label, value, helper], index) => (
            <div
              className="dashboard-card finance-slide-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={label}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatCurrency(value)}
              </p>
              <p className="mt-2 text-sm text-slate-500">{helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="dashboard-panel finance-slide-up rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Money split</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Expense and remaining balance from your salary.
                </p>
              </div>
              <span className="rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-[#0f766e]">
                {remaining >= 0 ? 'Positive' : 'Overspent'}
              </span>
            </div>

            <div className="mt-8 grid items-center gap-8 sm:grid-cols-[220px_1fr]">
              <div className="relative mx-auto size-56">
                <svg className="size-56 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="44"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                  />
                  <circle
                    className="finance-ring finance-ring-primary"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="44"
                    stroke="#0f766e"
                    strokeDasharray={`${circle}`}
                    strokeDashoffset={`${circle - (circle * remainingPercent) / 100}`}
                    strokeLinecap="round"
                    strokeWidth="14"
                  />
                  <circle
                    className="finance-ring finance-ring-secondary"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="28"
                    stroke="#f97316"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 28 - ((2 * Math.PI * 28) * expensePercent) / 100
                    }`}
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-sm text-slate-500">Saved</p>
                    <p className="text-3xl font-semibold text-[#0f766e]">
                      {remainingPercent.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Remaining</span>
                    <span>{formatCurrency(remaining)}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="finance-bar h-full rounded-full bg-[#0f766e]"
                      style={{ width: `${remainingPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Expense</span>
                    <span>{formatCurrency(expense)}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="finance-bar h-full rounded-full bg-orange-500"
                      style={{ width: `${expensePercent}%` }}
                    />
                  </div>
                </div>
                <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {expensePercent > 80
                    ? 'Your expenses are very high compared to salary. Start with non-essential spending.'
                    : remainingPercent >= 30
                      ? 'You have a strong remaining balance. This is a healthy place to pursue goals.'
                      : 'You have some room to save. Try moving closer to a 20% savings rate.'}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel finance-slide-up rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Goal analytics</h2>
            <p className="mt-1 text-sm text-slate-500">
              {goals.length > 1
                ? `Across ${goals.length} goals with a combined target of ${formatCurrency(goalAmount)}.`
                : `${latestFinance.goal?.name} in ${latestFinance.goal?.timeInMonths} months.`}
            </p>

            <div className="mt-6 grid gap-5">
              <div className="rounded-md border border-slate-200 p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">Full goal progress</span>
                  <span>{goalProgress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="finance-bar h-full rounded-full bg-indigo-600"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">Monthly target progress</span>
                  <span>{monthlyProgress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="finance-bar h-full rounded-full bg-emerald-600"
                    style={{ width: `${monthlyProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Monthly target: {formatCurrency(monthlyGoalAmount)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    {goals.length > 1 ? 'Longest timeline' : 'Months planned'}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {longestGoalTimeInMonths}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Monthly feasibility</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {latestFinance.canAchieveMonthlyGoal ? 'On track' : 'At risk'}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
                {latestFinance.isGoalAchieved
                  ? 'Great work. Your remaining amount can cover the full goal target today.'
                  : latestFinance.canAchieveMonthlyGoal
                    ? "You can meet the combined monthly goal target with this month's remaining amount."
                    : 'Your remaining amount is below the combined monthly target. Lower expenses or extend goal timelines.'}
              </div>
            </div>
          </div>
        </section>

        {dashboardSummary && (
          <section className="dashboard-panel finance-slide-up mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Overall dashboard analytics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total entries</p>
                <p className="mt-1 text-2xl font-semibold">{dashboardSummary.totalEntries}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total goal</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(dashboardSummary.totalGoal)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Goal achievement</p>
                <p className="mt-1 text-2xl font-semibold">
                  {dashboardSummary.goalAchievementRate}%
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Savings rate</p>
                <p className="mt-1 text-2xl font-semibold">{dashboardSummary.savingsRate}%</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Expense rate</p>
                <p className="mt-1 text-2xl font-semibold">{dashboardSummary.expenseRate}%</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 text-2xl font-semibold">{dashboardSummary.status}</p>
              </div>
            </div>
            <p className="mt-5 rounded-md border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              {dashboardSummary.recommendation}
            </p>
          </section>
        )}

        <section className="dashboard-panel finance-slide-up mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Goals</h2>
              <p className="mt-1 text-sm text-slate-500">
                {canAddGoal
                  ? `You can add ${3 - goals.length} more goal${3 - goals.length === 1 ? '' : 's'}.`
                  : 'You have added the maximum 3 goals.'}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {goals.length}/3 goals
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {goals.map((goal, index) => (
              <div
                className="dashboard-mini-panel rounded-md border border-slate-200 bg-slate-50 p-4"
                key={`${goal.name}-${index}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="text-sm text-slate-500">Goal {index + 1}</p>
                <p className="mt-1 text-lg font-semibold">{goal.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {formatCurrency(goal.amount)} in {goal.timeInMonths} months
                </p>
              </div>
            ))}
          </div>

          {canAddGoal && (
            <form className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_160px_auto]" onSubmit={onAddGoal}>
              <input
                className="h-11 rounded-md border border-slate-300 px-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                name="goalName"
                onChange={onGoalChange}
                placeholder="Goal name"
                required
                type="text"
                value={addGoalData.goalName}
              />
              <input
                className="h-11 rounded-md border border-slate-300 px-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                min="0"
                name="goalAmount"
                onChange={onGoalChange}
                placeholder="Amount"
                required
                type="number"
                value={addGoalData.goalAmount}
              />
              <input
                className="h-11 rounded-md border border-slate-300 px-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                min="1"
                name="goalTimeInMonths"
                onChange={onGoalChange}
                placeholder="Months"
                required
                type="number"
                value={addGoalData.goalTimeInMonths}
              />
              <button
                className="h-11 rounded-md bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isLoading}
                type="submit"
              >
                Add goal
              </button>
            </form>
          )}

          {message && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default FinanceDashboard
