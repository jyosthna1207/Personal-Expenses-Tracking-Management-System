PERSONAL EXPENSE TRACKER MANAGEMENT SYSTEM
==========================================

REQUIREMENTS
- Node.js (LTS recommended)
- MySQL Server and MySQL Workbench
- VS Code

SETUP
1. Extract this ZIP.
2. Open the extracted "Personal Expense Tracker Management System" folder in VS Code.
3. Open MySQL Workbench, connect to your local MySQL server, open database/database.sql and execute it.
4. Open backend/db.js and enter your MySQL password in the password field.
5. Open a VS Code terminal in the backend folder and run:
   npm install
   npm run dev
6. Open http://localhost:5000 in your browser.

IMPORTANT
- This starter project intentionally keeps the MySQL connection settings in backend/db.js.
- Change the default session secret in backend/server.js before deploying publicly.
- The app uses bcryptjs to hash passwords.
- Do not publish your database password or session secret.
- Images are unique remote Unsplash images, so internet access is needed to display them.

FIRST USE
1. Open the website.
2. Select Create account and register.
3. Log in with your registered email and password.
4. Add categories, transactions and monthly budgets.
5. View the dashboard and reports.

If you already have a folder with work in progress, make a backup before copying these files over it.
