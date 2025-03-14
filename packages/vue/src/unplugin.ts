import path from 'node:path';
import { createUnplugin } from 'unplugin';
import ElegantVueRouter from './context';
import { setRouteNamePageFile } from './shared/route-name';
import type { ElegantVueRouterOption } from './types';

export default createUnplugin<Partial<ElegantVueRouterOption> | undefined>((options, _meta) => {
  const ctx = new ElegantVueRouter(options);

  return {
    name: '@elegant-router/vue',
    enforce: 'pre',
    apply: 'serve',
    vite: {
      configureServer(server) {
        ctx.setViteServer(server);
      }
    },
    transformInclude(id) {
      const { cwd, pageDir } = ctx.elegantRouter.options;

      const isInPageDir = id.startsWith(path.join(cwd, pageDir));

      if (!isInPageDir) return null;

      const filePath = path.posix.join(cwd, pageDir);

      const glob = id.replace(`${filePath}/`, '');

      return ctx.elegantRouter.isMatchPageGlob(glob);
    },
    transform(code, id) {
      const { cwd, pageDir } = ctx.elegantRouter.options;

      const filePath = path.posix.join(cwd, pageDir);

      const glob = id.replace(`${filePath}/`, '');

      const { routeName } = ctx.elegantRouter.getRouterFileByGlob(glob);

      return setRouteNamePageFile(code, id, routeName);
    }
  };
});
