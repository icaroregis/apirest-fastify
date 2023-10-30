import { z } from 'zod';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';
import crypto, { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '@/middlewares/checkSessionIdExists';

// * Tipos de teste
// * Unitários: Unidade da sua aplicação. Ex: uma função.
// * Integração: Comunicação entre duas ou mais unidades. Ex. Uma função que chama outra função.
// * e2e - ponta a ponta: Simulam um usuário operando na nossa aplicação.

// ? e2e => front-end: Abre a página de login, digite o texto: icaroregisalmeida@gmail.com no campo com id email, clique no botão.
// ? back-end: Chamadas HTTP, websocket

// ! Pirâmide de testes: E2E(Não dependem de nenhuma tecnologia, não dependem de arquitetura).

//Cookies <--> Formas da gente manter contexto entre as requisições.
// todo plugin precisa ser uma função assíncrona.
export async function transactionsRoutes(app: FastifyInstance) {
  // middleware global
  // app.addHook('preHandler', async (request, reply) => {
  //   console.log('testando middleware global');
  // });

  /** preHandler => executar algo antes de executar a função dentro deste bloco. Em outras palavras um Middleware. */
  app.get('/', { preHandler: [checkSessionIdExists] }, async request => {
    const { sessionId } = request.cookies;
    const transactions = await knex('transactions').where('session_id', sessionId).select();
    return { transactions };
  });

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async request => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);
    const { sessionId } = request.cookies;

    /** o uso do first é para dizer para o knex que queremos apenas um resultado, senão ele retornaria um array. */
    const transaction = await knex('transactions')
      .where({
        session_id: sessionId,
        id: id,
      })
      .first();

    return { transaction };
  });

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async request => {
    const { sessionId } = request.cookies;

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first();

    return { summary };
  });

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
      });
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
