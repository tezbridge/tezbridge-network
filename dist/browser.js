parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"39eF":[function(require,module,exports) {
"use strict";function e(e){for(var r,t=void 0,n=e,i=arguments.length,o=new Array(i>1?i-1:0),s=1;s<i;s++)o[s-1]=arguments[s];for(;void 0!==(r=o.shift());)if(n instanceof Object&&!(n instanceof Array))t=n[r],n=n[r];else{if(!(n instanceof Array))return;var a=parseInt(r);if(isNaN(a))return;t=n[a],n=n[a]}return t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.safeProp=e;
},{}],"Y/Oq":[function(require,module,exports) {
"use strict";function n(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function e(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}function t(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}function r(n){for(var e=arguments.length,t=new Array(e>1?e-1:0),r=1;r<e;r++)t[r-1]=arguments[r];for(var o=t.shift(),x=n;void 0!==o;){if(!(o in x)||void 0===x[o])throw"Property: ".concat(o," is not in the object");x=x[o=t.shift()]}}function o(n){if(-1===n.indexOf("/"))throw"The input hash_url should be in this format: `xx/xx/xx/xx/xx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`";var e="/"===n[0]?1:0,t="/"===n.slice(-1)?-1:n.length;return n.slice(e,t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.checkProps=r,exports.filterHashUrl=o,exports.OpStep=void 0;var x=function(){function e(t){n(this,e),this.main_fn=t;for(var r=arguments.length,o=new Array(r>1?r-1:0),x=1;x<r;x++)o[x-1]=arguments[x];this.next_nodes=o}return t(e,[{key:"run",value:function(){for(var n=this,e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];var o=this.main_fn.apply(this,t);return"boolean"==typeof o?o?this.next_nodes[0]&&this.next_nodes[0].run():this.next_nodes[1]&&this.next_nodes[1].run():o instanceof Promise?o.then(function(e){return n.next_nodes[0]&&n.next_nodes[0].run(e)}).catch(function(n){throw"OpStep error caught: ".concat(n)}):void 0}}]),e}();exports.OpStep=x;
},{}],"cg5q":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=exports.Mixed=exports.Posts=exports.Gets=void 0;var e=require("../types"),t=require("../util");function n(e,t,n,r,a,i,o){try{var s=e[i](o),c=s.value}catch(u){return void n(u)}s.done?t(c):Promise.resolve(c).then(r,a)}function r(e){return function(){var t=this,r=arguments;return new Promise(function(a,i){var o=e.apply(t,r);function s(e){n(o,a,i,s,c,"next",e)}function c(e){n(o,a,i,s,c,"throw",e)}s(void 0)})}}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}var c=function(){function n(e){i(this,n),this.fetch=e}return s(n,[{key:"custom",value:function(e){return this.fetch(e)}},{key:"head",value:function(e){return this.fetch("/chains/main/blocks/head/".concat(e||""))}},{key:"hash",value:function(){return this.head("hash")}},{key:"header",value:function(){return this.head("header")}},{key:"protocol",value:function(){return this.header().then(function(t){return(0,e.safeProp)(t,"protocol")})}},{key:"predecessor",value:function(){return this.header().then(function(t){return(0,e.safeProp)(t,"predecessor")})}},{key:"balance",value:function(e){return this.fetch("/chains/main/blocks/head/context/contracts/".concat(e,"/balance"))}},{key:"contract",value:function(e){return this.fetch("/chains/main/blocks/head/context/contracts/".concat(e))}},{key:"contract_bytes",value:function(e,n){var r=(0,t.filterHashUrl)(e);return this.fetch("/chains/main/blocks/head/context/raw/bytes/contracts/index/originated/".concat(r).concat(n||""))}},{key:"storage_bytes",value:function(e){return this.contract_bytes(e,"/data/storage")}},{key:"big_map_bytes",value:function(e){return this.contract_bytes(e,"/big_map")}},{key:"manager_key",value:function(e){return this.fetch("/chains/main/blocks/head/context/contracts/".concat(e,"/manager_key"))}},{key:"counter",value:function(e){return this.fetch("/chains/main/blocks/head/context/contracts/".concat(e,"/counter"))}}]),n}();exports.Gets=c;var u=function(){function t(e){i(this,t),this.submit=e}return s(t,[{key:"pack_data",value:function(t,n){var r={data:t,type:n,gas:"400000"};return this.submit("/chains/main/blocks/head/helpers/scripts/pack_data",r).then(function(t){return(0,e.safeProp)(t,"packed")})}},{key:"forge_operation",value:function(e,t){var n={branch:e,contents:t};return this.submit("/chains/main/blocks/head/helpers/forge/operations",n)}},{key:"preapply_operation",value:function(e,t,n,r){var a={branch:e,contents:t,protocol:n,signature:r};return this.submit("/chains/main/blocks/head/helpers/preapply/operations",[a])}},{key:"inject_operation",value:function(e){return this.submit("/injection/operation",e)}}]),t}();exports.Posts=u;var h=function(){function t(e,n){i(this,t),this.fetch=e,this.submit=n}return s(t,[{key:"makeOperationBytes",value:function(){var n=r(regeneratorRuntime.mark(function n(r,a){var i,o,s,c,u,h,f,p,l;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return i=[],n.next=3,this.fetch.counter(r.source);case 3:return o=n.sent,n.next=6,this.fetch.manager_key(r.source);case 6:if(s=n.sent,"string"==typeof o){n.next=9;break}throw"Invalid counter";case 9:if(c=parseInt(o)+1+"",(0,e.safeProp)(s,"key")||(u=t.params.reveal(r.source,r.public_key,c),a.length&&"reveal"===a[0].kind?i.push(Object.assign({},u,a.shift())):i.push(u),c=parseInt(c)+1+""),"string"==typeof(h=(0,e.safeProp)(s,"manager"))){n.next=14;break}throw"Invalid manager public key hash";case 14:return a.forEach(function(e){var n={reveal:null,origination:Object.assign({},t.params.origination(r.source,h,c),e),transaction:Object.assign({},t.params.transaction(r.source,e.destination||"",c),e)}[e.kind];if(!n)throw"Invalid t(".concat(e.kind,") in makeOperationBytes");i.push(n),c=parseInt(c)+1+""}),n.next=17,this.fetch.hash();case 17:if("string"==typeof(f=n.sent)){n.next=20;break}throw"Error type for head_hash result: ".concat(f.toString());case 20:return n.next=22,this.submit.forge_operation(f,i);case 22:return p=n.sent,n.next=25,this.fetch.protocol();case 25:return l=n.sent,n.abrupt("return",{protocol:l,operation_hex:p,branch:f,contents:i});case 27:case"end":return n.stop()}},n,this)}));return function(e,t){return n.apply(this,arguments)}}()},{key:"makeOriginationBytes",value:function(){var e=r(regeneratorRuntime.mark(function e(t,n){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.makeOperationBytes({source:t.source,public_key:t.public_key},[Object.assign({kind:"origination"},n)]));case 1:case"end":return e.stop()}},e,this)}));return function(t,n){return e.apply(this,arguments)}}()},{key:"makeTransactionBytes",value:function(){var e=r(regeneratorRuntime.mark(function e(t,n){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.makeOperationBytes({source:t.source,public_key:t.public_key},[Object.assign({kind:"transaction"},n)]));case 1:case"end":return e.stop()}},e,this)}));return function(t,n){return e.apply(this,arguments)}}()}]),t}();exports.Mixed=h,a(h,"params",{reveal:function(e,t,n){return{kind:"reveal",source:e,fee:"1300",gas_limit:"10000",storage_limit:"0",public_key:t,counter:n}},transaction:function(e,t,n){return{kind:"transaction",source:e,fee:"400000",gas_limit:"400000",storage_limit:"60000",amount:"0",counter:n,destination:t}},origination:function(e,t,n){return{kind:"origination",source:e,fee:"400000",counter:n,gas_limit:"400000",storage_limit:"60000",managerPubkey:t,balance:"0"}}});var f={Gets:c,Posts:u,Mixed:h};exports.default=f;
},{"../types":"39eF","../util":"Y/Oq"}],"ii4M":[function(require,module,exports) {
"use strict";function t(t,n,e,r,a,i,o){try{var c=t[i](o),u=c.value}catch(s){return void e(s)}c.done?n(u):Promise.resolve(u).then(r,a)}function n(n){return function(){var e=this,r=arguments;return new Promise(function(a,i){var o=n.apply(e,r);function c(n){t(o,a,i,c,u,"next",n)}function u(n){t(o,a,i,c,u,"throw",n)}c(void 0)})}}function e(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}function r(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function a(t,n,e){return n&&r(t.prototype,n),e&&r(t,e),t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.External=void 0;var i=function(){function t(n,r){e(this,t),this.fetch=n,this.net_type="alphanet"===r?r:"mainnet"}return a(t,[{key:"domain",value:function(){if("mainnet"===this.net_type)return"https://api1.tzscan.io/v3";if("alphanet"===this.net_type)return"https://api.alphanet.tzscan.io/v3";throw"The net type can only be mainnet or alphanet"}},{key:"originated_contracts",value:function(){var t=n(regeneratorRuntime.mark(function t(n){var e,r,a,i,o=arguments;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e=!(o.length>1&&void 0!==o[1])||o[1],r=this.domain()+"/operations/".concat(n,"?type=Origination"),t.next=4,this.fetch(r);case 4:if(a=t.sent,i=[],!(a instanceof Array)){t.next=10;break}a.forEach(function(t){t.type.operations.forEach(function(t){t.spendable===e&&i.push(t.tz1.tz)})}),t.next=11;break;case 10:throw"Operations is invalid";case 11:return t.abrupt("return",i);case 12:case"end":return t.stop()}},t,this)}));return function(n){return t.apply(this,arguments)}}()}]),t}();exports.External=i;
},{}],"Focm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=exports.TezBridgeNetwork=void 0;var t=n(require("./PsddFKi3/api")),e=require("./external");function n(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function o(t,e,n){return e&&r(t.prototype,e),n&&r(t,n),t}var s=function(t,e,n){return new Promise(function(i,r){var o=new XMLHttpRequest;o.addEventListener("load",function(t){200===o.status?i(JSON.parse(o.responseText)):r(o.responseText)}),o.addEventListener("error",r),o.addEventListener("abort",r),o.open(n,t),"POST"===n&&o.setRequestHeader("Content-Type","application/json"),o.send(JSON.stringify(e))})},a={PsddFKi3:t.default},u=function(){function t(n){var r=this;if(i(this,t),!n.host)throw"Please set the host parameter";this.host=n.host,this.RPCFn=s,this.net_type=this.host.indexOf("alphanet")>-1?"alphanet":"mainnet";var o=n.protocol||"PsddFKi3";if(!(o in a))throw"Protocol:".concat(o," doesn't exist in protocols");this.fetch=new a[o].Gets(function(t,e){return r.get.call(r,t,e)}),this.submit=new a[o].Posts(function(t,e){return r.post.call(r,t,e)}),this.mixed=new a[o].Mixed(this.fetch,this.submit),this.external=new e.External(function(t,e){return r.RPCFn(t,e,"GET")},this.net_type)}return o(t,[{key:"switchProtocol",value:function(t){var e=this;if(!(t in a))throw"Protocol:".concat(t," doesn't exist in protocols");this.fetch=new a[t].Gets(function(t,n){return e.get.call(e,t,n)}),this.submit=new a[t].Posts(function(t,n){return e.post.call(e,t,n)}),this.mixed=new a[t].Mixed(this.fetch,this.submit)}},{key:"get",value:function(t,e){return this.RPCFn(this.host+t,e,"GET")}},{key:"post",value:function(t,e){return this.RPCFn(this.host+t,e,"POST")}}]),t}();exports.TezBridgeNetwork=u;var c=u;exports.default=c;
},{"./PsddFKi3/api":"cg5q","./external":"ii4M"}]},{},["Focm"], null)
//# sourceMappingURL=/browser.map