import { Moon, Sun } from 'lucide-react'

function AuthShell({
  isLogin,
  handleToggleTheme,
  switchView,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleLoginChange,
  handleRegisterChange,
  loginData,
  registerData,
  isLoading,
  message,
  error,
  isDarkMode,
}) {
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
          <aside className="auth-side flex min-h-140 flex-col justify-between bg-[#0f766e] p-8 text-white md:p-10">
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

export default AuthShell
