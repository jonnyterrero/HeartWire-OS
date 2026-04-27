# Coursework — Mathematics

This folder contains notes, summaries, and materials from all Mathematics courses.

## Relevant Topics

- Calculus

- Linear Algebra

- Differential Equations

- Probability

## Purpose

Centralize Mathematics coursework for future reference and exam prep.

## What’s in this tree

The coursework mirrors `OneDrive\School\mathematics` into this folder (alongside the existing `books/` material). Top-level course areas include:

- `Calc III (MIT)/`, `Differential Equations (MIT)/`, `Linear Algebra/`
- `Partial Differntial Equations (MIT)/`, `Math for Computer science/`
- `analysis and design of feedback control systems/`
- `Basic Statistics/`, `machine learning/`

## OneDrive sync caveats (ERROR 426)

If files are only in the cloud and not “always available” locally, `robocopy` can hit **error 426** and skip them. In Explorer, set **Always keep on this device** on `School\mathematics` (or the subfolder you need), wait for files to finish downloading, then re-run a small `robocopy` for that folder.

**`machine learning/`:** On OneDrive, the large cheatsheet PDFs in School often show as on-line only (`la---`); they fail with `robocopy` error 426 until hydrated. The repo currently includes the three `*.jpg` assets and `7-Machine-learning-explainability.pdf` (small enough to have copied). Add the remaining PDFs in a follow-up step after **Always keep on this device** on `School\mathematics\machine learning`, then re-copy that folder.

