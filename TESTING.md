# Functional verification plan

The application uses IndexedDB and is intended to be exercised in a browser. Run the checklist in README.txt after opening `index.html` (or the optional localhost server).

## Automated source checks
- `database.js` declares four IndexedDB stores: pilots, entries, exercises, settings.
- Pilot validation enforces a unique 3-digit key and non-negative baseline hours.
- Flight entry validation enforces a registered pilot and a duration greater than 0 and at most 24.
- Flight history uses independent auto-incrementing records.
- `Analytics.enrich()` derives totals from baseline hours plus matching history entries.
- Editing a flight entry updates the same entry ID; it does not create a second record.
- Deleting an entry removes that history record; all totals are recomputed from the remaining records.
- Restore validates the backup shape, pilot keys, and entry-to-pilot relationships before replacing stores in one IndexedDB transaction.
- CSV and JSON exports are generated locally in the browser.
- Charts are drawn from real records using canvas and have an empty-state message when no data exists.

## Manual browser test cases
1. Add, edit and delete pilots; duplicate indicatif should be rejected.
2. Add exercise types and categories; verify they appear in Data Entry.
3. Enter a pilot indicatif and confirm name/category/group auto-fill.
4. Save a flight; verify dashboard and pilot accumulated hours.
5. Edit and delete the flight; verify no double-counting.
6. Filter history by date, pilot, group, exercise type and category.
7. Open a group card; verify group pilot list and export.
8. Apply analytics date filters and select a pilot for individual history.
9. Generate each report type and print/save to PDF.
10. Export JSON, clear test data, restore backup and compare records.
