// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/engine/html/inputManager.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HtmlInputManager = /*#__PURE__*/function () {
  function HtmlInputManager(document) {
    var _this = this;

    _classCallCheck(this, HtmlInputManager);

    this.keys = {};
    document.addEventListener("keydown", function (event) {
      return _this.__keyDownHandler(_this, event);
    }, false);
    document.addEventListener("keyup", function (event) {
      return _this.__keyUpHandler(_this, event);
    }, false);
    document.addEventListener("keypress", function (event) {
      return _this.__keyPressedHandler(_this, event);
    }, false);
  }

  _createClass(HtmlInputManager, [{
    key: "isKeyDown",
    value: function isKeyDown(key) {
      return key in this.keys && this.keys[key] == 1;
    }
  }, {
    key: "isKeyPressed",
    value: function isKeyPressed(key) {
      return key in this.keys && this.keys[key] == 2;
    }
  }, {
    key: "isKeyUp",
    value: function isKeyUp() {
      return !(key in this.keys);
    }
  }, {
    key: "__keyDownHandler",
    value: function __keyDownHandler(inputManager, event) {
      inputManager.keys[event.key] = 1;
    }
  }, {
    key: "__keyPressedHandler",
    value: function __keyPressedHandler(inputManager, event) {
      inputManager.keys[event.key] = 2;
    }
  }, {
    key: "__keyUpHandler",
    value: function __keyUpHandler(inputManager, event) {
      if (event.key in inputManager.keys) delete inputManager.keys[event.key];
    }
  }]);

  return HtmlInputManager;
}();

exports.default = HtmlInputManager;
},{}],"src/engine/html/renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HtmlRenderer = /*#__PURE__*/function () {
  function HtmlRenderer(canvas) {
    _classCallCheck(this, HtmlRenderer);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height; // this.canvas = document.createElement('canvas');
    // this.ctx = new CanvasRenderingContext2D();
  }

  _createClass(HtmlRenderer, [{
    key: "upscaleCanvas",
    value: function upscaleCanvas(width, height) {
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
  }, {
    key: "setCripsPixel",
    value: function setCripsPixel() {
      this.canvas.style.imageRendering = '-moz-crisp-edges';
      this.canvas.style.imageRendering = '-webkit-crisp-edges';
      this.canvas.style.imageRendering = 'pixelated';
      this.canvas.style.imageRendering = 'crisp-edges';
    }
  }, {
    key: "clear",
    value: function clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }, {
    key: "drawPixel",
    value: function drawPixel(x, y, color) {
      this.ctx.beginPath();
      this.ctx.rect(x, y, 1, 1);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }, {
    key: "drawImage",
    value: function drawImage(x, y, image) {
      this.ctx.drawImage(image, x, y);
    }
  }, {
    key: "drawRect",
    value: function drawRect(x, y, width, height, color) {
      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }, {
    key: "drawEclipse",
    value: function drawEclipse(x, y, radius, color) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }]);

  return HtmlRenderer;
}();

exports.default = HtmlRenderer;
},{}],"src/engine/engine.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Engine = /*#__PURE__*/function () {
  function Engine(renderer, audioPlayer) {
    _classCallCheck(this, Engine);

    this.renderer = renderer;
    this.audioPlayer = audioPlayer;
  }

  _createClass(Engine, [{
    key: "clear",
    value: function clear() {
      clearInterval(this.interval);
    }
  }, {
    key: "start",
    value: function start(update, draw) {
      var _this = this;

      this.interval = setInterval(function () {
        update();

        _this.renderer.clear();

        draw();
      }, 10);
    }
  }, {
    key: "stop",
    value: function stop() {
      clearInterval(this.interval); // Needed for Chrome to end game
    }
  }, {
    key: "drawPixel",
    value: function drawPixel(x, y, color) {
      this.renderer.drawPixel(x, y, color);
    }
  }, {
    key: "drawImage",
    value: function drawImage(x, y, image) {
      this.renderer.drawImage(image, x, y);
    }
  }, {
    key: "drawRect",
    value: function drawRect(x, y, width, height, color) {
      this.renderer.drawRect(x, y, width, height, color);
    }
  }, {
    key: "drawEclipse",
    value: function drawEclipse(x, y, radius, color) {
      this.renderer.drawEclipse(x, y, radius, color);
    }
  }]);

  return Engine;
}();

exports.default = Engine;
},{}],"src/main.js":[function(require,module,exports) {
"use strict";

var _inputManager = _interopRequireDefault(require("./engine/html/inputManager"));

var _renderer = _interopRequireDefault(require("./engine/html/renderer"));

var _engine = _interopRequireDefault(require("./engine/engine"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var canvas = document.getElementById("main-canvas");
canvas.style.backgroundColor = 'rgba(255, 255, 255)';
var renderer = new _renderer.default(canvas);
var engine = new _engine.default(renderer, null);
var inputManager = new _inputManager.default(document);

function run(code) {
  try {
    engine.clear();
    var f = new Function('engine', 'inputManager', 'canvas', code);
    f.call(this, engine, inputManager, canvas);
  } catch (error) {
    console.warn("There are code errors, fix them before running the code", error);
  }
}

window.run = run;
},{"./engine/html/inputManager":"src/engine/html/inputManager.js","./engine/html/renderer":"src/engine/html/renderer.js","./engine/engine":"src/engine/engine.js"}],"C:/Users/pc/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62480" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/pc/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/main.js"], null)
//# sourceMappingURL=/main.1e43358e.js.map