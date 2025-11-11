import { Member } from 'app/type'
import MemberCard from '@/components/app/members/member-card'
import { getGithubMembers } from 'actions/getGithubMember'

export default async function MembersPage() {
  const allMembers = await getGithubMembers()

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-2xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-3xl sm:leading-10 md:text-3xl md:leading-14 dark:text-gray-100">
            Members
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          {allMembers.map((member: Member) => {
            return (
              <div key={member.github} className="p-4">
                <MemberCard member={member} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
