import Config from "../config";
import { Resource } from "../types";

export class SimpleSpaceExplorer {

    explorerContainer = document.createElement("div");
    callback: (id: string) => void;

    async getSpaces() {
        const res = await fetch(`https://${Config.VERTEX_URL_BASE}/core/resource?type=SceneAsset`, {
            headers: {
                "Authorization": `Bearer ${Vertex.Globals.bearerToken}`
            }
        })
        return await res.json();
    }

    async drawExplorer() {
        this.explorerContainer.id = "scene-explorer-container";
        this.explorerContainer.classList.add("explorerContainer");
        document.body.appendChild(this.explorerContainer);
        const resources: Resource[] = await this.getSpaces();

        this.drawCreateButton();

        resources.forEach(async resource => {
            await this.drawResourceTile(resource);
        });

    }

    drawCreateButton() {
        const cell = document.createElement("div");
        cell.classList.add("explorerCell");
        let add = document.createElement("div");
        add.classList.add("newSceneButton", "cursor-pointer");
        add.tabIndex = -1;
        cell.appendChild(add);
        add.addEventListener("click", () => {
            const date = new Date();
            this.createScene(date.toISOString());
        })
        this.explorerContainer.appendChild(cell);
    }

    async createScene(name: string) {
        const req = await fetch(`https://${Config.VERTEX_URL_BASE}/core/resource`, {
            headers: {
                "Authorization": `Bearer ${Vertex.Globals.bearerToken}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                name: name,
                type: "SceneAsset"
            })
        })

        if (!req.ok) {
            console.error("Failed to create new space resource", { req });
            throw new Error("Failed to create new space");
        }
        
        const resourceInfo = await req.json() as Resource;

        const id = resourceInfo.id;

        this.callback(id);
        this.explorerContainer.classList.add("hidden");
    }

    async drawResourceTile(resource: any) {
        const cell = document.createElement("div");
        const title = document.createElement("span");
        const img = document.createElement("img");
        cell.classList.add("explorerCell", "cursor-pointer");
        cell.tabIndex = -1;
        title.innerHTML = resource.name;
        cell.setAttribute("nx-id", resource.id);

        this.getImageUrlAsync(`https://${Config.VERTEX_URL_BASE}/core/resource/${resource.id}/thumb.png`)
            .then((imgUri) => {
                img.src = imgUri
            });
        cell.appendChild(title);
        cell.appendChild(img);
        cell.addEventListener("click", () => {
            this.callback(resource.id);
            this.explorerContainer.classList.add("hidden");
        })
        this.explorerContainer.appendChild(cell);
    }

    async getImageUrlAsync(url: string): Promise<string> {
        const result = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${Vertex.Globals.bearerToken}`
            }
        });

        if (!result.ok)
            return "";

        const data = await result.blob();

        const dataUri = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                res(reader.result as string);
            }
            reader.readAsDataURL(data);
        }) as string;

        return dataUri;
    }

    async createExplorer(callback: (id: string) => void) {
        this.callback = callback;
        this.drawExplorer();
    }
}
