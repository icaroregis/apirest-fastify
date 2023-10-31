import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';

export const app = fastify();

// * plugins => Uma forma organizada e separada do código principal da aplicação. Os plugins permitem estender o funcionamento do Fastify de maneira modular e reutilizável.
app.register(cookie);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});
