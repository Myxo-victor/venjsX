package com.venjsx

import android.os.Build
import android.os.Bundle
import android.graphics.Color
import androidx.appcompat.app.AlertDialog
import android.view.View
import android.view.ViewGroup
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
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

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val webView = bridgeWebView
        if (webView == null) {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
          isEnabled = true
          return
        }

        webView.evaluateJavascript(
          "(function(){try{return (window.__venjsHandleNativeBack && window.__venjsHandleNativeBack()) ? '1' : '0';}catch(e){return '0';}})();"
        ) { result ->
          val normalized = result?.replace("\"", "")?.trim()
          val consumed = normalized == "1" || normalized.equals("true", ignoreCase = true)
          if (!consumed) {
            isEnabled = false
            onBackPressedDispatcher.onBackPressed()
            isEnabled = true
          }
        }
      }
    })
  }

  private fun configureBridgeWebView(webView: WebView) {
    val settings = webView.settings
    settings.javaScriptEnabled = true
    settings.domStorageEnabled = true
    settings.allowFileAccess = true
    settings.allowContentAccess = true
    // Always fetch fresh local assets during development.
    settings.cacheMode = WebSettings.LOAD_NO_CACHE

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
      settings.allowFileAccessFromFileURLs = true
      settings.allowUniversalAccessFromFileURLs = true
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
    }

    webView.webViewClient = WebViewClient()
    webView.webChromeClient = object : WebChromeClient() {
      override fun onJsAlert(
        view: WebView?,
        url: String?,
        message: String?,
        result: JsResult?
      ): Boolean {
        AlertDialog.Builder(this@MainActivity)
          .setTitle("Message")
          .setMessage(message ?: "")
          .setCancelable(false)
          .setPositiveButton("OK") { _, _ ->
            result?.confirm()
          }
          .setOnCancelListener {
            result?.cancel()
          }
          .show()
        return true
      }
    }
    webView.clearCache(true)
    webView.clearHistory()
    webView.clearFormData()
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
