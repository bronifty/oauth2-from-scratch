{
  description = "Development proxy server with nginx";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Custom nginx configuration
        nginxConfig = pkgs.writeText "nginx.conf" ''
          worker_processes  1;
          daemon off;
          pid /tmp/nginx.pid;
          
          error_log /dev/stderr info;
          
          events {
              worker_connections  1024;
          }
          
          http {
              include       ${pkgs.nginx}/conf/mime.types;
              default_type  application/octet-stream;
              
              access_log /dev/stdout;
              sendfile        on;
              keepalive_timeout  65;
              
              # Client server (port 9000) -> http://client
              server {
                  listen 80;
                  server_name client;
                  
                  location / {
                      proxy_pass http://localhost:9000;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto $scheme;
                      
                      # WebSocket support
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade $http_upgrade;
                      proxy_set_header Connection "upgrade";
                  }
              }
              
              # Server (port 9001) -> http://server
              server {
                  listen 80;
                  server_name server;
                  
                  location / {
                      proxy_pass http://localhost:9001;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto $scheme;
                      
                      # WebSocket support
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade $http_upgrade;
                      proxy_set_header Connection "upgrade";
                  }
              }
              
              # API server (port 9002) -> http://api
              server {
                  listen 80;
                  server_name api;
                  
                  location / {
                      proxy_pass http://localhost:9002;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto $scheme;
                      
                      # WebSocket support
                      proxy_http_version 1.1;
                      proxy_set_header Upgrade $http_upgrade;
                      proxy_set_header Connection "upgrade";
                  }
              }
          }
        '';

        # Script to set up /etc/hosts entries
        setupHosts = pkgs.writeShellScriptBin "setup-hosts" ''
          echo "Setting up /etc/hosts entries..."
          
          # Backup original hosts file if not already backed up
          if [ ! -f /etc/hosts.backup ]; then
            sudo cp /etc/hosts /etc/hosts.backup
            echo "Created backup at /etc/hosts.backup"
          fi
          
          # Remove any existing entries
          sudo sed -i.tmp '/# Local development servers/,/^$/d' /etc/hosts
          
          # Add our entries
          echo "" | sudo tee -a /etc/hosts
          echo "# Local development servers" | sudo tee -a /etc/hosts
          echo "127.0.0.1   client" | sudo tee -a /etc/hosts
          echo "127.0.0.1   server" | sudo tee -a /etc/hosts
          echo "127.0.0.1   api" | sudo tee -a /etc/hosts
          
          echo "✅ /etc/hosts updated"
        '';

        # Script to remove /etc/hosts entries
        cleanupHosts = pkgs.writeShellScriptBin "cleanup-hosts" ''
          echo "Removing /etc/hosts entries..."
          if [ -f /etc/hosts.backup ]; then
            sudo cp /etc/hosts.backup /etc/hosts
            echo "✅ Restored original /etc/hosts"
          else
            sudo sed -i.tmp '/# Local development servers/,/^$/d' /etc/hosts
            echo "✅ Removed development entries from /etc/hosts"
          fi
        '';

        # Script to start nginx proxy
        startProxy = pkgs.writeShellScriptBin "start-proxy" ''
          echo "🚀 Starting development proxy server..."
          echo "Access your servers at:"
          echo "  http://client  -> localhost:9000"
          echo "  http://server  -> localhost:9001" 
          echo "  http://api     -> localhost:9002"
          echo ""
          echo "Press Ctrl+C to stop"
          
          sudo ${pkgs.nginx}/bin/nginx -c ${nginxConfig}
        '';

        # Complete development environment
        devProxy = pkgs.writeShellScriptBin "dev-proxy" ''
          case "''${1:-start}" in
            start)
              ${setupHosts}/bin/setup-hosts
              ${startProxy}/bin/start-proxy
              ;;
            stop)
              echo "Stopping nginx..."
              sudo pkill nginx || true
              echo "✅ Nginx stopped"
              ;;
            clean)
              echo "Stopping nginx..."
              sudo pkill nginx || true
              ${cleanupHosts}/bin/cleanup-hosts
              echo "✅ Development proxy cleaned up"
              ;;
            status)
              echo "Checking nginx status..."
              if pgrep nginx > /dev/null; then
                echo "✅ Nginx is running"
                sudo lsof -i :80 || true
              else
                echo "❌ Nginx is not running"
              fi
              echo ""
              echo "Current /etc/hosts entries:"
              grep -A 10 "Local development servers" /etc/hosts 2>/dev/null || echo "No development entries found"
              ;;
            *)
              echo "Usage: dev-proxy [start|stop|clean|status]"
              echo ""
              echo "Commands:"
              echo "  start   - Setup hosts and start proxy (default)"
              echo "  stop    - Stop nginx proxy"
              echo "  clean   - Stop proxy and restore /etc/hosts"
              echo "  status  - Check proxy status"
              ;;
          esac
        '';

      in {
        packages.default = devProxy;
        
        packages = {
          nginx-config = nginxConfig;
          setup-hosts = setupHosts;
          cleanup-hosts = cleanupHosts;
          start-proxy = startProxy;
          dev-proxy = devProxy;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nginx
            devProxy
          ];
          
          shellHook = ''
            echo "🔧 Development Proxy Environment"
            echo ""
            echo "Available commands:"
            echo "  dev-proxy start   - Start the proxy server"
            echo "  dev-proxy stop    - Stop the proxy server"  
            echo "  dev-proxy clean   - Stop and cleanup everything"
            echo "  dev-proxy status  - Check status"
            echo ""
            echo "Your servers should run on:"
            echo "  Port 9000 -> http://client"
            echo "  Port 9001 -> http://server" 
            echo "  Port 9002 -> http://api"
          '';
        };
      });
}
