interface Proposal {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const ideascaleData: Proposal[] = [
  {
    title: '[HTLABS] Freelance Connect: Building Trust Between Freelancers and Employers',
    description: `a platform that uses the Cardano blockchain to create secure contracts between freelancers and employers, eliminating trust issues and payment disputes through transparent transactions`,
    imgSrc:
      'https://vvjbtiuxbzgqlhps.public.blob.vercel-storage.com/freelance-2NcpJtyyoFPILauFbfcBFPEqnztZn2.webp',
    href: 'https://cardano.ideascale.com/c/cardano/idea/131507',
  },
  {
    title: '[HTLABS] 5 Project templates combining blockchain and internet of things',
    description: ` 5 project templates that combine blockchain and IoT, providing developers with practical examples to improve security, decentralization and scalability in IoT applications using Cardano`,
    imgSrc:
      'https://vvjbtiuxbzgqlhps.public.blob.vercel-storage.com/iot-zuADxWwEmvBlziHuhpsFUFkS1fsrer.webp',
    href: 'https://cardano.ideascale.com/c/cardano/idea/127449',
  },
  {
    title:
      '🇻🇳 Cardano App Development Course: A Step-by-Step Guide for Beginners - From basic Web development to use Cardano Libraries and interacting with Smart Contracts!',
    description: `A dApp course, guiding basic programming from building the webapp, integrating tools like Mesh, Lucid for transactions, and connecting with Aiken smart contracts to build a complete dApp.`,
    imgSrc:
      'https://vvjbtiuxbzgqlhps.public.blob.vercel-storage.com/dapp-nA2hfao7bpvUMj0RNUBziIuxo3TKqP.webp',
    href: 'https://cardano.ideascale.com/c/cardano/idea/128025',
  },
  {
    title: '[BUTC] Fueling Growth: Cardano Hackathons to Inspire Startup Success',
    description: `hackathon series with different topics to attract teams with great ideas, thereby helping them in the development process of the project.`,
    imgSrc:
      'https://vvjbtiuxbzgqlhps.public.blob.vercel-storage.com/hackathon-5X8ImqPH78dJJmk70y9dAQu9KYzrze.webp',
    href: 'https://cardano.ideascale.com/c/cardano/idea/132226',
  },
]

export default ideascaleData
