import Image from "next/image";
import Link from "next/link";
import ptcgApiSmall from "twinleaf-json/ptcgapi/small.json";
import { cn } from "~/lib/utils";
import { FileJsonIcon, GithubIcon, SproutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import Head from "next/head";
import HomeContents from "~/components/HomeContents.mdx";

export default function Home() {
  const cardsEntries = Object.entries(ptcgApiSmall);
  const slidingCards = [
    cardsEntries.slice(0, 20),
    cardsEntries.slice(20, 40),
    cardsEntries.slice(40, 60)
  ]
  return <>
    <Head>
      <title>Twinleaf Image JSON Repository</title>
      <meta name="description" content="A repository of JSON files containing card image sources for the Twinleaf online simulator." />
      <meta name="keywords" content="twinleaf,json,image,missing,simulator" />
    </Head>
    <main>
      <section className="w-full relative h-screen flex overflow-hidden flex-col justify-center gap-6">
        {
          slidingCards.map((cards, i) => <div key={i} className="w-full flex-shrink-0 inline-flex flex-nowrap overflow-hidden">
            {
              Array.from({ length: 2 }).map((_, ic) => <div key={i * ic} className={cn("flex items-center justify-center", i % 2 === 0 ? "animate-infinite-scroll" : "animate-infinite-scroll-reverse")}>
                {
                  cards.map(([setCode,imageUrl], i) =>
                    <div key={setCode} className="h-[30vh] mx-3">
                      <Image alt={setCode} className="h-full w-auto max-w-none" key={i} src={imageUrl} width={180} height={250} loading="lazy" />
                    </div>
                  )
                }
              </div>)
            }
          </div>)
        }
        <div className="absolute inset-0 flex justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent from-0% to-background to-90%" />
      </section>
      <section className="max-w-4xl mx-auto sticky bottom-0">
        <Card className="border-b-0 rounded-b-none shadow-none">
          <CardHeader>
            <CardTitle>
              <h1 className="text-4xl font-extrabold mb-3">Twinleaf Image JSON Repository</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <p>
              Fill in your missing card images on <Link href="https://play.twinleaf.gg">play.twinleaf.gg</Link>.
            </p>
          </CardContent>
          <CardFooter className="flex gap-1">
            <Button variant="outline" size="icon" asChild>
              <Link href="https://play.twinleaf.gg/">
                <SproutIcon />
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="/images.json">
                <FileJsonIcon />
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="https://github.com/amydevs/twinleaf-json">
                <GithubIcon />
              </Link>
            </Button>
            <div className="mr-auto" />
            <Button asChild>
              <Link href="/#installation-guide">
                Install
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
      <section className="max-w-4xl mx-auto">
        <Card className="border-t-0 rounded-t-none">
          <CardContent className="prose max-w-none">
            <HomeContents />
          </CardContent>
        </Card>
      </section>
    </main>
  </>;
}
