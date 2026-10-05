"use client"

import { useState } from "react"

export default function AdminLoginPage() {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ user, pass }),
      })

      if (res.ok) {
        // Hard navigation: guarantees the new cookie is sent and avoids
        // Next's client router cache serving a stale /admin redirect.
        window.location.assign("/admin")
        return
      }
      setError(res.status === 401 ? "Invalid credentials" : `Server error (${res.status})`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-white">Admin Login</h2>

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
            placeholder="Enter username"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition cursor-pointer disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}