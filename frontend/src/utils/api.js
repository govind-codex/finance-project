export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

export const apiFetch = async (path, options) => {
  try {
    return await fetch(getApiUrl(path), options)
  } catch (error) {
    const message = API_BASE_URL
      ? `Could not connect to backend API at ${API_BASE_URL}. Check that the backend is deployed and CORS allows this frontend domain.`
      : 'Backend API URL is not configured. Set VITE_API_BASE_URL to your deployed backend URL and redeploy the frontend.'

    throw new Error(`${message} ${error.message}`, { cause: error })
  }
}

export const readResponse = async (response) => {
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
