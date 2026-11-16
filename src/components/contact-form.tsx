"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FormStatus = {
    kind: "success" | "error"
    message: string
}

export function ContactForm() {
    const [isSending, setIsSending] = useState(false)
    const [status, setStatus] = useState<FormStatus | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        setIsSending(true)
        setStatus(null)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    email: formData.get("email"),
                    subject: formData.get("subject"),
                    message: formData.get("message"),
                    company: formData.get("company"),
                }),
            })
            const result = await response.json() as { error?: string; message?: string }

            if (!response.ok) {
                throw new Error(result.error || "We could not send your message. Please try again.")
            }

            form.reset()
            setStatus({ kind: "success", message: result.message || "Your message has been sent." })
        } catch (error) {
            setStatus({
                kind: "error",
                message: error instanceof Error ? error.message : "We could not send your message. Please try again.",
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">
                    Your name
                    <Input name="name" required minLength={2} maxLength={100} autoComplete="name" className="mt-2 h-12 rounded-xl border-[#dce3d4] bg-white" />
                </label>
                <label className="text-sm font-medium text-ink">
                    Email address
                    <Input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-2 h-12 rounded-xl border-[#dce3d4] bg-white" />
                </label>
                <label className="text-sm font-medium text-ink sm:col-span-2">
                    Subject
                    <Input name="subject" required minLength={2} maxLength={120} className="mt-2 h-12 rounded-xl border-[#dce3d4] bg-white" />
                </label>
                <label className="text-sm font-medium text-ink sm:col-span-2">
                    Message
                    <Textarea name="message" required minLength={10} maxLength={5000} rows={6} className="mt-2 min-h-40 rounded-xl border-[#dce3d4] bg-white" />
                </label>
            </div>

            <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                Leave this field empty
                <Input name="company" tabIndex={-1} autoComplete="off" />
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" disabled={isSending} className="h-12 rounded-full bg-ink px-6 text-white hover:bg-grape">
                    {isSending ? (
                        <>
                            <LoaderCircle className="animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            Send message
                            <ArrowRight />
                        </>
                    )}
                </Button>
                <p aria-live="polite" className={`text-sm ${status?.kind === "error" ? "text-red-700" : "text-emerald-700"}`}>
                    {status?.message}
                </p>
            </div>
        </form>
    )
}
