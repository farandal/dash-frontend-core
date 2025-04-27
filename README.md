# intro

- This a monorepo structure
- The main components are within apps and packages
- Domain app : apps/dash folder must always contain the domain app. 
- This project requires WSL in windows

# Requirements

- Node 20+

# Setup
- yarn install
- yarn new
- yarn install
- yarn dev

# Setup Windows
- Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1 
- refreshenv
- wsl
- chmod +x ./new.sh
- sh ./new.sh
- exit
- yarn install
- yarn dev-win


# use Node 20 (example with nvm)

Install NVM (if not already installed):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
Alternatively, use wget:
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm ls
nvm install 20
nvm use 20
node -v
make sure the package.json references it:
"engines": {
    "node": ">=20.18.3",
    "npm": ">=9.6.7"
},
