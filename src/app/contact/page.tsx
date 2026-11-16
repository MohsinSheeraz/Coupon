import type { Metadata } from "next"
import { Mail, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
    title: "Contact Us | DealzyCoup",
    description: "Send a message to the DealzyCoup team.",
}

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <section className="mx-auto max-w-6xl">
                <header className="mb-8 max-w-2xl">
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce3d4] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5b7048]">
                        <MessageCircle size={14} aria-hidden="true" />
                        Contact DealzyCoup
                    </p>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                        How can we help?
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-gray-600">
                        Send us a message and our team will get back to you.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <aside className="rounded-3xl bg-ink p-6 text-white sm:p-8">
                        <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#dfff6c]">
                            <Mail size={22} aria-hidden="true" />
                        </div>
                        <h2 className="mt-6 font-display text-2xl font-semibold">Email us directly</h2>
                        <p className="mt-2 max-w-sm leading-relaxed text-white/70">
                            Have a question about a deal or need help? We are happy to hear from you.
                        </p>
                        <a
                            href="mailto:info@dealzycoup.com"
                            className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-[#dfff6c] transition hover:bg-white/10"
                        >
                            info@dealzycoup.com
                        </a>
                    </aside>

                    <ContactForm />
                </div>
            </section>
        </div>
    )
}
