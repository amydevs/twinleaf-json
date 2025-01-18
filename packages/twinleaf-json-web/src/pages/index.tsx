import Image from "next/image";
import Link from "next/link";
import imagesManifest from "twinleaf-json/manifest.json";
import ptcgApiSmall from "twinleaf-json/ptcgapi/small.json";
import { cn } from "~/lib/utils";
import { FileJsonIcon, GithubIcon, SproutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
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
            <h2 id="installation-guide">
              Installation Guide
            </h2>
            <p>
              With this guide, you will be able to replace the default Twinleaf images with the images of the actual cards from various sources.
            </p>
            <p>
              First, you will need to choose one of the JSON files below to use as the sources for your images. Copy the link of the one you have chosen to your clipboard.
            </p>
            
            <p>
              The available image JSON sources:
            </p>
            <ul>
              {
                Object.entries(imagesManifest).map(([key, desc]) => {
                  return <li key={key}>
                    {key}
                    <ul>
                      {
                        Object.entries(desc.variants).map(([variantName, variant]) => <li key={variantName}>
                          <Link href={`/image-jsons/${variant.filePath}`}>{variantName}</Link>
                        </li>)
                      }
                    </ul>
                  </li>;
                })
              }
            </ul>
            <p>
              Next, navigate to <Link href="https://play.twinleaf.gg">play.twinleaf.gg</Link> and login if you have not yet already.
            </p>
            <p>
              Click on your profile on the top right corner of the site, and click on the &quot;Show profile&quot; button.
            </p>
            <Image width="1514" height="213" alt="Show profile screenshot" src={`${router.basePath}/images/show_profile.png`} />
            <p>
              Then, click on the &quot;Edit profile&quot; button underneath the navbar on the right, and then on the &quot;Images&quot; button within the dropdown menu.
            </p>
            <Image width="169" height="159" alt="Edit profile screenshot" src={`${router.basePath}/images/edit_profile.png`} />
            <p>
              Then, paste in the JSON URL that you copied to your clipboard earlier into the input field and hit the &quot;Save&quot; button.
            </p>
            <Image width="909" height="502" alt="Edit images screenshot" src={`${router.basePath}/images/edit_images.png`} />
            <h2 id="reporting-issues">
              Reporting Issues
            </h2>
            <p>
              To report issues, you can either leave a <Link href="https://github.com/amydevs/twinleaf-json/issues">GitHub issue</Link>, or send me a message on Discord at <code>amydev.me</code>.
            </p>
            <p>
              Please include the URL of the JSON file you used so that I know which variant of the JSON has your specific issue. Furthermore, attaching your exported deck-list that contains the erroneous cards would be greatly appreciated!
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  </>;
}
