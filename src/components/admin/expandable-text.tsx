type ExpandableTextProps = {
    text: string
    maxLength?: number
    showPreview?: boolean
    triggerLabel?: string
    className?: string
}

export function ExpandableText({
    text,
    maxLength = 36,
    showPreview = true,
    triggerLabel = "View",
    className = "",
}: ExpandableTextProps) {
    if (text.length <= maxLength) return <span className={className}>{text}</span>

    return (
        <details className={`admin-expandable-text ${className}`}>
            <summary>
                {showPreview && <span className="admin-expandable-preview">{text}</span>}
                <span className="admin-expandable-trigger">
                    <span className="admin-expandable-trigger-closed">{triggerLabel}</span>
                    <span className="admin-expandable-trigger-open">Hide</span>
                </span>
            </summary>
            <div className="admin-expandable-full">{text}</div>
        </details>
    )
}
