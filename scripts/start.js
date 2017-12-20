const bs = require("browser-sync").create();
const path = require('path');
const generate = require("./generate");


generate.init(() => {
    bs.init({
        server: "public",
        files: [
            "public/*.html",
            {
                match: ["templates/*.twig", "templates/*.json"],
                fn: function (event, file) {
                    generate.recompile(path.basename(file))
                }
            }
        ]
    });
});


