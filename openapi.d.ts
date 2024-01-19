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
}

interface Parameter {
}

interface Property {
    type: string;
    nullable: boolean;
    items: { // Must be present if type === "array"
        "$ref": string;
    }
}