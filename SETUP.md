# Vamsi Krishna's GitHub Profile — Immersive README

## Repository structure

```text
Vamsi-i7/
├── README.md
├── SETUP.md
├── .github/
│   └── workflows/
│       ├── update-repo.yml
│       └── contribution-snake.yml
└── scripts/
    └── update-repositories.js
```

## Install & Setup

1. Push all files (`README.md`, `.github/`, `scripts/`, `SETUP.md`, `.gitignore`) to the repository's `main` branch.
2. In **Settings → Actions → General → Workflow permissions**, select **Read and write permissions** and check **Allow GitHub Actions to create and approve pull requests**, then click **Save**.
3. Open the **Actions** tab in your repository:
   - Run **Generate contribution snake** manually once (via "Run workflow"). This generates and publishes the contribution snake animations to the `output` branch.
   - Run **Update repository catalog** manually once. This automatically syncs your public repositories table into `README.md`.

Both workflows use the repository's built-in `GITHUB_TOKEN`; no personal access token or external API keys are required.

## What updates automatically

- `update-repo.yml` runs daily and populates the project spotlight and the complete repository wall for public repositories owned by `Vamsi-i7`. Each repository preview image is wrapped in a link to that repository, so clicking a card opens the source repository. Forks appear in the full wall and are marked separately; they are excluded from the original-project spotlight.
- `contribution-snake.yml` runs daily and publishes light/dark contribution snake SVGs to the `output` branch.
- The README's contribution timeline, statistics cards, language chart, and streak card are served by dynamic SVG services with smooth animations.

## Important notes

- The full repository grid covers public repositories owned by `Vamsi-i7`, including public forks. Private repositories are excluded automatically.
- GitHub profile READMEs do not run custom JavaScript, so animations work as embedded animated SVGs and GIFs.
