const domain = `${location?.protocol || `http:`}//${process.env.API || location.hostname || `localhost`}`;
export const CACHE_KEY = `${process.env.CACHE}`;
export const API = `${domain}:${process.env.PORT}`;
