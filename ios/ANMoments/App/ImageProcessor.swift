import UIKit

enum ImageProcessor {
    // Avoid uploading huge original HEIC/RAW dimensions or exceeding the
    // private storage bucket's 10 MB upload limit.
    static func jpeg(_ image: UIImage, maxDimension: CGFloat = 1800) -> Data? {
        let original = image.size
        guard original.width > 0, original.height > 0 else { return nil }
        let ratio = min(1.0, maxDimension / max(original.width, original.height))
        let size = CGSize(width: max(1, original.width * ratio),
                          height: max(1, original.height * ratio))
        let renderer = UIGraphicsImageRenderer(size: size)
        let normalized = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
        return normalized.jpegData(compressionQuality: 0.78)
    }
}
