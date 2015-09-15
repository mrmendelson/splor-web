# splore-api
API & web Layer for Splore

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
DB_TYPE=[mysql]
DB_PORT=[3306]
DB_NAME=[splore]
DB_USER=[root]
DB_PASS=[]

SESSION_KEY=[splore_session]
SESSION_HOST=[localhost]
SESSION_PORT=[3306]
SESSION_USER=[root]
SESSION_PASS=[]
SESSION_DB=[splore_sessions]
```

- Set up local mysql instance running on localhost:3306 (if using defaults)
- connect to mysql using `mysql -uroot`
run:

```
CREATE TABLE splore;
CREATE TABLE splore_sessions;
```

- run migrations:

```
./scripts/migrate
```

- run dev server:

```
gulp serve
```
