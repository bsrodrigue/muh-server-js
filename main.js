import { createServer } from 'node:http';

const HOST = '127.0.0.1';
const PORT = 3000;

const log = (req, res) => {
  console.log(`[REQUEST]: ${req.url}`);
  return [req, res];
}

const middlewares = [log];

const controllers = {
  'api': {
    'store-data': (body) => {
      const data = JSON.parse(body);
      console.log(data);
    }
  }
}

function notFound(res) {
  res.writeHead(404, {
    'Content-Type': 'application/json'
  });

  return res.end(JSON.stringify({
    error: {
      message: "not-found"
    }
  }));
}

function success(res) {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });

  return res.end(JSON.stringify({
    data: {
      message: "success"
    }
  }));
}

const router = (req, res) => {
  const url = req.url;
  let [_, ...segments] = url.split('/');
  let controller = controllers;

  do {
    controller = controller[segments[0]];

    if (controller === undefined) return notFound(res);

    if (typeof controller === 'function') {
      let body = null;

      if (req.method === "POST") {
        req.on('data', (chunk) => {
          body = chunk.toString('utf-8');
          controller(body);
          success(res);
        });
      }

      break;
    }

  } while (segments.shift());
}

const server = createServer((req, res) => {

  for (const middleware of middlewares) {
    ([req, res] = middleware(req, res));
  }

  router(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
