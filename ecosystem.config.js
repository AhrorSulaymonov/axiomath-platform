module.exports = {
  apps: [
    {
      name: "axiomath-backend",
      script: "venv/bin/python3",
      args: "-m uvicorn api:app --host 127.0.0.1 --port 8000",
      cwd: "/home/azureuser/axiomath-platform",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "axiomath-frontend",
      script: "npm",
      args: "run start -- -p 3000",
      cwd: "/home/azureuser/axiomath-platform/frontend",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      }
    }
  ]
};
