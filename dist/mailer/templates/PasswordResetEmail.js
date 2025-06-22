"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const PasswordResetEmail = ({ logoUrl, firstName, resetLink, successLink }) => {
    return (react_1.default.createElement("html", { lang: "en" },
        react_1.default.createElement("head", null,
            react_1.default.createElement("meta", { charSet: "UTF-8" }),
            react_1.default.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            react_1.default.createElement("title", null, "Reset Your Password"),
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
            .button {
              display: inline-block;
              padding: 14px 30px;
              font-size: 16px;
              font-weight: 600;
              color: #ffffff;
              background: linear-gradient(90deg, #4d9c39, #7dbf72);
              border-radius: 25px;
              text-decoration: none;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
              box-shadow: 0 4px 10px rgba(77, 156, 57, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 15px rgba(77, 156, 57, 0.4);
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #999;
              background-color: #fafafa;
              borderterr-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
            }
          `)),
        react_1.default.createElement("body", null,
            react_1.default.createElement("div", { className: "container" },
                react_1.default.createElement("div", { className: "header" },
                    react_1.default.createElement("img", { src: logoUrl, alt: "Logo", style: { borderRadius: 12 } }),
                    react_1.default.createElement("h1", null, "Reset your password")),
                react_1.default.createElement("div", { className: "content" },
                    react_1.default.createElement("p", null,
                        "Hi ",
                        firstName,
                        ","),
                    react_1.default.createElement("p", null, "We received a request to reset your password. Click the button below to create a new password:"),
                    react_1.default.createElement("a", { style: { color: '#fff' }, href: `${resetLink}&successLink=${encodeURIComponent(successLink)}`, className: "button" }, "Reset Password"),
                    react_1.default.createElement("p", { style: { color: '#aaa', marginTop: 24 } }, "If you didn't request this, you can safely ignore this email."),
                    react_1.default.createElement("p", { style: { color: '#aaa' } }, "After resetting your password, you'll be redirected to our success page.")),
                react_1.default.createElement("div", { className: "footer" },
                    react_1.default.createElement("p", null, "This link will expire in 1 hour."),
                    react_1.default.createElement("p", null, "If you have any questions, please contact our support team."))))));
};
exports.default = PasswordResetEmail;
//# sourceMappingURL=PasswordResetEmail.js.map