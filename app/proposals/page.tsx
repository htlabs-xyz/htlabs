import ProposalPage from '@/components/app/ProposalPage'
import { genPageMetadata } from 'app/seo'
export const metadata = genPageMetadata({ title: 'Proposal' })

export default function Page() {
  return <ProposalPage />
}
