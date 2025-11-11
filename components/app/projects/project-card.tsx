import Image from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card } from '@/components/ui/card'
import Link from '@/components/ui/link'
import { Project } from 'contentlayer/generated'
import { cn } from 'utils'

export default function ProjectCard({ project }: { project: Project }) {
  const { title, slug, description, images, link } = project
  const href = link ? link : `/projects/${slug}`
  return (
    <Card
      className={cn([
        'flex flex-col gap-6 p-4 md:h-80 md:flex-row md:gap-12 md:py-8',
        // reversed && 'md:flex-row-reverse',
      ])}
    >
      <div className="flex h-full items-center justify-center border-t-slate-600 p-4 sm:h-80 md:h-auto md:w-1/2">
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
      <div className="flex grow flex-col justify-between space-y-6 pb-1 md:w-1/2 md:pb-0">
        <div className="space-y-4">
          <h2 className="text-[1.75rem] leading-8 font-semibold">
            {href ? (
              <Link href={href} aria-label={`Link to ${title}`}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
          <div className="max-w-none space-y-4">
            {/* <div className="flex flex-wrap items-center gap-2">
              {builtWith?.map((tool) => {
                return (
                  <Brand
                    key={tool}
                    name={tool as keyof typeof BrandsMap}
                    iconClassName={clsx(
                      tool === 'Pygame' ? 'h-5 md:h-5.5' : 'h-5 w-5 md:h-5.5 md:w-5.5'
                    )}
                  />
                )
              })}
            </div> */}
            <p className="line-clamp-3 text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
            aria-label={`Link to ${title}`}
          >
            Show more &rarr;
          </Link>
        )}
      </div>
    </Card>
  )
}
