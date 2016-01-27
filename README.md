# splor-api
API & web Layer for Splor

# Development

The Splor development environment is a node.js server, and assumes that you have mild familiarity with node.js.

It is also meant to be as painless as possible to set up.

The dev environment and bootstrap scripts assume you are running on an OSX machine.

How to set up your dev environment:
---

- clone this repo

- in the terminal, `cd` to this repo and run:

```bash
./bootstrap.sh        # If you're running OS X
# OR
./bootstrap-linux.sh  # If you're running a GNU/Linux distro
```

This script will attempt to do the following automatically:

- verify or install node
- verify or install redis
- verify or install sqlite3
- set up a `.env` file with the basics for running the server
- set up a local sqlite db
- install npm dependencies
- migrate the local db to the latest

if it fails, post an issue in this repo with the error message and we can figure out what's wrong.

- Once you have run the bootstrap script, edit the `.env` file and add your khan academy key and secret.

Also add random strings for your `TOKEN_SECRET` and `SESSION_SECRET`. These don't need to conform to any standard, you can either type random words or smash your hand on your keyboard for these values.

You may also optionally define any of the following keys if you want to override the defaults (as specified in brackets):

```
HOST=[localhost]
PORT=[4000]

DB_NAME=[splor]
SQLITE_STORE=[sqlite/splor.sqlite]
# if you want to use a different database, you can remove SQLITE_STORE and define some of these values.
DB_HOST=[]
DB_TYPE=[]
DB_PORT=[]
DB_USER=[]
DB_PASS=[]

REDIS_HOST=[localhost]
# this is a custom port because we run redis with npm start inside of package.json
REDIS_PORT=[7889]

SESSION_KEY=[splor_session]
```

- Once you have updated the config file, you're all set up.

Running the dev environment
---

The dev environment runs a server that automatically reloads whenever you change the code in this repo.

To start the dev server, run:

```bash
npm run dev
```

This will start redis and a livereload server.

Then, you can visit [http://localhost:4000](http://localhost:4000) to see your local site.

# Development primer

Stack/tools
---

At it's core, Splor is an [express](http://expressjs.com/) app.

It uses the [Sequelize](http://docs.sequelizejs.com/en/latest/) ORM to interact with it's database, which is postgres in production, and sqlite in dev.

It uses redis to store session data and other ephemeral data, which must be running for splor to work. In dev, a redis server is automatically started with `npm run dev`, so there is no need to run a daemonized server locally.

For the most part, development is as simple as starting the dev server and editing files.

This repo uses [github flow](https://guides.github.com/introduction/flow/) as it's workflow. A primer on how to push to this repo (or any github flow project) can be found on [Jesse Ditson's Blog](http://jesseditson.com/post/github-for-beginners)

# Views

Splor uses the [handlebars](http://handlebarsjs.com/) templating engine to draw dynamic data, and houses it's views in the `/views` folder at the root of this project.

There are 3 base folders in the `views` directory:

- `auth` - this is where views for authorization live.
- `layouts` - this is where layouts are stored.
- `partials` - this is where partials go.

Layouts and partials are just blocks of html that can be included multiple times, and are conventions that help keep you from repeating markup in multiple places. All views automatically include the `main` layout, where navigation and other global elements are defined.

If you put a file in the views directory, it will be accessible from your express routes by just calling it by it's relative path to the `views` directory.

For instance, if you were to add a file called `list.hbs` to a new folder called `classes` in the `views` directory, you would render it by calling `res.render('classes/list', {})` in an express route.

# Sequelize

Because this project uses Sequelize, all database interactions are performed via Models.

This project also is set up so that any creation of models can and should be performed via [sequelize-cli](https://github.com/sequelize/cli) (exposed as the `sequelize` command). For help on the command, type `sequelize help` in this repo's directory, and you'll be presented with a slough of options to choose from.

Below are descriptions of some common tasks you may want to perform in sequelize.

Creating models
---

To create a new model, use the following command:

```
sequelize model:create --name SomeModelName --attributes="property:string, anotherProperty:boolean"
```

where `SomeModelName` is the TitleCased name of your new model, and the attributes are a list of `propertyname:type`. There are many types, which can be read about in the Sequelize documentation. Generally the types here will be the lowercase version of their `DataTypes.TYPENAME` counterpart.

Caveats:
- Do not specify an `id` field if you want a standard autoincrement INTEGER id, it will be defined automatically. However, you'll need to add the definition to the model file.
- Same thing for createdAt and updatedAt records - they will be automatically created and updated by Sequelize.
- If you update a model directly after creating it, be sure to also update the migration. Once you push a migration/model, do not update the model without a corresponding migration with the same `up/down` change.

This will generate a model file in `lib/models`, as well as a migration file in the `lib/migrations` folder.

When you create a new model, first check both the generated model and migration to make sure it matches what you expect.
This is also the time to update uniqueness and indexes on your model & migration.

After you're _sure_ your model is complete, run the migration.

Migrating your database
---

To run all pending migrations, run:

```
sequelize db:migrate
```

If you need to roll back a migration (only do this while validating a new migration), run the following:

```
sequelize db:migrate:undo
```

When you deploy code with new migrations, be sure that the production database was also migrated.

# Production

Connecting to heroku
----

If you have production access, you can add heroku as a remote, which will allow you to deploy by running:

```
git remote add heroku https://git.heroku.com/splor.git
```

Once heroku is in your git config, you can deploy the latest from master by running:

```
git push heroku
```

If you need to migrate the database, you should run the following before deploying:

```
heroku run sequelize db:migrate
```

To tail the logs from the current version of production code, run:

```
heroku logs -t
```

Other heroku commands can come in handy, see the [heroku toolbelt docs](https://toolbelt.heroku.com/)

Provisioning
----

Splor is already provisioned and deployed, so these steps are written here purely for historical information.
It is not recommended to attempt to run any of them, however this may be interesting information if you are interested in how heroku was initially set up.

```
heroku create splor
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
heroku ps:scale web=1
heroku config:set KHAN_CONSUMER_KEY=<key> KHAN_CONSUMER_SECRET=<secret> TOKEN_SECRET=<randomstring> SESSION_SECRET=<randomstring> HOST=0.0.0.0
```
