export type Member = {
  name: string
  github: string
  avatar: string
  company: string
  website: string
  location: string
  email: string
  bio: string
  social: Social[]
}
export type Social = {
  provider: string
  url: string
}
