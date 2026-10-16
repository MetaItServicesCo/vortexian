import { Node, mergeAttributes } from "@tiptap/core";
import { BY_NAME, HEX, isDarkHex } from "@/lib/designPalette";

// Cards inside rich text: a row of cards (<div class="rc-cards rc-cols-3">) holding
// cards (<div class="rc-card rc-c-cyan">) that contain normal rich text.
// Palette colours are classes (styled in globals.css); custom colours are inline
// background/text colour, both allowed by the backend sanitiser.

const COLS = ["auto", "2", "3", "4"];

export const CardGroup = Node.create({
    name: "cardGroup",
    group: "block",
    content: "card+",
    defining: true,
    addAttributes() {
        return {
            columns: {
                default: "auto",
                parseHTML: (el) => COLS.find((c) => el.classList.contains(`rc-cols-${c}`)) || "auto",
                renderHTML: () => ({}),
            },
        };
    },
    parseHTML() {
        return [{ tag: "div.rc-cards" }];
    },
    renderHTML({ node, HTMLAttributes }) {
        return ["div", mergeAttributes(HTMLAttributes, { class: `rc-cards rc-cols-${node.attrs.columns}` }), 0];
    },
});

export const Card = Node.create({
    name: "card",
    content: "block+",
    defining: true,
    isolating: true,
    addAttributes() {
        return {
            color: {
                default: "cyan",
                parseHTML: (el) => {
                    const named = [...el.classList].find((c) => c.startsWith("rc-c-"))?.slice(5);
                    if (named && BY_NAME[named]) return named;
                    const bg = el.style.backgroundColor;
                    if (bg) {
                        const m = bg.match(/\d+/g);
                        return m ? `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}` : "cyan";
                    }
                    return "cyan";
                },
                renderHTML: () => ({}),
            },
        };
    },
    parseHTML() {
        return [{ tag: "div.rc-card" }];
    },
    renderHTML({ node, HTMLAttributes }) {
        const color = node.attrs.color;
        if (HEX.test(color || "")) {
            return ["div", mergeAttributes(HTMLAttributes, {
                class: `rc-card ${isDarkHex(color) ? "rc-dark" : ""}`.trim(),
                style: `background-color: ${color}; color: ${isDarkHex(color) ? "#ffffff" : "#0b0b2e"}`,
            }), 0];
        }
        const name = BY_NAME[color] ? color : "cyan";
        return ["div", mergeAttributes(HTMLAttributes, { class: `rc-card rc-c-${name}${BY_NAME[name].dark ? " rc-dark" : ""}` }), 0];
    },
});

export const newCard = (color = "cyan", n = 1) => ({
    type: "card",
    attrs: { color },
    content: [
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: `Card ${n} title` }] },
        { type: "paragraph", content: [{ type: "text", text: "Write a short description here." }] },
    ],
});

// Position of the card (or card row) around the cursor
export function findAncestor(state, name) {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        if (node.type.name === name) return { node, depth: d, pos: $from.before(d), end: $from.after(d) };
    }
    return null;
}
