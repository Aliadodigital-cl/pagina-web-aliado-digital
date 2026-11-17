#!/bin/sh
set -eu

APP_ROOT="${APP_ROOT:-$(pwd)}"
PORT="${PORT:-80}"
NGINX_CONF="/tmp/nginx-nixpacks.conf"
HEADERS_CONF="/tmp/nginx-security-headers.conf"

# Same snippet the Docker image uses; included per location because nginx
# drops server-level add_header in any location that sets its own.
cp "${APP_ROOT}/nginx-security-headers.conf" "${HEADERS_CONF}"
REDIRECTS_CONF="/tmp/nginx-redirects.conf"
cp "${APP_ROOT}/nginx-redirects.conf" "${REDIRECTS_CONF}"

cat > "${NGINX_CONF}" <<EOF
worker_processes auto;
pid /tmp/nginx.pid;

events {
  worker_connections 1024;
}

http {
  default_type application/octet-stream;

  types {
    text/html html;
    text/css css;
    application/javascript js mjs;
    application/json json;
    application/manifest+json webmanifest;
    application/xml xml;
    image/svg+xml svg;
    image/png png;
    image/jpeg jpg jpeg;
    image/webp webp;
    image/avif avif;
    image/gif gif;
    image/x-icon ico;
    font/woff2 woff2;
    font/woff woff;
    font/ttf ttf;
    font/otf otf;
  }

  sendfile on;
  tcp_nopush on;

  server {
    listen ${PORT};
    listen [::]:${PORT};
    server_name _;

    root ${APP_ROOT}/dist;
    index index.html;

    # Behind a TLS-terminating proxy nginx only sees http, so an absolute
    # Location header downgrades the scheme: /desarrollo became
    # https -> http -> https, three hops with an insecure one in the middle,
    # on every slashless URL. Relative redirects keep the client scheme.
    # Keep in sync with nginx.conf, which the Docker path uses instead.
    absolute_redirect off;

    include ${HEADERS_CONF};

    error_page 404 /404.html;
    error_page 500 502 503 504 /500.html;

    location = /404.html {
      internal;
      add_header Cache-Control "no-store" always;
      include ${HEADERS_CONF};
    }

    location = /500.html {
      internal;
      add_header Cache-Control "no-store" always;
      include ${HEADERS_CONF};
    }

    include ${REDIRECTS_CONF};

    location ^~ /_astro/ {
      add_header Cache-Control "public, max-age=31536000, immutable" always;
      include ${HEADERS_CONF};
      expires 1y;
      try_files \$uri =404;
    }

    location ~* \.(?:png|jpe?g|webp|gif|avif|svg|ico|woff2?|ttf|otf|eot)\$ {
      add_header Cache-Control "public, max-age=2592000, must-revalidate" always;
      include ${HEADERS_CONF};
      expires 30d;
      try_files \$uri =404;
    }

    location = /site.webmanifest {
      add_header Cache-Control "public, max-age=86400, must-revalidate" always;
      include ${HEADERS_CONF};
      try_files \$uri =404;
    }

    location ~* \.html\$ {
      add_header Cache-Control "public, max-age=0, must-revalidate" always;
      include ${HEADERS_CONF};
      expires -1;
      try_files \$uri =404;
    }

    location / {
      try_files \$uri \$uri/ \$uri.html =404;
      add_header Cache-Control "public, max-age=0, must-revalidate" always;
      include ${HEADERS_CONF};
    }
  }
}
EOF

exec nginx -c "${NGINX_CONF}" -g "daemon off;"
