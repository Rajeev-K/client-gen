/// <reference path="./lib.deno.d.ts" />

import { OpenAPIObject, OperationObject, SchemaObject } from "./openapi.d.ts";

async function main() {
    const pathOrUrl = Deno.args[0];
    if (!pathOrUrl) {
        console.error("Please provide an OpenAPI spec path or URL.");
        Deno.exit(1);
    }

    try {
        let spec: OpenAPIObject;
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

function generateTypeScript(spec: OpenAPIObject): void {
    generateMethods(spec);
    generateDataModels(spec);
}

function generateMethods(spec: OpenAPIObject): void {
    for (const path in spec.paths) {
        const pathItemObject = spec.paths[path];
        for (const method in pathItemObject) {
            if (method === "get" || method === "post" || method === "put" || method === "delete") {
                let functionName = path.split('/').pop()!;
                if (!functionName.toLowerCase().startsWith(method))
                    functionName = method + functionName;
                const operationObject = pathItemObject[method]!;
                const returnTypeSpec = getReturnTypeSpec(operationObject);
                console.log(`function ${functionName}: ${returnTypeSpec} {`);
                console.log('}');
                console.log();
            }
        }
    }
}

function getReturnTypeSpec(operationObject: OperationObject) {
    return "any";
}

function generateDataModels(spec: OpenAPIObject): void {
    const schemas = spec.components?.schemas;
    if (!schemas)
        return;
    for (const schemaName in schemas) {
        const schema = schemas[schemaName];
        switch (schema.type) {
            case "object":
                generateObject(schemaName, schema);
                break;
            case "string":
                if (schema.enum)
                    generateEnum(schemaName, schema);
                break;
        }
    }
}

function generateObject(schemaName: string, schema: SchemaObject): void {
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
                elementType = property.items.$ref.split('/').pop()!;
            typeSpec = `${elementType}[]`;
        }
        else if (property.$ref) {
            typeSpec = property.$ref.split('/').pop()!;
        }
        else {
            typeSpec = property.type;
        }
        console.log(`   ${propertyName}?: ${typeSpec};`);
    }
    console.log('}');
    console.log();
}

function generateEnum(schemaName: string, schema: SchemaObject): void {
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
