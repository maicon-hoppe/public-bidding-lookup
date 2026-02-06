import type { Handle } from "@sveltejs/kit"
import { minify, type MinifierOptions } from "html-minifier-next";

const minifyOpts: MinifierOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: false,
    removeAttributeQuotes: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassNames: true,
};

export const handle: Handle = async function ({ event, resolve }) {
    return await resolve(event, { transformPageChunk: ({ html }) => minify(html, minifyOpts) });
}