import Foundation
import SwiftUI
import UIKit

@MainActor
final class LocalAlbum: ObservableObject {
    @Published private(set) var moments: [LocalMoment] = []
    @Published private(set) var friends: [LocalFriend] = []

    private let fm = FileManager.default
    private var root: URL {
        let directory = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ANMoments", isDirectory: true)
        try? fm.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }

    init() {
        load()
    }

    private func load() {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let momentsURL = root.appendingPathComponent("moments.json")
        let friendsURL = root.appendingPathComponent("friends.json")
        if let data = try? Data(contentsOf: momentsURL),
           let decoded = try? decoder.decode([LocalMoment].self, from: data) {
            moments = decoded.sorted { $0.createdAt > $1.createdAt }
        }
        if let data = try? Data(contentsOf: friendsURL),
           let decoded = try? decoder.decode([LocalFriend].self, from: data) {
            friends = decoded
        }
    }

    private func save() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        if let data = try? encoder.encode(moments) {
            try? data.write(to: root.appendingPathComponent("moments.json"), options: .atomic)
        }
        if let data = try? encoder.encode(friends) {
            try? data.write(to: root.appendingPathComponent("friends.json"), options: .atomic)
        }
        // No-op when App Groups is not available on the signing profile.
        let lastImageData = moments.first.flatMap { image(for: $0)?.jpegData(compressionQuality: 0.7) }
        WidgetBridge.saveLatest(data: lastImageData)
    }

    func add(image: UIImage, caption: String, recipients: [String]) throws {
        guard let compressed = ImageProcessor.jpeg(image) else {
            throw CocoaError(.fileWriteInapplicableStringEncoding)
        }
        let name = UUID().uuidString + ".jpg"
        try compressed.write(to: root.appendingPathComponent(name), options: .atomic)
        moments.insert(LocalMoment(caption: caption, fileName: name, mediaKind: "photo", recipients: recipients), at: 0)
        save()
    }

    func addVideo(fileURL: URL, caption: String, recipients: [String]) async throws {
        try await VideoMedia.validate(fileURL)
        let name = UUID().uuidString + ".mov"
        try fm.copyItem(at: fileURL, to: root.appendingPathComponent(name))
        moments.insert(LocalMoment(caption: caption, fileName: name, mediaKind: "video", recipients: recipients), at: 0)
        save()
    }

    func videoURL(for moment: LocalMoment) -> URL? {
        guard moment.isVideo else { return nil }
        return root.appendingPathComponent(moment.fileName)
    }

    func image(for moment: LocalMoment) -> UIImage? {
        let location = root.appendingPathComponent(moment.fileName)
        if moment.isVideo { return VideoMedia.thumbnail(location) }
        return UIImage(contentsOfFile: location.path)
    }

    func react(to id: UUID, emoji: String) {
        guard let index = moments.firstIndex(where: { $0.id == id }) else { return }
        moments[index].reaction = emoji
        save()
    }

    func delete(_ moment: LocalMoment) {
        try? fm.removeItem(at: root.appendingPathComponent(moment.fileName))
        moments.removeAll { $0.id == moment.id }
        save()
    }

    func addFriend(_ name: String) {
        let clean = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty, !friends.contains(where: { $0.name.caseInsensitiveCompare(clean) == .orderedSame }) else { return }
        friends.append(LocalFriend(name: clean))
        save()
    }

    func removeFriend(_ id: UUID) {
        friends.removeAll { $0.id == id }
        save()
    }

    func exportURL(for moment: LocalMoment) -> URL {
        root.appendingPathComponent(moment.fileName)
    }

    func clearAll() {
        for moment in moments {
            try? fm.removeItem(at: root.appendingPathComponent(moment.fileName))
        }
        moments.removeAll()
        friends.removeAll()
        save()
    }
}
