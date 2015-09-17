# splor-api
API & web Layer for Splor

#development

- install dependencies

```
npm install
```

- Add a file called .env with the following vars:

```
# required

# from the khan academy app
KHAN_CONSUMER_KEY=<key>
KHAN_CONSUMER_SECRET=<secret>
# for json web token generation
TOKEN_SECRET=<randomstring>
# for session control
SESSION_SECRET=<randomstring>

# optional vars

HOST=[localhost]
PORT=[4000]

DB_HOST=[localhost]
DB_TYPE=[postgres]
DB_PORT=[5432]
DB_NAME=[splor]
DB_USER=[]
DB_PASS=[]

REDIS_HOST=[localhost]
REDIS_PORT=[6379]

SESSION_KEY=[splor_session]
```

- Set up local postgres instance running on localhost:5432 (if using defaults)

run:

```
createdb splor
```

- run migrations:

```
./scripts/migrate
```

- run dev server:

```
gulp serve
```

Other dev
----

create migration:

`./scripts/create-migration`

rewind migration:

`./scripts/undo-migration`

#production

Provisioning (do not do this):
----

```
heroku create splor
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
heroku ps:scale web=1
heroku config:set KHAN_CONSUMER_KEY=<key> KHAN_CONSUMER_SECRET=<secret> TOKEN_SECRET=<randomstring> SESSION_SECRET=<randomstring> HOST=0.0.0.0
```

Setup
----

```
git remote add heroku https://git.heroku.com/splor.git
```

Updating
----

Migrations:

```
git push heroku
heroku run scripts/migrate
```
