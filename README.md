# Portfolio — Mathias JAVIERRE

Portfolio d'un étudiant en Bac Pro CIEL (Cybersécurité, Informatique et Réseaux, Électronique).
Site statique, sans dépendance à installer : ouvrir `index.html` dans un navigateur suffit.

## Structure

```
index.html                  Accueil (présentation, parcours, compétences, fiches, attestations)
pages/projet.html           Liste des projets
pages/chef-oeuvre.html      Dossier du chef-d'œuvre STOKARA
assets/css/site.css         Feuille de style unique (toutes les pages)
assets/js/site.js           Comportements partagés (navigation, visionneuse, thème…)
image/  pdfs/  previews/    Médias : photos, documents, vignettes des fiches
Video/                      CV vidéo
_backup_original/           Version du site avant refonte visuelle
```

## Charte graphique

Tout se règle depuis les variables en tête de `assets/css/site.css` :

| Variable | Rôle |
|---|---|
| `--accent` | Couleur principale (bleu pétrole en clair, cyan en sombre) |
| `--signal` | Vert des indicateurs d'état |
| `--paper` / `--surface` | Fonds de page et de cartes |
| `--ink` / `--muted` | Texte principal et texte secondaire |
| `--line` | Filets et bordures |

Le thème sombre reprend les mêmes noms de variables dans le bloc `[data-theme="dark"]`.
Le choix du visiteur est mémorisé dans le navigateur ; par défaut le site suit le réglage du système.

Polices : Newsreader (titres), Inter (texte), JetBrains Mono (métadonnées), chargées depuis Google Fonts.

## Ajouter du contenu

**Une fiche d'activité** — déposer le PDF dans `pdfs/`, la vignette dans `previews/`, puis
dupliquer un bloc `<article class="entry" data-pdf="...">` dans la section `#activities`
de `index.html`.

**Un projet** — dupliquer un bloc `<article class="project">` dans `pages/projet.html`.
La classe `fact--status` affiche la pastille verte d'état.
Penser à mettre à jour les compteurs `data-count` de la barre de statistiques.

**Une compétence** — dupliquer un `<li class="skill">` dans la section `#skills`.
Avec image : utiliser `skill__media` + `data-zoom`. Sans image : utiliser `skill__glyph`.
La numérotation `01, 02…` est automatique.

**Une attestation** — dupliquer un `<article class="cert" data-zoom="...">`.

Toute image portant `data-zoom` entre automatiquement dans la visionneuse,
et se parcourt aux flèches du clavier.

## Accessibilité et performance

- Lien d'évitement, libellés ARIA sur les boutons, focus visible au clavier
- `prefers-reduced-motion` : les animations sont neutralisées si le système le demande
- Images hors écran en chargement différé, pages internes préchargées au survol
- Feuille d'impression dédiée (le portfolio s'imprime proprement, sections dépliées)
