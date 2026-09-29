"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    })
    if (res.ok) {
      router.replace("/admin")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-400 p-4">
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
          className="w-full py-2 font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition cursor-pointer"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
