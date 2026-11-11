<?php

use Lus\Richtext\Widget\RichtextInput;
use Redaxo\Core\Translation\I18n;
use Redaxo\Core\View\HtmlAttributes;

use function Redaxo\Core\View\escape;

return static function (RichtextInput $input): void { ?>
    <div <?= $input->attributes->with([
        'class' => ['richtext'],
        'data-richtext' => json_encode([
            'headings' => $input->headings,
            'language' => $input->languageId,
            'disabled' => $input->disabled,
            'i18n' => [
                'internal' => I18n::rawMsg('richtext_internal_link'),
                'heading' => I18n::rawMsg('richtext_heading'),
                'paragraph' => I18n::rawMsg('richtext_paragraph'),
                'html' => I18n::rawMsg('richtext_html'),
            ],
        ], JSON_THROW_ON_ERROR),
    ]) ?>>
        <textarea <?= new HtmlAttributes([
            'class' => ['rex-input', 'richtext-source'],
            'name' => $input->name,
            'id' => $input->id,
            'rows' => 8,
            'required' => $input->required,
            'disabled' => $input->disabled,
            'data-richtext-source' => true,
        ]) ?>><?= escape($input->value ?? '') ?></textarea>
    </div>
<?php };
