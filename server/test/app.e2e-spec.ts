import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;

  let accessToken: string;

  const testUser = {
    email: 'test.user@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password',
  };

  const createUser = (user: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }) => request(app.getHttpServer()).post('/users').send(user);

  const loginUser = (credentials: { email?: string; password?: string }) =>
    request(app.getHttpServer()).post('/auth/login').send(credentials);

  const getProfile = (token?: string) => {
    const req = request(app.getHttpServer()).get('/auth/profile');

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }

    return req;
  };

  const getRoot = (token?: string) => {
    const req = request(app.getHttpServer()).get('/');

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }

    return req;
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  describe('create user', () => {
    it('fails if missing fields', () => {
      const { firstName, lastName, email } = testUser;

      createUser({
        firstName,
      }).expect(400);

      createUser({
        firstName,
        lastName,
      }).expect(400);

      createUser({
        firstName,
        lastName,
        email,
      }).expect(400);
    });

    it('succeeds if all fields are present', () => {
      createUser(testUser).expect(200);
    });

    it('fails if email is already taken', () => {
      createUser(testUser).expect(409);
    });
  });

  describe('login', () => {
    it('fails if user does not exist', () => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test.bad.user@gmail.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('fails if password is incorrect', () => {
      loginUser({
        email: testUser.email,
        password: 'bad-password',
      }).expect(401);
    });

    it('succeeds if email and password are correct', () => {
      const { email, password } = testUser;

      loginUser({
        email,
        password,
      })
        .expect(200)
        .expect((res) => {
          accessToken = res.body.accessToken;
        });
    });
  });

  describe('get profile', () => {
    it('get profile fails if not authenticated', () => {
      getProfile().expect(401);
    });

    it('get profile succeeds if authenticated', () => {
      getProfile(accessToken)
        .expect(200)
        .expect((res) => {
          const { email, firstName, lastName } = testUser;

          expect(res.body.email).toBe(email);
          expect(res.body.firstName).toBe(firstName);
          expect(res.body.lastName).toBe(lastName);
        });
    });
  });

  describe('get root', () => {
    it('fails if not authenticated', () => {
      getRoot().expect(401);
    });

    it('succeeds if authenticated', () => {
      const { firstName, lastName } = testUser;
      getRoot(accessToken)
        .expect(200)
        .expect(`Hello ${firstName} ${lastName}!`);
    });
  });
});
