# Image replacement checklist

The site currently ships with **interim imagery**. Every filename below is
a placeholder that must be replaced with licensed, authorized photography
before launch.

## Hero Slider One — "Libraries of the World"
Brief §3.1.1. Slow cross-fade, 5–7 images, no text overlay for the first
two seconds. Closing image should be a warm interior of **The Space by
Arapahoe Libraries**.

| File                 | Current (interim)                 | Required                                              |
| -------------------- | --------------------------------- | ----------------------------------------------------- |
| `hero-1.jpg`         | Bibliotheca Alexandrina           | Trinity College Dublin — Long Room                    |
| `hero-2.jpg`         | State Library Victoria            | Stockholm Public Library rotunda                      |
| `hero-3.jpg`         | State Library Mortlock, Adelaide  | Beinecke Rare Book & Manuscript Library (Yale)        |
| `hero-4.jpg`         | Bibliothèque de l'Hôtel de Ville  | Boston Public Library — McKim Building                |
| `hero-5.jpg`         | Bibliothèque de la Sorbonne       | State Library Victoria — La Trobe Reading Room        |
| `hero-6.jpg` *(new)* | —                                 | National Library of Australia                          |
| `hero-7.jpg` *(new)* | —                                 | The Space by Arapahoe Libraries — warm interior       |

When adding `hero-6.jpg` / `hero-7.jpg`, also add the corresponding
`<div class="hero-slide">` blocks in `index.html` (section `#heroOne`).

## Hero Slider Two — "The Space by Arapahoe Libraries"
Brief §3.7. 5–7 images, exclusively of The Space at 12855 East Adam
Aircraft Circle, Englewood, Colorado. Image selection to be finalized
with Arapahoe's communications team.

| File                      | Current (interim)                | Required                                  |
| ------------------------- | -------------------------------- | ----------------------------------------- |
| `showcase-1.jpg`          | Columbus Metropolitan Library    | Exterior of the building                  |
| `showcase-2.jpg`          | Kelver Main Collections Hall     | Cafe                                      |
| `showcase-3.webp`         | CPL West Loop Branch, Chicago    | Coworking environment                     |
| `showcase-4.jpg` *(new)*  | —                                | Meeting room in use                       |
| `showcase-5.jpg` *(new)*  | —                                | Event space                               |
| `showcase-6.jpg` *(new)*  | —                                | Reading / gathering moment                |

When adding new showcase files, append matching slide divs in the
`#heroTwo` section of `index.html`.

## Invitation — reading room image
Brief §3.2.1. Currently reuses `hero-2.jpg`. Replace with an authorized
photograph of an Arapahoe Libraries reading or gathering space.
Referenced in `index.html` as `.invitation-image`.

## Portrait of Bob Beth
Brief §3.6.2, §6.4. Currently an initials placeholder. Supply a portrait
(recommended ratio 4:5) and update `.convenor-portrait` in `index.html`:

```html
<div class="convenor-portrait"
     role="img"
     aria-label="Bob Beth, Convening Steward and Strategic Innovations Advisor"
     style="background-image:url('/images/bob-beth.jpg')">
</div>
```

Remove the inner `.convenor-portrait-placeholder` once a real image is in place.

## Optimization

Before launch, run every file through a compressor (e.g. `squoosh`,
`sharp`) and keep each hero image under ~300 KB if possible. The five
current heroes total ~2.8 MB; target ~1 MB combined.
