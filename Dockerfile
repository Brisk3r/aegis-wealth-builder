# Aegis Developer Hub - Enterprise Self-Hosted Dockerfile
# Production-ready, zero-telemetry static hub deployment
FROM nginx:1.25-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy security-hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Aegis Hub static codebase
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
