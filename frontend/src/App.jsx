import { useState } from 'react'

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
  user,
  onAddAnother,
  onRefresh,
  onLogout,
  isLoading,
}) {
  const latestFinance = dashboardData?.entries?.[0] || financeSummary
  const dashboardSummary = dashboardData?.summary
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

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <section className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8">
        <header className="finance-fade-in flex flex-col gap-4 rounded-lg bg-[#0f766e] p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
              Finance Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Hi {user.name}, here is your analysis</h1>
            <p className="mt-2 text-sm text-teal-50">
              Your latest salary, expense, and goal plan turned into readable insights.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="h-10 rounded-md bg-white px-5 text-sm font-semibold text-[#0f766e] transition hover:bg-teal-50"
              onClick={onAddAnother}
              type="button"
            >
              Add another input
            </button>
            <button
              className="h-10 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              onClick={onRefresh}
              type="button"
            >
              Refresh dashboard
            </button>
            <button
              className="h-10 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ['Salary', salary, 'Total income added by you'],
            ['Expense', expense, `${expensePercent.toFixed(1)}% of salary used`],
            ['Remaining', remaining, `${remainingPercent.toFixed(1)}% of salary left`],
            ['Goal Amount', goalAmount, latestFinance.goal?.name],
          ].map(([label, value, helper], index) => (
            <div
              className="finance-slide-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
          <div className="finance-slide-up rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
                    className="finance-ring"
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
                    className="finance-ring"
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

          <div className="finance-slide-up rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
                    ? 'You can meet the monthly goal target with this month’s remaining amount.'
                    : 'Your remaining amount is below the monthly target. Lower expenses or extend the timeline.'}
              </div>
            </div>
          </div>
        </section>

        {dashboardSummary && (
          <section className="finance-slide-up mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
      </section>
    </main>
  )
}

function App() {
  const [activeView, setActiveView] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegisterData)
  const [loginData, setLoginData] = useState(initialLoginData)
  const [financeData, setFinanceData] = useState(initialFinanceData)
  const [financeSummary, setFinanceSummary] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [financeView, setFinanceView] = useState('input')
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

  const clearAlerts = () => {
    setMessage('')
    setError('')
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
      setSessionToken(data.session?.token || '')
      setUser(data.user)

      setMessage(`Welcome back, ${data.user.name}. You are logged in.`)
      setLoginData(initialLoginData)

      // Fetch finance data after login to determine initial view
      try {
        const financeData = await fetchFinanceDashboard()
        if (financeData.entries?.length > 0) {
          setFinanceView('dashboard')
          setFinanceSummary(financeData.entries[0])
          setDashboardData(financeData)
        }
        // If no data, keep financeView as 'input' (default) so user sees input form
      } catch (financeErr) {
        // If finance fetch fails, still show input form so user can try again
        console.warn('Failed to fetch finance data on login:', financeErr)
        // Keep financeView as 'input' (default)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFinanceDashboard = async () => {
    const response = await fetch(`${API_BASE_URL}/api/finance/dashboard`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
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
          dashboardData={dashboardData}
          financeSummary={financeSummary}
          isLoading={isLoading}
          onAddAnother={() => {
            clearAlerts()
            setFinanceView('input')
          }}
          onRefresh={handleDashboardRefresh}
          onLogout={handleLogout}
          user={user}
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
                            ? 'You can hit this month’s target with your remaining amount.'
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
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10">
        <div className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[0.95fr_1.05fr]">
          <aside className="flex min-h-[560px] flex-col justify-between bg-[#0f766e] p-8 text-white md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Finance Project
              </p>
              <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight md:text-5xl">
                {isLogin ? 'Log in and continue your money plan.' : 'Build your account and start tracking clearly.'}
              </h1>
            </div>

            <div className="grid gap-4 text-sm text-teal-50">
              <div className="rounded-md border border-white/20 bg-white/10 p-4">
                <p className="font-semibold text-white">Secure session</p>
                <p className="mt-1 leading-6">
                  Login creates a session token that stays active for 24 hours.
                </p>
              </div>
              <div className="rounded-md border border-white/20 bg-white/10 p-4">
                <p className="font-semibold text-white">Finance dashboard</p>
                <p className="mt-1 leading-6">
                  Add salary, expenses, and goals to review your dashboard analysis.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex items-center p-6 md:p-10">
            <div className="w-full">
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
