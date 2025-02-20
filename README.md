# Twinleaf JSON Repository Monorepo

This repository is a monorepo that contains both the code for generating the JSON files from various sources, as well as the website hosted at https://amydev.me/twinleaf-json/.

## Packages

Packages in this monorepo are contained in the `packages` directory. Here, you can find:

- `twinleaf-json` - This package contains the code to build the JSON files, as well as a manifest that describes the JSON files that have been built. Note that you will need `git` installed for update descriptions to be correctly fetched.
- `twinleaf-json-remote` - This package contains the code to get and scrape remote resources for the JSON files. This is mainly used for the Limitless source at the moment.
- `twinleaf-json-web` - This package is a Next.js SSG SPA that serves as both the homepage and the guide for installation and usage.
- `twinleaf-json-common` - This package contains common types and utilities used by all the other packages.
