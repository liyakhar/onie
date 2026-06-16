import type { Category } from '#/generated/prisma/client'

export const CATEGORIES: {
  value: Category
  label: string
  description: string
}[] = [
  { value: 'UX_UI', label: 'UX / UI', description: 'Design systems, research, prototyping' },
  { value: 'SAAS', label: 'SaaS', description: 'Building and shipping software products' },
  { value: 'SCIENCE', label: 'Science', description: 'Research, lab work, analysis' },
  { value: 'ARCHITECTURE', label: 'Architecture', description: 'Spatial design and planning' },
  { value: 'ENGINEERING', label: 'Engineering', description: 'Hardware, systems, and builds' },
  { value: 'DATA', label: 'Data', description: 'Pipelines, analytics, ML ops' },
  { value: 'MARKETING', label: 'Marketing', description: 'Growth, campaigns, positioning' },
  { value: 'CONTENT', label: 'Content', description: 'Writing, video, editorial' },
  { value: 'RESEARCH', label: 'Research', description: 'Deep dives and synthesis' },
  { value: 'DEVOPS', label: 'DevOps', description: 'Infra, CI/CD, reliability' },
  { value: 'MOBILE', label: 'Mobile', description: 'iOS, Android, cross-platform' },
  { value: 'GAME_DEV', label: 'Game Dev', description: 'Games, engines, interactive' },
  { value: 'EDUCATION', label: 'Education', description: 'Teaching and learning flows' },
  { value: 'LEGAL', label: 'Legal', description: 'Contracts, compliance, review' },
  { value: 'FINANCE', label: 'Finance', description: 'Models, forecasting, ops' },
  { value: 'HEALTHCARE', label: 'Healthcare', description: 'Clinical and health workflows' },
  { value: 'PRODUCT', label: 'Product', description: 'PM, strategy, roadmaps' },
  { value: 'DESIGN', label: 'Design', description: 'Visual, brand, creative' },
  { value: 'OTHER', label: 'Other', description: 'Everything else' },
]

export function categoryLabel(value: Category) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}
