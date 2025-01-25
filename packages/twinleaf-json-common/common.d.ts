export type TexturePack = Record<string, string>;

export type ManifestSourceDefinition = {
    variants: Record<string, ManifestVariantDefinition>,
}

export type ManifestVariantDefinition = {
    filePath: string,
}

export type VariantDefinition = ManifestVariantDefinition & {
    extract: () => Promise<TexturePack>,
};

export type SourceDefinition = ManifestSourceDefinition & {
    variants: Record<string, VariantDefinition>,
};

export type Sources = Record<string, SourceDefinition>;

export type Manifest = Record<string, ManifestSourceDefinition>;