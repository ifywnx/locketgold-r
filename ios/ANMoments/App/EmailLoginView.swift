import SwiftUI

struct EmailLoginView: View {
    @EnvironmentObject private var cloud: CloudService
    @State private var email = ""
    @State private var token = ""
    @State private var sent = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 22) {
                Spacer()
                Image(systemName: "heart.square.fill")
                    .font(.system(size: 84))
                    .foregroundStyle(Theme.gold)
                    .shadow(color: .orange.opacity(0.18), radius: 16, y: 8)
                Text("AN Moments")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                Text("Một khung ảnh nhỏ, dành cho những người thật sự thân.")
                    .font(.title3)
                    .foregroundStyle(Theme.muted)

                VStack(alignment: .leading, spacing: 14) {
                    TextField("Email của bạn", text: $email)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .padding(15)
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))
                    if sent {
                        TextField("Mã OTP trong email", text: $token)
                            .keyboardType(.numberPad)
                            .textContentType(.oneTimeCode)
                            .padding(15)
                            .background(.white, in: RoundedRectangle(cornerRadius: 16))
                    }
                    Button {
                        Task {
                            if sent {
                                await cloud.verifyOTP(email: email, token: token)
                            } else {
                                sent = await cloud.sendOTP(email: email)
                            }
                        }
                    } label: {
                        HStack {
                            Spacer()
                            if cloud.busy { ProgressView().tint(Theme.ink) }
                            Text(sent ? "Xác nhận đăng nhập" : "Gửi mã xác minh")
                            Spacer()
                        }
                        .fontWeight(.semibold)
                        .padding(16)
                        .background(Theme.gold, in: RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(cloud.busy || !email.contains("@") || (sent && token.isEmpty))
                }
                Spacer()
                Text("Đăng nhập bằng email OTP. Không yêu cầu Telegram.")
                    .font(.footnote)
                    .foregroundStyle(Theme.muted)
            }
            .padding(24)
            .background(Theme.cream.ignoresSafeArea())
            .alert("Thông báo", isPresented: Binding(
                get: { cloud.errorMessage != nil || cloud.infoMessage != nil },
                set: { if !$0 { cloud.errorMessage = nil; cloud.infoMessage = nil } }
            )) {
                Button("OK") { cloud.errorMessage = nil; cloud.infoMessage = nil }
            } message: {
                Text(cloud.errorMessage ?? cloud.infoMessage ?? "")
            }
        }
    }
}
