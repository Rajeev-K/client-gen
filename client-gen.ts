/// <reference path="./lib.deno.d.ts" />

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
    generateDataModels(spec);
}

function generateDataModels(spec: OpenAPI): void {
    const schemas = spec.components?.schemas;
    if (!schemas)
        return;
    for (let schemaName in schemas) {
        const schema = schemas[schemaName];
        switch (schema.type) {
            case "object":
                generateObject(spec, schema);
                break;
            case "string":
                if (schema.enum)
                    generateEnum(spec, schemaName, schema);
                break;
        }
    }
}

function generateObject(spec: OpenAPI, schema: Schema): void {
}

function generateEnum(spec: OpenAPI, schemaName: string, schema: Schema): void {
    console.log(`enum ${schemaName} {`);
    for (let i = 0; i < schema.enum.length; i++) {
        const item = schema.enum[i];
        console.log(`   ${item}${i < schema.enum.length - 1 ? ',' : ''}`);
    }
    console.log('}');
    console.log();
}

main();
