#!/bin/bash
# CineScript -- Lokaler Server starten
# Doppelklick genuegt. Terminal oeffnet sich automatisch.

cd "$(dirname "$0")"

PORT=8765

# Lokale IP ermitteln (WLAN bevorzugt)
IP=$(ipconfig getifaddr en0 2>/dev/null)
[ -z "$IP" ] && IP=$(ipconfig getifaddr en1 2>/dev/null)
[ -z "$IP" ] && IP=$(ipconfig getifaddr en2 2>/dev/null)
[ -z "$IP" ] && IP="localhost"

URL_LOCAL="http://localhost:${PORT}/cinescript_tonbericht.html"
URL_NETWORK="http://${IP}:${PORT}/cinescript_tonbericht.html"

clear
echo ""
echo "  ============================================"
echo "  =         CINESCRIPT  SET-MANAGER         ="
echo "  ============================================"
echo ""
echo "  Auf diesem Mac:"
echo "  ${URL_LOCAL}"
echo ""
echo "  Auf iPhone / iPad (gleiches WLAN):"
echo "  ${URL_NETWORK}"
echo ""
echo "  --------------------------------------------"
echo "  Beim ersten Oeffnen auf iOS:"
echo "  Safari oeffnen -> URL eingeben"
echo "  Teilen (Pfeil nach oben) ->"
echo "  Zum Home-Bildschirm -> Hinzufuegen"
echo "  Danach laeuft die App offline ohne Server."
echo "  --------------------------------------------"
echo ""
echo "  Server laeuft auf Port ${PORT}"
echo "  Stoppen: Ctrl + C"
echo ""

# Browser auf dem Mac oeffnen
open "${URL_LOCAL}" 2>/dev/null &

# Python HTTP Server starten
python3 -m http.server ${PORT}
