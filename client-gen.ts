/// <reference path="./lib.deno.d.ts" />

import {
    OpenAPIObject,
    OperationObject,
    SchemaObject,
    ResponseObject,
    RequestBodyObject,
    ParameterObject
} from "./openapi.d.ts";
import { PathItemObject } from "./openapi.d.ts";

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
    console.log('import { performFetch } from "./FetchWrapper";');
    console.log();
    generateFunctions(spec);
    generateDataModels(spec);
}

function generateFunctions(spec: OpenAPIObject): void {
    for (const path in spec.paths) {
        const pathItemObject = spec.paths[path];
        for (const method in pathItemObject) {
            if (method === "get" || method === "post" ||
                method === "put" || method === "patch" || method === "delete") {
                generateFunction(path, method, pathItemObject[method]!)
            }
        }
    }
}

function generateFunction(path: string, method: string, operation: OperationObject): void {
    let functionName = path.split('/').pop()!;
    if (method === "get" || functionName.toLowerCase().startsWith(method))
        functionName = toCamelCase(functionName);
    else
        functionName = method + functionName;
    const {paramsSpec, queryParams, bodyObjectParamName} = generateFunctionParameters(operation);
    const returnTypeSpec = getReturnTypeSpec(operation);
    const bodyParam = bodyObjectParamName ? `, ${bodyObjectParamName}` : '';
    const url = "`" + convertToTemplateLiterals(path) + "`";
    console.log(`export async function ${functionName}(${paramsSpec}): Promise<${returnTypeSpec}> {`);
    console.log(`   return await performFetch(${url}, "${method.toUpperCase()}"${bodyParam});`)
    console.log('}');
    console.log();
}

function generateFunctionParameters(operation: OperationObject): ParameterMetadata {
    const functionParams = [];
    if (operation.parameters) {
        for (const parameter of operation.parameters) {
            const param = parameter as ParameterObject;
            functionParams.push(`${param.name}: ${getTypeSpec(param.schema as SchemaObject)}`);
        }
    }
    const requestBody = operation.requestBody as RequestBodyObject;
    let bodyObjectParamName = '';
    if (requestBody) {
        const schema = requestBody.content["application/json"]?.schema as SchemaObject;
        const bodyObjectType = schema ? getTypeSpec(schema) : "any";
        bodyObjectParamName = toCamelCase(bodyObjectType);
        functionParams.push(`${bodyObjectParamName}: ${bodyObjectType}`);
    }
    const queryParams = "";
    return { queryParams, paramsSpec: functionParams.join(', '), bodyObjectParamName};
}

function getReturnTypeSpec(operationObject: OperationObject): string {
    const response = operationObject.responses["200"] as ResponseObject;
    const content = response.content!;
    if (!content)
        return "void";
    const result = content["application/json"];
    return getTypeSpec(result.schema!);
}

function generateDataModels(spec: OpenAPIObject): void {
    const schemas = spec.components?.schemas;
    if (!schemas)
        return;
    for (const schemaName in schemas) {
        const schema = schemas[schemaName] as SchemaObject;
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
    console.log(`export interface ${schemaName} {`);
    const properties = schema.properties! as SchemaObject;
    if (properties) {
        const propertyNames = Object.keys(properties);
        for (let i = 0; i < propertyNames.length; i++) {
            const propertyName = propertyNames[i];
            const property = schema.properties![propertyName] as SchemaObject;
            const typeSpec = getTypeSpec(property);
            console.log(`   ${propertyName}?: ${typeSpec};`);
        }
    }
    console.log('}');
    console.log();
}

function getTypeSpec(schema: SchemaObject): string {
    if (schema.type === "array") {
        let elementType = "any";
        const items = schema.items as SchemaObject;
        if (items.type === "array") // array of arrays
            elementType = "any[]"; // todo
        else if (items.type === "integer")
            elementType = "number";
        else if (items.type)
            elementType = items.type;
        else if (items.$ref)
            elementType = items.$ref.split('/').pop()!;
        return `${elementType}[]`;
    }
    else if (schema.$ref) {
        return schema.$ref.split('/').pop()!;
    }
    else if (schema.type === "integer") {
        return "number";
    }
    else {
        return schema.type!;
    }
}

function generateEnum(schemaName: string, schema: SchemaObject): void {
    console.log(`export enum ${schemaName} {`);
    for (let i = 0; i < schema.enum!.length; i++) {
        const item = schema.enum![i];
        const isLast = i === schema.enum!.length - 1;
        console.log(`   ${item} = "${item}"${isLast ? '' : ','}`);
    }
    console.log('}');
    console.log();
}

function toCamelCase(str: string): string {
    str = str.replace(/[^a-zA-Z0-9]/g, '');
    return str.charAt(0).toLocaleLowerCase() + str.slice(1);
}

function convertToTemplateLiterals(str: string): string {
    return str.replace(/{(\w+)}/g, '${$1}');
}

interface ParameterMetadata {
    queryParams: string;
    paramsSpec: string;
    bodyObjectParamName: string;
}

main();
