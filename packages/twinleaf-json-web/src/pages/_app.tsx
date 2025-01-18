import { GeistSans } from "geist/font/sans";
import { type AppType, type AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={`${router.basePath}/favicon.ico`} />
      </Head>
      <div className={GeistSans.className}>
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default MyApp;
