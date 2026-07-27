module.exports = {
  apps: [
    {
      name: 'edu-backend',
      script: 'venv/bin/python3',
      args: '-m uvicorn api:app --host 0.0.0.0 --port 8000',
      cwd: './',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'edu-frontend',
      script: 'npm',
      args: 'run start',
      cwd: './frontend',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'edu-landing',
      script: 'npx',
      args: 'serve -s dist -l 5173',
      cwd: './landing_page',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
