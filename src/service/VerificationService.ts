var svgCaptcha = require("svg-captcha");
export default class VerificationService {
    public constructor() {}
    public getCode() {
        return svgCaptcha.create({
            // 翻转颜色
            inverse: false,
            // 字体大小
            fontSize: 36,
            // 噪声线条数
            noise: 2,
            // 宽度
            width: 80,
            // 高度
            height: 30
        });
    }
}
