import HttpCode from "../network/HttpCode";
import Host from "../network/Config";
import RNFetchBlob from 'react-native-fetch-blob'
import Toast from '../widget/Toast';

const CONTENT_TYPE = {
    multipart: 'multipart/form-data',
    urlencode: 'application/x-www-form-urlencoded;charset=UTF-8'
};

class HttpClient {
    static doPost(path, data, callback) {
        HttpClient.doRequest(path, "POST", data, callback);
    }

    static doGet(path, data, callback) {
        HttpClient.doRequest(path, "GET", data, callback)
    }

    static doRequest(path, method, data, callback) {
        console.log("请求路径：" + path);
        console.log("请求参数：" + JSON.stringify(data));

        let url = Host.address + path;
        console.log("url: " + url);
        let body = HttpClient.feedUrlForm(method, data);
        HttpClient.fire(body.method, url, body.headers, body.body, callback);
    }

    static feedUrlForm(method, args) {
        let body = Object.keys(args).map(key => key + '=' + args[key]).join('&');
        let header = {
            'Content-Type': CONTENT_TYPE.urlencode
        };

        console.log("body:" + body.toString());
        return HttpClient.fill(method, header, body);
    }

    static fill(method, header, body) {
        return {
            method: method,
            headers: header,
            body: body
        };
    }

    static fire(method, url, header, body, callback) {
        RNFetchBlob
            .config({timeout:60*1000})
            .fetch(method, url, header, body).then((response) => {
            if (response.info().status === 200) {
                console.log("response: " +  200);
                return response.text();
            } else if (response.info().status === 404) {
                Toast.show("404 Not Found", Toast.SHORT);
            } else if (response.info().status === 500) {
                Toast.show("服务器遇到麻烦了~", Toast.SHORT);
            } else {
                let error = new Error("response.statusText");
              console.log("response.statusText");
                error.response = response;
                throw error
            }
        })
            .then((responseText) => {
                console.log("请求结果：" + responseText);
                callback(HttpCode.SUCCESS, JSON.parse(responseText));
            })
            .catch((error) => {
              console.log("异常结果：" + JSON.stringify(error));
              callback(HttpCode.ERROR, error);
            });
    }
}

export default HttpClient;