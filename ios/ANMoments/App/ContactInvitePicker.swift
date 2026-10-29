import SwiftUI
import Contacts
import ContactsUI
import MessageUI

/// Apple contacts picker grants access only to the selected contact.
/// The app does not scan or upload the address book.
struct ContactInvitePicker: UIViewControllerRepresentable {
    let onPhoneSelected: (String) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController()
        picker.displayedPropertyKeys = [CNContactPhoneNumbersKey]
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ controller: CNContactPickerViewController,
                                context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, CNContactPickerDelegate {
        let parent: ContactInvitePicker
        init(_ parent: ContactInvitePicker) { self.parent = parent }

        func contactPicker(_ picker: CNContactPickerViewController,
                           didSelect contact: CNContact) {
            if let phone = contact.phoneNumbers.first?.value.stringValue {
                parent.onPhoneSelected(phone)
            }
            parent.dismiss()
        }
        func contactPickerDidCancel(_ picker: CNContactPickerViewController) {
            parent.dismiss()
        }
    }
}

struct InviteSMS: UIViewControllerRepresentable {
    let recipient: String
    let handle: String
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> MFMessageComposeViewController {
        let composer = MFMessageComposeViewController()
        composer.recipients = [recipient]
        composer.body = """
        Mình dùng AN Moments để chia sẻ khoảnh khắc. \
        Nếu bạn đã cài AN Moments, mở anmoments://invite/\(handle) \
        hoặc tìm username @\(handle) để kết bạn nhé!
        """
        composer.messageComposeDelegate = context.coordinator
        return composer
    }

    func updateUIViewController(_ controller: MFMessageComposeViewController,
                                context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }
    final class Coordinator: NSObject, MFMessageComposeViewControllerDelegate {
        let parent: InviteSMS
        init(_ parent: InviteSMS) { self.parent = parent }
        func messageComposeViewController(_ controller: MFMessageComposeViewController,
                                          didFinishWith result: MessageComposeResult) {
            parent.dismiss()
        }
    }
}
