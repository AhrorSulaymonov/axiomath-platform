module.exports = {
  apps: [
    {
      name: "axiomath-backend",
      script: "api.py",
      interpreter: "venv/bin/python3",
      cwd: "/home/azureuser/axiomath-platform",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "axiomath-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/home/azureuser/axiomath-platform/frontend",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      }
    }
  ]
};
