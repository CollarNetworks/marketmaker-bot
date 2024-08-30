# Collar networks market maker BOT utility

---

## Setup and run

- Ensure necessary pre-requisites are installed on system:
  `sudo apt-get install git curl`

- Install NVM
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`

- Install Node 20
  `nvm install 20`

- Install PNPM globally
  `npm install pnpm -g`

- Clone repo
  `git clone git@github.com:CollarNetworks/marketmaker-bot.git`

- change directory to newly created folder
  `cd marketmaker-bot`

- Install dependencies
  `pnpm i`

- Setup ENV file
  `touch .env`
  `nano .env`

- Put ENV variables in
  Reach out to @CollarNetworks for help with this

- Run your bot!
  `pnpm start`

---

### Optional:

#### Install PM2 to run your bot continuously

This will install PM2 to run your bot continuously even when you close your connection to your server/bot.

- Install PM2 globally
  `npm install pm2 -g`

- Run your bot in cluster mode with PM2
  `pnpm runbot`
