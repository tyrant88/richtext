/* Richtext-Feld: ersetzt Textareen mit [data-richtext-source] durch einen Quill-Editor. */
(() => {
    if (!window.Quill) {
        return;
    }

    const Link = Quill.import('formats/link');

    // Interne Links (redaxo://ID) zulassen; Links öffnen im selben Fenster.
    class RexLink extends Link {
        static create(value) {
            const node = super.create(value);
            node.removeAttribute('target');
            node.removeAttribute('rel');
            return node;
        }
    }
    RexLink.PROTOCOL_WHITELIST = [...Link.PROTOCOL_WHITELIST, 'redaxo'];
    Quill.register(RexLink, true);

    const formats = ['header', 'bold', 'italic', 'link', 'list', 'image'];

    function sync(quill, source) {
        source.value = quill.getLength() > 1 ? quill.getSemanticHTML() : '';
        source.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function internalLink(quill, options) {
        const range = quill.getSelection(true);
        const [item] = await window.rex.pick('article', { language: options.language });
        if (!item) {
            return;
        }

        const href = 'redaxo://' + item.value;
        if (range.length > 0) {
            quill.formatText(range.index, range.length, 'link', href, 'user');
            return;
        }

        const text = item.label.replace(/\s*\[\d+\]$/, '');
        quill.insertText(range.index, text, 'link', href, 'user');
        quill.setSelection(range.index + text.length, 0, 'user');
    }

    function init(wrapper) {
        if (wrapper.dataset.richtextReady !== undefined) {
            return;
        }
        wrapper.dataset.richtextReady = '';

        const options = JSON.parse(wrapper.dataset.richtext || '{}');
        const source = wrapper.querySelector('[data-richtext-source]');

        const editor = document.createElement('div');
        editor.className = 'richtext-editor';
        editor.innerHTML = source.value;
        source.before(editor);

        const quill = new Quill(editor, {
            theme: 'snow',
            formats,
            readOnly: Boolean(options.disabled),
            modules: {
                toolbar: {
                    container: [
                        [{ header: [...(options.headings || [2, 3]), false] }],
                        ['bold', 'italic'],
                        ['link', 'internal'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean'],
                    ],
                    handlers: {
                        internal: () => internalLink(quill, options),
                    },
                },
            },
        });

        const button = wrapper.querySelector('.ql-internal');
        if (button) {
            button.innerHTML = '<i class="rex-icon rex-icon-open-linkmap" aria-hidden="true"></i>';
            button.title = options.i18n?.internal ?? 'Internal link';
            button.setAttribute('aria-label', button.title);
        }

        // Die Textarea bleibt das Formularfeld und zeigt auf Knopfdruck den HTML-Code unter dem Editor.
        // Pflichtfelder prüft der Server.
        source.hidden = true;
        source.required = false;

        // Nicht über die Quill-Toolbar-Konfiguration: Quill setzt den Aktiv-Zustand seiner Knöpfe nach jeder
        // Auswahländerung anhand der Formate zurück.
        const htmlButton = document.createElement('button');
        htmlButton.type = 'button';
        htmlButton.className = 'ql-html';
        htmlButton.innerHTML = '<i class="rex-icon fa-code" aria-hidden="true"></i>';
        htmlButton.title = options.i18n?.html ?? 'HTML code';
        htmlButton.setAttribute('aria-label', htmlButton.title);
        htmlButton.setAttribute('aria-pressed', 'false');
        if (source.id) {
            htmlButton.setAttribute('aria-controls', source.id);
        }
        htmlButton.addEventListener('click', () => {
            source.hidden = !source.hidden;
            htmlButton.classList.toggle('ql-active', !source.hidden);
            htmlButton.setAttribute('aria-pressed', String(!source.hidden));
        });
        const htmlGroup = document.createElement('span');
        htmlGroup.className = 'ql-formats';
        htmlGroup.append(htmlButton);
        quill.getModule('toolbar').container.append(htmlGroup);

        // Änderungen im HTML-Code übernimmt der Editor, ohne sie zurückzuschreiben.
        source.addEventListener('input', () => {
            quill.setContents(quill.clipboard.convert({ html: source.value }), 'silent');
        });
        const label = source.id ? document.querySelector(`label[for="${CSS.escape(source.id)}"]`) : null;
        if (label) {
            quill.root.setAttribute('aria-label', label.textContent.trim());
        }

        quill.on('text-change', () => sync(quill, source));
    }

    document.addEventListener('rex:ready', (event) => {
        for (const wrapper of event.target.querySelectorAll('[data-richtext]')) {
            init(wrapper);
        }
    });
})();
