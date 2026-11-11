<?php

declare(strict_types=1);

namespace Lus\Richtext\Field;

use Attribute;
use Lus\Richtext\Widget\RichtextInput;
use Override;
use Redaxo\Core\Form\BoundField;
use Redaxo\Core\Form\Field\Field;
use Redaxo\Core\Form\ValueType;
use Redaxo\Core\Language\Language;
use Redaxo\Core\Util\Type;
use Redaxo\Core\View\Renderable;

/**
 * HTML-Text mit Editor (Quill 2): Absätze, Überschriften, fett/kursiv, Listen, Links und interne Links
 * (`redaxo://ID`, beim Rendern ersetzt der Core sie durch die Artikel-URL).
 *
 * Gespeichert wird das HTML, wie der Editor es liefert. Ein leerer Editor ergibt einen leeren String.
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
class Richtext extends Field
{
    /** @param list<int> $headings Überschriftsebenen, die die Toolbar anbietet */
    public function __construct(
        string|Renderable $label,
        string|Renderable|null $note = null,
        bool $required = false,
        ?string $key = null,
        public readonly array $headings = [2, 3],
    ) {
        parent::__construct($label, $note, $required, $key);
    }

    #[Override]
    public function supports(ValueType $type): bool
    {
        return $type->isAnyOf('string');
    }

    #[Override]
    public function isEmpty(mixed $value): bool
    {
        return !is_string($value) || '' === trim(strip_tags($value, '<img>'));
    }

    #[Override]
    public function widget(BoundField $field): RichtextInput
    {
        return new RichtextInput(
            $field->inputName,
            Type::string($field->raw),
            $field->id,
            $this->headings,
            Language::getCurrentId(),
            $this->required,
            $field->disabled,
        );
    }
}
