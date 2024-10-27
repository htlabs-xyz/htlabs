import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allPosts } from 'contentlayer/generated'
import HomePage from 'components/app/HomePage'

export default async function Page() {
  const sortedPosts = sortPosts(allPosts)
  const posts = allCoreContent(sortedPosts)
  return <HomePage posts={posts} />
}
