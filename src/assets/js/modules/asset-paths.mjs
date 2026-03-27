const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, '');

export const getBasePath = (root = document) => {
  const basePathMeta = root.querySelector?.('meta[name="app-base-path"]');
  const rawValue = basePathMeta?.content?.trim() || '/';

  if (!rawValue || rawValue === '/') {
    return '/';
  }

  return `/${trimSlashes(rawValue)}/`;
};

export const getAssetPath = (pathname, root = document) => {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) {
    throw new Error(`Expected an absolute asset pathname, received "${pathname}"`);
  }

  const basePath = getBasePath(root);

  if (pathname === '/') {
    return basePath;
  }

  if (basePath === '/') {
    return pathname;
  }

  return `${basePath}${pathname.slice(1)}`;
};
