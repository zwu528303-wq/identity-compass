# Identity Compass

Mobile-first prototype for turning Screen Time app usage into an Identity Score.

The current MVP is intentionally local and lightweight:

- Upload a Screen Time screenshot preview.
- Confirm/edit detected app usage rows.
- Recalculate the Goal Identity, Identity Score, Identity Mix, and score drivers immediately.
- Use deterministic scoring rules before adding OCR, auth, or data integrations.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main Files

- `src/components/identity-compass-app.tsx` - main interactive prototype
- `src/lib/identity-score.ts` - score, contribution, and identity mix logic
- `src/app/page.tsx` - app entry point

## Next Steps

- Add real OCR for uploaded screenshots.
- Save daily scans to Supabase.
- Add trend/history screens once the daily score loop feels right.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
