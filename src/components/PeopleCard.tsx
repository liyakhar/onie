import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

type PeopleCardProps = {
  username: string
  name: string
  image?: string | null
  meta: string
}

export function PeopleCard({ username, name, image, meta }: PeopleCardProps) {
  return (
    <li>
      <Link to="/u/$username" params={{ username }} className="people-card">
        <Avatar className="people-card__avatar">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="people-card__body">
          <span className="people-card__name">{name}</span>
          <p className="people-card__handle">@{username}</p>
          <p className="people-card__meta">{meta}</p>
        </div>
      </Link>
    </li>
  )
}
