import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;

  let accessToken: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('create user fails if missing fields', () => {
    request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Test',
      })
      .expect(400);

    request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(400);

    request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@gmail.com',
      })
      .expect(400);
  });

  it('create user succeeds if all fields are present', () => {
    request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test.user@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
      })
      .expect(200);
  });

  it('create user fails if email is already taken', () => {
    request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test.user@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
      })
      .expect(409);
  });

  it('login fails if user does not exist', () => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test.bad.user@gmail.com',
        password: 'password',
      })
      .expect(401);
  });

  it('login fails if password is incorrect', () => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test.user@gmail.com',
        password: 'bad-password',
      })
      .expect(401);
  });

  it('login succeeds if email and password are correct', () => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test.user@gmail.com',
        password: 'password',
      })
      .expect(200)
      .expect((res) => {
        accessToken = res.body.accessToken;
      });
  });

  it('get profile fails if not authenticated', () => {
    request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('get profile succeeds if authenticated', () => {
    request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('test.user@gmail.com');
        expect(res.body.firstName).toBe('Test');
        expect(res.body.lastName).toBe('User');
      });
  });

  it('get / fails if not authenticated', () => {
    request(app.getHttpServer()).get('/').expect(401);
  });

  it('get / succeeds if authenticated', () => {
    request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect('Hello Test User!');
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });
});
