module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/css/style.css")

    eleventyConfig.addPassthroughCopy("./static/headshot.webp")
    eleventyConfig.addPassthroughCopy("./static/favicon.ico")
    eleventyConfig.addPassthroughCopy("./static/logo.svg")

    eleventyConfig.addWatchTarget("./src/css/");

    return {
        dir: {
            input: "src",
            output: "public"
        }
    }
}