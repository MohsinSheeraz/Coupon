import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 12_000
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 15 * 60 * 1000
const recentRequests = new Map<string, { count: number; resetAt: number }>()

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function allowRequest(key: string) {
    const now = Date.now()
    if (recentRequests.size >= 1000 && !recentRequests.has(key)) {
        for (const [requestKey, entry] of recentRequests) {
            if (entry.resetAt <= now) recentRequests.delete(requestKey)
        }
        if (recentRequests.size >= 1000) {
            const oldestKey = recentRequests.keys().next().value
            if (oldestKey) recentRequests.delete(oldestKey)
        }
    }

    const current = recentRequests.get(key)
    if (!current || current.resetAt <= now) {
        recentRequests.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
        return true
    }

    if (current.count >= RATE_LIMIT) return false
    current.count += 1
    return true
}

export async function POST(request: NextRequest) {
    const contentLength = Number(request.headers.get("content-length") ?? 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "Message is too large." }, { status: 413 })
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    if (!isRecord(body)) {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const honeypot = typeof body.company === "string" ? body.company.trim() : ""

    if (honeypot) {
        return NextResponse.json({ error: "Unable to send this message." }, { status: 400 })
    }

    if (
        name.length < 2 ||
        name.length > 100 ||
        /[\r\n]/.test(name) ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        subject.length < 2 ||
        subject.length > 120 ||
        /[\r\n]/.test(subject) ||
        message.length < 10 ||
        message.length > 5000
    ) {
        return NextResponse.json({ error: "Please check the contact form fields and try again." }, { status: 400 })
    }

    const smtpHost = process.env.SMTP_HOST?.trim()
    const smtpPort = Number(process.env.SMTP_PORT)
    const smtpSecureValue = process.env.SMTP_SECURE?.trim().toLowerCase()
    const smtpUser = process.env.SMTP_USER?.trim()
    const smtpPassword = process.env.SMTP_PASSWORD
    const mailFrom = process.env.MAIL_FROM?.trim()
    const mailTo = process.env.MAIL_TO?.trim()

    if (
        !smtpHost ||
        !Number.isInteger(smtpPort) ||
        smtpPort < 1 ||
        smtpPort > 65535 ||
        (smtpSecureValue !== "true" && smtpSecureValue !== "false") ||
        !smtpUser ||
        !smtpPassword ||
        !mailFrom ||
        !mailTo
    ) {
        console.error("Contact email is not configured. Set the SMTP and mail environment variables.")
        return NextResponse.json(
            { error: "Email delivery is not configured yet. Please try again later." },
            { status: 503 },
        )
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientKey =
        request.headers.get("x-real-ip")?.trim() ||
        forwardedFor?.split(",")[0]?.trim() ||
        "unknown"

    if (!allowRequest(clientKey)) {
        return NextResponse.json(
            { error: "Too many messages were sent. Please wait a little and try again." },
            { status: 429 },
        )
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecureValue === "true",
        auth: { user: smtpUser, pass: smtpPassword },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
    })

    try {
        await transporter.sendMail({
            from: { name: "DealzyCoup", address: mailFrom },
            to: mailTo,
            replyTo: { name, address: email },
            subject: `[DealzyCoup Contact] ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        })

        return NextResponse.json({ message: "Thanks! Your message has been sent." })
    } catch (error) {
        console.error("Contact email delivery failed:", error)
        return NextResponse.json(
            { error: "We could not send your message right now. Please try again later." },
            { status: 502 },
        )
    } finally {
        transporter.close()
    }
}
