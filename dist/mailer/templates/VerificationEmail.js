"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const VerificationEmail = ({ logoUrl, verificationCode }) => {
    return (react_1.default.createElement("html", { lang: "en" },
        react_1.default.createElement("head", null,
            react_1.default.createElement("meta", { charSet: "UTF-8" }),
            react_1.default.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            react_1.default.createElement("title", null, "Email Verification"),
            react_1.default.createElement("style", null, `
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f9;
              color: #333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }
            .header {
              padding: 20px;
              text-align: center;
              border-bottom: 1px solid #e0e0e0;
            }
            .header img {
              max-width: 100px;
              height: auto;
            }
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: #333;
              margin: 10px 0;
            }
            .content {
              padding: 30px;
              text-align: center;
            }
            .content p {
              font-size: 16px;
              line-height: 1.6;
              color: #666;
              margin: 0 0 20px;
            }
            .verification-code {
              display: inline-block;
              padding: 14px 30px;
              font-size: 24px;
              font-weight: 600;
              color: #ffffff;
              background: linear-gradient(90deg, #4d9c39, #7dbf72);
              border-radius: 25px;
              margin: 20px 0;
              box-shadow: 0 4px 10px rgba(77, 156, 57, 0.3);
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #999;
              background-color: #fafafa;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
            }
            .footer a {
              color: #4d9c39;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          `)),
        react_1.default.createElement("body", null,
            react_1.default.createElement("div", { className: "container" },
                react_1.default.createElement("div", { className: "header" },
                    react_1.default.createElement("img", { src: logoUrl, alt: "Logo" }),
                    react_1.default.createElement("h1", null, "Verify Your Email")),
                react_1.default.createElement("div", { className: "content" },
                    react_1.default.createElement("p", null, "Hi there,"),
                    react_1.default.createElement("p", null, "Thank you for signing up! To complete your account creation, please verify your email by entering the code below:"),
                    react_1.default.createElement("p", { style: { color: '#fff' }, className: "verification-code" }, verificationCode),
                    react_1.default.createElement("p", { style: { marginTop: '2rem', color: '#aaa' } }, "If you didn\u2019t request this, you can ignore this email.")),
                react_1.default.createElement("div", { className: "footer" },
                    react_1.default.createElement("p", null, "Flashfood team"),
                    react_1.default.createElement("p", null,
                        react_1.default.createElement("a", { href: "mailto:support@flashfood.com" }, "Contact Support")))))));
};
exports.default = VerificationEmail;
//# sourceMappingURL=VerificationEmail.js.map