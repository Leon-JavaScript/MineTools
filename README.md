# MineTools

Cloudflare Worker project for the MineTools repository.

## Prerequisites

- Node.js 18+
- A Cloudflare account with Workers enabled

## Install

```bash
npm install
```

## Link to your existing worker

This repo is configured with `wrangler.toml`. Make sure `name` in that file matches your already-created Cloudflare Worker name.

## Local development

```bash
npm run dev
```

The worker will run locally at `http://localhost:8787`.

## Deploy

First time only:

```bash
npx wrangler login
```

Deploy:

```bash
npm run deploy
```