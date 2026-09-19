# Auto-Push to GitHub Rule

- **Trigger**: Upon completing any task or bug fix in this repository and verifying correctness via `npm run lint` and `npm run build`.
- **Action**: Automatically stage all changes (`git add`), commit them with a descriptive commit message following Conventional Commits, and push to GitHub on the active branch (`git push origin <branch>`).
