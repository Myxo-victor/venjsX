import UIKit
import WebKit

class VenjsXEngine: NSObject, WKScriptMessageHandler {
  weak var rootViewController: UIViewController?
  weak var containerView: UIView?
  weak var bridgeWebView: WKWebView?

  private var eventMap: [ObjectIdentifier: [String: Int]] = [:]

  init(controller: UIViewController, container: UIView, bridgeWebView: WKWebView) {
    self.rootViewController = controller
    self.containerView = container
    self.bridgeWebView = bridgeWebView
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    if message.name == "processUINode", let jsonString = message.body as? String {
      if let data = jsonString.data(using: .utf8) {
        do {
          if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
            DispatchQueue.main.async {
              self.updateUI(with: json)
            }
          }
        } catch {
          print("venjsX Error: \(error)")
        }
      }
    }
  }

  private func updateUI(with node: [String: Any]) {
    guard let container = containerView else { return }
    eventMap.removeAll()
    container.subviews.forEach { $0.removeFromSuperview() }

    let nativeView = renderNode(node: node)
    nativeView.frame = container.bounds
    nativeView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    container.addSubview(nativeView)
  }

  private func renderNode(node: [String: Any]) -> UIView {
    let tag = node["tag"] as? String ?? "div"
    let props = node["props"] as? [String: Any] ?? [:]
    let style = props["style"] as? [String: Any] ?? [:]

    let view: UIView
    switch tag {
    case "button":
      let button = UIButton(type: .system)
      button.setTitle(props["textContent"] as? String ?? "", for: .normal)
      applyTextStyle(to: button.titleLabel, style: style)
      if let colorHex = style["color"] as? String {
        button.setTitleColor(parseColor(colorHex), for: .normal)
      }
      view = button
    case "text":
      let label = UILabel()
      label.text = props["textContent"] as? String ?? ""
      label.numberOfLines = 0
      applyTextStyle(to: label, style: style)
      view = label
    case "input":
      let field = UITextField()
      field.borderStyle = .roundedRect
      field.placeholder = props["placeholder"] as? String
      field.text = props["value"] as? String
      if let colorHex = style["color"] as? String {
        field.textColor = parseColor(colorHex)
      }
      if let size = style["fontSize"] {
        let fontSize = CGFloat(styleInt(["fontSize": size], "fontSize", defaultValue: 16))
        field.font = .systemFont(ofSize: fontSize)
      }
      view = field
    case "image":
      let imageView = UIImageView()
      imageView.clipsToBounds = true
      imageView.contentMode = .scaleAspectFill
      if let src = props["src"] as? String {
        loadImage(from: src, into: imageView)
      }
      view = imageView
    case "activityIndicator":
      let spinner = UIActivityIndicatorView(style: .medium)
      spinner.startAnimating()
      view = spinner
    default:
      let stack = UIStackView()
      stack.axis = (style["flexDirection"] as? String) == "row" ? .horizontal : .vertical
      stack.spacing = CGFloat(styleInt(style, "gap", defaultValue: 10))
      stack.alignment = mapAlignment(style["alignItems"] as? String)
      stack.distribution = .fill
      stack.isLayoutMarginsRelativeArrangement = true
      let padding = CGFloat(styleInt(style, "padding", defaultValue: 12))
      stack.layoutMargins = UIEdgeInsets(
        top: padding,
        left: padding,
        bottom: padding,
        right: padding
      )
      view = stack
    }

    applyBaseStyle(to: view, style: style)
    bindEventsIfPresent(view: view, props: props, tag: tag)

    if let children = node["children"] as? [[String: Any]] {
      for child in children {
        let childView = renderNode(node: child)
        if let stack = view as? UIStackView {
          stack.addArrangedSubview(childView)
        } else {
          view.addSubview(childView)
        }
      }
    }

    return view
  }

  private func bindEventsIfPresent(view: UIView, props: [String: Any], tag: String) {
    guard let events = props["events"] as? [String: Any] else { return }
    let key = ObjectIdentifier(view)
    var mapped: [String: Int] = [:]
    if let clickId = events["click"] as? Int, clickId > 0 {
      mapped["click"] = clickId
    }
    if let changeId = events["change"] as? Int, changeId > 0 {
      mapped["change"] = changeId
    }
    guard !mapped.isEmpty else { return }
    eventMap[key] = mapped

    if mapped["click"] != nil, let button = view as? UIButton {
      button.addTarget(self, action: #selector(handleButtonTap(_:)), for: .touchUpInside)
    }

    if mapped["click"] != nil, !(view is UIButton) {
      view.isUserInteractionEnabled = true
      let tap = UITapGestureRecognizer(target: self, action: #selector(handleViewTap(_:)))
      tap.name = tag
      view.addGestureRecognizer(tap)
    }

    if mapped["change"] != nil, let input = view as? UITextField {
      input.addTarget(self, action: #selector(handleInputChange(_:)), for: .editingChanged)
    }
  }

  @objc private func handleButtonTap(_ sender: UIButton) {
    emitEvent(for: sender, eventName: "click", tag: "button", extra: [:])
  }

  @objc private func handleViewTap(_ recognizer: UITapGestureRecognizer) {
    guard let view = recognizer.view else { return }
    emitEvent(for: view, eventName: "click", tag: recognizer.name ?? "view", extra: [:])
  }

  @objc private func handleInputChange(_ sender: UITextField) {
    emitEvent(
      for: sender,
      eventName: "change",
      tag: "input",
      extra: ["value": sender.text ?? ""]
    )
  }

  private func emitEvent(for view: UIView, eventName: String, tag: String, extra: [String: Any]) {
    let key = ObjectIdentifier(view)
    guard
      let events = eventMap[key],
      let eventId = events[eventName]
    else { return }

    var payload: [String: Any] = [
      "type": eventName,
      "tag": tag,
      "platform": "ios",
      "timestamp": Int(Date().timeIntervalSince1970 * 1000)
    ]
    extra.forEach { payload[$0.key] = $0.value }

    guard let data = try? JSONSerialization.data(withJSONObject: payload, options: []),
          let json = String(data: data, encoding: .utf8) else {
      return
    }

    let js = "window.__venjsDispatchNativeEvent && window.__venjsDispatchNativeEvent(\(eventId), \(json));"
    bridgeWebView?.evaluateJavaScript(js, completionHandler: nil)
  }

  private func loadImage(from source: String, into imageView: UIImageView) {
    let trimmed = source.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty { return }

    if trimmed.hasPrefix("http://") || trimmed.hasPrefix("https://"),
       let url = URL(string: trimmed) {
      URLSession.shared.dataTask(with: url) { data, _, _ in
        guard let data, let image = UIImage(data: data) else { return }
        DispatchQueue.main.async {
          imageView.image = image
        }
      }.resume()
      return
    }

    if let image = UIImage(named: trimmed) {
      imageView.image = image
    }
  }

  private func applyBaseStyle(to view: UIView, style: [String: Any]) {
    if let colorHex = style["backgroundColor"] as? String {
      view.backgroundColor = parseColor(colorHex)
    }

    let radius = CGFloat(styleInt(style, "borderRadius", defaultValue: 0))
    if radius > 0 {
      view.layer.cornerRadius = radius
      view.layer.masksToBounds = true
    }

    let margin = CGFloat(styleInt(style, "margin", defaultValue: 0))
    if margin > 0 {
      view.layoutMargins = UIEdgeInsets(top: margin, left: margin, bottom: margin, right: margin)
    }
  }

  private func applyTextStyle(to label: UILabel?, style: [String: Any]) {
    guard let label else { return }
    label.font = .systemFont(ofSize: CGFloat(styleInt(style, "fontSize", defaultValue: 16)))

    if let weight = style["fontWeight"] as? String, weight.lowercased() == "bold" {
      label.font = .boldSystemFont(ofSize: CGFloat(styleInt(style, "fontSize", defaultValue: 16)))
    }

    if let colorHex = style["color"] as? String {
      label.textColor = parseColor(colorHex)
    }

    switch (style["textAlign"] as? String)?.lowercased() {
    case "center":
      label.textAlignment = .center
    case "right":
      label.textAlignment = .right
    default:
      label.textAlignment = .left
    }
  }

  private func parseColor(_ hex: String) -> UIColor {
    var value = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    if value.hasPrefix("#") {
      value.removeFirst()
    }

    if value.count == 6 {
      value = "FF" + value
    }

    guard value.count == 8, let intVal = UInt64(value, radix: 16) else {
      return .clear
    }

    let a = CGFloat((intVal & 0xFF000000) >> 24) / 255.0
    let r = CGFloat((intVal & 0x00FF0000) >> 16) / 255.0
    let g = CGFloat((intVal & 0x0000FF00) >> 8) / 255.0
    let b = CGFloat(intVal & 0x000000FF) / 255.0

    return UIColor(red: r, green: g, blue: b, alpha: a)
  }

  private func styleInt(_ style: [String: Any], _ key: String, defaultValue: Int) -> Int {
    guard let raw = style[key] else { return defaultValue }
    if let number = raw as? NSNumber {
      return number.intValue
    }

    if let string = raw as? String {
      let sanitized = string.replacingOccurrences(of: "px", with: "").trimmingCharacters(in: .whitespaces)
      if let value = Int(sanitized) {
        return value
      }
      if let value = Double(sanitized) {
        return Int(value.rounded())
      }
    }

    return defaultValue
  }

  private func mapAlignment(_ value: String?) -> UIStackView.Alignment {
    switch value?.lowercased() {
    case "center":
      return .center
    case "end", "right":
      return .trailing
    case "stretch":
      return .fill
    default:
      return .leading
    }
  }
}
