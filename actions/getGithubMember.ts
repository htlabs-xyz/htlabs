import { Member } from 'app/type'

const BACKEND_URL = process.env.BASE_PATH || 'http://localhost:3000'

export const getGithubMembers = async (): Promise<Member[]> => {
  return await fetch(BACKEND_URL + '/api/github/get-members', {
    cache: 'no-store',
  }).then((res) => res.json())
}
