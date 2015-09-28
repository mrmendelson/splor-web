#!/bin/bash

endExit ()
{
  echo "error: ${1}"
  exit 1
}

installBrew ()
{
  if [ -z "$(which brew)" ]
    then
    brew_code=tryInstall "brew" 'ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"'
    return [ $brew_code -eq 0 ]
  else
    return true
  fi
}

tryInstall ()
{
  echo "$1 not found. Would you like to install it? [Y/n]"
  read -n do_install
  do_install=$(awk '{print tolower($0)}')
  [ $do_install -eq "y" ] && eval "$2"
  install_success=$?
  [ $install_success -ne 0 ] && endExit "installing $1 failed. Try installing it manually and re-running this script."
  return [ $install_success -eq 0 ]
}

# check prerequisites
echo "checking for prerequisites"
[ -z "$(which node)" ] && installBrew && tryInstall "node" "brew install node" && endExit "node not found. Is it installed?"
# [ -z "$(which createdb)" ] && installBrew && tryInstall "postgres" "brew install postgresql" && endExit "createdb command not found. Is postgres installed?"
[ -z "$(which sqlite3)" ] && installBrew && tryInstall "sqlite3" "brew install sqlite3" && endExit "sqlite3 command not found. Is SQLite installed?"
[ -z "$(which redis-server)" ] && installBrew && tryInstall "redis" "brew install redis" && endExit "redis-server command not found. Is redis installed?"

# check for and import an existing .env file
env_exists=$([ -s .env ] && echo true)
[ $env_exists ] && export $(cat .env | grep -e ^[^#] | xargs)

# get user-defined inputs
if [ -z "$DB_NAME" ]; then
  echo "choose a database name [splor]:"
  read DB_NAME
fi

# defaults
[ -z "${DB_NAME}" ] && DB_NAME=splor
read -r -d '' DEFAULT_ENV <<-'EOF'
# required

KHAN_CONSUMER_KEY=
KHAN_CONSUMER_SECRET=
TOKEN_SECRET=
SESSION_SECRET=


# optional

APP_PORT=8080
APP_IP=127.0.0.1

DB_TYPE=sqlite
DB_NAME=${DB_NAME}
SQLITE_STORE=sqlite/${DB_NAME}.sqlite
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=

REDIS_HOST=127.0.0.1
# this is a custom port because we run redis with npm start inside of package.json
REDIS_PORT=7889
REDIS_PASS=
REDIS_URL=
EOF

# create folders
mkdir -p lib/db-seeders
mkdir -p sqlite

# create env file
if [ -z $env_exists ]; then
  echo "creating .env file"
  cat > .env $DEFAULT_ENV
  echo "created env file."
  echo "you will need to add your Khan Academy credentials. Would you like to edit this file? [Y/n]"
  read -n edit_file
  edit_file = $(awk '{print tolower($0)}')
  [ $edit_file -eq "y" ] && nano $edit_file
fi

# create database
echo "creating database '$DB_NAME'"
# createdb $DB_NAME
touch sqlite/${DB_NAME}.sqlite

# install dependencies
echo "installing dependencies"
npm install

# run migrations
echo "migrating database"
sequelize db:migrate

# done
cat <<-EOF
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
