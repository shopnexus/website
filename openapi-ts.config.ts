import { defineConfig } from "@hey-api/openapi-ts"

// The spec is generated on the server side by `go generate ./...` (cmd/specgen) from the
// per-module fragments. Reading it straight from the sibling checkout rather than from a
// copy is deliberate: the copy that used to live at website/openapi.yaml had drifted 18
// paths behind, which is how the frontend ended up calling two routes that do not exist.
export default defineConfig({
	input: "./openapi.yaml",
	// Not linted or formatted on the way out: it is generated, it is gitignored, and
	// running the project's ESLint over it only produces failures nobody can fix.
	output: "src/api/generated",
	plugins: [
		{
			name: "@hey-api/client-fetch",
			// Auth, the 401 refresh and the error envelope live here, applied to the
			// generated client at import time.
			runtimeConfigPath: "./src/api/runtime-config",
		},
		"@hey-api/typescript",
		"@hey-api/sdk",
		{
			name: "@tanstack/react-query",
			queryOptions: true,
			infiniteQueryOptions: true,
			mutationOptions: true,
		},
	],
})
