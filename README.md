# Maze Runner — Real-Time Maze Visualization Engine

TypeScript + Babylon.js + Vite project that visualizes maze **generation** (DFS recursive backtracking) and **solving** (DFS) with performance tuned for low-end hardware.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal. Use the HUD to generate, solve, pause, change speed, maze size, quality preset, and camera mode.

## Architecture

```
src/
  app/MazeApp.ts          # Orchestrates engine, algorithms, rendering, UI
  config/                 # App + graphics quality presets
  core/                   # Babylon engine wrapper, FPS stats
  maze/                   # Grid + cell data model
  algorithms/             # Step-based generators & solvers
  rendering/              # Instanced walls, cell overlays, materials pool
  animation/              # Delta-time step scheduler
  ui/                     # HUD controls + statistics
```

### Design principles

- **Step-based algorithms** — generation/solving advance in discrete `step()` calls, not per-frame full recompute.
- **Incremental rendering** — each step sends a small `RenderPatch` (changed walls/cells only).
- **Thin instancing** — all walls are two instanced meshes (horizontal + vertical); cell states use four instanced overlay layers.
- **Pooled materials** — one shared material per category, frozen after creation.
- **Delta-time animation** — `AnimationScheduler` accumulates time and runs multiple logical steps per frame when needed (capped to avoid spiral-of-death).

## Algorithms

### Generation — DFS recursive backtracking

1. Push start cell on stack, mark visited.
2. If current cell has unvisited neighbors, pick one, remove wall between, push neighbor.
3. Else backtrack (pop stack).

### Solving — DFS

1. Traverse using solver visit flags and open walls.
2. On dead end, mark cell and backtrack.
3. On reaching goal, mark stack cells as solution path.

## Performance optimizations

| Area | Technique |
|------|-----------|
| Walls | 2 thin-instanced meshes instead of O(cells) boxes |
| Overlays | 4 instanced layers; only changed cells updated |
| Materials | Global cache + `freeze()` |
| Animation | Delta-time scheduler, max 8 steps/frame |
| Engine | Optional hardware scaling, `low-power` GPU hint, no stencil |
| Quality | Low / Medium / High / Auto presets |

### Draw call scaling (20×20 maze)

- **Before:** ~840 wall meshes + per-cell marker meshes → hundreds of draw calls
- **After:** ~7 static draw calls (walls×2, overlays×4, floor, mouse)

## Controls

| Control | Action |
|---------|--------|
| Generate | New maze + restart generation |
| Solve | Start DFS solver (after generation) |
| Reset | Same as Generate |
| Pause / Resume | Freeze algorithm steps |
| Speed | 0.25× – 3× step rate |
| Size | 10 – 40 |
| Quality | Auto-detect or force Low/Medium/High |
| Camera | Isometric or top-down |

## Roadmap (not yet implemented)

- Prim & recursive-division generators
- BFS & A* solvers
- First-person camera, minimap, sound, screenshot export
- Shadow pipeline (disabled on Low/Medium for compatibility)

## License

MIT (course / portfolio use).
