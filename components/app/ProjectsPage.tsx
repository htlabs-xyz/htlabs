import Card from '@/components/common/Card'
import siteMetadata from '@/data/siteMetadata'
import { allProjects } from 'contentlayer/generated'

export default function ProjectsPage() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-10 md:text-3xl md:leading-14">
            Projects
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            List of projects made or contributed by HTLabs team.
          </p>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap justify-center">
            {allProjects.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.summary}
                imgSrc={d.images ? d.images[0] : siteMetadata.socialBanner}
                href={d.link ? d.link : `/projects/${d.slug}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
