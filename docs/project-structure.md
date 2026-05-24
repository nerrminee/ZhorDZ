# Project Structure

```text
zhordz/
├── docs/
├── public/
│   ├── fonts/
│   └── images/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── config/
│   ├── constants/
│   ├── context/
│   ├── data/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── test/
│   └── utils/
└── .env.example
```

- `app`: application-level providers and route definitions.
- `components`: reusable UI and layout pieces.
- `config`: external service configuration such as Firebase.
- `features`: domain-specific feature modules.
- `hooks`: reusable React hooks.
- `pages`: route-level screens.
- `services`: API and backend access helpers.
- `utils`: small shared utility functions.
