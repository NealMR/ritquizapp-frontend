# RIT Quiz — frontend prototype

Clickable frontend for the RIT Quiz app (Slido-style live quizzes and polls).
It runs entirely on mock data, so there is **no backend** in this folder.
Use it to see every screen and every field; then wire each page to the API.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use the demo buttons on the login page
(Admin / Teacher / Student). Any 6+ character password works.

## Screens

| Route | Who | What it shows |
|---|---|---|
| `/login`, `/signup`, `/forgot-password` | everyone | College-email auth; signup fields change for student vs teacher |
| `/admin` | admin | User stats, teacher approval queue, user table with filters, add user |
| `/admin/settings` | admin | Allowed domain, sign-up rules, quiz defaults, data export |
| `/teacher` | teacher | Class cards, create-class form, QR + join code |
| `/teacher/classes/[id]` | teacher | Quizzes & polls list, student roster, join settings |
| `/teacher/quizzes/[id]/edit` | teacher | Quiz builder: 6 question types, options, correct answers, timer, points, live settings |
| `/teacher/quizzes/[id]/live` | teacher | Projector host screen: lobby → question → reveal → leaderboard → final |
| `/teacher/quizzes/[id]/report` | teacher | Per-question answer breakdown and per-student scores |
| `/student` | student | Live-quiz banner, join by code or QR, my classes, recent results |
| `/join/[token]` | student | Landing page the QR opens; confirm and join class |
| `/play/[id]` | student | Phone quiz screen: waiting room, answering, result, leaderboard, final rank |
| `/student/results` | student | Full results history |
| `/profile` | all | Edit details (role-specific fields) and change password |

## Where to plug in the backend

- `lib/types.ts` — the exact data shapes the UI expects (see `FIELDS.md`).
- `lib/mock.ts` — replace each array with a `fetch()` to the API.
- `lib/auth.tsx` — replace `loginAs` with `POST /auth/login` + JWT storage.
- Every form has a comment like `/* POST /classes */` where the API call goes.
- Live screens (`/live`, `/play`) simulate timers locally; in the real app the
  teacher's actions are broadcast over the WebSocket and students follow.

Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, qrcode.react.
