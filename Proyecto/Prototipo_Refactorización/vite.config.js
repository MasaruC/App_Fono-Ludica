import { defineConfig } from 'vite';
import { resolve } from 'path';
import os from 'os';

/**
 * Plugin ligero de sincronización en tiempo real para el Modo Evaluación Micro-SCED (Actividad 10).
 * Permite que los integrantes del Equipo G7 (UNMSM) califiquen desde sus propios celulares/laptops
 * (evaluador.html) sin tocar la tablet/dispositivo donde juega el niño (index.html).
 */
function scedRemoteSyncPlugin() {
  const rooms = new Map(); // roomCode -> { state, clients: Set<res>, history: [] }

  function getOrCreateRoom(roomCode) {
    const key = String(roomCode || 'G7-P01').toUpperCase().trim();
    if (!rooms.has(key)) {
      rooms.set(key, {
        roomCode: key,
        lastState: null,
        clients: new Set(),
        updatedAt: Date.now()
      });
    }
    return rooms.get(key);
  }

  function getLanIpAddresses() {
    const nets = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      }
    }
    return ips;
  }

  function attachMiddleware(middlewares) {
    middlewares.use((req, res, next) => {
      if (!req.url) return next();
      const urlObj = new URL(req.url, 'http://localhost');

      if (urlObj.pathname === '/api/sced-info') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          ok: true,
          lanIps: getLanIpAddresses(),
          timestamp: Date.now()
        }));
        return;
      }

      if (urlObj.pathname !== '/api/sced-sync') {
        return next();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      const roomCode = (urlObj.searchParams.get('room') || 'G7-P01').toUpperCase();
      const room = getOrCreateRoom(roomCode);

      // Stream SSE en tiempo real para conectar Dispositivo Infantil <-> App Remota Evaluador
      if (req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', roomCode, peers: room.clients.size + 1 })}\n\n`);
        if (room.lastState) {
          res.write(`data: ${JSON.stringify({ type: 'STATE_SNAPSHOT', roomCode, payload: room.lastState })}\n\n`);
        }

        room.clients.add(res);

        // Notificar a los demás pares de la sala que se unió un dispositivo
        const joinMsg = `data: ${JSON.stringify({ type: 'PEER_COUNT', roomCode, peers: room.clients.size })}\n\n`;
        room.clients.forEach(client => {
          try { client.write(joinMsg); } catch (e) {}
        });

        req.on('close', () => {
          room.clients.delete(res);
          const leaveMsg = `data: ${JSON.stringify({ type: 'PEER_COUNT', roomCode, peers: room.clients.size })}\n\n`;
          room.clients.forEach(client => {
            try { client.write(leaveMsg); } catch (e) {}
          });
        });
        return;
      }

      // Publicación de eventos o comandos remotos (POST)
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
          if (body.length > 2 * 1024 * 1024) req.destroy();
        });
        req.on('end', () => {
          try {
            const message = JSON.parse(body || '{}');
            const targetRoom = getOrCreateRoom(message.roomCode || roomCode);
            targetRoom.updatedAt = Date.now();
            if (message.type === 'STATE_SNAPSHOT' && message.payload) {
              targetRoom.lastState = message.payload;
            }
            const ssePayload = `data: ${JSON.stringify(message)}\n\n`;
            targetRoom.clients.forEach(client => {
              try { client.write(ssePayload); } catch (e) {}
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, peers: targetRoom.clients.size }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
          }
        });
        return;
      }

      next();
    });
  }

  return {
    name: 'sced-remote-sync-relay',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    }
  };
}

export default defineConfig({
  base: './', // Vital para empaquetado móvil Capacitor (rutas relativas en WebView)
  plugins: [scedRemoteSyncPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        evaluador: resolve(__dirname, 'evaluador.html')
      }
    }
  }
});


