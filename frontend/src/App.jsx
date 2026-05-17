import { useCallback, useEffect, useState } from 'react'
import AuthShell from './components/auth/AuthShell'
import FinanceDashboard from './components/dashboard/FinanceDashboard'
import { apiFetch, readResponse } from './utils/api'
import {
  initialRegisterData,
  initialLoginData,
  initialFinanceData,
  initialGoalData,
  initialProfileFinanceData,
} from './utils/initialStates'

function App() {
  const [activeView, setActiveView] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegisterData)
  const [loginData, setLoginData] = useState(initialLoginData)
  const [financeData, setFinanceData] = useState(initialFinanceData)
  const [addGoalData, setAddGoalData] = useState(initialGoalData)
  const [profileFinanceData, setProfileFinanceData] = useState(initialProfileFinanceData)
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

  const fetchFinanceDashboard = useCallback(async (token = sessionToken) => {
    const response = await apiFetch('/api/finance/dashboard', {
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
      const latestFinance = data.entries[0]

      setFinanceSummary(latestFinance)
      setProfileFinanceData({
        salary: String(latestFinance.salary ?? ''),
        expense: String(latestFinance.expense ?? ''),
      })
    }

    return data
  }, [sessionToken])

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
  }, [fetchFinanceDashboard, financeSummary, isAuthenticated])

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

  const handleProfileFinanceChange = (event) => {
    const { name, value } = event.target

    setProfileFinanceData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await apiFetch('/api/auth/register', {
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
      const response = await apiFetch('/api/auth/login', {
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

  const handleFinanceSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await apiFetch('/api/finance', {
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
      const response = await apiFetch('/api/finance/goals', {
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

  const handleProfileFinanceSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    clearAlerts()

    try {
      const response = await apiFetch('/api/finance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          salary: Number(profileFinanceData.salary),
          expense: Number(profileFinanceData.expense),
        }),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update salary and expense')
      }

      await fetchFinanceDashboard()
      setMessage('Salary and expense updated successfully.')
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
        await apiFetch('/api/auth/logout', {
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
      setProfileFinanceData(initialProfileFinanceData)
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
          onProfileFinanceChange={handleProfileFinanceChange}
          onProfileFinanceSubmit={handleProfileFinanceSubmit}
          onRefresh={handleDashboardRefresh}
          onLogout={handleLogout}
          onToggleTheme={handleToggleTheme}
          profileFinanceData={profileFinanceData}
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
    <AuthShell
      isLogin={isLogin}
      handleToggleTheme={handleToggleTheme}
      switchView={switchView}
      handleLoginSubmit={handleLoginSubmit}
      handleRegisterSubmit={handleRegisterSubmit}
      handleLoginChange={handleLoginChange}
      handleRegisterChange={handleRegisterChange}
      loginData={loginData}
      registerData={registerData}
      isLoading={isLoading}
      message={message}
      error={error}
      isDarkMode={isDarkMode}
    />
  )
}

export default App
