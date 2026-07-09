//--------------------------------------------------------------------------------
// version 1
//--------------------------------------------------------------------------------
//todo: copy old version here
//--------------------------------------------------------------------------------
// version 2
//--------------------------------------------------------------------------------
//import { loadModule } from './lib/vue3-sfc-loader/vue3-sfc-loader.esm.js';
//import * as Vue from './lib/vue/vue.esm-browser.prod.js';
//
//export async function bootstrapSfcApp() {
//  // Bind Vue globally for the IIFE global router script to consume
//  window.Vue = Vue;
//
//  const routerRes = await fetch('./src/lib/vue-router/vue-router.global.prod.js');
//  if (!routerRes.ok) throw new Error("Failed to load Vue Router global asset.");
//  const routerCode = await routerRes.text();
//  
//  const script = document.createElement('script');
//  script.textContent = routerCode;
//  document.head.appendChild(script);
//  
//  const VueRouter = window.VueRouter;
//
//  if ('serviceWorker' in navigator) {
//    window.addEventListener('load', () => {
//      navigator.serviceWorker.register('./sw.sfc.js')
//        .then(reg => console.log('Offline worker active!', reg.scope))
//        .catch(err => console.error('Worker registration failed:', err));
//    });
//  }
//
//  const customJsCache = {};
//
//  const options = {
//    moduleCache: {
//      vue: Vue,
//      'vue-router': VueRouter
//    },
//    async getFile(url) {
//      const res = await fetch(url);
//      if (!res.ok) throw new Error(`Failed to load ${url}`);
//      return { getContentData: (asBinary) => asBinary ? res.arrayBuffer() : res.text() };
//    },
//    addStyle(styleStr) {
//      const style = document.createElement('style');
//      style.textContent = styleStr;
//      document.head.appendChild(style);
//    },
//    pathResolve({ refPath, relPath }) {
//      if (!refPath) return relPath;
//      if (relPath.startsWith('.')) {
//        return refPath.substring(0, refPath.lastIndexOf('/') + 1) + relPath;
//      }
//      return relPath;
//    },
//    async handleModule(type, getContentData, path, options) {
//      if (path.endsWith('.js')) {
//        async function resolveAndCacheModule(currentPath) {
//          if (currentPath === 'vue') return { resolved: true, exports: Vue };
//          if (currentPath === 'vue-router') return { resolved: true, exports: VueRouter };
//          if (customJsCache[currentPath]) {
//            return customJsCache[currentPath];
//          }
//          
//          customJsCache[currentPath] = { resolved: false, blobUrl: null, exports: null, rawCode: '' };
//          const res = await fetch(currentPath);
//          if (!res.ok) throw new Error(`Module compilation failed to fetch:${currentPath}`);
//          const rawCode = await res.text();
//          customJsCache[currentPath].rawCode = rawCode;
//          
//          let cleanCurrentDir = currentPath;
//          if (cleanCurrentDir.startsWith('.')) cleanCurrentDir = cleanCurrentDir.substring(1);
//          const currentDirUrl = new URL(cleanCurrentDir, window.location.origin);
//          
//          const importRegex = /from\s+['"](\.\.?\/[^'"]+|vue|vue-router)['"]/g;
//          let match;
//          const dependencies = [];
//          
//          while ((match = importRegex.exec(rawCode)) !== null) {
//            const relPath = match[1];
//            if (relPath === 'vue' || relPath === 'vue-router') {
//              dependencies.push({ relPath, absoluteDependencyPath: relPath });
//            } else {
//              const resolvedUrl = new URL(relPath, currentDirUrl);
//              const absoluteDependencyPath = '.' + resolvedUrl.pathname;
//              dependencies.push({ relPath, absoluteDependencyPath });
//            }
//          }
//          
//          for (const dep of dependencies) {
//            if (dep.absoluteDependencyPath.endsWith('.vue')) {
//              if (!customJsCache[dep.absoluteDependencyPath]) {
//                customJsCache[dep.absoluteDependencyPath] = { resolved: false, blobUrl: null, exports: null };
//                const vueComponent = await loadModule(dep.absoluteDependencyPath, options);
//                const compBlob = new Blob([`export default window.sfcComponentCache["${dep.absoluteDependencyPath}"];`], { type: 'text/javascript' });
//                if (!window.sfcComponentCache) window.sfcComponentCache = {};
//                window.sfcComponentCache[dep.absoluteDependencyPath] = vueComponent;
//                customJsCache[dep.absoluteDependencyPath].blobUrl = URL.createObjectURL(compBlob);
//                customJsCache[dep.absoluteDependencyPath].exports = { default: vueComponent };
//                customJsCache[dep.absoluteDependencyPath].resolved = true;
//              }
//            } else {
//              await resolveAndCacheModule(dep.absoluteDependencyPath);
//            }
//          }
//          
//          let transformedCode = rawCode.replace(/from\s+['"](\.\.?\/[^'"]+|vue|vue-router)['"]/g, (m, relPath) => {
//            if (relPath === 'vue') {
//              return `from 'data:text/javascript,export default window.Vue; export * from "data:text/javascript,const {reactive,ref,computed,watch,onMounted,onUnmounted,defineComponent,createApp}=window.Vue; export {reactive,ref,computed,watch,onMounted,onUnmounted,defineComponent,createApp};";'`;
//            }
//            if (relPath === 'vue-router') {
//              return `from 'data:text/javascript,export default window.VueRouter; export * from "data:text/javascript,const {createRouter,createWebHashHistory,createWebHistory,useRoute,useRouter}=window.VueRouter; export {createRouter,createWebHashHistory,createWebHistory,useRoute,useRouter};";'`;
//            }
//            const resolvedUrl = new URL(relPath, currentDirUrl);
//            const absoluteDependencyPath = '.' + resolvedUrl.pathname;
//            const cachedDep = customJsCache[absoluteDependencyPath];
//            if (cachedDep && cachedDep.blobUrl) {
//              return `from '${cachedDep.blobUrl}'`;
//            }
//            return `from '${resolvedUrl.pathname}'`;
//          });
//          
//          const blob = new Blob([transformedCode], { type: 'text/javascript' });
//          const blobUrl = URL.createObjectURL(blob);
//          customJsCache[currentPath].blobUrl = blobUrl;
//          const evaluatedModule = await import(blobUrl);
//          customJsCache[currentPath].resolved = true;
//          customJsCache[currentPath].exports = evaluatedModule;
//          return customJsCache[currentPath];
//        }
//        const moduleData = await resolveAndCacheModule(path);
//        return moduleData.exports;
//      }
//    }
//  };
//
//  window.sfcLoaderOptions = options;
//
//  // Compile the Main component and your local router configuration script
//  const MainComponent = await loadModule('./src/Main.vue', options);
//  const routerModule = await options.handleModule('.js', null, './src/router/index.js', options);
//
//  // Return the configured hooks back to our simplified entry file
//  return {
//    createApp: Vue.createApp,
//    Main: MainComponent,
//    router: routerModule && routerModule.default ? routerModule.default : null
//  };
//}
//--------------------------------------------------------------------------------
//version 3
// * run console.log(JSON.stringify(window.__sfc_trace__, null, 0)); for trace
//--------------------------------------------------------------------------------
import { loadModule } from '../lib/vue3-sfc-loader/vue3-sfc-loader.esm.js';
import * as Vue from '../lib/vue/vue.esm-browser.prod.js';


