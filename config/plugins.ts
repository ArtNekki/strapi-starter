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
    upload: {
        config: {
            provider: 'cloudinary',
            providerOptions: {
                cloud_name: env('CLOUDINARY_NAME'),
                api_key: env('CLOUDINARY_KEY'),
                api_secret: env('CLOUDINARY_SECRET'),
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            },
        },
    },
});
