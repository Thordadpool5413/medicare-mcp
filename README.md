# Medicare Intelligence Console

A complete browser based Medicare analytics app built on top of the unofficial Medicare MCP server. It gives you a clean web interface for searching CMS Medicare provider, prescriber, hospital, formulary, spending, quality, and ASP pricing data.

The original upstream project provides the Medicare MCP engine. This repo adds a full web application layer, static frontend, app runtime, health checks, API proxy, CSV export, JSON export, sample queries, and build automation.

## What this app does

The Medicare Intelligence Console lets you search and review:

1. Medicare provider services
2. Medicare Part D prescriber patterns
3. Hospital utilization and payment data
4. Hospital quality indicators
5. Drug spending trends
6. Medicare Part D formulary coverage
7. Medicare Part B ASP pricing
8. ASP pricing trends
9. Hospital comparison data

## Local setup

Install dependencies:

```bash
npm install
```

Build the TypeScript code:

```bash
npm run build
```

Start the full browser app:

```bash
npm run app
```

Then open:

```text
http://localhost:8080
```

## App commands

```bash
npm run build
```

Compiles the MCP server and the web app into the `build` folder.

```bash
npm run app
```

Starts the full Medicare Intelligence Console. By default, this starts the embedded Medicare API on port `3000` and the browser app on port `8080`.

```bash
npm run start:http
```

Starts only the Medicare HTTP API.

```bash
npm start
```

Starts the original MCP server mode for MCP clients.

## Environment variables

Copy `.env.example` to `.env` for local development.

```bash
cp .env.example .env
```

Available settings:

```text
APP_PORT=8080
API_PORT=3000
START_EMBEDDED_API=true
LOG_LEVEL=info
```

If you want the browser app to connect to a separate Medicare API server, set:

```text
MEDICARE_API_URL=http://127.0.0.1:3000
START_EMBEDDED_API=false
```

## OpenAI API key safety

Do not commit an OpenAI API key to this repo.

If you use OpenAI features later, store the key in GitHub Secrets as:

```text
OPENAI_API_KEY
```

For local development, use a private `.env` file that is not committed.

## Web app routes

```text
GET /api/health
```

Returns app and Medicare API health status.

```text
POST /api/medicare-info
```

Runs Medicare data queries through the existing Medicare engine.

```text
POST /api/list-tools
```

Returns available Medicare MCP tool metadata.

## MCP usage

The original MCP server mode is still available.

Example MCP configuration:

```json
{
  "mcpServers": {
    "medicare-mcp-server": {
      "command": "node",
      "args": ["/path/to/medicare-mcp/build/index.js"]
    }
  }
}
```

## GitHub Actions

This repo includes two workflows:

1. `Import upstream medicare-mcp`

   Imports the latest upstream source from `openpharma-org/medicare-mcp` while preserving the local workflow files.

2. `Build Medicare Intelligence Console`

   Installs dependencies and runs the TypeScript build on push, pull request, or manual workflow dispatch.

## Notes

This app uses public CMS data sources through the upstream Medicare MCP implementation. Medicare data can be large, occasionally slow, and sometimes limited by availability from CMS source files. The app is designed to show useful errors instead of silently failing, because silent failure is just a bug wearing a fake mustache.
