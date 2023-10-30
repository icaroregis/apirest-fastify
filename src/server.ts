import fastify from 'fastify';
import { env } from './env';
import cookie from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';

const app = fastify();

//plugins => Uma forma organizada e separada do código principal da aplicação. Os plugins permitem estender o funcionamento do Fastify de maneira modular e reutilizável.
app.register(cookie);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server Running!!!');
  });
