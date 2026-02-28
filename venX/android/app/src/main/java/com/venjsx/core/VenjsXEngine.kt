package com.venjsx.core

import android.app.Activity
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Outline
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.text.Editable
import android.text.TextWatcher
import android.util.LruCache
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread
import kotlin.math.max
import kotlin.math.min

class VenjsXEngine(
  private val context: Context,
  private val rootLayout: ViewGroup,
  private val bridge: WebView
) {
  companion object {
    private const val ANIM_SIGNATURE_TAG_KEY = 0x7F0B1001
    private const val USE_RECONCILIATION = false
  }

  private data class VNode(
    val tag: String,
    val props: JSONObject,
    val style: JSONObject?,
    val children: List<VNode>
  )

  private var mountedScrollView: ScrollView? = null
  private var mountedRootView: View? = null
  private var previousTree: VNode? = null

  private val imageCache: LruCache<String, Bitmap> = run {
    val maxKb = (Runtime.getRuntime().maxMemory() / 1024).toInt()
    val cacheKb = max(1024, maxKb / 8)
    object : LruCache<String, Bitmap>(cacheKb) {
      override fun sizeOf(key: String, value: Bitmap): Int = value.byteCount / 1024
    }
  }

  @JavascriptInterface
  fun processUINode(json: String) {
    try {
      val parsed = parseNode(JSONObject(json))
      (context as Activity).runOnUiThread {
        try {
          if (!USE_RECONCILIATION) {
            mountFreshTree(parsed)
            return@runOnUiThread
          }

          val oldTree = previousTree
          val oldRoot = mountedRootView
          val scroll = mountedScrollView

          if (oldTree == null || oldRoot == null || scroll == null) {
            mountFreshTree(parsed)
            return@runOnUiThread
          }

          val reconciled = reconcileNode(
            parent = scroll,
            currentView = oldRoot,
            oldNode = oldTree,
            newNode = parsed,
            indexInParent = 0
          )

          if (reconciled !== oldRoot) {
            if (scroll.childCount > 0) {
              scroll.removeViewAt(0)
            }
            scroll.addView(reconciled, 0)
          }

          mountedRootView = reconciled
          previousTree = parsed
        } catch (e: Exception) {
          // Reconciliation errors should not crash user interactions.
          e.printStackTrace()
          mountFreshTree(parsed)
        }
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  private fun mountFreshTree(tree: VNode) {
    rootLayout.removeAllViews()
    val rendered = renderNode(tree)
    val scrollView = ScrollView(context).apply {
      setFillViewport(true)
      isSmoothScrollingEnabled = true
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      addView(rendered)
    }
    rootLayout.addView(scrollView)
    mountedScrollView = scrollView
    mountedRootView = rendered
    previousTree = tree
  }

  private fun parseNode(raw: JSONObject): VNode {
    val tag = raw.optString("tag", "div")
    val props = raw.optJSONObject("props") ?: JSONObject()
    val style = props.optJSONObject("style")
    val childrenRaw = raw.optJSONArray("children") ?: JSONArray()
    val children = ArrayList<VNode>(childrenRaw.length())
    for (i in 0 until childrenRaw.length()) {
      val child = childrenRaw.optJSONObject(i) ?: continue
      children.add(parseNode(child))
    }
    return VNode(tag, props, style, children)
  }

  private fun reconcileNode(
    parent: ViewGroup,
    currentView: View,
    oldNode: VNode,
    newNode: VNode,
    indexInParent: Int
  ): View {
    if (oldNode.tag != newNode.tag || !isViewCompatibleWithTag(currentView, oldNode.tag)) {
      return renderNode(newNode)
    }

    val oldProps = oldNode.props.toString()
    val newProps = newNode.props.toString()
    val childrenChanged = oldNode.children.size != newNode.children.size

    // Input node keeps a TextWatcher. Recreate only when props change to avoid duplicate listeners.
    if (newNode.tag == "input" && oldProps != newProps) {
      return renderNode(newNode)
    }

    // Only skip when this is a true leaf node with identical props.
    // Parent-level shallow checks can miss deep changes (route/content updates).
    if (oldProps == newProps && !childrenChanged && oldNode.children.isEmpty() && newNode.children.isEmpty()) {
      return currentView
    }

    bindView(currentView, newNode)

    if (currentView is ViewGroup) {
      val common = min(oldNode.children.size, newNode.children.size)
      for (i in 0 until common) {
        val childView = currentView.getChildAt(i) ?: run {
          return renderNode(newNode)
        }
        val updated = reconcileNode(
          parent = currentView,
          currentView = childView,
          oldNode = oldNode.children[i],
          newNode = newNode.children[i],
          indexInParent = i
        )
        if (updated !== childView) {
          currentView.removeViewAt(i)
          currentView.addView(updated, i)
        }
      }

      if (newNode.children.size > oldNode.children.size) {
        for (i in oldNode.children.size until newNode.children.size) {
          currentView.addView(renderNode(newNode.children[i]))
        }
      } else if (newNode.children.size < oldNode.children.size) {
        for (i in oldNode.children.size - 1 downTo newNode.children.size) {
          currentView.removeViewAt(i)
        }
      }
    }

    return currentView
  }

  private fun isViewCompatibleWithTag(view: View, tag: String): Boolean {
    return when (tag) {
      "button" -> view is Button
      "text" -> view is TextView
      "input" -> view is EditText
      "image" -> view is ImageView
      "activityIndicator" -> view is ProgressBar
      else -> view is LinearLayout
    }
  }

  private fun renderNode(node: VNode): View {
    if (node.tag == "div" && node.style?.optString("overflowX", "") == "scroll") {
      val horizontalScroll = HorizontalScrollView(context).apply {
        isHorizontalScrollBarEnabled = false
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.WRAP_CONTENT
        )
      }
      val content = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
      }

      setupClickEvent(horizontalScroll, node.props, node.tag)
      applyBaseStyle(horizontalScroll, node.style)
      applyAnimation(horizontalScroll, node.style)

      if (node.children.isNotEmpty()) {
        for (child in node.children) {
          content.addView(renderNode(child))
        }
      }

      horizontalScroll.addView(content)
      return horizontalScroll
    }

    val view = when (node.tag) {
      "button" -> Button(context)
      "text" -> TextView(context)
      "input" -> EditText(context)
      "image" -> ImageView(context).apply { scaleType = ImageView.ScaleType.CENTER_CROP }
      "activityIndicator" -> ProgressBar(context).apply { isIndeterminate = true }
      else -> LinearLayout(context)
    }

    bindView(view, node)

    if (view is ViewGroup && node.children.isNotEmpty()) {
      for (child in node.children) {
        view.addView(renderNode(child))
      }
    }

    return view
  }

  private fun bindView(view: View, node: VNode) {
    when (node.tag) {
      "button" -> {
        val btn = view as Button
        btn.text = node.props.optString("textContent", "")
        btn.isAllCaps = false
        applyTextStyle(btn, node.style)
        setupClickEvent(btn, node.props, node.tag)
      }

      "text" -> {
        val tv = view as TextView
        tv.text = node.props.optString("textContent", "")
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
        applyTextStyle(tv, node.style)
        setupClickEvent(tv, node.props, node.tag)
      }

      "input" -> {
        val input = view as EditText
        val nextHint = node.props.optString("placeholder", "")
        if (input.hint?.toString() != nextHint) {
          input.hint = nextHint
        }
        val nextValue = node.props.optString("value", "")
        if (input.text?.toString() != nextValue) {
          input.setText(nextValue)
          input.setSelection(input.text?.length ?: 0)
        }
        applyTextStyle(input, node.style)
        setupChangeEvent(input, node.props, node.tag)
        setupClickEvent(input, node.props, node.tag)
      }

      "image" -> {
        val image = view as ImageView
        val src = node.props.optString("src", "")
        if ((image.tag as? String) != src) {
          image.tag = src
          loadImageSource(image, src)
        }
        setupClickEvent(image, node.props, node.tag)
      }

      "activityIndicator" -> {
        setupClickEvent(view, node.props, node.tag)
      }

      else -> {
        val layout = view as LinearLayout
        val direction = node.style?.optString("flexDirection", "column") ?: "column"
        layout.orientation = if (direction == "row") LinearLayout.HORIZONTAL else LinearLayout.VERTICAL
        setupClickEvent(layout, node.props, node.tag)
      }
    }

    applyBaseStyle(view, node.style)
    applyAnimation(view, node.style)
  }

  private fun setupClickEvent(view: View, props: JSONObject, tag: String) {
    val events = props.optJSONObject("events")
    val clickEventId = events?.optInt("click", -1) ?: -1
    if (clickEventId <= 0) {
      view.setOnClickListener(null)
      view.isClickable = false
      return
    }

    view.isClickable = true
    view.setOnClickListener {
      try {
        val payload = JSONObject().apply {
          put("type", "click")
          put("tag", tag)
          put("platform", "android")
          put("timestamp", System.currentTimeMillis())
        }
        emitEvent(clickEventId, payload)
      } catch (_: Exception) {
      }
    }
  }

  private fun setupChangeEvent(input: EditText, props: JSONObject, tag: String) {
    val events = props.optJSONObject("events") ?: return
    if (!events.has("change")) return
    val changeEventId = events.optInt("change", -1)
    if (changeEventId <= 0) return

    input.addTextChangedListener(object : TextWatcher {
      override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

      override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
        try {
          val payload = JSONObject().apply {
            put("type", "change")
            put("tag", tag)
            put("platform", "android")
            put("value", s?.toString() ?: "")
            put("timestamp", System.currentTimeMillis())
          }
          emitEvent(changeEventId, payload)
        } catch (_: Exception) {
        }
      }

      override fun afterTextChanged(s: Editable?) {}
    })
  }

  private fun loadImageSource(imageView: ImageView, src: String?) {
    if (src.isNullOrBlank()) return
    val source = src.trim()

    imageCache.get(source)?.let {
      imageView.setImageBitmap(it)
      return
    }

    if (source.startsWith("http://") || source.startsWith("https://")) {
      thread(start = true) {
        var connection: HttpURLConnection? = null
        try {
          val url = URL(source)
          connection = url.openConnection() as HttpURLConnection
          connection.doInput = true
          connection.connect()
          val bytes = connection.inputStream.use { it.readBytes() }
          val bitmap = decodeSampledBitmap(bytes, 1080, 720)
          if (bitmap != null) {
            imageCache.put(source, bitmap)
            (context as Activity).runOnUiThread { imageView.setImageBitmap(bitmap) }
          }
        } catch (_: Exception) {
        } finally {
          connection?.disconnect()
        }
      }
      return
    }

    thread(start = true) {
      val bitmap = loadAssetBitmap(source)
      if (bitmap != null) {
        imageCache.put(source, bitmap)
        (context as Activity).runOnUiThread { imageView.setImageBitmap(bitmap) }
      }
    }
  }

  private fun loadAssetBitmap(source: String): Bitmap? {
    val candidates = listOf(
      source,
      if (source.startsWith("./")) source.substring(2) else source,
      if (source.startsWith("images/")) "app/$source" else source,
      if (source.startsWith("./images/")) "app/${source.substring(2)}" else source,
      if (source.startsWith("app/")) source.substring(4) else source
    )

    for (candidate in candidates) {
      if (candidate.isBlank()) continue
      try {
        context.assets.open(candidate).use { input ->
          val bytes = input.readBytes()
          val bitmap = decodeSampledBitmap(bytes, 1080, 720)
          if (bitmap != null) return bitmap
        }
      } catch (_: Exception) {
      }
    }
    return null
  }

  private fun emitEvent(eventId: Int, payload: JSONObject) {
    val js = "window.__venjsDispatchNativeEvent && window.__venjsDispatchNativeEvent($eventId, $payload);"
    (context as Activity).runOnUiThread {
      bridge.evaluateJavascript(js, null)
    }
  }

  private fun applyBaseStyle(view: View, style: JSONObject?) {
    if (style == null) return

    val hasRadius = style.has("borderRadius")
    val hasBackground = style.has("backgroundColor")
    val hasBorder = style.has("borderWidth") || style.has("borderColor")

    if (hasRadius || hasBackground || hasBorder) {
      val drawable = GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        setColor(parseColor(style.optString("backgroundColor", "#00000000")))
        if (hasRadius) {
          cornerRadius = dpF(styleFloat(style, "borderRadius", 0f))
        }
      }

      if (hasBorder) {
        val borderWidthPx = dp(styleInt(style, "borderWidth", 0))
        val borderColor = parseColor(style.optString("borderColor", "#00000000"))
        drawable.setStroke(borderWidthPx, borderColor)
      }

      view.background = drawable
    } else if (style.has("backgroundColor")) {
      view.setBackgroundColor(parseColor(style.optString("backgroundColor", "#00000000")))
    }

    val marginDp = styleInt(style, "margin", 0)
    val lp = LinearLayout.LayoutParams(
      sizeFromStyle(style, "width", ViewGroup.LayoutParams.MATCH_PARENT),
      sizeFromStyle(style, "height", ViewGroup.LayoutParams.WRAP_CONTENT)
    )
    lp.setMargins(
      dp(styleInt(style, "marginLeft", marginDp)),
      dp(styleInt(style, "marginTop", marginDp)),
      dp(styleInt(style, "marginRight", marginDp)),
      dp(styleInt(style, "marginBottom", marginDp))
    )
    view.layoutParams = lp

    if (style.has("borderRadius") && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      val radiusPx = dpF(styleFloat(style, "borderRadius", 0f))
      view.outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(v: View, outline: Outline) {
          outline.setRoundRect(0, 0, v.width, v.height, radiusPx)
        }
      }
      view.clipToOutline = true
    }

    applyPadding(view, style)
  }

  private fun applyTextStyle(view: TextView, style: JSONObject?) {
    if (style == null) return

    if (style.has("fontSize")) {
      view.setTextSize(TypedValue.COMPLEX_UNIT_SP, styleInt(style, "fontSize", 16).toFloat())
    }
    if (style.has("color")) {
      view.setTextColor(parseColor(style.optString("color", "#111111")))
    }
    when (style.optString("textAlign", "")) {
      "center" -> view.gravity = Gravity.CENTER_HORIZONTAL
      "right" -> view.gravity = Gravity.END
      else -> view.gravity = Gravity.START
    }
  }

  private fun sizeFromStyle(style: JSONObject?, key: String, fallback: Int): Int {
    if (style == null || !style.has(key)) return fallback

    val value = style.optString(key, "")
    if (value == "match" || value == "100%") return ViewGroup.LayoutParams.MATCH_PARENT
    if (value == "wrap" || value == "auto") return ViewGroup.LayoutParams.WRAP_CONTENT

    val base = if (fallback == ViewGroup.LayoutParams.MATCH_PARENT) 0 else 44
    return dp(styleInt(style, key, base))
  }

  private fun parseColor(value: String): Int {
    return try {
      Color.parseColor(value)
    } catch (_: Exception) {
      Color.TRANSPARENT
    }
  }

  private fun styleFloat(style: JSONObject?, key: String, fallback: Float): Float {
    if (style == null || !style.has(key)) return fallback
    return try {
      style.optString(key, fallback.toString())
        .replace("px", "")
        .trim()
        .toFloat()
    } catch (_: Exception) {
      fallback
    }
  }

  private fun styleInt(style: JSONObject?, key: String, fallback: Int): Int {
    if (style == null || !style.has(key)) return fallback
    return try {
      style.optString(key, fallback.toString())
        .replace("px", "")
        .trim()
        .toDouble()
        .toInt()
    } catch (_: Exception) {
      fallback
    }
  }

  private fun dp(value: Int): Int {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value.toFloat(),
      context.resources.displayMetrics
    ).toInt()
  }

  private fun dpF(value: Float): Float {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value,
      context.resources.displayMetrics
    )
  }

  private fun applyPadding(view: View, style: JSONObject) {
    val basePadding = styleInt(style, "padding", 0)
    val horizontal = styleInt(style, "paddingHorizontal", basePadding)
    val vertical = styleInt(style, "paddingVertical", basePadding)

    val left = dp(styleInt(style, "paddingLeft", horizontal))
    val right = dp(styleInt(style, "paddingRight", horizontal))
    val top = dp(styleInt(style, "paddingTop", vertical))
    val bottom = dp(styleInt(style, "paddingBottom", vertical))

    if (left != view.paddingLeft || top != view.paddingTop || right != view.paddingRight || bottom != view.paddingBottom) {
      view.setPadding(left, top, right, bottom)
    }
  }

  private fun applyAnimation(view: View, style: JSONObject?) {
    if (style == null) return

    val type = style.optString("animation", style.optString("animationType", "")).trim()
    val duration = styleInt(style, "animationDuration", 280).toLong().coerceAtLeast(0L)
    val delay = styleInt(style, "animationDelay", 0).toLong().coerceAtLeast(0L)
    val distance = dp(styleInt(style, "animationDistance", 18)).toFloat()
    val targetOpacity = styleFloat(style, "opacity", 1f).coerceIn(0f, 1f)

    val signature = "${type}|${duration}|${delay}|${distance}|${targetOpacity}"
    if (view.getTag(ANIM_SIGNATURE_TAG_KEY) == signature) return
    view.setTag(ANIM_SIGNATURE_TAG_KEY, signature)

    if (type.isEmpty()) {
      view.alpha = targetOpacity
      return
    }

    when (type.lowercase()) {
      "fade", "fadein" -> {
        view.alpha = 0f
        view.animate()
          .alpha(targetOpacity)
          .setDuration(duration)
          .setStartDelay(delay)
          .start()
      }

      "slideup" -> {
        view.alpha = 0f
        view.translationY = distance
        view.animate()
          .translationY(0f)
          .alpha(targetOpacity)
          .setDuration(duration)
          .setStartDelay(delay)
          .start()
      }

      "slidedown" -> {
        view.alpha = 0f
        view.translationY = -distance
        view.animate()
          .translationY(0f)
          .alpha(targetOpacity)
          .setDuration(duration)
          .setStartDelay(delay)
          .start()
      }

      "zoomin" -> {
        view.alpha = 0f
        view.scaleX = 0.92f
        view.scaleY = 0.92f
        view.animate()
          .alpha(targetOpacity)
          .scaleX(1f)
          .scaleY(1f)
          .setDuration(duration)
          .setStartDelay(delay)
          .start()
      }

      else -> {
        view.alpha = targetOpacity
      }
    }
  }

  private fun decodeSampledBitmap(bytes: ByteArray, reqWidth: Int, reqHeight: Int): Bitmap? {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

    val options = BitmapFactory.Options().apply {
      inSampleSize = calculateInSampleSize(bounds, reqWidth, reqHeight)
      inPreferredConfig = Bitmap.Config.RGB_565
      inDither = true
      inJustDecodeBounds = false
    }
    return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
  }

  private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
    var inSampleSize = 1
    val height = options.outHeight
    val width = options.outWidth

    if (height > reqHeight || width > reqWidth) {
      val halfHeight = height / 2
      val halfWidth = width / 2
      while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
        inSampleSize *= 2
      }
    }
    return max(1, inSampleSize)
  }
}
