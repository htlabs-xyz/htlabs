import { genPageMetadata } from 'app/seo'
import MembersPage from '@/components/app/MembersPage'

export const metadata = genPageMetadata({ title: 'Members' })

export default function Page() {
  return <MembersPage />
}
