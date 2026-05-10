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
  goal: '',
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

function App() {
  const [activeView, setActiveView] = useState('login')
  const [registerData, setRegisterData] = useState(initialRegisterData)
  const [loginData, setLoginData] = useState(initialLoginData)
  const [financeData, setFinanceData] = useState(initialFinanceData)
  const [financeSummary, setFinanceSummary] = useState(null)
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
      const response = await fetch(`${API_BASE_URL}/api/finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          salary: Number(financeData.salary),
          expense: Number(financeData.expense),
          goal: Number(financeData.goal),
        }),
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save finance details')
      }

      setFinanceSummary(data.finance)
      setFinanceData(initialFinanceData)
      setMessage('Finance details saved successfully.')
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
      setFinanceData(initialFinanceData)
      setActiveView('login')
      setMessage('You have been logged out.')
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
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
                  Add your salary, expense, and goal to calculate your finance summary.
                </p>
              </div>

              <button
                className="h-10 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </header>

            <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
              <aside className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-semibold text-slate-950">Finance inputs</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These values will be saved to your backend finance API and returned with
                  remaining amount and goal progress.
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

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Goal
                    <input
                      className="h-12 rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-teal-100"
                      min="0"
                      name="goal"
                      onChange={handleFinanceChange}
                      placeholder="15000"
                      required
                      type="number"
                      value={financeData.goal}
                    />
                  </label>

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
                      <p className="text-sm text-slate-500">Goal progress</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {financeSummary.goalProgress}%
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500">Goal status</p>
                      <p className="mt-1 text-lg font-semibold text-[#0f766e]">
                        {financeSummary.isGoalAchieved
                          ? 'Goal achieved with your remaining amount.'
                          : 'Goal not achieved yet. Try reducing expenses or increasing savings.'}
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
