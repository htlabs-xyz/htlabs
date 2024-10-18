import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.BASE_PATH

const Image = ({ src, ...rest }: ImageProps) => {
  const isExternal = typeof src === 'string' && src.startsWith('http')
  return <NextImage src={isExternal ? src : `${basePath || ''}${src}`} {...rest} />
}

export default Image
