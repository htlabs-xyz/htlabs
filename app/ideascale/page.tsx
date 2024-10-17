import IdeascalePage from '@/components/app/IdeascalePage'
import { genPageMetadata } from 'app/seo'
export const metadata = genPageMetadata({ title: 'Ideascale' })

export default function Page() {
  return <IdeascalePage />
}
