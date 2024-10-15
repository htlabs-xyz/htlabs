import { Member } from 'app/type'
import axios from 'axios'

export const getGithubMember = async (): Promise<Member[]> => {
  return (await axios.get('/api/github')).data
}
