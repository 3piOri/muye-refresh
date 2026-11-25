(() => {
    const skippedElements = "script, style, noscript, textarea, input, select, option";

    function formatTextNode(node) {
        const text = node.nodeValue;
        const alreadyFormatted = node.parentElement
            && node.parentElement.closest(".numbskull-brand");
        if (!text || !/muyë/i.test(text) || alreadyFormatted) {
            return;
        }

        const fragment = document.createDocumentFragment();
        text.split(/(muyë)/gi).forEach((part, index) => {
            if (!part) {
                return;
            }

            if (index % 2 === 1) {
                const brand = document.createElement("span");
                brand.className = "numbskull-brand";
                brand.textContent = part;
                fragment.append(brand);
            } else {
                fragment.append(document.createTextNode(part));
            }
        });

        node.replaceWith(fragment);
    }

    function formatNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            formatTextNode(node);
            return;
        }

        if (!(node instanceof Element) || node.matches(skippedElements)) {
            return;
        }

        if (node.classList.contains("numbskull-brand")) {
            return;
        }

        Array.from(node.childNodes).forEach(formatNode);
    }

    formatNode(document.body);

    new MutationObserver((records) => {
        records.forEach((record) => {
            if (record.type === "characterData") {
                formatTextNode(record.target);
                return;
            }

            Array.from(record.addedNodes).forEach(formatNode);
        });
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
})();
