# ML labs

Six notebooks that rebuild `src/pipeline/experiment.py` in miniature, on the real
612-row Surrey panel. They assume you can read Python and have never been taught
machine learning.

Each lab ends with an assignment you write yourself and a grader cell that prints
a receipt code. Paste that into the **ML labs** tab of `docs/learn/index.html`.

```bash
jupyter lab notebooks/labs/lab1_the_panel.ipynb
```

Kernel: **Surrey Biome (venv)**. Plain `python3` lacks the project deps. Paths
resolve on their own, so it does not matter which directory you start from.

| # | Notebook | You write | What it lands |
|---|----------|-----------|---------------|
| 1 | `lab1_the_panel.ipynb` | `rows_in_year`, `spread_ratio`, `fit_dry_edge` | The orthogonal-axes table, by hand. Refits the published dry edge. |
| 2 | `lab2_first_model.ipynb` | `mse`, `r2`, `best_line` | What a **negative R²** means, and why yours is negative. |
| 3 | `lab3_random_splits_lie.ipynb` | `assign_blocks`, `blocked_cv_rmse` | Spatial autocorrelation here is ~0; the repeated-corridor leak is **+0.87**. |
| 4 | `lab4_ridge.ipynb` | `ridge_solve`, `COND_CLIMATE` | Collinearity costs you *explanations*, not predictions. |
| 5 | `lab5_a_vs_b.ipynb` | `upscale`, `var_removed` | The blur gate: 12% removed against a 30% requirement. |
| 6 | `lab6_is_it_real.ipynb` | `paired_bootstrap`, `excludes_zero` | ΔRMSE −0.00004, CI [−0.00016, +0.00007], and why that is INCONCLUSIVE. |

Lab 6 calls the real `experiment.py` for the model run and reproduces the
preprint's headline interval to the digit — `ex.paired_difference` and your own
bootstrap should agree exactly.

## Requirements

The panel must exist at `data/processed/features.parquet`. If it doesn't:

```bash
.venv/bin/python -m src.pipeline.assemble -v
```

## Grading

`labgrader.py` holds the checks and the receipt format. Checks compare against a
reference within a tolerance, so a different-but-correct implementation passes;
they are tight enough that a function returning a constant does not.

The receipt is `LAB{n}-{passed}o{total}-{fnv1a}`. The Learning Centre recomputes
the same FNV-1a hash and rejects an edited code. That stops a mistyped paste, not
a determined student — the salt is in this directory and you can read it. The
verification is a convenience; the honesty is yours.

A note on naming that trips people up: the target column is `tvwsi` in the
parquet and **CDEI** in the preprint. Same numbers, two names.
