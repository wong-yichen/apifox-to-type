import Markdoc from '@markdoc/markdoc';
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import Prism from "prismjs";


require("prismjs/components/prism-go")
require("prismjs/components/prism-java")
require("prismjs/components/prism-javascript")
require("prismjs/components/prism-python")
require("prismjs/components/prism-bash")
require("prismjs/components/prism-nginx")
require("prismjs/components/prism-typescript")
require("prismjs/components/prism-json")
require("prismjs/components/prism-rust")
require("prismjs/components/prism-sass")
require("prismjs/components/prism-scss")
require("prismjs/components/prism-css")
require("prismjs/components/prism-jsx")
require("prismjs/components/prism-tsx")
require("prismjs/plugins/toolbar/prism-toolbar")
require("prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard")

Prism.manual = true;
type MarkdocViewPops = {
    source?: string
}

function MarkdocView({source}: MarkdocViewPops) {
    const domRef = useRef(null);
    const [html, setHtml] = useState<ReactNode | null>(null);

    function highlight() {
        if (domRef.current) {
            const dom = domRef.current as HTMLElement;
            dom.querySelectorAll("pre").forEach(pre => {
                if (pre.children.length < 1) {
                    const code = pre.innerHTML;
                    const dataset = pre.dataset;
                    const language = dataset.language;
                    const codeDom = document.createElement("code");
                    codeDom.classList.add("language-" + language);
                    codeDom.innerHTML = code;
                    pre.innerHTML = "";
                    pre.append(codeDom);
                }
            });
        }
        Prism.highlightAll();
    }

    useEffect(() => {
        setHtml(renderText(source));
    }, [source]);

    useEffect(() => {
        highlight();
    }, [html]);

    function renderText(text?: string) {
        if (!text) return null
        const ast = Markdoc.parse(text);
        const content = Markdoc.transform(ast, /* config */);
        return Markdoc.renderers.react(content, React, {
            components: {}
        })
    }

    return <div ref={domRef} className="mark-doc-view markdown-body">
        {html}
    </div>
}

MarkdocView.defaultProps = {
    source: ""
}

export default MarkdocView;