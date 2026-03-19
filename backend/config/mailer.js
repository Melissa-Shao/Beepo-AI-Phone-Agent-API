const { Resend } = require('resend');

// lazy initialization
let _resend;
module.exports = {
  get resend() {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
  }
};