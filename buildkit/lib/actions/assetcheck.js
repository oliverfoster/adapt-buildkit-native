var Action = require("../utils/Action.js");

var assetcheck = new Action({

    initialize: function() {

        this.deps(GLOBAL, {
            "fsext": "../utils/fsext.js",
            "logger": "../utils/logger.js",
            "fs": "fs",
            "path": "path",
            "_": "underscore"
        });

    },

    perform: function(options, done, started) { 

        started();

        options = options || {};
        options.jsonSrc = fsext.replace(options.jsonSrc, options);
        options.jsonRoot = fsext.replace(options.jsonRoot, options);
        options.cssSrc = fsext.replace(options.cssSrc, options);
        options.cssRoot = fsext.replace(options.cssRoot, options);

        options.jsonRoot = fsext.expand(options.jsonRoot);
        options.cssRoot = fsext.expand(options.cssRoot);

        var assetRegExp = new RegExp(options.assetRegex, "g");

        try {
            check(options);
        } catch(e) {
            //logger.error(e);
        }

        done(options);

        
        function check(options) {
            var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];
            var jsonAssetListPaths = [];
            var cssAssetListPaths = [];
            var fileAssetListPaths = [];

            // method to check json ids
            function checkAssetsExists() {
                var currentCourseFolder;
                // Go through each course folder inside the src/course directory
                 var nodes = fsext.list( path.join(options.jsonRoot, options.jsonSrc) );

                _.each(nodes.dirs, function(subdir) {

                    var dir = subdir;
                    // Stored current path of folder - used later to read .json files
                    var currentCourseFolder = dir;
                    // Go through each list of declared course files
                    listOfCourseFiles.forEach(function(jsonFileName) {
                        // Make sure course.json file is not searched
                                                        
                        jsonAssetListPaths[jsonFileName] = [];
                        // Read each .json file
                        var currentJsonFile = ""+ fs.readFileSync(currentCourseFolder + "/" + jsonFileName + ".json");
                        var matches = currentJsonFile.match(assetRegExp);
                        matches = _.uniq(matches);
                        if (matches === null) return;
                        for (var i = 0, l = matches.length; i < l; i++) {
                            switch (matches[i].substr(0,2)) {
                            case "\\'": case '\\"':
                                matches[i] = matches[i].substr(2);
                            }
                            switch (matches[i].substr(matches[i].length-2,2)) {
                            case "\\'": case '\\"':
                                matches[i] = matches[i].substr(0, matches[i].length-2);
                            }
                            switch (matches[i].substr(0,1)) {
                            case "'": case '"':
                                matches[i] = matches[i].substr(1);
                            }
                            switch (matches[i].substr(matches[i].length-1,1)) {
                            case "'": case '"':
                                matches[i] = matches[i].substr(0, matches[i].length-1);
                            }
                            jsonAssetListPaths.push(matches[i]);

                        }

                    });
                });

                jsonAssetListPaths = _.uniq(jsonAssetListPaths);

                for (var i = 0, l = jsonAssetListPaths.length; i < l; i++ ){
                    if (jsonAssetListPaths[i].substr(0,4) === "http") {
                        if (options.course) {
                            logger.log(options.course + " -  External: " + jsonAssetListPaths[i], 2);
                        } else {
                            logger.log(" External: " + jsonAssetListPaths[i], 2);
                        }
                        continue;
                    }
                    var filePath = path.join(options.jsonRoot, jsonAssetListPaths[i]);
                    fileAssetListPaths.push(filePath);
                    if (!fs.existsSync( filePath )) {
                        if (options.course) {
                            logger.log(options.course + " -  Missing: " + jsonAssetListPaths[i], 2);
                        } else {
                            logger.log(" Missing: " + jsonAssetListPaths[i], 2);
                        }
                    }
                }



                var cssPath = path.join(options.cssRoot, options.cssSrc);
                if (fs.existsSync(cssPath)) {
                    var cssFile = fs.readFileSync(cssPath).toString();
                    var matches = cssFile.match(assetRegExp);
                    matches = _.uniq(matches);
                    if (matches === null) return;
                    for (var i = 0, l = matches.length; i < l; i++) {
                        matches[i] = matches[i].trim()
                        switch (matches[i].substr(0,5)) {
                        case "url('": case "url(\"":
                            matches[i] = matches[i].substr(5);
                        }
                        switch (matches[i].substr(0,4)) {
                        case "url(":
                            matches[i] = matches[i].substr(4);
                        }
                        switch (matches[i].substr(0,2)) {
                        case "\\'": case '\\"':
                            matches[i] = matches[i].substr(2);
                        }
                        switch (matches[i].substr(matches[i].length-2,2)) {
                        case "\\'": case '\\"':
                            matches[i] = matches[i].substr(0, matches[i].length-2);
                        }
                        switch (matches[i].substr(matches[i].length-2,2)) {
                        case "')": case '")':
                            matches[i] = matches[i].substr(0, matches[i].length-2);
                        }
                        switch (matches[i].substr(0,1)) {
                        case "'": case '"':
                            matches[i] = matches[i].substr(1);
                        }
                        switch (matches[i].substr(matches[i].length-1,1)) {
                        case "'": case '"':
                            matches[i] = matches[i].substr(0, matches[i].length-1);
                        }
                        switch (matches[i].substr(matches[i].length-1,1)) {
                        case ")":
                            matches[i] = matches[i].substr(0, matches[i].length-1);
                        }
                        cssAssetListPaths.push(matches[i]);

                    }

                }

                for (var i = 0, l = cssAssetListPaths.length; i < l; i++ ){
                    if (cssAssetListPaths[i].substr(0,4) === "http") {
                        if (options.couse) {
                            logger.log(options.course + " -  External: " + cssAssetListPaths[i], 2);
                        } else {
                            logger.log(" External: " + cssAssetListPaths[i], 2);
                        }
                        continue;
                    }
                    var filePath = path.join(options.cssRoot, cssAssetListPaths[i]);
                    fileAssetListPaths.push(filePath);
                    /*if (!fs.existsSync( filePath )) {
                        logger.log(options.course + " -  Missing: " + cssAssetListPaths[i], 2);
                    }*/
                }


                var assets = fsext.glob( options.jsonRoot, options.jsonAssetGlobs );
                var storedAssets = _.pluck(assets, 'path');
                var difference = _.difference(storedAssets, fileAssetListPaths);
                var redundant = [];
                _.each(difference, function(item) {
                    item = item.substr(options.jsonRoot.length+1);
                    item = item.replace(/\\/g,"/");
                    var matches = ("'"+item+"'").match(assetRegExp);
                    if (matches === null) return false;
                    redundant.push(item);
                });

                for (var i = 0, l = redundant.length; i < l; i++ ){
                    if (options.couse) {
                        logger.log(options.course + " -  Redundant: " + redundant[i], 2);
                    } else {
                        logger.log(" Redundant: " + redundant[i], 2);
                    }
                }

            }

            checkAssetsExists();
        }

    }
    
});

module.exports = assetcheck;

