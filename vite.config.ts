import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function staticMediaPlugin(): Plugin {
  return {
    name: 'static-media-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        
        // Strip query params
        const rawUrl = req.url.split('?')[0];
        let decodedPath = '';
        try {
          decodedPath = decodeURIComponent(rawUrl);
        } catch {
          decodedPath = rawUrl;
        }

        // Check if requesting an image or video
        if (/\.(jpg|jpeg|png|mp4|webp|svg|gif|ico)$/i.test(decodedPath)) {
          const cleanName = decodedPath.replace(/^\/+/, '').replace(/^public\//, '');
          
          // Candidate file paths
          const candidates = [
            path.resolve(__dirname, 'public', cleanName),
            path.resolve(__dirname, cleanName),
            path.resolve(__dirname, path.basename(cleanName)),
            path.resolve(__dirname, 'public', path.basename(cleanName)),
          ];

          let targetFile = candidates.find(f => fs.existsSync(f) && fs.statSync(f).isFile());

          if (targetFile) {
            const stat = fs.statSync(targetFile);
            const ext = path.extname(targetFile).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.mp4': 'video/mp4',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
            };

            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600');

            // Handle HTTP Range header for video streaming
            const range = req.headers.range;
            if (range && ext === '.mp4') {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
              const chunksize = end - start + 1;

              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
              });
              const fileStream = fs.createReadStream(targetFile, { start, end });
              fileStream.pipe(res);
              return;
            }

            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': contentType,
              'Accept-Ranges': 'bytes',
            });
            const fileStream = fs.createReadStream(targetFile);
            fileStream.pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    publicDir: 'public',
    plugins: [react(), tailwindcss(), staticMediaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
