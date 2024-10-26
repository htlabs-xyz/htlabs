import { genPageMetadata } from 'app/seo'
import MembersPage from '@/components/app/MembersPage'

export const metadata = genPageMetadata({ title: 'Members' })
export const dynamic = 'force-dynamic'

export default function Page() {
  return <MembersPage />
}
