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
        wrapper.append(editor);

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

        // Die Textarea bleibt das Formularfeld, ist aber nicht mehr sichtbar; Pflichtfelder prüft der Server.
        source.hidden = true;
        source.required = false;
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
