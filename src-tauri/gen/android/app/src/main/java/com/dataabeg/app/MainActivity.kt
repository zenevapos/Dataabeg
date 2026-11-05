package com.dataabeg.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    webView.settings.domStorageEnabled = true
    webView.settings.javaScriptEnabled = true
    webView.settings.javaScriptCanOpenWindowsAutomatically = true

    webView.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false
        return handleCustomUri(view, url)
      }

      @Deprecated("Deprecated in Java")
      override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
        if (url == null) return false
        return handleCustomUri(view, url)
      }

      private fun handleCustomUri(view: WebView?, url: String): Boolean {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return false
        }

        try {
          val intent = if (url.startsWith("intent://")) {
            Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
          } else {
            Intent(Intent.ACTION_VIEW, Uri.parse(url))
          }

          if (intent != null) {
            intent.addCategory(Intent.CATEGORY_BROWSABLE)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            val pm = packageManager
            if (intent.resolveActivity(pm) != null) {
              startActivity(intent)
              return true
            } else {
              val fallbackUrl = intent.getStringExtra("browser_fallback_url")
              if (fallbackUrl != null && fallbackUrl.startsWith("http")) {
                view?.loadUrl(fallbackUrl)
                return true
              }
              if (url.startsWith("btravel://") || url.startsWith("opay://")) {
                val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=team.opay.pay"))
                marketIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                if (marketIntent.resolveActivity(pm) != null) {
                  startActivity(marketIntent)
                  return true
                }
              }
            }
          }
        } catch (e: Exception) {
          e.printStackTrace()
        }
        return true
      }
    }
  }
}
