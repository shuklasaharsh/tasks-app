const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API

sgMail.setApiKey(sendgridAPIKey)
const sendWelcomeEmail = async (email, name) => {
    const response = await sgMail.send({
        to: email,
        from: 'shukla.saharsh7.work@gmail.com',
        subject: 'This is my first mail',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
    return response
}

const sendDeletionEmail = async (email, name) => {
    const response = await sgMail.send({
        to: email,
        from: 'shukla.saharsh7.work@gmail.com',
        subject: 'We are sorry to see you leave',
        text: `Goodbye, ${name},\nPlease leave us with your valuable feedback`
    })

    return response
}

module.exports = {
    sendWelcomeEmail,
    sendDeletionEmail
}



