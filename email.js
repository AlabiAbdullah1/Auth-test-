const nodemailer= require('nodemailer')

const sendEmail= async options=>{
    //Create A TARNSPORTER
 
    const transporter= nodemailer.createTransport({
        service:'gmail',
        host:'smpt.gmail.com',
        port:465,
    auth:{
        user:'sikeabdulnig@gmail.com',
        pass:'fdyvlpfxuplojszd'
    }

    })

    // 2)Define the Email options
    const mailOption={
        from:'sikebadulnig@gmail.com',
        to:options.email,
        subject: options.subject,
        text:options.message
    }   


    // 3)Send the email with nodemailer
    await transporter.sendMail(mailOption)
}

module.exports= sendEmail