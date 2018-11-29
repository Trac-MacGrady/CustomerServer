package com.customerserver;

import android.app.Application;
import android.util.Log;

import com.customerserver.customer.CustomerSetPackage;
import com.customerserver.customer.DealMessagePackage;
import com.facebook.react.BuildConfig;
import com.facebook.react.ReactApplication;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.hyphenate.chat.ChatClient;
import com.customerserver.common.Constant;
import com.customerserver.common.Preferences;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
              new PickerPackage(),
              new CustomerSetPackage(),
              new DealMessagePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // 初始化 环信
    ChatClient.Options options = new ChatClient.Options();
    options.setAppkey(Constant.IM_APP_KEY);
    options.setTenantId(Constant.IM_TENANT_ID);
    options.setConsoleLog(true);

    boolean register = ChatClient.getInstance().init(this, options);
    Log.e("MainApplication", "register: " + register);
    Preferences.init(this);

  }
}
