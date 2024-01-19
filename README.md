# client-gen

Generates TypeScript REST API client from OpenAPI spec.

## Dependencies

Install [Deno](https://deno.com/). Deno is like node.js, but better.

## Setup

Run the following command at the command prompt:
```
deno types > lib.deno.d.ts
```

## Run client-gen

```
deno run --allow-read --allow-net client-gen.ts swagger.json > RestClient.ts
```

In the above example, the definition comes from `swagger.json` but you can also supply a URL instead.
The output is written to stdout, which is redirected to `RestClient.ts`.

## Use the generated code

The generated code requires you to supply a wrapper function for `fetch`. One is provided [here](FetchWrapper.ts).
