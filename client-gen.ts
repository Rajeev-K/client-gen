/// <reference path="./lib.deno.d.ts" />

import { resolve, join } from "https://deno.land/std@0.212.0/path/mod.ts";

async function main() {
    const pathOrUrl = Deno.args[0];
    if (!pathOrUrl) {
        console.error("Please provide an OpenAPI spec path or URL.");
        Deno.exit(1);
    }

    try {
        let spec: OpenAPI;
        if (pathOrUrl.startsWith("http")) {
            spec = await fetch(pathOrUrl).then(res => res.json());
        }
        else {
            const fileContent = await Deno.readTextFile(pathOrUrl);
            spec = JSON.parse(fileContent);
        }
        generateTypeScript(spec);
    }
    catch (error) {
        console.error("Failed to generate TypeScript:", error);
    }
}

function generateTypeScript(spec: OpenAPI): void {
    generateDataModels(spec.components?.schemas)
}

function generateDataModels(schemas: Schemas): void {
    for (let schema in schemas) {
        console.log(schema);
    }
}

main();
