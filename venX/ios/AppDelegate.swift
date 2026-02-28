import UIKit
import WebKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var webView: WKWebView!
  var venjsXEngine: VenjsXEngine!

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    window = UIWindow(frame: UIScreen.main.bounds)
    let rootVC = UIViewController()
    rootVC.view.backgroundColor = .white
    window?.rootViewController = rootVC
    window?.makeKeyAndVisible()

    let contentController = WKUserContentController()
    let config = WKWebViewConfiguration()
    config.userContentController = contentController

    webView = WKWebView(frame: .zero, configuration: config)

    venjsXEngine = VenjsXEngine(controller: rootVC, container: rootVC.view, bridgeWebView: webView)
    contentController.add(venjsXEngine, name: "processUINode")

    if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "app") {
      webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    return true
  }
}



