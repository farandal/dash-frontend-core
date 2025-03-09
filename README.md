# intro

- This a monorepo structure
- The main components are within apps and packages

# Requirements

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


# Font Aesome Icons Loader within compoments

import { loadFontAwesomeIcons } from './helpers/fontAwesomeLoader';

// In your component's useEffect or similar
useEffect(() => {
  loadFontAwesomeIcons();
}, []);
$#
# Miising deps


chartjs-plugin-datalabels