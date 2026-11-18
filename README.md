# Unlabeled Graph Progression Lab

A separate version of Graph Progression Lab for **unlabeled (unordered) simple undirected graphs**. Two graphs represent one state exactly when a vertex bijection preserves adjacency. Vertex renamings are merged; graphs sharing a degree sequence are not automatically merged.

## Run locally

From this extracted project folder:

    python3 -m http.server 8000 --directory dist

Open http://localhost:8000. Any static HTTP server works; Python only serves the files. Do not double-click index.html: browsers restrict Web Workers on file:// URLs. No external JavaScript dependencies, CDN access, Python packages, or sign-in are needed for local use.

## Rules

All updates are simultaneous, using degrees computed before the step:

- **u:** toggle every pair with equal degrees.
- **u+:** add missing edges between equal-degree vertices; never remove edges.
- **u−:** remove existing edges between equal-degree vertices; never add edges.

Each step then identifies the resulting graph's isomorphism class. The new state is a structure, not a fixed labeling. Both u+ and u− stabilize because each changing step strictly increases or decreases the edge count. A graph is u+ complete when its u+ stable outcome is K_n, and u− collapsible when its u− stable outcome has no edges. Already complete/empty graphs qualify with zero steps; the n=1 graph qualifies for both.

## Exact isomorphism classes

The engine enumerates all labeled bit masks for n=1–7 and partitions them by their complete vertex-permutation orbits. No heuristic hash, degree sequence, or visual layout determines equality. The representative is the smallest adjacency bit mask in an orbit. Class IDs U0, U1, ... follow ascending representative masks. Pair bits use lexicographic order (0,1), (0,2), ... . Representative vertex numbers are for display and do not retain identities between steps.

| n | Unlabeled states | Labeled graphs represented |
|---|---:|---:|
| 1 | 1 | 1 |
| 2 | 2 | 2 |
| 3 | 4 | 8 |
| 4 | 11 | 64 |
| 5 | 34 | 1,024 |
| 6 | 156 | 32,768 |
| 7 | 1,044 | 2,097,152 |

The rules are equivariant under vertex relabeling: isomorphic inputs have isomorphic outputs. Thus they define well-posed transitions on isomorphism classes.

**Periods and transient distances are measured up to isomorphism.** Under u, a structural period-1 state can have a changed labeled adjacency after a step. Quotient periods can be shorter than labeled periods. Under u+ and u−, a structural fixed point is an actual stable graph because a changed step changes the edge count. Trajectories display canonical representatives; an individual vertex number need not follow the same physical vertex across frames.

All graph counts, property counts, and basin sizes in the interface are **unweighted counts of isomorphism classes**. The inspector's “labelings” badge shows how many distinct labeled graphs the class represents (n! / automorphism-group order). All isolates remain part of the graph. Disconnected graphs are included.

## Features

- Separate u, u+, and u− maps; the selected class is retained when switching rules at the same n.
- Pan, wheel/pinch zoom, fit, fullscreen, basin filtering, and click-to-inspect graph representatives.
- Exact transient depth and attractor period; stable graph outcomes and steps for both monotone rules.
- u+ complete and u− collapsible classifications; trajectory filters for either property, its negation, or both.
- Paginated trajectories with the first repeated class included.
- JSON export: state-space convention, rule, representative masks and edges, labeled multiplicities, all transitions, basins, depths, periods, and both stable outcomes and classifications.
- Orbit enumeration runs in a background worker and is cached across rule switches at the same n.

## Validation

    node tests/engine.test.cjs

Tests independently implement transitions using adjacency matrices and exhaustively check every labeled input for n=1–7 against each quotient transition, ensuring that every member of a class maps into the same successor class. They check class totals, orbit sizes, weighted property counts against the labeled version, cycles, fixed points, monotonicity, and a structural fixed point that is not a labeled fixed point.

Files: dist/index.html, style.css, app.js, engine.js, worker.js, plus tests/engine.test.cjs and this README.

## n=7 downloadable edition

This edition adds n=7 to the rule selector and the exact orbit-enumeration engine. Select 7, then Generate map. All 1,044 unlabeled simple undirected graphs are included, with isolated and disconnected graphs retained. All three rules are computed exactly. No precomputed external data or internet connection is required once the files are served locally. The background worker keeps the interface responsive and caches the orbit partition across rule switches.

Use a fresh extraction folder to avoid opening the previous n<=6 edition. From that folder run:

    python3 -m http.server 8000 --directory dist

Open http://localhost:8000 and refresh the browser if it was already open. If port 8000 is occupied by the old project, stop the previous server or use port 8001.

Validation covers every labeled transition for n<=6; n=7 checks the 1,044-class total, all representative transitions, orbit cardinalities, monotonicity, stable outcomes, and sampled relabeled inputs. Counts and periods are up to isomorphism. The hosted app and this downloadable edition both support n ≤ 7.

## Crossing-free transition layout

Every transition state has exactly one successor. Each basin is therefore a directed cycle with incoming trees attached to its cycle vertices. The layout gives each subtree a disjoint horizontal interval and puts its parents on the next lower level; this prevents branch crossings. Cycle vertices are ordered along the baseline; adjacent cycle edges lie on that baseline, and the closing edge runs below the trees. Self-loops also sit below the baseline. Basins occupy separate boxes. This guarantee applies to these functional transition graphs, not to arbitrary directed graphs.

Branches are mirrored across the two sides of a two-state cycle where possible. Perfect symmetry is not imposed when the two attached trees differ. Node positions and routing change only the drawing, not transitions, properties, or periods. All 1,044 states at n=7 remain available through pan/zoom and basin filters.

Use the **↓ SVG** button in the map header to save the displayed basin selection as a scalable vector diagram. It exports complete basins, independently of the current zoom/pan crop. Select All basins to export the full transition map. The JSON export remains available below the map.

Run `node tests/layout.test.cjs` to check node positions, downward transient edges, disjoint basin boxes, containment, and nonincident edge crossings (using sampled cubic curves) for all n=1–7 and all three rules. The layout construction provides the separation; the geometric tests check its implementation.
# ugrapprog2
