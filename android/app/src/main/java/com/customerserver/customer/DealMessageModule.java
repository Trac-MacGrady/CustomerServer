package com.customerserver.customer;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

import com.customerserver.common.CommonUtils;
import com.customerserver.common.Constant;
import com.customerserver.common.ImageCache;
import com.customerserver.common.Preferences;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hyphenate.chat.ChatClient;
import com.hyphenate.chat.ChatManager;
import com.hyphenate.chat.EMFileMessageBody;
import com.hyphenate.chat.EMImageMessageBody;
import com.hyphenate.chat.EMTextMessageBody;
import com.hyphenate.chat.Message;
import com.hyphenate.helpdesk.model.ContentFactory;
import com.hyphenate.helpdesk.model.VisitorInfo;
import com.hyphenate.util.DensityUtil;
import com.hyphenate.util.ImageUtils;

import java.io.File;
import java.util.List;

/**
 * Created by root on 2018/11/22.
 */

public class DealMessageModule extends ReactContextBaseJavaModule {
    private String TAG = "DealMessageModule";
    private ReactApplicationContext mContext;
    private com.hyphenate.helpdesk.callback.Callback messageReceiveCallback;

    public DealMessageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        ChatClient.getInstance().chatManager().bindChat(Constant.IM_SERVICE_NUMBER);
        receiveMessageListener();
        Log.e(TAG, "DealMessageModule");
    }

    @Override
    public String getName() {
        return "DealMessageModule";
    }

    /**
     * 发送消息
     */
    @ReactMethod
    public void sendTextMessage(String strMessage, Promise promise) {
        Message message = Message.createTxtSendMessage(strMessage, Constant.IM_SERVICE_NUMBER);
        String sendMessageId = message.getMsgId();
        message.addContent(createVisitorInfo());
        ChatClient.getInstance().chatManager().sendMessage(message);
        WritableMap map = Arguments.createMap();
        map.putString("sendMessages",sendMessageId);
        promise.resolve(map);
    }

    /**
     * 发送图片消息
     */
    @ReactMethod
    public void sendImageMessage(String imagePath, Promise promise) {
        if (imagePath.startsWith("file:///storage/emulated/0")) {
            imagePath = Environment.getExternalStorageDirectory().getPath() + imagePath.substring(26);
        }
        Message message = Message.createImageSendMessage(imagePath, false, Constant.IM_SERVICE_NUMBER);
        Log.d(TAG, "message: " + message);
         String sendMessageId = message.getMsgId();
        message.addContent(createVisitorInfo());
        ChatClient.getInstance().chatManager().sendMessage(message);
        WritableMap map = Arguments.createMap();
        map.putString("sendMessages",sendMessageId);
        promise.resolve(map);
    }

    private VisitorInfo createVisitorInfo() {
        VisitorInfo info = ContentFactory.createVisitorInfo(null);
        info.nickName("wanghong")
                .name("hwnag")
                .qq("10000")
                .phone("15811200000")
                .companyName("easemob")
                .description("")
                .email("abc@123.com");
        return info;
    }

    /**
     * 注册消息监听
     */
    public void receiveMessageListener() {
        ChatClient.getInstance().getChat().addMessageListener(new ChatManager.MessageListener() {
            @Override
            public void onCmdMessage(List<Message> list) {
                //收到命令消息，命令消息不存数据库，一般用来作为系统通知，例如留言评论更新，
                //会话被客服接入，被转接，被关闭提醒
                Log.e(TAG, "会话被客服接入，被转接，被关闭提醒");
            }

            @Override
            public void onMessage(List<Message> msgs) {
                //收到普通消息
                for (Message message : msgs) {
                    switch (message.getType()) {
                        case TXT:
                            receiveTextMessage(message);
                            break;
                        case IMAGE:
                            receiveImageMessage(message);
                            break;
                        case VOICE:
                            break;

                        default:
                            break;
                    }
                }
            }

            @Override
            public void onMessageStatusUpdate() {
                //消息的状态修改，一般可以用来刷新列表，显示最新的状态
                Log.e(TAG, "消息的状态修改，一般可以用来刷新列表，显示最新的状态");
            }

            @Override
            public void onMessageSent() {
                //发送消息后，会调用，可以在此刷新列表，显示最新的消息
                Log.e(TAG, "发送消息后，会调用，可以在此刷新列表，显示最新的消息");
            }
        });
    }

    private void receiveTextMessage(Message message) {
        String username = message.from();
        Log.e(TAG, "message: " + ((EMTextMessageBody)message.body()).getMessage());
        //如果是当前会话的消息，刷新聊天页面
        if (username != null && username.equals(Constant.IM_SERVICE_NUMBER)) {
            String receiveMessage =  ((EMTextMessageBody)message.body()).getMessage();
            String messageId = message.getMsgId();
            WritableMap map = Arguments.createMap();
            map.putString("textMessage",receiveMessage);
            map.putString("messageId",messageId);
            mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("receiveTextMessage", map);
        }
    }

    private void receiveImageMessage(Message message) {
        EMImageMessageBody imgBody = (EMImageMessageBody) message.body();
        String filePath = imgBody.getRemoteUrl();
        Log.e(TAG, "remoteUrl: " + filePath);
        if (filePath != null) {
            int imageWidth = imgBody.getWidth();
            int imageHeight = imgBody.getHeight();
            WritableMap map = Arguments.createMap();
            map.putString("imageMessage",filePath);
            map.putString("messageId",message.getMsgId());
            map.putInt("imageWidth",imageWidth);
            map.putInt("imageHeight",imageHeight);
            mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("receiveImageMessage", map);
        }
    }
}
