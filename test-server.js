// Simple test server to verify port access
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>ChefGrocer Test</title></head>
      <body>
        <h1>ChefGrocer Server is Working!</h1>
        <p>Port: ${process.env.PORT || '5000'}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>If you see this, the server is accessible.</p>
      </body>
    </html>
  `);
});

const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Access at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app`);
});