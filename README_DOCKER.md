# Enterprise Self-Hosting & Deployment Guide

This guide provides instructions for deploying **Aegis Developer Hub** on-premise, air-gapped, or behind a corporate firewall using Docker and Docker Compose.

---

## 1. Quick Start with Docker Compose

```bash
# Clone or transfer the repository
git clone https://github.com/Brisk3r/aegis-wealth-builder.git aegis-hub
cd aegis-hub

# Build and start the container
docker compose up -d
```

Access the hub locally at `http://localhost:8080`.

---

## 2. Docker CLI Commands

```bash
# Build Enterprise Image
docker build -t aegis-hub:latest .

# Run Container on Port 80
docker run -d --name aegis-hub -p 80:80 aegis-hub:latest
```

---

## 3. Enterprise SSO & SAML Setup

To configure Single Sign-On (SSO / Okta / SAML) for corporate deployments, inject your SAML provider metadata into your reverse proxy (e.g. Traefik, Nginx Plus, or AWS ALB) targeting port 80 of the `aegis-hub` container.

---

## 4. Air-Gapped Compliance

Aegis Hub runs 100% in browser memory. No outbound telemetry or external server tracking calls are made by the core tool engines.
