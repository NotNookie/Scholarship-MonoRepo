export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-border-muted rounded-full flex items-center justify-center mb-4">
          <Icon size={24} className="text-content-disabled" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-content mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-content-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
