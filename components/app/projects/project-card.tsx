import Image from 'next/image'
import { Project } from '@/.contentlayer/generated'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card } from '@/components/ui/card'
import Link from '@/components/ui/link'

export default function ProjectCard({ project }: { project: Project }) {
  const { title, slug, description, images, link } = project
  const href = link ? link : `/projects/${slug}`
  return (
    <Card className="flex flex-col items-start space-y-2 xl:grid xl:grid-cols-4 xl:gap-x-8 xl:space-y-0">
      <div className="flex h-full items-center justify-center border-t-slate-600 p-4 xl:col-span-2">
        {images && (
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <Image
              src={images[0]}
              alt={title}
              fill
              className="h-full w-full rounded-md object-cover"
            />
          </AspectRatio>
        )}
      </div>
      <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={`Link to ${title}`}
          >
            Show more &rarr;
          </Link>
        )}
      </div>
      {/* <div className="prose max-w-none pb-8 pt-8 dark:prose-invert xl:col-span-2">
        <h3 className="text-2xl font-bold leading-8 tracking-tight">{title}</h3>
        <div className="h-14">{description}</div>
      </div> */}
    </Card>
  )
}
