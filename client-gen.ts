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
    for (const schemaName in schemas) {
        const schema = schemas[schemaName];
        switch (schema.type) {
            case "object":
                generateObject(spec, schemaName, schema);
                break;
            case "string":
                if (schema.enum)
                    generateEnum(spec, schemaName, schema);
                break;
        }
    }
}

function generateObject(spec: OpenAPI, schemaName: string, schema: Schema): void {
    console.log(`interface ${schemaName} {`);
    const propertyNames = Object.keys(schema.properties);
    for (let i = 0; i < propertyNames.length; i++) {
        const propertyName = propertyNames[i];
        const property = schema.properties[propertyName];
        let typeSpec: string;
        if (property.type === "array") {
            let elementType = "any";
            if (property.items.type === "array") // array of arrays
                elementType = "any[]"; // todo
            else if (property.items.type)
                elementType = property.items.type;
            else if (property.items.$ref)
                elementType = property.items.$ref.split('/').pop() as string;
            typeSpec = `${elementType}[]`;
        }
        else if (property.$ref) {
            typeSpec = property.$ref.split('/').pop() as string;
        }
        else {
            typeSpec = property.type;
        }
        console.log(`   ${propertyName}?: ${typeSpec};`);
    }
    console.log('}');
    console.log();
}

function generateEnum(spec: OpenAPI, schemaName: string, schema: Schema): void {
    console.log(`enum ${schemaName} {`);
    for (let i = 0; i < schema.enum.length; i++) {
        const item = schema.enum[i];
        const isLast = i === schema.enum.length - 1;
        console.log(`   ${item} = "${item}"${isLast ? '' : ','}`);
    }
    console.log('}');
    console.log();
}

main();
