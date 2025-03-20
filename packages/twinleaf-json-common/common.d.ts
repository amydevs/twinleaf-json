export type TexturePack = Record<string, string>;

export type ManifestSourceDefinition = {
    description?: string,
    variants: Record<string, ManifestVariantDefinition>,
    priority?: number,
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