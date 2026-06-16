export type BlogAuthor = {
  name: string
  role: string
  bio: string
}

export type BlogFaq = {
  question: string
  answer: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  readingMinutes: number
  primaryKeyword: string
  keywordCluster: string[]
  author: BlogAuthor
  tldr: string
  body: string
  faqs: BlogFaq[]
  relatedSlugs?: string[]
}
