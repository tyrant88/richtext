<?php

declare(strict_types=1);

namespace Lus\Richtext\Widget;

use Redaxo\Core\Form\Widget\Widget;
use Redaxo\Core\View\HtmlAttributes;
use Redaxo\Core\View\RendersView;

/**
 * Textarea, die `assets/richtext.js` durch einen Quill-Editor ersetzt. Die Textarea bleibt das Formularfeld,
 * der Editor schreibt bei jeder Änderung hinein.
 */
final class RichtextInput implements Widget
{
    use RendersView;

    /** @param list<int> $headings */
    public function __construct(
        public string $name,
        public ?string $value,
        public ?string $id,
        public array $headings,
        public int $languageId,
        public bool $required = false,
        public bool $disabled = false,
        public HtmlAttributes $attributes = new HtmlAttributes(),
    ) {}

    public function labelTarget(): ?string
    {
        return null;
    }
}
