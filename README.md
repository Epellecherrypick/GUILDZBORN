# GuildWatch — Developer README

This repository contains a Next.js frontend and a small Express + MongoDB backend for managing guilds, users, and short-lived paid codes (creation/promotion). The project implements JWT authentication, spectator code issuance, protected server endpoints, and frontend wiring for auth and protected actions.

## Quick start

1. Copy or verify your `server/.env` includes `MONGODB_URI` and optionally `JWT_SECRET` and `SPECTATOR_PASSWORD`.
2. Start the backend:

```powershell
cd server
npm install
npm run dev
```

3. Start the frontend from the repo root:

```bash
npm install
npm run dev
# open the dev URL shown (e.g. http://localhost:3001)
```

## What I added / changed

- Backend
	- `server/middleware/auth.js` — JWT auth middleware (verifies Bearer token and attaches `req.user`).
	- `server/routes/auth.js` — signup/login/spectator endpoints that issue JWT tokens.
	- `server/routes/codes.js` — create/verify code endpoints; `POST /api/codes/issue` requires a spectator token.
	- `server/routes/guilds.js` — protected `POST /api/guilds/create` (uses token `uid`), `POST /api/guilds/:id/promote` and added protected `disband`, `transfer`, `leave` endpoints.
	- `server/models/*` — Mongoose models for `User`, `Guild`, `Code`.

- Frontend
	- `src/app/components/GuildStateProvider.js` — stores `authToken`, exposes `signupUser`, `loginUser`, `loginAsSpectator`, attaches `Authorization: Bearer <token>` to protected fetches, and clears token on logout; provides server-first behavior with client fallback.
	- `src/app/page.js` — Home page wired to call signup/login endpoints and spectator login; `createGuild` uses protected create endpoint when available.
	- `src/app/admin-spectator/page.js` — spectator admin view (client-side gating); server enforces spectator-only for code issuance.

## How the auth flow works (current dev)

- The server issues a JWT when a user signs up, logs in, or when a spectator authenticates. The frontend stores that token in `GuildStateProvider` state and sends `Authorization: Bearer <token>` on protected requests.
- Server endpoints validate the token via `authMiddleware` and enforce roles (e.g., only `spectator` can issue codes).

## Tutorials

### A — Add UI controls to call `disband` / `transfer` / `leave` from profile

Goal: wire the profile UI so authenticated users call the server endpoints and update local state.

1. Open your profile page (example path): [src/app/profile/page.js](src/app/profile/page.js#L1) and import context:

```js
import { useGuildContext } from '../../components/GuildStateProvider';

export default function Profile() {
	const { getUserGuild, disbandGuild, transferOwnership, leaveGuild } = useGuildContext();
	const guild = getUserGuild();
	// ... render buttons
}
```

2. Add server-backed implementations (preferred) inside `GuildStateProvider` for the actions. Example `disbandGuild`:

```js
const disbandGuild = async (guildId) => {
	try {
		if (state.authToken) {
			const resp = await fetch(`${API_BASE}/api/guilds/${guildId}/disband`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.authToken}` },
			});
			const data = await resp.json();
			if (!resp.ok) return { error: data.error || 'Failed to disband' };
			setState(current => ({ ...current, guilds: current.guilds.filter(g => g.id !== guildId) }));
			return { success: true };
		}
	} catch (err) {
		return { error: err.message };
	}
	// fallback to client-only behavior here if you want offline support
};
```

3. Add profile buttons that call these functions and show feedback (example using `prompt` and `alert` for simplicity):

```jsx
<button onClick={async () => {
	const r = await disbandGuild(guild.id);
	if (r.error) alert(r.error); else alert('Disbanded');
}}>Disband</button>

<button onClick={async () => {
	const newOwner = prompt('New owner UID');
	if (!newOwner) return;
	const r = await transferOwnership(guild.id, newOwner);
	if (r.error) alert(r.error); else alert('Transferred');
}}>Transfer</button>

<button onClick={async () => {
	const r = await leaveGuild(guild.id);
	if (r.error) alert(r.error); else alert('Left');
}}>Leave</button>
```

Notes:
- `transferOwnership` server endpoint expects `{ newOwnerId }` in the POST body and validates membership.
- The server will enforce permissions; the client UI should only display buttons to users with the appropriate roles.

### B — Convert to secure cookie-based auth (HttpOnly cookie)

Goal: stop storing JWT in `localStorage` and use an HttpOnly cookie set by the server on login/signup. This reduces XSS risk.

Server-side steps

1. Install `cookie-parser` in `server/`:

```bash
cd server
npm install cookie-parser
```

2. Update `server/server.js` to parse cookies and enable CORS with credentials:

```js
const cookieParser = require('cookie-parser');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3001', credentials: true }));
app.use(cookieParser());
app.use(express.json());
```

3. Update `server/routes/auth.js` when issuing tokens to set an HttpOnly cookie instead of returning the token in JSON (you can still return the `user` object):

```js
res.cookie('token', token, {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	maxAge: 7 * 24 * 60 * 60 * 1000,
});
res.json({ success: true, user });
```

4. Update `server/middleware/auth.js` to read the token from `Authorization` header _or_ cookie:

```js
const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.cookies?.token;
if (!token) return res.status(401).json({ error: 'Missing token' });
// verify as before
```

5. Clear cookie on logout: `res.clearCookie('token');`.

Frontend changes

1. Remove long-term storage of tokens in localStorage. Instead rely on server-set cookie. Update protected fetches to include credentials:

```js
const resp = await fetch(`${API_BASE}/api/guilds/create`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	credentials: 'include',
	body: JSON.stringify({...}),
});
```

2. When calling `loginUser` / `signupUser`, the server will set the cookie and return the `user` object. Update your provider to use the returned `user` and not to store tokens.

3. For logout call a server-side endpoint that clears the cookie, or call `res.clearCookie('token')` on a server route.

Caveats & security

- Cookies are subject to CSRF; consider adding CSRF protection for state-changing endpoints (double-submit token or same-site policies). `SameSite: 'lax'` reduces this risk for many flows.
- Make sure production uses HTTPS and `secure: true` on the cookie.
- If you support multiple domains/origins, carefully configure `CORS` and cookie domains.

## Example `curl` tests

- Using header-based JWT (dev):

```bash
curl -X POST http://localhost:4000/api/guilds/create \
	-H "Authorization: Bearer <TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"game":"Game","name":"MyGuild","description":"...","joinCode":"abc"}'
```

- Using cookie approach (after setting cookie):

```bash
# If you have a token you can pass it as cookie: curl -b "token=<TOKEN>" ...
curl -b "token=<TOKEN>" -X POST http://localhost:4000/api/guilds/create -H "Content-Type: application/json" -d '{...}'
```

## Next steps I can take for you

- Patch the `profile` page to include the UI and server wiring for disband/transfer/leave.
- Convert the entire app to HttpOnly cookie-based authentication (server + frontend patches).
- Add toasts/loading states around API calls.

Which of these would you like me to do next?

---
Generated by your coding assistant — I can follow up by applying any of the patches above automatically.
