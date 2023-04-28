# Heorot-next

> Alert: Extremely early development ahead!

This is the upcoming v2.0.0 build of Heorot.

Built with the [T3 Stack](https://create.t3.gg/):

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

It aims to simplify the codebase, deployment, and provide an end to end Typesafe developer experience.

Some functions may be carried over from v1.x.x, but the aim is for an entire application rewrite.

## Development:

clone the repo and install node packages, then copy and edit the .env file

Run the dev script:

```bash
npm run dev
```

In another terminal: initialize the DB & run the Prisma webUI:

> Note: SQLite is used by default

```bash
npx prisma db push && npx prisma studio
```

http://localhost:3000 will house the entire application, register a test user and start coding!
