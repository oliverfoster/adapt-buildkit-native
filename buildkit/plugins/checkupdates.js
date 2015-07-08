var Plugin = require("../libraries/Plugin.js");

module.exports = new Plugin({

	initialize: function() {
		this.deps(GLOBAL, {
			'_': "underscore",
			"logger": "../libraries/logger.js",
			"url": "url",
			"fs": "fs",
			"path": "path"
		});
	},

	"config:loaded": function(config) {
		//console.log("config:loaded", config);

		if (!config.defaults.versionURL) return;

		var version = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"))).version;

		download(config.defaults.versionURL, function(data) {
			try {
				var onlineVersion = JSON.parse(data).version;
				if (onlineVersion != version) {
					logger.log("Out of date. Current version is v" +version+ ". New version is v"+onlineVersion+".",1);
					logger.log("Please run 'adapt-buildkit install rub'",1);
				} else {
					logger.log("Version v"+version+".",0)
				}
			} catch (e){

			}
		}, this);

		function download(locationUrl, callback, that, isText) {
			//download any file to a location
			var https = require("https");
			var urlParsed = url.parse(locationUrl);
			var req = https.request({
				hostname: urlParsed.hostname,
				port: 443,
				protocol: urlParsed.protocol,
				path: urlParsed.path,
				method: "GET"
			}, function(res) {
				var outputData = "";
				if (res.headers.location) {
					return pub.download(res.headers.location, callback, that);
				}
				res.on("data", function(data) {
					outputData+= data.toString();
				});
				res.on("end", function() {
					setTimeout(function() {
						callback.call(that, outputData);
					}, 500);
				});
			});
			req.on("error", function(e) {
				console.log(e);
				process.exit(0);
			});
			req.end();
		}
	},

	"actions:setup": function(actions) {
		//console.log("actions:setup", actions);
	},

	"actions:build": function(actions) {
		//console.log("actions:build", actions);
	},

	"actions:phase": function(phaseName) {
		//console.log("actions:phase", phaseName);
	},

	"action:prep": function(options, action) {		
		//console.log("action:prep", options, action);
	},

	"action:start": function(options, action) {
		//console.log("action:start", options, action);
	},

	"action:error": function(options, error, action) {
		//console.log("action:error", options, error, action);
	},

	"action:end": function(options, action) {
		//console.log("action:end", options, action);
	},

	"actions:wait": function() {
		//console.log("actions:wait");
	}

})
