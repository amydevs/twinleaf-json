import type { Manifest } from "twinleaf-json-common";
import imagesManifest from "twinleaf-json/manifest.json";
import Link from "next/link";

export default function SourceList() {
  return (
    <ul>
      {Object.entries(imagesManifest as Manifest).map(([key, desc]) => {
        return (
          <li key={key}>
            {key}
            {desc.description != null ? (
              <>
                <br />
                {desc.description}
              </>
            ) : (
              ""
            )}
            <ul>
              {Object.entries(desc.variants).map(([variantName, variant]) => (
                <li key={variantName}>
                  <Link href={`/image-jsons/${variant.filePath}`}>
                    {variantName}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
