#!/usr/bin/env swift
import Foundation
import AppKit

let fileManager = FileManager.default
let root = URL(fileURLWithPath: fileManager.currentDirectoryPath)
let icons = [
    ("AppIcon", NSColor(calibratedRed: 1.00, green: 0.78, blue: 0.25, alpha: 1)),
    ("IconRose", NSColor(calibratedRed: 0.94, green: 0.43, blue: 0.59, alpha: 1)),
    ("IconMidnight", NSColor(calibratedRed: 0.19, green: 0.21, blue: 0.31, alpha: 1))
]
for (name, background) in icons {
    let size: CGFloat = 1024
    let image = NSImage(size: NSSize(width: size, height: size))
    image.lockFocus()
    background.setFill()
    NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()
    let heart = "♥"
    let attributes: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: 650, weight: .bold),
        .foregroundColor: NSColor.white
    ]
    let measured = heart.size(withAttributes: attributes)
    let position = NSPoint(
        x: (size - measured.width) / 2,
        y: (size - measured.height) / 2 + 30
    )
    heart.draw(at: position, withAttributes: attributes)
    image.unlockFocus()

    guard let tiff = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff),
          let png = bitmap.representation(using: .png, properties: [:]) else {
        fatalError("Could not render icon \(name)")
    }
    let folder = root.appendingPathComponent("App/Assets.xcassets/\(name).appiconset")
    try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
    try png.write(to: folder.appendingPathComponent("\(name).png"), options: .atomic)
    let metadata = """
    {
      "images": [{"filename":"\(name).png","idiom":"universal","platform":"ios","size":"1024x1024"}],
      "info": {"author":"xcode","version":1}
    }
    """
    try metadata.write(to: folder.appendingPathComponent("Contents.json"), atomically: true, encoding: .utf8)
    print("Generated icon:", folder.path)
}
