const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, '');
const hasProtocol = (value) => /^[a-z][a-z\d+\-.]*:\/\//i.test(value);
const normalizeAbsoluteBaseUrl = (value) => {
  const url = new URL(value);

  url.pathname = `/${trimSlashes(url.pathname)}/`;
  url.search = '';
  url.hash = '';

  return url.toString();
};

export const getBasePath = (root = document) => {
  const basePathMeta = root.querySelector?.('meta[name="app-base-path"]');
  const rawValue = basePathMeta?.content?.trim() || '/';

  if (!rawValue || rawValue === '/') {
    return '/';
  }

  if (hasProtocol(rawValue)) {
    return normalizeAbsoluteBaseUrl(rawValue);
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

  if (hasProtocol(basePath)) {
    return new URL(pathname.slice(1), basePath).toString();
  }

  if (basePath === '/') {
    return pathname;
  }

  return `${basePath}${pathname.slice(1)}`;
};
