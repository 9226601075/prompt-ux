This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Authentication Foundation

The app now includes a modular authentication foundation that leaves the existing prompt engine untouched:

- Dedicated auth architecture under src/lib/auth and src/components/auth
- Login page with Google and guest entry points
- Protected routes with redirect-to-login behavior
- User menu and logout flow
- Guest mode kept separate from Google-authenticated users
- Storage-based session foundation prepared for future Supabase Auth integration

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication flow

- Visit /login to access the sign-in experience.
- Continue with Google uses the local auth foundation placeholder.
- Continue as Guest creates a separate local guest session.
- Authenticated users can access the main prompt workspace and the workspace page.
- Unauthenticated users are redirected back to /login.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
