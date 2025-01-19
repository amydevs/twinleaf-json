import type { MDXComponents } from 'mdx/types'
import { useRouter } from 'next/router'
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  
  return {
    img: ({ src, ...imgProps}) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      return <img src={`${router.basePath}${src}`} {...imgProps} />
    },
    ...components,
  }
}