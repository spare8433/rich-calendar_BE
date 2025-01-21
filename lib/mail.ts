import nodemailer from "nodemailer";
import { CustomError } from "./customError";

type GmailOption = {
  to: string; // 수신할 이메일
  subject: string; // 메일 제목
  text: string; // 메일 내용
};

function sendGmail(options: GmailOption) {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    secure: true,
    requireTLS: true,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // 메일 옵션
  const mailOptions = {
    from: process.env.SEND_EMAIL, // 보내는 메일의 주소
    ...options,
  };

  // 메일 발송
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw new CustomError("Server Error", 500);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

export default sendGmail;
