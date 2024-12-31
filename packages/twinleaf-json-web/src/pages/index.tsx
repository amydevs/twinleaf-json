import Link from "next/link";
import imagesManifest from "twinleaf-json/manifest.json";

export default function Home() {
  return <main className="max-w-4xl mx-auto">
    <div className="prose p-3">
      <h1>
        Twinleaf Image JSON Repository
      </h1>
      <ul>
        {
          Object.keys(imagesManifest).map((key) => {
            return <li key={key}><Link href={`/images/${imagesManifest[key as keyof typeof imagesManifest].fileName}`}>{key}</Link></li>;
          })
        }
      </ul>
    </div>
  </main>;
}
