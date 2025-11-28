export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Ceh3HKZ_.js",app:"_app/immutable/entry/app.CmEw9TQn.js",imports:["_app/immutable/entry/start.Ceh3HKZ_.js","_app/immutable/chunks/BYNwmuFe.js","_app/immutable/chunks/BtxYcPeY.js","_app/immutable/chunks/Cm_nByCo.js","_app/immutable/chunks/BuV3rt98.js","_app/immutable/entry/app.CmEw9TQn.js","_app/immutable/chunks/BtxYcPeY.js","_app/immutable/chunks/CHjT2g_j.js","_app/immutable/chunks/DH3FBsMJ.js","_app/immutable/chunks/Ca6PdoZt.js","_app/immutable/chunks/BuV3rt98.js","_app/immutable/chunks/CVtanQ5f.js","_app/immutable/chunks/BW41Plnd.js","_app/immutable/chunks/CFRiFLgw.js","_app/immutable/chunks/CO9PofcF.js","_app/immutable/chunks/Cm_nByCo.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/draw"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
