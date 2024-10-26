import { allProjects, Project } from '@/.contentlayer/generated'
import ProjectCard from './project-card'

export default async function ProjectsPage() {
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
        <div className="flex flex-col gap-4">
          {allProjects.map((project: Project) => {
            return (
              <div key={project.title} className="p-4">
                <ProjectCard project={project} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
