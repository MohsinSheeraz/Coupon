export function notifyNavigationStart(href: string) {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("app:navigation-start", { detail: { href } }))
}
