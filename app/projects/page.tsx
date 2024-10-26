import ProjectsPage from '@/components/app/projects'
import { genPageMetadata } from 'app/seo'
export const metadata = genPageMetadata({ title: 'Projects' })

export default function Page() {
  return <ProjectsPage />
}
