import { z } from 'zod';
import crypto from 'node:crypto';
import { knex } from '../database';
import { FastifyInstance } from 'fastify';

//Cookies <--> Formas da gente manter contexto entre as requisições.
//todo plugin precisa ser uma função assíncrona.
export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select();
    return { transactions };
  });

  app.get('/:id', async request => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    /** o uso do first é para dizer para o knex que queremos apenas um resultado, senão ele retornaria um array. */
    const transaction = await knex('transactions').where('id', id).first();

    return { transaction };
  });

  app.get('/summary', async () => {
    const summary = await knex('transactions').sum('amount', { as: 'amount' }).first();
    return { summary };
  });

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(request.body);

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    });

    return reply.status(201).send();
  });
}
