export default () => ({
    jwt: {
        secret: process.env.JWT_SECRET
    },
    database: {
        connectionString: process.env.MONGO_URL,
        MONGO_URL: process.env.MONGO_URL
    },
    mail: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || '"Alwadih" <no-reply@alwadih.com>'
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID
    }
});
