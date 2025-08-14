# Development Proxy with Nix Flake

This Nix flake provides a reproducible development proxy server using nginx that maps clean URLs to your local development servers.

## Quick Start

```bash
# Enter the development environment
nix develop

# Start the proxy (sets up /etc/hosts and starts nginx)
dev-proxy start

# In another terminal, start your servers on the mapped ports:
# - Port 9000 for http://client
# - Port 9001 for http://server  
# - Port 9002 for http://api
```

## Available Commands

```bash
# Start the proxy server (default command)
nix run . -- start
# or
dev-proxy start

# Stop the proxy server
nix run . -- stop
# or  
dev-proxy stop

# Stop proxy and restore /etc/hosts
nix run . -- clean
# or
dev-proxy clean

# Check proxy status
nix run . -- status
# or
dev-proxy status
```

## URL Mapping

The proxy maps these URLs to your local development servers:

- `http://client` → `localhost:9000`
- `http://server` → `localhost:9001`
- `http://api` → `localhost:9002`

## How It Works

1. **nginx Configuration**: Custom nginx config with reverse proxy rules
2. **DNS Resolution**: Modifies `/etc/hosts` to map domain names to localhost
3. **Port Mapping**: nginx listens on port 80 and forwards to your development servers

## Files

- `flake.nix` - Nix flake definition with nginx configuration and scripts
- `flake.lock` - Locked dependencies for reproducible builds

## Benefits of Using Nix

- **Reproducible**: Same nginx version and configuration across machines
- **Isolated**: No system-wide nginx installation conflicts
- **Version Controlled**: Configuration is tracked in git
- **Portable**: Works on any machine with Nix installed
- **Clean**: Easy to remove without leaving system artifacts

## Cleanup

To completely remove everything:

```bash
# Stop and cleanup
nix run . -- clean

# Optional: Remove the flake files
rm flake.nix flake.lock PROXY-README.md
```

## Customization

Edit the `nginxConfig` section in `flake.nix` to:
- Change port mappings
- Add more servers
- Modify proxy headers
- Add SSL/HTTPS support
