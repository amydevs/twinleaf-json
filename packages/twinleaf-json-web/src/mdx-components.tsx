import type { MDXComponents } from "mdx/types";
import { useRouter } from "next/router";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: ({ src, ...imgProps }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      // eslint-disable-next-line @next/next/no-img-element
      // eslint-disable-next-line jsx-a11y/alt-text
      return <img src={`${router.basePath}${src}`} {...imgProps} />;
    },
    ...components,
  };
}
