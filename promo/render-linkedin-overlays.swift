import AppKit
import Foundation

let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let posterURL = URL(fileURLWithPath: CommandLine.arguments[2])
let width = 1280
let height = 720

let captions = [
    "Every child has ideas. ByteBuddies helps turn those ideas\ninto things they can make.",
    "Pupils explore interactive lessons, learn to code,\nand build games in one primary computing platform.",
    "They solve story-led coding challenges,\nexperimenting, testing, and learning to debug.",
    "They can design their own robots\nand bring ideas to life in 3D worlds.",
    "Teachers can set work, track progress,\nand give thoughtful feedback in one place.",
    "From a first line of code to a project of their own,\nlearning becomes active, creative, and visible.",
    "ByteBuddies. Make learning.\nMake things happen.",
]

func makeBitmap() -> NSBitmapImageRep {
    NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
}

func writePNG(_ bitmap: NSBitmapImageRep, to url: URL) throws {
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "ByteBuddiesPromo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode PNG"])
    }
    try data.write(to: url)
}

func drawCenteredText(_ text: String, in rect: NSRect, size: CGFloat, color: NSColor) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center
    paragraph.lineBreakMode = .byWordWrapping
    paragraph.lineSpacing = 3
    let font = NSFont(name: "Avenir Next Demi Bold", size: size) ?? NSFont.systemFont(ofSize: size, weight: .semibold)
    NSAttributedString(string: text, attributes: [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph,
    ]).draw(in: rect)
}

func renderCaption(_ text: String, to url: URL) throws {
    let bitmap = makeBitmap()
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.cgContext.clear(CGRect(x: 0, y: 0, width: width, height: height))

    let panel = NSRect(x: 100, y: 32, width: 1080, height: 112)
    let path = NSBezierPath(roundedRect: panel, xRadius: 18, yRadius: 18)
    NSColor(calibratedRed: 0.035, green: 0.045, blue: 0.12, alpha: 0.94).setFill()
    path.fill()
    NSColor(calibratedRed: 0.25, green: 0.78, blue: 0.92, alpha: 0.9).setStroke()
    path.lineWidth = 2
    path.stroke()

    drawCenteredText(text, in: NSRect(x: 132, y: 48, width: 1016, height: 82), size: 28, color: .white)
    NSGraphicsContext.restoreGraphicsState()
    try writePNG(bitmap, to: url)
}

func renderEndCard(to url: URL) throws {
    guard let poster = NSImage(contentsOf: posterURL) else {
        throw NSError(domain: "ByteBuddiesPromo", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not load poster image"])
    }
    let bitmap = makeBitmap()
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.cgContext.clear(CGRect(x: 0, y: 0, width: width, height: height))
    poster.draw(in: NSRect(x: 0, y: 0, width: width, height: height))

    let button = NSRect(x: 342, y: 44, width: 596, height: 70)
    NSColor(calibratedRed: 0.12, green: 0.76, blue: 0.67, alpha: 0.98).setFill()
    NSBezierPath(roundedRect: button, xRadius: 24, yRadius: 24).fill()
    drawCenteredText("Explore bytebuddies.technology", in: button.insetBy(dx: 12, dy: 8), size: 25, color: .white)
    NSGraphicsContext.restoreGraphicsState()
    try writePNG(bitmap, to: url)
}

try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
for (index, caption) in captions.enumerated() {
    try renderCaption(caption, to: outputDirectory.appendingPathComponent(String(format: "caption-%02d.png", index + 1)))
}
try renderEndCard(to: outputDirectory.appendingPathComponent("end-card.png"))