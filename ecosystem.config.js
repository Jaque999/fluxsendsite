// Update these paths to match your deployment directory
const APP_DIR = process.env.APP_DIR || "/var/www/fluxsend";

module.exports = {
  apps: [
    {
      name: "fluxsend",
      script: "npm",
      args: "start",
      cwd: APP_DIR,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Update these paths to match your deployment
        DATA_DIR: `${APP_DIR}/data`,
        STORAGE_DIR: `${APP_DIR}/storage`,
        // IMPORTANT: Set these in .env.local or update here
        TOKEN_PEPPER: "CHANGE_THIS_TO_RANDOM_STRING",
        BASE_URL: "https://fluxsend.xyz",
      },
      error_file: `${APP_DIR}/logs/pm2-error.log`,
      out_file: `${APP_DIR}/logs/pm2-out.log`,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
