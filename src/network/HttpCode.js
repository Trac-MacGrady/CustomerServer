const HttpCode = {
    SUCCESS: 1, // http 请求成功
    ERROR: -1, // http 请求失败
    FAIL: -2, // http请求返回500或404等，fetch不会走到error
};

export default HttpCode;