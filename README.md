# japan-winter-live

TravelPilot trip dashboard and multi-trip runtime.

Current QA cleanup branch: `qa-cleanup-v10.12.0`.

Automated checks live in `scripts/qa.py` and run through the `TravelPilot QA` GitHub Actions workflow. The checks cover release/version ownership, retired runtime references, local asset integrity, trip registry/config/data consistency, homepage date sorting, and cross-trip routing/feature leakage.
