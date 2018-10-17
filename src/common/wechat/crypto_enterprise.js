const crypto = require('crypto');

/**
 * 提供基于PKCS7算法的加解密接口
 *
 */
class PKCS7Encoder {
  /**
   * 对需要加密的明文进行填充补位
   * @param {Buffer} buffer 需要进行填充补位操作的明文
   */
  static encode(buffer) {
    let blockSize = 32;
    let textLength = buffer.length;
    //计算需要填充的位数
    let amountToPad = blockSize - (textLength % blockSize);

    let result = new Buffer(amountToPad);
    result.fill(amountToPad);

    return Buffer.concat([buffer, result]);
  }

  /**
   * 删除解密后明文的补位字符
   * @param {Buffer} buffer 解密后的明文
   */
  static decode(buffer) {
    let pad = buffer[buffer.length - 1];

    if (pad < 1 || pad > 32) {
      pad = 0;
    }

    return buffer.slice(0, buffer.length - pad);
  }
}

const ID = Symbol('ID');
const TOKEN = Symbol('TOKEN');
const AESKey = Symbol('AESKey');
const AESVi = Symbol('AESVi');

class WeChatEnterpriseCrypto {
  /**
   * 微信企业平台加解密信息构造函数
   *
   * @param {Object} obj
   * @param {Object} obj.id - 企业号的CorpId或者AppId
   * @param {Object} obj.token - 公众平台上，开发者设置的Token
   * @param {Object} obj.encodingAESKey - 公众平台上，开发者设置的EncodingAESKey
   */
  constructor({id, token, encodingAESKey}) {
    if (!token || !encodingAESKey || !id) {
      throw new Error('please check arguments');
    }

    this[ID] = id;
    this[TOKEN] = token;
    this[AESKey] = new Buffer(`${encodingAESKey}=`, 'base64');

    if (this[AESKey].length !== 32) {
      throw new Error('encodingAESKey invalid');
    }

    this[AESVi] = this[AESKey].slice(0, 16);
  }

  /**
   * 获取签名，对所有字段值进行字典排序再做 SHA1 算法
   *
   * @param {Object} model - 参与计算的键值对
   * @return {String} 签名
   */
  getSignature(model) {
    let str = Object
      .keys(model)
      .map(key => model[key])
      .concat([this[TOKEN]])
      .sort()
      .join('');

    return crypto.createHash('sha1').update(str).digest('hex');
  }

  /**
   * 对明文进行加密
   *
   * @param {String} text - 待加密的明文
   * @return {String} 加密字符串
   */
  encrypt(text) {
    // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
    // 获取16B的随机字符串
    let randomString = crypto.pseudoRandomBytes(16);

    let msg = new Buffer(text);

    // 获取4B的内容长度的网络字节序
    let msgLength = new Buffer(4);
    msgLength.writeUInt32BE(msg.length, 0);

    let id = new Buffer(this[ID]);

    let bufMsg = Buffer.concat([randomString, msgLength, msg, id]);

    // 对明文进行补位操作
    let encoded = PKCS7Encoder.encode(bufMsg);

    // 创建加密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    let cipher = crypto.createCipheriv('aes-256-cbc', this[AESKey], this[AESVi]);
    cipher.setAutoPadding(false);

    let cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

    // 返回加密数据的base64编码
    return cipheredMsg.toString('base64');
  }

  /**
   * 对密文进行解密
   *
   * @param {String} text - 待解密的密文
   * @return {Object} 解密的对象
   */
  decrypt(text) {
    // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    let decipher = crypto.createDecipheriv('aes-256-cbc', this[AESKey], this[AESVi]);
    decipher.setAutoPadding(false);

    let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

    // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
    // 删除解密后明文的补位字符，去除16位随机数
    let content = PKCS7Encoder.decode(deciphered).slice(16);
    let length = content.slice(0, 4).readUInt32BE(0);

    return {
      message: content.slice(4, length + 4).toString(),
      id: content.slice(length + 4).toString()
    };
  }
}

module.exports = WeChatEnterpriseCrypto;