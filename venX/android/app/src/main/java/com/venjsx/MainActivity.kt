package com.venjsx

import android.os.Build
import android.os.Bundle
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.venjsx.core.VenjsXEngine

class MainActivity : AppCompatActivity() {
  private var bridgeWebView: WebView? = null
  private var nativeRoot: FrameLayout? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    // Drop launch/splash theme immediately so it doesn't linger while JS boots.
    setTheme(R.style.Theme_Venjsx_App)
    super.onCreate(savedInstanceState)
    window.statusBarColor = Color.parseColor("#FFFFFF")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      window.navigationBarColor = Color.parseColor("#FFFFFF")
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      window.decorView.systemUiVisibility = window.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
    }

    val appHost = FrameLayout(this).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    nativeRoot = FrameLayout(this).apply {
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    bridgeWebView = WebView(this).apply {
      layoutParams = FrameLayout.LayoutParams(1, 1)
      visibility = View.GONE
    }

    configureBridgeWebView(bridgeWebView!!)
    bridgeWebView!!.addJavascriptInterface(VenjsXEngine(this, nativeRoot!!, bridgeWebView!!), "Android")
    bridgeWebView!!.loadUrl("file:///android_asset/app/index.html")

    appHost.addView(nativeRoot)
    appHost.addView(bridgeWebView)
    setContentView(appHost)
  }

  private fun configureBridgeWebView(webView: WebView) {
    val settings = webView.settings
    settings.javaScriptEnabled = true
    settings.domStorageEnabled = true
    settings.allowFileAccess = true
    settings.allowContentAccess = true

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
      settings.allowFileAccessFromFileURLs = true
      settings.allowUniversalAccessFromFileURLs = true
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
    }

    webView.webViewClient = WebViewClient()
    webView.webChromeClient = WebChromeClient()
  }

  override fun onDestroy() {
    bridgeWebView?.let {
      it.removeJavascriptInterface("Android")
      it.destroy()
    }
    bridgeWebView = null
    nativeRoot = null
    super.onDestroy()
  }
}
