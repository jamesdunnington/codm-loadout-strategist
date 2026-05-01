# CODM Loadout Strategist

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

A high-performance Windows desktop application that empowers CODM (Call of Duty Mobile) players to generate hyper-optimized weapon loadouts based on specific tactical "Smart Modes".

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-01 | Initial release with Smart Modes, weapon selection, and loadout generation |

## Features

- **Smart Mode Selector**: Choose from Rush, Aggro, Stealth, or Tactical modes
- **Weapon Selection**: Pick your favorite weapon or let the mode choose for you
- **Loadout Generation**: Generates complete loadouts with weapon, 5 attachments, perks, and scorestreaks
- **Meta Weapon Database**: 15+ S-Tier and A-Tier weapons with real attachment data
- **Export to Clipboard**: Copy loadout strings for easy sharing
- **Historical Saves**: Save up to 10 loadouts locally
- **Neo-Brutalist UI**: High-contrast design with Toxic Green and Sharp Yellow accents

## Smart Modes

| Mode | Description | Priority Stats |
|------|-------------|----------------|
| **Rush** | CQC King | Mobility > ADS Speed > Sprint-to-Fire |
| **Aggro** | Mid-Range Slayer | Range > Accuracy > Recoil Control |
| **Stealth** | Silent Killer | Suppressor > Dead Silence > Ghost |
| **Tactical** | Strategic Play | Accuracy > Control > Range |

## Weapons Database

### Assault Rifles
- Kilo 141 (S-Tier)
- AK-47 (A-Tier)
- M4 (A-Tier)
- ASM10 (B-Tier)

### SMGs
- Fennec (S-Tier)
- QQ9 (S-Tier)
- HG 40 (A-Tier)
- MX9 (A-Tier)
- PPSh-41 (B-Tier)

### LMGs
- Holger 26 (A-Tier)

### Sniper Rifles
- DL Q33 (S-Tier)
- Locus (A-Tier)

### Shotguns
- BY15 (A-Tier)
- HS0405 (B-Tier)

### Marksman Rifles
- SP-R 208 (S-Tier)

## Download

Download the latest Windows installer from the [Releases](https://github.com/remio/codm-loadout-strategist/releases) page.

## Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build Windows App
```bash
npm run electron:build:win
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 28
- **CI/CD**: GitHub Actions
- **Package Manager**: npm

## Project Structure

```
codm-loadout-strategist/
├── .github/workflows/     # CI/CD configuration
├── assets/                # App icons and resources
├── electron/              # Electron main & preload scripts
├── src/
│   ├── data/             # Weapons, perks, scorestreaks JSON
│   ├── engine/           # Loadout generation logic
│   ├── App.tsx           # Main UI component
│   ├── index.css         # Neo-Brutalist styles
│   ├── main.tsx          # React entry point
│   └── types.ts          # TypeScript types
├── dist/                  # Built React app
├── dist-electron/         # Built Electron files
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## CI/CD

This project uses GitHub Actions to automatically build Windows executables:

- **Trigger**: Push to `main` branch
- **Output**: `.exe` installer and portable app
- **Artifacts**: Available in GitHub Releases

See `.github/workflows/build-windows.yml` for configuration.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**remio** - [GitHub](https://github.com/remio)

---

## Development Notes (For AI Assistants)

### Project Context
- **Framework**: React 18 + TypeScript + Electron + Vite
- **UI Style**: Neo-Brutalist (toxic green #00FF00, sharp yellow #FFFF00, thick borders, hard shadows)
- **Build**: `npm run build` (tsc + vite), `npm run electron:build:win` (full Windows app)
- **Dev**: `npm run dev` (starts Vite dev server + Electron)

### Key Files
| File | Purpose |
|------|---------|
| `src/App.tsx` | Main UI with mode selector, weapon dropdown, loadout display |
| `src/engine/loadoutGenerator.ts` | Core logic for generating loadouts based on mode/weapon |
| `src/data/weapons.json` | Weapon database with attachments |
| `src/types.ts` | TypeScript interfaces |
| `.github/workflows/build-windows.yml` | CI/CD - auto-builds on push to main |

### Common Tasks
- **Add weapon**: Edit `src/data/weapons.json`, follow existing structure
- **Change UI style**: Modify `src/index.css` CSS variables
- **Update build**: Edit `package.json` build scripts or `vite.config.ts`
- **Fix TypeScript**: Run `npx tsc --noEmit` to check errors
- **Git push**: Already configured for `https://github.com/jamesdunnington/codm-loadout-strategist.git`

### Build Outputs
- `dist/` - React production build
- `dist-electron/` - Electron main/preload compiled
- `release/` - Final `.exe` files (from electron-builder)

### Known Warnings (Safe to Ignore)
- CSS inline style warnings from Microsoft Edge Tools extension (cosmetic only)
- Vite CJS deprecation notice (informational)

**Disclaimer**: This application does not interact with CODM game files or memory. All loadouts are generated for manual entry into the game.
