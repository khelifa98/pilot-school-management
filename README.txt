PILOT SCHOOL MANAGEMENT SYSTEM
================================

RUN ON WINDOWS
1. Extract pilot_school_management.zip to a normal folder, for example:
   C:\PilotSchool\
2. Open the folder.
3. Double-click index.html. Use a modern version of Microsoft Edge or Google Chrome.
4. The app creates its local IndexedDB database automatically.

IMPORTANT STORAGE NOTES
- Records are stored in this browser profile on this Windows computer.
- Do not use private/incognito browsing for operational data.
- Clearing browser site data can delete this database. Use Settings > Backup & Restore regularly.
- For the most reliable IndexedDB behavior, especially if your browser restricts file:// pages,
  run a local static server from this folder:
      py -m http.server 8000
  Then open http://localhost:8000 in Edge/Chrome.
  Python is only needed for this optional local server; it is not part of the application.
- Core forms, data storage, calculations and charts run locally. No application server or account
  is required. The chart renderer is a lightweight built-in canvas renderer so charts work offline
  without loading an external Chart.js dependency.
- PDF reports: Reports > Generate report > Print / Save PDF, then choose "Save as PDF" in the
  browser print dialog.
- CSV exports open in Excel or compatible spreadsheet software.

ADD YOUR SCHOOL LOGO
1. Open Settings.
2. Under School identity, choose your logo image (PNG, JPG or WebP, max 2 MB).
3. Enter the school name and click Save school profile.
4. The logo appears in the sidebar and printable reports.

DATA MODEL AND HOUR CALCULATION
- Each pilot has a Previous accumulated hours baseline.
- Current accumulated hours = Previous accumulated hours + sum of all current flight history entries.
- Each flight entry is stored separately.
- Editing/deleting a history entry causes totals and analytics to be recalculated from the records.
- A pilot with flight history cannot be deleted; set their status to Inactive to preserve audit history.
- Pilot indicatifs must be unique and exactly 3 digits.

BACKUP / RESTORE
- Settings > Download JSON backup exports the full local database.
- Restore replaces the current database after confirmation.
- Store backups separately from the computer running the application.

FIRST USE
1. Add exercise catalogue items in Exercises.
2. Add pilots in Pilots Database, including group, category and previous accumulated hours.
3. Use Data Entry to record flight hours.
4. Dashboard, Groups, Analytics and Reports derive their information from those records.

TEST CHECKLIST
A. Add a pilot with indicatif 456, previous hours 10.0.
B. Add an exercise in Exercises (e.g. Navigation / Training).
C. Record a 2.5-hour flight for pilot 456.
D. In Pilots Database, total should show 12.5 hours (10 + 2.5).
E. Edit the flight entry to 3.0 hours; total should become 13.0, not 15.5.
F. Delete the entry; total should return to 10.0.
G. Export JSON, then restore it and verify pilots and history remain.
H. Add another pilot in group 456 and check Groups filtering/report.

LIMITATIONS / OPERATIONAL CAUTION
- This is a single-device, single-browser local application, not a multi-user synchronized system.
- Anyone with access to the same Windows browser profile can access the data.
- IndexedDB is not encrypted by this application. Protect the Windows account and backups.
- Use your school's approved procedures for operational records and keep independent backups.
