import { Link } from '@tanstack/react-router'

export function BlogBreadcrumbs({
  items,
}: {
  items: Array<{ label: string; to?: string }>
}) {
  return (
    <nav aria-label="Breadcrumb" className="blog-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="blog-breadcrumbs__sep" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
