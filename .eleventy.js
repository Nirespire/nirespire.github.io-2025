const { DateTime } = require("luxon")

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("./src/css/style.css")
    eleventyConfig.addPassthroughCopy("./src/css/tailwind.css")

    eleventyConfig.addPassthroughCopy("./static/headshot.webp")
    eleventyConfig.addPassthroughCopy("./static/favicon.ico")
    eleventyConfig.addPassthroughCopy("./static/logo.svg")

    eleventyConfig.addWatchTarget("./src/css/");

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
    })

    eleventyConfig.addFilter('readTime', (value) => {
        const content = value
        const textOnly = content.replace(/(<([^>]+)>)/gi, '')
        const readingSpeedPerMin = 450
        return Math.max(1, Math.floor(textOnly.length / readingSpeedPerMin))
    })

    return {
        dir: {
            input: "src",
            output: "public"
        }
    }
}