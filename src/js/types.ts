export type Guid = string;

export interface Resource {
    id: Guid,
    name: string,
    type: "SceneAsset" | "MeshAsset" | "Assembly" | "Data",
    created: string,
    modified: string,
    tags: string[],
    resourceKeys: string[],
    resourceMD5Hashes: string[],
    publishParent?: Guid,
    publishedResources: Guid[]
}