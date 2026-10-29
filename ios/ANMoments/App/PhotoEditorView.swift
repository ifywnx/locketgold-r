import SwiftUI
import UIKit

/// Original local editor; it does not change media on Locket's servers.
/// Text and a selected sticker are composited into a new JPEG-ready UIImage.
struct PhotoEditorView: View {
    let source: UIImage
    let onDone: (UIImage) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var headline = ""
    @State private var sticker = "❤️"
    @State private var colorChoice = 0
    private let choices = ["❤️", "🥰", "🔥", "✨", "🌸", "⭐", "😂", "💛"]
    private let ink: [UIColor] = [.white, .black, .systemPink, .systemYellow]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    ZStack(alignment: .bottom) {
                        Image(uiImage: source)
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: .infinity)
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                        VStack(spacing: 5) {
                            Text(sticker).font(.system(size: 50))
                            if !headline.isEmpty {
                                Text(headline).font(.title2.bold())
                                    .foregroundStyle(Color(uiColor: ink[colorChoice]))
                                    .shadow(color: .black.opacity(0.55), radius: 3)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(20)
                    }
                    TextField("Thêm chữ lên ảnh...", text: $headline)
                        .onChange(of: headline) { _, value in
                            if value.count > 80 { headline = String(value.prefix(80)) }
                        }
                        .padding(14)
                        .background(.white, in: RoundedRectangle(cornerRadius: 14))
                    ScrollView(.horizontal) {
                        HStack(spacing: 14) {
                            ForEach(choices, id: \.self) { emoji in
                                Button {
                                    sticker = emoji
                                } label: {
                                    Text(emoji).font(.system(size: 30))
                                        .padding(8)
                                        .background(sticker == emoji
                                            ? Theme.gold.opacity(0.6) : .white,
                                            in: RoundedRectangle(cornerRadius: 12))
                                }
                            }
                        }
                    }
                    HStack(spacing: 18) {
                        ForEach(ink.indices, id: \.self) { index in
                            Button {
                                colorChoice = index
                            } label: {
                                Circle()
                                    .fill(Color(uiColor: ink[index]))
                                    .frame(width: 32, height: 32)
                                    .overlay {
                                        Circle().strokeBorder(
                                            colorChoice == index ? Theme.gold : .gray,
                                            lineWidth: colorChoice == index ? 3 : 1
                                        )
                                    }
                            }
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationTitle("Chỉnh ảnh")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Hủy") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Áp dụng") {
                        let result = PhotoEditor.render(
                            image: source, text: headline,
                            sticker: sticker, textColor: ink[colorChoice]
                        )
                        onDone(result)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

enum PhotoEditor {
    static func render(image: UIImage, text: String,
                       sticker: String, textColor: UIColor) -> UIImage {
        let target = image.size
        let renderer = UIGraphicsImageRenderer(size: target)
        return renderer.image { context in
            image.draw(in: CGRect(origin: .zero, size: target))
            let scale = max(0.5, min(target.width, target.height) / 750.0)
            let stickerFont = UIFont.systemFont(ofSize: 64 * scale)
            let labelFont = UIFont.systemFont(ofSize: 32 * scale, weight: .bold)
            let stickerAttrs: [NSAttributedString.Key: Any] = [
                .font: stickerFont
            ]
            let labelAttrs: [NSAttributedString.Key: Any] = [
                .font: labelFont,
                .foregroundColor: textColor,
                .strokeColor: UIColor.black.withAlphaComponent(0.5),
                .strokeWidth: -2.0
            ]
            let baseline = target.height * 0.8
            let stickerSize = (sticker as NSString).size(withAttributes: stickerAttrs)
            (sticker as NSString).draw(
                at: CGPoint(x: (target.width-stickerSize.width)/2,
                            y: baseline-stickerSize.height-12*scale),
                withAttributes: stickerAttrs
            )
            if !text.isEmpty {
                let paragraph = NSMutableParagraphStyle()
                paragraph.alignment = .center
                var attrs = labelAttrs
                attrs[.paragraphStyle] = paragraph
                let rect = CGRect(x: 16*scale, y: baseline,
                                  width: target.width-32*scale,
                                  height: min(target.height*0.15, 150*scale))
                (text as NSString).draw(in: rect, withAttributes: attrs)
            }
        }
    }
}
