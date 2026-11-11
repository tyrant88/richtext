<?php

declare(strict_types=1);

namespace Lus\Richtext;

use Override;
use Redaxo\Core\Addon\Addon;
use Redaxo\Core\Core;
use Redaxo\Core\View\Asset;

/**
 * Richtext-Feld mit Quill 2, siehe {@see Field\Richtext}.
 *
 * Die Assets kommen auf jede Backend-Seite, weil Moduleingaben auch per Overlay nachgeladen werden und das Overlay
 * nur den Hauptinhalt übernimmt, nicht die Skripte der geladenen Seite.
 */
final class RichtextAddon extends Addon
{
    #[Override]
    public function boot(): void
    {
        if (!Core::isBackend()) {
            return;
        }

        Asset::addCssFile($this->getAssetsUrl('quill.snow.css'));
        Asset::addCssFile($this->getAssetsUrl('richtext.css'));
        Asset::addJsFile($this->getAssetsUrl('quill.js'));
        Asset::addJsFile($this->getAssetsUrl('richtext.js'));
    }
}
