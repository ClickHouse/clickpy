import { useEffect } from "react";
import { Galaxy } from "./web/browser";

function getBrowserCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  } catch {
    return null;
  }
}

function setBrowserCookie(name, value, { maxAge } = {}) {
  try {
    let cookie = `${name}=${value}; path=/; SameSite=Lax`;
    if (maxAge) cookie += `; max-age=${maxAge}`;
    document.cookie = cookie;
  } catch {
    // ignore
  }
}

function findOrCreateGalaxyId(key) {
  const read = () => {
    try {
      return (
        getBrowserCookie(key) ??
        window.localStorage.getItem(key) ??
        window.sessionStorage.getItem(key)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const persist = (value) => {
    try {
      setBrowserCookie(key, value, {
        maxAge: 2147483647, // (68 years) the largest value supported
      });
      window.localStorage.setItem(key, value);
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      console.log(error);
    }
  };

  const id = read() ?? crypto.randomUUID();
  persist(id);
  return id;
}

export function getUserId() {
  return findOrCreateGalaxyId("glx_anonymous_id");
}

export const useInitGalaxy = () => {
  useEffect(() => {
    const galaxyOptions = {
      getUserId,
      httpClient: {
        post: async (url, requestBody) => {
          const LIMIT_BYTES = 60 * 1024;
          const json = JSON.stringify(requestBody);
          const blob = new Blob([json], {
            type: "application/json;charset=UTF-8",
          });
          const tooLarge = blob.size > LIMIT_BYTES;

          if (
            !tooLarge &&
            typeof navigator !== "undefined" &&
            "sendBeacon" in navigator
          ) {
            try {
              const sent = navigator.sendBeacon(url, blob);
              if (sent) {
                const synthetic = new Response(null, {
                  status: 202,
                  statusText: "Queued via beacon",
                });
                synthetic._transport = "beacon";
                synthetic._queued = true;
                return synthetic;
              }
            } catch {
              // fall through to fetch
            }
          }

          const useKeepalive = !tooLarge;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: json,
            keepalive: useKeepalive,
          });
          res._transport = "fetch";
          return res;
        },
      },
      errorHandler: {
        captureException(exception) {
          console.error(exception);
        },
      },
      replaceConsoleLog: false,
      application: "CLICKPY",
      apiHost: process.env.NEXT_PUBLIC_GALAXY_API_ENDPOINT,
    };

    const [galaxy, stopGalaxy] = Galaxy.init(galaxyOptions);
    window.galaxy = galaxy;
    window.dispatchEvent(new Event("galaxy:ready"));

    return () => {
      void stopGalaxy();
    };
  }, []);
};

export const galaxyOnLoad = (event) => {
  window.galaxy.track(event, { interaction: "trigger" });
};

export const galaxyOnFocus = (event, depsArray) => {
  const listener = () => {
    window.galaxy?.track(event, { interaction: "trigger" });
  };

  useEffect(() => {
    window.addEventListener("focus", listener);
    return () => {
      window.removeEventListener("focus", listener);
    };
  }, depsArray);
};

export const galaxyOnBlur = (event, depsArray) => {
  const listener = () => {
    window.galaxy?.track(event, { interaction: "trigger" });
  };

  useEffect(() => {
    window.addEventListener("blur", listener);
    return () => {
      window.removeEventListener("blur", listener);
    };
  }, depsArray);
};

export const useGalaxyOnPage = (prefix, depsArray = []) => {
  useEffect(() => {
    const track = () =>
      window.galaxy.track(`${prefix}.window.load`, { interaction: "trigger" });

    if (window.galaxy) {
      track();
      return;
    }

    window.addEventListener("galaxy:ready", track, { once: true });
    return () => window.removeEventListener("galaxy:ready", track);
  }, [prefix, ...depsArray]);

  galaxyOnBlur(`${prefix}.window.blur`, [prefix, ...depsArray]);
  galaxyOnFocus(`${prefix}.window.focus`, [prefix, ...depsArray]);
};

export const galaxyOnClick = (event) => {
  return () => {
    window.galaxy.track(event, { interaction: "click" });
  };
};
