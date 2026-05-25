#!/usr/bin/env bash
# Open HTTP/HTTPS on Oracle Cloud VM iptables (fixes Cloudflare Error 523).
set -euo pipefail
RULES=/etc/iptables/rules.v4
if ! grep -q 'dport 80 -j ACCEPT' "$RULES" || ! grep -q 'dport 443' "$RULES"; then
  cp -a "$RULES" "${RULES}.bak"
  sed -i '/dport 22 -j ACCEPT/a -A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT\n-A INPUT -p tcp -m state --state NEW -m tcp --dport 443 -j ACCEPT' "$RULES"
fi
iptables-restore < "$RULES"
echo "Firewall OK: ports 22, 80, 443 open"
