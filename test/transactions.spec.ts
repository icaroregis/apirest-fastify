import { test, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import { app } from '../src/app';
import request from 'supertest';

// * Os testes são compostos de tres partes:
// * O título.
// * A Operação.
// * A Validação.

describe('Transactions routes', () => {
  // ? Para todos os testes.
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ? Para cada teste.
  // ? O cenário ideal para os testes é que todas as vezes em que os testes são executados os ambientes estejam zerados incluindo o banco de dados.
  beforeEach(async () => {
    execSync('yarn knex -- migrate:rollback');
    execSync('yarn knex -- migrate:latest');
  });

  test('User can create a new Transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201);
  });

  test('User can list all transactions', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 5000,
      }),
    ]);
  });

  test('User can get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 5000,
      })
    );
  });

  test('User can get the summary', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'Credit Transaction',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server).post('/transactions').set('Cookie', cookies).send({
      title: 'Debit Transaction',
      amount: 2000,
      type: 'debit',
    });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});
