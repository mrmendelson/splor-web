#!/bin/bash

# Sanity check: make sure we're actually on Linux
# TODO: allow non-Darwin BSDs, too
if [ ! $(uname) = "Linux" ]; then
    echo "This ain't Linux!"
    exit 1
fi

echo "Examining your system..."

# Detect distro
if [ -f /etc/debian_version ]; then        # Debian, Ubuntu
    distro="debian"
elif [ -f /etc/redhat-release ]; then      # RHEL, CentOS, Fedora
    distro="redhat"
elif [ -f /etc/SUSE-brand ]; then          # SUSE, openSUSE
    distro="suse"
elif [ -f /etc/slackware-version ]; then   # Slackware
    distro="slackware"
elif [ -f $(which pacman) ]; then          # Arch (and ttylinux?)
    distro="arch"
elif [ -f $(which emerge) ]; then          # Gentoo
    distro="gentoo"
else
    # TODO: be less picky
    echo "Not a supported distro."; exit 1
fi

# Select package manager and package names
case $distro in
    debian)
        pm="sudo apt-get install"
        pkgs="redis-server sqlite3 libsqlite3-dev nodejs nodejs-dev"
        ;;
    redhat)
        pm="sudo yum install"

        # Install EPEL, since we need that for Redis
        echo "Installing epel-release..."
        $pm epel-release

        # Proceed as normal
        pkgs="redis sqlite sqlite-devel npm"
        ;;
    suse)
        pm="sudo zypper install"
        pkgs="redis sqlite3 sqlite3-devel nodejs nodejs-devel"
        ;;
    slackware)
        pm="sudo /usr/sbin/sbopkg -i"
        pkgs="redis"
        USE_NVM="YES"
        ;;
    arch)
        pm="sudo pacman -S"
        pkgs="redis sqlite nodejs"
        ;;
    gentoo)
        # I hope this is right
        pm="sudo emerge -atv"
        pkgs="redis sqlite nodejs"
	;;
esac

echo "Detected distro '${distro}'; using '${pm}' to install dependencies."

# Install Node via NVM if necessary (e.g. for Slackware)
if [ -n "$USE_NVM" ]; then
    echo "Installing Node.js Version Manager (NVM)..."
    if ! nvm --version; then
        # I really hate piping to bash, but whatever.
        curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
        echo "I've installed NVM for you.  Please close/reopen your terminal session and try again."
        exit 0
    fi
    nvm install node
fi

# Install system dependencies
echo "Installing packages: ${pkgs}"
$pm $pkgs

# Generate some random numbers
token_secret=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
session_secret=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)

# Get Khan Academy consumer key/secret from user
echo "Please provide your Khan Academy API consumer key and secret."
echo -n "Key: "; read khan_key
echo -n "Secret: "; read khan_secret

# Write out .env
echo "Creating .env file with provided Khan Academy credentials..."
cat <<EOF > .env
# required

KHAN_CONSUMER_KEY=${khan_key}
KHAN_CONSUMER_SECRET=${khan_secret}
TOKEN_SECRET=${token_secret}
SESSION_SECRET=${session_secret}
MAILGUN_API_KEY=
MAILGUN_DOMAIN=

# optional

BLUEBIRD_DEBUG=1

APP_PORT=8080
APP_IP=127.0.0.1

DB_TYPE=sqlite
DB_NAME=splor
SQLITE_STORE=sqlite/splor.sqlite
# DB_HOST=
# DB_PORT=
# DB_USER=
# DB_PASS=

REDIS_HOST=127.0.0.1
# this is a custom port because we run redis with npm start inside of package.json
REDIS_PORT=7889
# REDIS_PASS=
# REDIS_URL=
EOF

# Touch some stuff
echo "Bootstrapping local database..."
mkdir -p lib/db-seeders
mkdir -p sqlite
touch sqlite/splor.sqlite

# Install app dependencies
echo "Installing app dependencies..."
npm install

# Run migrations
echo "Performing database migrations..."
`npm bin`/sequelize db:migrate

# Done :)
cat <<EOF
########################################
#    Completed bootstrapping splor.    #
#    You can now run the dev server    #
#    by runnning:                      #
#                                      #
#    npm run dev                       #
#                                      #
#    this will start a live-reloaded   #
#    local development server.         #
########################################
EOF
