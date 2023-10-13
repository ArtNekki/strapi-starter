module.exports = ({ env }) => ({
    email: {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: env('SMTP_HOST', 'smtp.example.com'),
                port: env('SMTP_PORT', 587),
                auth: {
                    user: env('SMTP_USERNAME'),
                    pass: env('SMTP_PASSWORD'),
                },
            },
            settings: {
                defaultFrom: env('EMAIL_ADDRESS_FROM'),
                defaultReplyTo: env('EMAIL_ADDRESS_REPLY'),
            },
        },
    },
    'import-export-entries': {
        enabled: true,
        config: {
            // See `Config` section.
        },
    },
    'strapi-plugin-populate-deep': {
        config: {
            defaultDepth: 5, // Default is 5
        }
    },
    'rest-cache': {
        config: {
            provider: {
                name: "memory",
                options: {
                    max: 32767,
                    maxAge: 3600,
                },
            },
            strategy: {
                contentTypes: [
                    // list of Content-Types UID to cache
                    // "api::category.category",
                    // "api::article.article",
                    // "api::global.global",
                    // "api::homepage.homepage",
                ],
            },
        },
    },
    seo: {
        enabled: true,
    },
});
