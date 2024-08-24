export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'omar',
    password: process.env.DATABASE_PASSWORD || '',
    name: process.env.DATABASE_NAME || 'nest-with-auth',
  },
});
