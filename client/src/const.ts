export const COOKIE_NAME = "vindicai_preview_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const startLogin = () => {
  window.location.href = "/auth/sign-in";
};
