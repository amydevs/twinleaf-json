import type { Manifest } from "twinleaf-json-common";
import { CopyIcon } from "lucide-react";
import imagesManifest from "twinleaf-json/manifest.json";
import Link from "next/link";
import * as React from "react";

function SourceLink({
  children,
  filePath,
}: {
  children?: React.ReactNode;
  filePath: string;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  return (
    <>
      <Link ref={ref} href={`/image-jsons/${filePath}`}>
        {children}
      </Link>{" "}
      <a
        href="#"
        onClick={async (e) => {
          e.preventDefault();
          await navigator.clipboard.writeText(ref.current!.href);
        }}
      >
        <CopyIcon size={16} className="inline" />
      </a>
    </>
  );
}

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
                  <SourceLink filePath={variant.filePath}>
                    {variantName}
                  </SourceLink>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
