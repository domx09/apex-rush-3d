# APEX RUSH — 3D Racing

A browser-based 3D driving game built with Three.js. It runs directly from static files and is structured for GitHub Pages.

## Play locally

Because the game uses JavaScript modules, run it through a local web server (not by opening `index.html` as a `file://` URL).

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Accelerate | W / ↑ | GO |
| Brake / reverse | S / ↓ | BRAKE |
| Steer | A / D or ← / → | ◀ / ▶ |
| Handbrake / drift | Space | DRIFT |
| Pause | Esc | Pause button |
| Change camera | Camera button | Camera button |

## Current playable build

- Procedural 3D sports car and outdoor circuit
- Acceleration, braking, reverse, steering and handbrake slide
- Circuit race (3 laps) and free-drive sessions
- Rival car that follows the circuit
- Lap detection, race timer, speed/RPM/gear HUD
- Chase, front and cockpit-style camera views
- Off-track slowdown and track-limit feedback
- Responsive touch controls and desktop keyboard support

## GitHub Pages deployment

1. Create a repository on GitHub (or use a dedicated game repository).
2. Upload `index.html`, `styles.css`, `game.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages deployment to finish. Your game will be available at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

No build step is required. Three.js is loaded from jsDelivr, so an internet connection is required when playing.

## Honest scope notes

This is a first playable vertical slice, not the full feature list from the original concept. The vehicle is procedurally modelled rather than a licensed detailed car asset. Handling is an arcade-style approximation, not a tyre/suspension simulation. The rival is a path-following opponent, not a full tactical racing AI. The current build does not yet include damage deformation, audio assets, weather, a minimap, garage upgrades, unlockable cars, or separate rally/traffic environments. Those should be added as later development milestones and tested individually.
