/// <reference path="./lib.deno.d.ts" />

import { resolve, join } from "https://deno.land/std@0.212.0/path/mod.ts";

async function main() {
    const pathOrUrl = Deno.args[0]; // Get the OpenAPI spec URL from command line arguments
    if (!pathOrUrl) {
        console.error("Please provide an OpenAPI spec path or URL.");
        Deno.exit(1);
    }

    try {
        let spec: any;
        if (pathOrUrl.startsWith("http")) {
            spec = await fetch(pathOrUrl).then(res => res.json());
        }
        else {
            // Resolving the full path to the file
            const fullPath = resolve(join(Deno.cwd(), pathOrUrl));

            // Reading the file content as text
            const fileContent = await Deno.readTextFile(fullPath);

            // Parsing the file content as JSON
            const spec = JSON.parse(fileContent);            
        }
        generateTypeScript(spec);
    }
    catch (error) {
        console.error("Failed to generate TypeScript:", error);
    }
}

function generateTypeScript(spec): void {
}

main();
