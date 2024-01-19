interface OpenAPI {
    openapi: string;
    info: {
        title: string;
        version: string;
    }
    paths: Path[];
    components: {
        schemas: Schemas;
        parameters: {[parameterName: string]: Parameter};
    }
}

type Schemas = {[schemaName: string]: Schema};
type Properties = {[propertyName: string]: Property};

interface Path {
}

interface Schema {
    type: string;
    enum: string[];
    properties: Properties;
}

interface Parameter {
}

interface Property {
    type: string;
    nullable: boolean;
    "$ref": string;
    items: { // Must be present if type === "array"
        "type": string;
        "$ref": string;
    }
}