import Foundation

struct StreakSummary {
    let todayPosted: Bool
    let current: Int
    let longest: Int
    let missingDay: Date?
}

enum StreakEngine {
    private static let calendar = Calendar.current

    // Track consecutive local calendar days. Exactly ONE eligible missing day
    // between the two most recent posting days may be restored; never pretend
    // that a skipped day was a real photo posting.
    static func summarize(dates: [Date], restoredDays: Set<String>, today: Date = .now) -> StreakSummary {
        let days = Set(dates.map { calendar.startOfDay(for: $0) })
        let todayStart = calendar.startOfDay(for: today)
        let yesterday = calendar.date(byAdding: .day, value: -1, to: todayStart)!
        let activeDays = days.union(restoredDays.compactMap(date))
        let hasToday = days.contains(todayStart)
        var current = 0
        var cursor = hasToday ? todayStart : yesterday
        while activeDays.contains(cursor) {
            current += 1
            cursor = calendar.date(byAdding: .day, value: -1, to: cursor)!
        }

        let sorted = activeDays.sorted()
        var maximum = 0
        var run = 0
        var previous: Date?
        for day in sorted {
            if let prior = previous,
               calendar.dateComponents([.day], from: prior, to: day).day == 1 {
                run += 1
            } else {
                run = 1
            }
            maximum = max(maximum, run)
            previous = day
        }

        // A restoration candidate must be between two *real* post days.
        var missing: Date?
        let realSorted = days.sorted(by: >)
        if realSorted.count >= 2 {
            for index in 0..<(realSorted.count - 1) {
                let newer = realSorted[index], older = realSorted[index + 1]
                if calendar.dateComponents([.day], from: older, to: newer).day == 2,
                   let gap = calendar.date(byAdding: .day, value: 1, to: older),
                   gap <= yesterday,
                   !activeDays.contains(gap) {
                    missing = gap
                    break
                }
            }
        }
        return StreakSummary(todayPosted: hasToday, current: current, longest: maximum, missingDay: missing)
    }

    static func key(_ day: Date) -> String {
        let f = DateFormatter()
        f.calendar = calendar
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: day)
    }
    static func date(_ key: String) -> Date? {
        let f = DateFormatter()
        f.calendar = calendar
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.date(from: key)
    }
}
