module.exports = {
    host: process.env.SESSION_HOST || 'localhost',
    port: process.env.SESSION_PORT || 3306,
    user: process.env.SESSION_USER || 'root',
    password: process.env.SESSION_PASS || '',
    database: process.env.SESSION_DB || 'splore_sessions',
    key: process.env.SESSION_KEY || 'splore_session',
    secret: process.env.SESSION_SECRET
}
