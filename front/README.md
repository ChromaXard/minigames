## Frontend

### Présentation rapide

Next.js, le framework avec lequel j'ai décide de faire le front est normalement un framework fullstack mais que je n'utilise pas a 100%, je préfére séparé un minimum le front et back dans ce projet.  
Pourquoi Next ? ça simplicité et rapidité de mise en place, je passe pas 500 ans a configurer un truc. En plus avec la facilité de routage dans l'app directory, qui est un file based routing (routage basé sur les dossiers en français), la simplicité d'ajout de page est un sacré avantage

### Arborescence
```text
.
├── Dockerfile -> pour pouvoir utiliser le front en docker compose
├── README.md -> le fichier que vous etes en train de lire
├── eslint.config.mjs   )
├── next.config.ts      )
├── package.json        ) Configuration globale des plugins et package manager
├── pnpm-lock.yaml      ) (pnpm, eslint, next, postcss)
├── pnpm-workspace.yaml )
├── postcss.config.mjs  )
├── src -> tout le code écrit (histoire d'éviter de me mélanger avec la config)
│   ├── app -> toutes pages générés pour les différentes routes
│   │   ├── (auth) -> quand un dossier est entre parenthèses ça ne fait pas de sous routes (en gros ce sera /confirmation et non /auth/confirmation)
│   │   │   ├── confirmation
│   │   │   │   └── page.tsx -> page rendu pour le chemin en question
│   │   │   ├── connexion
│   │   │   │   └── page.tsx
│   │   │   ├── deconnexion
│   │   │   │   └── page.tsx
│   │   │   └── inscription
│   │   │       └── page.tsx
│   │   ├── chat
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── profil
│   │       ├── [id] -> route dynamique
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── components -> composants réutilisables pour les pages
│   │   ├── footer.tsx
│   │   ├── formComp
│   │   │   └── form.tsx
│   │   └── header.tsx
│   ├── contexts -> context global
│   │   ├── auth.tsx
│   │   ├── popups.tsx
│   │   ├── profile.tsx
│   │   └── socket.tsx
│   ├── hooks -> hooks pour utiliser les contexts
│   │   ├── useAuth.ts
│   │   ├── usePopups.ts
│   │   ├── useProfile.ts
│   │   └── useSocket.ts
│   └── lib -> dossier ou se trouveront toute les fonctions réutilisables (fetching, parsing ou autre)
└── tsconfig.json -> config typescript
```