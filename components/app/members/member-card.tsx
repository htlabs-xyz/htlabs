import Image from 'next/image'
import SocialIcon, { icons } from '@/components/common/social-icons'
import { Member } from 'app/type'

export default function MemberCard({ member }: { member: Member }) {
  const { name, github, avatar, company, website, location, email, bio, social } = member
  return (
    <div className="flex flex-col items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
      <div className="flex h-full items-center justify-center border-t-slate-600 xl:col-span-1">
        {avatar && (
          <Image
            src={avatar}
            alt="avatar"
            width={192}
            height={192}
            className="h-52 w-52 rounded-full"
          />
        )}
      </div>
      <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
        <h3 className="text-2xl leading-8 font-bold tracking-tight">{name}</h3>
        <div className="h-full">{bio}</div>
        <div className="mt-2 text-gray-500 dark:text-gray-400">{company}</div>
        <div className="text-gray-500 dark:text-gray-400">{location}</div>
        <div className="flex space-x-3 pt-6">
          <SocialIcon kind="mail" href={`mailto:${email}`} />
          <SocialIcon kind="github" href={`https://github.com/${github}`} />
          <SocialIcon kind="website" href={website} />
          {social.map((s, index) => {
            const kind =
              s.provider.toLocaleLowerCase() in icons
                ? (s.provider.toLocaleLowerCase() as keyof typeof icons)
                : 'website'
            return <SocialIcon key={index} kind={kind} href={s.url} />
          })}
        </div>
      </div>
    </div>
  )
}
