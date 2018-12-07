package com.customerserver.customer;

import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hyphenate.chat.ChatClient;
import com.hyphenate.helpdesk.Error;
import com.hyphenate.helpdesk.callback.Callback;

/**
 * Created by wh on 2018/11/21.
 */

public class CustomerSetModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private ReactApplicationContext mContext;
    private String TAG = "CustomerSetModule";
    public CustomerSetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "CustomerSetModule";
    }


    /**
     * 可以检测是否已经登录过环信，如果登录过则环信SDK会自动登录，不需要再次调用登录操作
     * 登录之后再显示对话页面，要不可能出现问题
     */
    @ReactMethod
    public void setCustomerAccout(String account, String password, Promise promise) {
        Log.e("CustomerSetModule", "setCustomerAccout");
        if (ChatClient.getInstance().isLoggedInBefore()) {
            Log.e("CustomerSetModule", "setCustomerAccout: " + ChatClient.getInstance().isLoggedInBefore());
            // 已经登录
            String  login = "true";
            WritableMap map = Arguments.createMap();
            map.putString("isLogin", login);
            promise.resolve(map);
        } else {
            //创建一个用户并登录环信服务器
            createAccountAndLoginChatServer(account, password, promise);
            Log.e("CustomerSetModule", "createAccountAndLoginChatServer");
        }
    }

    private void createAccountAndLoginChatServer(final String account, final String password, final Promise promise) {
        ChatClient.getInstance().register(account, password, new Callback() {
            @Override
            public void onSuccess() {
                Log.e(TAG, "onSuccess");
                login(account, password, promise);
            }

            @Override
            public void onError(final int errorCode, String error) {
                Log.e(TAG, "onError: " + errorCode);
                if (errorCode == Error.NETWORK_ERROR){
                    // 网络问题
                }else if (errorCode == Error.USER_ALREADY_EXIST){
                    //已经注册 尝试登陆
                    login(account, password, promise);
                }else if(errorCode == Error.USER_AUTHENTICATION_FAILED){
                    //未认证
                } else if (errorCode == Error.USER_ILLEGAL_ARGUMENT){
                    // 注册失败
                }else {
                    //注册失败
                }

            }

            @Override
            public void onProgress(int progress, String status) {
                Log.e(TAG, "onProgress: " + progress);
            }
        });
    }

    /**
     * login huanxin server
     * @param uname
     * @param upwd
     */
    private void login(final String uname, final String upwd, final Promise promise) {
        ChatClient.getInstance().login(uname, upwd, new Callback() {
            @Override
            public void onSuccess() {
                //登录成功
                String  login = "true";
                WritableMap map = Arguments.createMap();
                map.putString("isLogin", login);
                promise.resolve(map);
            }

            @Override
            public void onError(int code, String error) {

            }

            @Override
            public void onProgress(int progress, String status) {

            }
        });
    }

    @Override
    public void onHostResume() {
        Log.e(TAG, "onHostResume");
        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onResume", "true");
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }

}
