# Richtext für REDAXO 6

Ein Richtext-Feld mit [Quill 2](https://quilljs.com/) für Moduleingaben und andere Formulare, die auf den
Feld-Attributen von REDAXO 6 aufbauen. Es ersetzt Redactor & Co., die es für REDAXO 6 nicht gibt.

> Frühe Version für das noch nicht veröffentlichte REDAXO 6 (`6.x-dev`).

## Funktionen

- Absätze und Überschriften (Ebenen einstellbar)
- fett, kursiv, nummerierte und unnummerierte Listen
- Links nach außen und interne Links über die Linkmap von REDAXO (`redaxo://ID`, beim Ausgeben ersetzt der Core
  sie durch die Artikel-URL)
- Formatierung entfernen

Gespeichert wird das HTML, das Quill erzeugt. Ein leerer Editor ergibt einen leeren String.

## Installation

Das Paket ist nicht auf Packagist. In der `composer.json` des Projekts das Repository eintragen:

```json
"repositories": [
    { "type": "vcs", "url": "https://github.com/tyrant88/richtext" }
]
```

```bash
composer require lus/richtext:dev-main
```

Wie jedes REDAXO-6-Addon ist es damit aktiv. Ein Install-Schritt ist nicht nötig.

## Verwendung

```php
use Lus\Richtext\Field\Richtext;
use Redaxo\Core\Content\AsModule;
use Redaxo\Core\Content\Module;

#[AsModule('text', 'Text')]
final class TextModule extends Module
{
    #[Richtext('Text')]
    public string $text = '';

    public function output(): string
    {
        return '<div class="text">' . $this->text . '</div>';
    }
}
```

Der Text ist HTML und wird deshalb **nicht** escaped ausgegeben.

### Optionen

| Parameter | Bedeutung | Vorgabe |
|---|---|---|
| `label` | Feldbeschriftung | – |
| `note` | Hinweis unter dem Feld | `null` |
| `required` | Pflichtfeld | `false` |
| `key` | abweichender Speicherschlüssel | Property-Name |
| `headings` | Überschriftsebenen in der Toolbar | `[2, 3]` |

```php
#[Richtext('Einleitung', headings: [2], required: true)]
public string $intro = '';
```

## Hinweise

- Quill verwirft beim Bearbeiten Markup, das es nicht kennt. Wird bestehendes HTML (z. B. aus Redactor) geöffnet
  und gespeichert, gehen etwa `target="_blank"`, Klassen und `javascript:`-Links verloren. Unverändert
  gespeicherte Inhalte bleiben wie sie sind.
- Links öffnen immer im selben Fenster.

## Lizenz

MIT, siehe [LICENSE](LICENSE). Quill steht unter der BSD-3-Clause-Lizenz, siehe
[assets/quill.LICENSE](assets/quill.LICENSE).
