name: "📦 Scaffold & 🚀 Deploy"

on:
  workflow_dispatch:
    inputs:
      project_prompt:
        description: 'Natural language spec for your new app'
        required: true

jobs:
  scaffold:
    runs-on: ubuntu-latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      VERCEL_TOKEN:    ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID:   ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    outputs:
      pushed: ${{ steps.push.outputs.committed }}
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Scaffold from prompt
        run: node scaffold.js "${{ github.event.inputs.project_prompt }}"

      - name: Commit & Push scaffolded code
        id: push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "actions@github.com"
          git add .
          if git diff --quiet; then
            echo "::set-output name=committed::false"
          else
            git commit -m "✨ Scaffold from prompt"
            git push
            echo "::set-output name=committed::true"
          fi

  deploy:
    needs: scaffold
    if: needs.scaffold.outputs.pushed == 'true'
    runs-on: ubuntu-latest
    env:
      VERCEL_TOKEN:    ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID:   ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:  ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          prod: true
