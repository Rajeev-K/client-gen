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

interface Path {
}

interface Schema {
    type: string;
}

interface Parameter {
}