export async function bootstrapSfcApp() {
  window.Vue = Vue;

  // Tiny logging telemetry footprint
  window.__sfc_trace__ = { ts: new Date().toISOString(), al: [], ff: {}, dg: {} };
  const logT = (s, d) => window.__sfc_trace__.al.push({ t: performance.now().toFixed(0), s, d });

  logT('bi', 'Init stack');

  const routerRes = await fetch('./lib/vue-router/vue-router.global.prod.js');
  if (!routerRes.ok) throw new Error("Router failed");
  const routerCode = await routerRes.text();

  const script = document.createElement('script');
  script.textContent = routerCode;
  document.head.appendChild(script);

  const VueRouter = window.VueRouter;

  const unifiedCache = Object.create(null);
  unifiedCache['vue'] = Vue;
  unifiedCache['vue-router'] = VueRouter;

  const options = {
    moduleCache: unifiedCache,

    async getFile(url) {
      logT('gfr', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`404:${url}`);
      const content = await res.text();
      
      window.__sfc_trace__.ff[url] = { s: 'ok', z: content.length };

      if (url.endsWith('.js')) {
        return { getContentData: () => content, type: '.mjs' };
      }
      return { getContentData: (asB) => asB ? res.arrayBuffer() : content };
    },

    addStyle(styleStr) {
      const style = document.createElement('style');
      style.textContent = styleStr;
      document.head.appendChild(style);
    },

    pathResolve({ refPath, relPath }) {
      if (relPath === '.' || relPath === './') return refPath || './src/';
      if (relPath === 'vue' || relPath === 'vue-router') return relPath;

      let resolved = relPath;
      if (relPath.startsWith('.')) {
        // FIXED: Only use the './src/' default base if the requested path doesn't already contain it
        const base = refPath ? refPath.substring(0, refPath.lastIndexOf('/') + 1) : (relPath.startsWith('./src/') ? './' : './src/');
        resolved = base + relPath;
      }

      // Clean up and normalise double slashes
      resolved = resolved.replace(/\/\.\//g, '/').replace(/\/+/g, '/');
      if (!resolved.startsWith('./') && !resolved.startsWith('http')) resolved = './' + resolved;

      const k = refPath || 'root';
      if (!window.__sfc_trace__.dg[k]) window.__sfc_trace__.dg[k] = [];
      window.__sfc_trace__.dg[k].push({ q: relPath, r: resolved });
      
      logT('psv', `${k} | ${relPath} -> ${resolved}`);
      return resolved;
    },

    async handleModule(type, getContentData, path, options) {
      return undefined;
    }
  };

  window.sfcLoaderOptions = options;

  logT('lmv', 'Load Main.vue');
  const MainComponent = await loadModule('./src/Main.vue', options);
  
  let routerModule = null;
  try {
    logT('lmr', 'Load router');
    routerModule = await loadModule('./src/router/index.js', options);
  } catch (err) {
    logT('rsk', err.message);
  }

  return {
    createApp: Vue.createApp,
    Main: MainComponent,
    router: routerModule && routerModule.default ? routerModule.default : null
  };
}

