import { useEffect, useState } from 'react'
import { Camera, LogOut, Moon, RefreshCw, Sun, X } from 'lucide-react'

const initialRegisterData = {
  name: '',
  email: '',
  password: '',
}

const initialLoginData = {
  email: '',
  password: '',
}

const initialFinanceData = {
  salary: '',
  expense: '',
  goalName: '',
  goalAmount: '',
  goalTimeInMonths: '',
}

const initialGoalData = {
  goalName: '',
  goalAmount: '',
  goalTimeInMonths: '',
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const readResponse = async (response) => {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      message: text,
    }
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(Number(value || 0))

const clampPercent = (value) => Math.max(0, Math.min(Number(value || 0), 100))

function FinanceDashboard({
  dashboardData,
  financeSummary,
  addGoalData,
  error,
  user,
  message,
  onAddGoal,
  onGoalChange,
  onRefresh,
  onLogout,
  onToggleTheme,
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
  const goalAmount = Number(latestFinance.goal?.amount || 0)
  const monthlyGoalAmount = Number(latestFinance.monthlyGoalAmount || 0)
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
                  <label className="group relative block size-28 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-teal-50 shadow-xl">
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
                  <p className="mt-1 max-w-full break-words text-sm text-teal-50">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <div className="profile-stat-card rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Salary</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(salary)}</p>
                </div>
                <div className="profile-stat-card rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Expense</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(expense)}</p>
                </div>
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
            ['Goal Amount', goalAmount, latestFinance.goal?.name],
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
              {latestFinance.goal?.name} in {latestFinance.goal?.timeInMonths} months.
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
                  <p className="text-sm text-slate-500">Months planned</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {latestFinance.goal?.timeInMonths}
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
                  ? 'Great work. Your remaining amount can cover the full goal today.'
                  : latestFinance.canAchieveMonthlyGoal
                    ? "You can meet the monthly goal target with this month's remaining amount."
                    : 'Your remaining amount is below the monthly target. Lower expenses or extend the timeline.'}
              </div>
            </div>
          </div>
        </section>

        {dashboardSummary && (
          <section className="dashboard-panel finance-slide-up mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Overall dashboard analytics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total entries</p>
                <p className="mt-1 text-2xl font-semibold">{dashboardSummary.totalEntries}</p>
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

function App() {
  const [activeView, setActiveView] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegisterData)
  const [loginData, setLoginData] = useState(initialLoginData)
  const [financeData, setFinanceData] = useState(initialFinanceData)
  const [addGoalData, setAddGoalData] = useState(initialGoalData)
  const [financeSummary, setFinanceSummary] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [financeView, setFinanceView] = useState('input')
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark',
  )
  const [sessionToken, setSessionToken] = useState(
    () => localStorage.getItem('sessionToken') || '',
  )
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')

    return savedUser ? JSON.parse(savedUser) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isLogin = activeView === 'login'
  const isAuthenticated = Boolean(sessionToken && user)

  useEffect(() => {
    if (!isAuthenticated || financeSummary) {
      return
    }

    const loadExistingFinance = async () => {
      try {
        const data = await fetchFinanceDashboard()

        if (data.entries?.length > 0) {
          setFinanceView('dashboard')
          setFinanceSummary(data.entries[0])
          setDashboardData(data)
        }
      } catch (err) {
        console.warn('Failed to load existing finance data:', err)
      }
    }

    loadExistingFinance()
  }, [isAuthenticated, financeSummary, sessionToken])

  const clearAlerts = () => {
    setMessage('')
    setError('')
  }

  const handleToggleTheme = () => {
    setIsDarkMode((currentMode) => {
      const nextMode = !currentMode

      localStorage.setItem('theme', nextMode ? 'dark' : 'light')
      return nextMode
    })
  }

  const switchView = (view) => {
    setActiveView(view)
    clearAlerts()
  }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target

    setRegisterData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target

    setLoginData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleFinanceChange = (event) => {
    const { name, value } = event.target

    setFinanceData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleGoalChange = (event) => {
    const { name, value } = event.target

    setAddGoalData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setMessage(`Welcome, ${data.user.name}. Your account was created successfully.`)
      setRegisterData(initialRegisterData)
      setActiveView('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('sessionToken', data.session?.token || '')
      localStorage.setItem('sessionExpiresAt', data.session?.expiresAt || '')
      localStorage.setItem('user', JSON.stringify(data.user))
      const loginSessionToken = data.session?.token || ''
      setSessionToken(loginSessionToken)
      setUser(data.user)

      setMessage(`Welcome back, ${data.user.name}. You are logged in.`)
      setLoginData(initialLoginData)

      try {
        const financeData = await fetchFinanceDashboard(loginSessionToken)
        if (financeData.entries?.length > 0) {
          setFinanceView('dashboard')
          setFinanceSummary(financeData.entries[0])
          setDashboardData(financeData)
        }
      } catch (financeErr) {
        console.warn('Failed to fetch finance data on login:', financeErr)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFinanceDashboard = async (token = sessionToken) => {
    const response = await fetch(`${API_BASE_URL}/api/finance/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await readResponse(response)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard data')
    }

    setDashboardData(data)

    if (data.entries?.[0]) {
      setFinanceSummary(data.entries[0])
    }

    return data
  }

  const handleFinanceSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await fetch(`${API_BASE_URL}/api/finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          salary: Number(financeData.salary),
          expense: Number(financeData.expense),
          goal: {
            name: financeData.goalName,
            amount: Number(financeData.goalAmount),
            timeInMonths: Number(financeData.goalTimeInMonths),
          },
        }),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        if (response.status === 409) {
          const dashboard = await fetchFinanceDashboard()

          if (dashboard.entries?.length > 0) {
            setFinanceSummary(dashboard.entries[0])
            setDashboardData(dashboard)
            setFinanceData(initialFinanceData)
            setFinanceView('dashboard')
            return
          }
        }

        throw new Error(data.message || 'Failed to save finance details')
      }

      setFinanceSummary(data.finance)
      await fetchFinanceDashboard()
      setFinanceData(initialFinanceData)
      setFinanceView('dashboard')
      setMessage('Finance details saved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDashboardRefresh = async () => {
    setIsLoading(true)
    clearAlerts()

    try {
      const data = await fetchFinanceDashboard()

      if (!data.entries?.length) {
        setMessage('No finance data found yet. Add your first finance input.')
        setFinanceView('input')
        return
      }

      setFinanceView('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          goal: {
            name: addGoalData.goalName,
            amount: Number(addGoalData.goalAmount),
            timeInMonths: Number(addGoalData.goalTimeInMonths),
          },
        }),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add goal')
      }

      setAddGoalData(initialGoalData)
      await fetchFinanceDashboard()
      setMessage('Goal added successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    clearAlerts()

    try {
      if (sessionToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
        })
      }
    } finally {
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('sessionExpiresAt')
      localStorage.removeItem('user')
      setSessionToken('')
      setUser(null)
      setAddGoalData(initialGoalData)
      setFinanceSummary(null)
      setDashboardData(null)
      setFinanceView('input')
      setFinanceData(initialFinanceData)
      setActiveView('login')
      setMessage('You have been logged out.')
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    if (financeView === 'dashboard' && financeSummary) {
      return (
        <FinanceDashboard
          addGoalData={addGoalData}
          dashboardData={dashboardData}
          error={error}
          financeSummary={financeSummary}
          isLoading={isLoading}
          message={message}
          onAddGoal={handleAddGoal}
          onGoalChange={handleGoalChange}
          onRefresh={handleDashboardRefresh}
          onLogout={handleLogout}
          onToggleTheme={handleToggleTheme}
          user={user}
          isDarkMode={isDarkMode}
        />
      )
    }

    return (
      <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
          <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-col gap-4 border-b border-slate-200 bg-[#0f766e] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                  Finance Project
                </p>
                <h1 className="mt-2 text-3xl font-semibold">Welcome, {user.name}</h1>
                <p className="mt-2 text-sm text-teal-50">
                  Add your salary, expense, and goal details to calculate your finance summary.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="h-10 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={handleDashboardRefresh}
                  type="button"
                >
                  View dashboard
                </button>
                <button
                  className="h-10 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading}
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </header>

            <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
              <aside className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-semibold text-slate-950">Finance inputs</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These values will be saved to your backend finance API and returned with
                  remaining amount, monthly goal target, and goal progress.
                </p>

                <div className="mt-6 grid gap-4 text-sm">
                  <div className="rounded-md border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-800">Remaining amount</p>
                    <p className="mt-1 text-slate-600">Salary minus expense.</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-800">Goal progress</p>
                    <p className="mt-1 text-slate-600">
                      How much of your goal your remaining money covers.
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-800">Monthly target</p>
                    <p className="mt-1 text-slate-600">
                      Goal amount divided by the number of months.
                    </p>
                  </div>
                </div>
              </aside>

              <section>
                <form className="grid gap-5" onSubmit={handleFinanceSubmit}>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Salary
                    <input
                      className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      min="0"
                      name="salary"
                      onChange={handleFinanceChange}
                      placeholder="50000"
                      required
                      type="number"
                      value={financeData.salary}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Expense
                    <input
                      className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      min="0"
                      name="expense"
                      onChange={handleFinanceChange}
                      placeholder="30000"
                      required
                      type="number"
                      value={financeData.expense}
                    />
                  </label>

                  <div className="grid gap-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                    <h2 className="text-lg font-semibold text-slate-950">Goal details</h2>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Goal name
                      <input
                        className="h-12 rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        name="goalName"
                        onChange={handleFinanceChange}
                        placeholder="Buy a laptop"
                        required
                        type="text"
                        value={financeData.goalName}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Goal amount
                      <input
                        className="h-12 rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        min="0"
                        name="goalAmount"
                        onChange={handleFinanceChange}
                        placeholder="60000"
                        required
                        type="number"
                        value={financeData.goalAmount}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Goal time in months
                      <input
                        className="h-12 rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        min="1"
                        name="goalTimeInMonths"
                        onChange={handleFinanceChange}
                        placeholder="6"
                        required
                        type="number"
                        value={financeData.goalTimeInMonths}
                      />
                    </label>
                  </div>

                  <button
                    className="h-12 rounded-md bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? 'Saving finance details...' : 'Save finance details'}
                  </button>
                </form>

                {message && (
                  <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {financeSummary && (
                  <div className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Salary</p>
                      <p className="mt-1 text-2xl font-semibold">{financeSummary.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Expense</p>
                      <p className="mt-1 text-2xl font-semibold">{financeSummary.expense}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Remaining</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.remainingAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Goal</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.goal?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Goal amount</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.goal?.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Goal time</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.goal?.timeInMonths} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Monthly target</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.monthlyGoalAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Goal progress</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.goalProgress}%
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500">Goal status</p>
                      <p className="mt-1 text-lg font-semibold text-[#0f766e]">
                        {financeSummary.isGoalAchieved
                          ? 'Full goal achieved with your remaining amount.'
                          : financeSummary.canAchieveMonthlyGoal
                            ? "You can hit this month's target with your remaining amount."
                            : 'Monthly target not achieved yet. Try reducing expenses or increasing savings.'}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={`auth-shell min-h-screen text-slate-950 ${isDarkMode ? 'theme-dark' : ''}`}>
      <button
        className="auth-theme-toggle fixed right-5 top-5 z-20 grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-[#0f766e] shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50"
        onClick={handleToggleTheme}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        type="button"
      >
        {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <div className="auth-card grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[0.95fr_1.05fr]">
          <aside className="auth-side flex min-h-[560px] flex-col justify-between bg-[#0f766e] p-8 text-white md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Finance Project
              </p>
              <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight md:text-5xl">
                {isLogin ? 'Log in and continue your money plan.' : 'Build your account and start tracking clearly.'}
              </h1>
            </div>

            <div className="grid gap-4 text-sm text-teal-50">
              <div className="auth-floating-card rounded-md border border-white/20 bg-white/10 p-4">
                <p className="font-semibold text-white">Secure session</p>
                <p className="mt-1 leading-6">
                  Login creates a session token that stays active for 24 hours.
                </p>
              </div>
              <div className="auth-floating-card rounded-md border border-white/20 bg-white/10 p-4">
                <p className="font-semibold text-white">Finance dashboard</p>
                <p className="mt-1 leading-6">
                  Add salary, expenses, and goals to review your dashboard analysis.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex items-center p-6 md:p-10">
            <div className="auth-form-panel w-full">
              <div className="mb-8 flex rounded-md border border-slate-200 bg-slate-50 p-1">
                <button
                  className={`h-10 flex-1 rounded px-4 text-sm font-semibold transition ${
                    isLogin ? 'bg-white text-[#0f766e] shadow-sm' : 'text-slate-600'
                  }`}
                  onClick={() => switchView('login')}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`h-10 flex-1 rounded px-4 text-sm font-semibold transition ${
                    !isLogin ? 'bg-white text-[#0f766e] shadow-sm' : 'text-slate-600'
                  }`}
                  onClick={() => switchView('register')}
                  type="button"
                >
                  Register
                </button>
              </div>

              {isLogin ? (
                <form className="w-full" onSubmit={handleLoginSubmit}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-semibold text-slate-950">Login</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Enter your email and password to start your session.
                    </p>
                  </div>

                  <div className="grid gap-5">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Email
                      <input
                        className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        name="email"
                        onChange={handleLoginChange}
                        placeholder="john@example.com"
                        required
                        type="email"
                        value={loginData.email}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Password
                      <input
                        className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        name="password"
                        onChange={handleLoginChange}
                        placeholder="Your password"
                        required
                        type="password"
                        value={loginData.password}
                      />
                    </label>
                  </div>

                  <button
                    className="mt-6 h-12 w-full rounded-md bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              ) : (
                <form className="w-full" onSubmit={handleRegisterSubmit}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-semibold text-slate-950">Create account</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Enter your details to register with the finance backend.
                    </p>
                  </div>

                  <div className="grid gap-5">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Name
                      <input
                        className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        name="name"
                        onChange={handleRegisterChange}
                        placeholder="John Doe"
                        required
                        type="text"
                        value={registerData.name}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Email
                      <input
                        className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        name="email"
                        onChange={handleRegisterChange}
                        placeholder="john@example.com"
                        required
                        type="email"
                        value={registerData.email}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Password
                      <input
                        className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                        minLength={6}
                        name="password"
                        onChange={handleRegisterChange}
                        placeholder="Minimum 6 characters"
                        required
                        type="password"
                        value={registerData.password}
                      />
                    </label>
                  </div>

                  <button
                    className="mt-6 h-12 w-full rounded-md bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}

              {message && (
                <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
