# Minigames Project 

## Présentation rapide
Bienvenue sur mon nouveau projet !  
Sans plus attendre rentrons dans le vif du sujet.  
Ce projet a pour simple but de m'occupper d'une certaine manière, mais de le rendre accessible et sympathique à utiliser pour tous.  
La finalité de ce projet ? Un site de mini-jeux accessible uniquement avec un compte crée sur le site, le tout remanié à mon goût (et compréhensible par tout le monde évidemment).  
Pour donner un avant gout de ce que je prévois, voici un début de liste de jeux qui seront disponible au fur et à mesure du temps :
- un snake, le grand classique, en solo uniquement mais avec un hébergement des scores possible
- un tic tac toe, morpion, ou autre nom que je ne connais pas, sur lequel je prévois d'implémenter le multijoueur avec un stockage de l'historique des parties
- un chi fou mi en bon français (autrement dit un pierre feuille ciseaux)
- Bien d'autres seront à venir avec le temps, ne vous en faites pas

Malheureusement le site n'est pas encore disponible, je suis en train de faire toute la partie technique de base nécéssaire pour que le site soit un minimum sécurisé.  
Mais lorsque un début sera disponible, je penserais a mettre ce petit fichier à jour histoire de tenir les personnes intéressés au courant.

Si vous souhaitez plus de détails n'hésitez pas a aller voir la roadmap ou je maintiendrai mes différents objectifs a jour

## Partie technique

### Description

Malgré que c'est censé être un minimum logique, la partie technique n'est pas accessible a toute personnes, du moins ça peut être incompréhensible pour certains.  
Du coup pour faire vite histoire de pas prendre trop de temps, le site est composé de trois parties :
- base de données
    - mis directement en place avec pg_cron
- backend ou api si vous préferez
    - express en "framework" de base (c'est plutôt une lib mais bon-)
    - typage (TypeScript au lieu de JavaScript) et hot reload avec tsx
    - socket.io pour les websocket
    - drizzle pour la gestion de mes schèmas pour la base de données
    - d'autres choses plus classiques mais pas besoin de les citer, comme par exemple : cors, cookieParser, jwt, bcrypt, etc...
- frontend
    - tout est fait avec Next.js (ironique sachant que la config de base est fait pour du ts et non js)
    - socket.io-client pour le websocket côté front
    - zod pour la validation de formulaire (doublon avec le back mais on essaie d'optimiser la bande passante)

Du coup, avec tout ça vous auriez peut etre envie de me dire, où est "l'orchestrateur avec quoi tu les lances ?", ou encore "tu utilises un reverse proxy, genre nginx ?"  
Je vais d'avance répondre au questions, pour le lancement je fait tout a la main avec docker compose, pas de K3s, K8s, pas de solution de déploiement automatisé pour l'instant.  
Quant au reverse proxy, vu que je fais tout directement sur le vps, j'utilise mon reverse proxy global dessus qui est traefik, ça me permait de setup les noms de domaines assez rapidement avec les labels (sans oublier d'ajouter la redirection chez son gestionnaire genre ovh, hostinger, namecheap ou autre).

### Arborescence
```text
.
├── LICENSE -> la licence du projet
├── Makefile -> Makefile classique avec up up-build, down, down-volumes, restart, logs et ps
├── README.md -> Le fichier que vous êtes en train de lire
├── ROADMAP.md -> La roadmap du projet
├── backend -> toute la partie backend fait avec express et autre
├── database -> Ma modification de l'image pour la basse de donnée
├── docker-compose.yml -> le docker compose de dev (pas encore de prod setup)
└── front -> toute la partie front next
```