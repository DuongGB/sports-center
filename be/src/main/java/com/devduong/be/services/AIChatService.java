package com.devduong.be.services;

import com.devduong.be.dtos.response.AIChatResponse;
import com.devduong.be.entities.Court;
import com.devduong.be.entities.CourtPrice;
import com.devduong.be.entities.SportType;
import com.devduong.be.enums.CourtStatus;
import com.devduong.be.repositories.CourtPriceRepository;
import com.devduong.be.repositories.CourtRepository;
import com.devduong.be.repositories.SportTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AIChatService {
    CourtRepository courtRepository;
    SportTypeRepository sportTypeRepository;
    CourtPriceRepository courtPriceRepository;
    GeminiService geminiService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Xử lý câu hỏi từ khách hàng:
     * 1. Thu thập dữ liệu sân + giá từ DB
     * 2. Gửi context + câu hỏi đến Gemini AI
     * 3. Trả về câu trả lời AI + court suggestions
     */
    public AIChatResponse processQuestion(String message) {
        if (message == null || message.trim().isEmpty()) {
            return AIChatResponse.builder()
                    .reply("Xin chào! Tôi là trợ lý AI của D-Sport Center. Hãy hỏi tôi về sân thể thao, giá cả, hoặc cách đặt sân nhé! 😊")
                    .courts(Collections.emptyList())
                    .build();
        }

        // 1. Thu thập dữ liệu từ database
        String dbContext = buildDatabaseContext();

        // 2. Tạo system prompt
        String systemPrompt = buildSystemPrompt(dbContext);

        // 3. Gọi Gemini AI
        String aiReply = geminiService.generateContent(systemPrompt, message);

        // 4. Nếu Gemini fail, dùng fallback
        if (aiReply == null || aiReply.trim().isEmpty()) {
            log.warn("Gemini API trả về null, sử dụng fallback response");
            return buildFallbackResponse(message);
        }

        // 5. Trích xuất court suggestions từ DB nếu câu hỏi liên quan đến sân
        List<AIChatResponse.CourtSuggestion> suggestions = extractCourtSuggestions(message);

        return AIChatResponse.builder()
                .reply(aiReply)
                .courts(suggestions)
                .build();
    }

    /**
     * Thu thập toàn bộ dữ liệu sân, giá từ DB để làm context cho AI
     */
    private String buildDatabaseContext() {
        StringBuilder context = new StringBuilder();

        // Lấy tất cả sport types
        List<SportType> sportTypes = sportTypeRepository.findAll();

        if (sportTypes.isEmpty()) {
            return "Hiện tại chưa có dữ liệu sân thể thao nào trong hệ thống.";
        }

        context.append("=== DỮ LIỆU SÂN THỂ THAO HIỆN TẠI ===\n\n");

        for (SportType st : sportTypes) {
            context.append("【Loại sân: ").append(st.getName()).append("】\n");

            // Lấy courts theo sport type
            List<Court> courts = courtRepository.findAllWithFilter(
                    null, CourtStatus.ACTIVE, st.getId(), PageRequest.of(0, 50)
            ).getContent();

            if (courts.isEmpty()) {
                context.append("  → Chưa có sân nào đang hoạt động\n");
            } else {
                context.append("  Danh sách sân (đang hoạt động):\n");
                for (Court c : courts) {
                    context.append("  • ").append(c.getName())
                            .append(" | Địa điểm: ").append(c.getLocation());
                    if (c.getOpenTime() != null && c.getCloseTime() != null) {
                        context.append(" | Giờ mở cửa: ")
                                .append(c.getOpenTime().format(TIME_FMT))
                                .append(" - ")
                                .append(c.getCloseTime().format(TIME_FMT));
                    }
                    context.append(" | Trạng thái: ").append(c.getStatus().name()).append("\n");
                }
            }

            // Lấy bảng giá
            List<CourtPrice> prices = courtPriceRepository.findBySportTypeId(st.getId());
            if (!prices.isEmpty()) {
                context.append("  Bảng giá:\n");
                for (CourtPrice p : prices) {
                    context.append("  • Khung giờ ").append(p.getStartTime().format(TIME_FMT))
                            .append(" - ").append(p.getEndTime().format(TIME_FMT))
                            .append(": ").append(String.format("%,.0f", p.getPrice())).append(" VND\n");
                }
            } else {
                context.append("  Bảng giá: Chưa cập nhật\n");
            }

            context.append("\n");
        }

        // Thống kê tổng
        long totalActive = courtRepository.countByStatus(CourtStatus.ACTIVE);
        context.append("=== TỔNG QUAN ===\n");
        context.append("Tổng số sân đang hoạt động: ").append(totalActive).append("\n");
        context.append("Số loại sân: ").append(sportTypes.size()).append("\n");

        return context.toString();
    }

    /**
     * System prompt cho Gemini — định nghĩa vai trò và hướng dẫn trả lời
     */
    private String buildSystemPrompt(String dbContext) {
        return """
                Bạn là trợ lý AI của "Sports Center" — một hệ thống đặt sân thể thao trực tuyến.
                
                NHIỆM VỤ:
                - Trả lời câu hỏi của khách hàng về sân thể thao, giá cả, giờ hoạt động, cách đặt sân.
                - Tư vấn và gợi ý sân phù hợp dựa trên dữ liệu thực từ hệ thống.
                - Luôn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp.
                
                QUY TẮC:
                1. CHỈ trả lời dựa trên dữ liệu được cung cấp bên dưới. KHÔNG bịa thông tin.
                2. Nếu không tìm thấy thông tin phù hợp, hãy nói rõ và gợi ý khách liên hệ hỗ trợ.
                3. Sử dụng emoji phù hợp để tạo cảm giác thân thiện (🏟️ 💰 ⏰ 📍 ⚽ 🏸 🎾 etc.)
                4. Khi liệt kê sân hoặc giá, trình bày rõ ràng, dễ đọc.
                5. Luôn khuyến khích khách đặt sân qua website.
                6. Format câu trả lời dạng Markdown (dùng **bold**, bullet points, etc.)
                7. Trả lời ngắn gọn, tập trung, không dài dòng quá 300 từ.
                8. Nếu khách hỏi những thứ không liên quan đến thể thao/sân bãi, hãy lịch sự từ chối và hướng dẫn lại.
                
                HƯỚNG DẪN ĐẶT SÂN:
                1. Truy cập trang "Đặt sân" trên website
                2. Chọn môn thể thao
                3. Chọn ngày và khung giờ
                4. Điền thông tin (có thể đặt với tư cách khách mà không cần tài khoản)
                5. Thanh toán qua PayPal hoặc thanh toán tại quầy
                
                DỮ LIỆU HỆ THỐNG (cập nhật realtime):
                """ + dbContext;
    }

    /**
     * Trích xuất court suggestions từ DB dựa trên nội dung câu hỏi
     */
    private List<AIChatResponse.CourtSuggestion> extractCourtSuggestions(String message) {
        String normalized = message.toLowerCase().trim();
        List<AIChatResponse.CourtSuggestion> suggestions = new ArrayList<>();

        // Phát hiện sport type trong câu hỏi
        List<SportType> sportTypes = sportTypeRepository.findAll();
        SportType matched = null;

        for (SportType st : sportTypes) {
            if (normalized.contains(st.getName().toLowerCase())) {
                matched = st;
                break;
            }
        }

        // Nếu không match tên trong DB, thử matching phổ biến
        if (matched == null) {
            Map<String, List<String>> commonNames = Map.of(
                    "bóng đá", List.of("bóng đá", "bong da", "football", "soccer"),
                    "cầu lông", List.of("cầu lông", "cau long", "badminton"),
                    "bóng rổ", List.of("bóng rổ", "bong ro", "basketball"),
                    "tennis", List.of("tennis", "quần vợt"),
                    "bóng chuyền", List.of("bóng chuyền", "volleyball"),
                    "pickleball", List.of("pickleball"),
                    "bóng bàn", List.of("bóng bàn", "ping pong")
            );

            for (Map.Entry<String, List<String>> entry : commonNames.entrySet()) {
                for (String kw : entry.getValue()) {
                    if (normalized.contains(kw)) {
                        // Tìm trong DB
                        for (SportType st : sportTypes) {
                            if (st.getName().toLowerCase().contains(entry.getKey()) ||
                                    entry.getKey().contains(st.getName().toLowerCase())) {
                                matched = st;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (matched != null) break;
            }
        }

        // Nếu có keyword liên quan đến sân/giá nhưng không chỉ định loại → lấy tất cả
        boolean askingCourt = normalized.contains("sân") || normalized.contains("court") ||
                normalized.contains("danh sách") || normalized.contains("tất cả") ||
                normalized.contains("giá") || normalized.contains("xem");

        if (matched != null) {
            List<Court> courts = courtRepository.findAllWithFilter(
                    null, CourtStatus.ACTIVE, matched.getId(), PageRequest.of(0, 5)
            ).getContent();
            List<CourtPrice> prices = courtPriceRepository.findBySportTypeId(matched.getId());

            SportType finalMatched = matched;
            suggestions = courts.stream()
                    .map(c -> buildCourtSuggestion(c, finalMatched.getName(), prices))
                    .collect(Collectors.toList());
        } else if (askingCourt) {
            List<Court> courts = courtRepository.findAllWithFilter(
                    null, CourtStatus.ACTIVE, null, PageRequest.of(0, 6)
            ).getContent();

            for (Court c : courts) {
                List<CourtPrice> prices = courtPriceRepository.findBySportTypeId(c.getSportType().getId());
                suggestions.add(buildCourtSuggestion(c, c.getSportType().getName(), prices));
            }
        }

        return suggestions;
    }

    /**
     * Fallback response khi Gemini API không khả dụng
     */
    private AIChatResponse buildFallbackResponse(String message) {
        String normalized = message.toLowerCase().trim();
        List<AIChatResponse.CourtSuggestion> suggestions = extractCourtSuggestions(message);

        String reply;
        if (normalized.contains("chào") || normalized.contains("hello") || normalized.contains("hi")) {
            reply = "Xin chào! 👋 Tôi là trợ lý AI của Sports Center. Tôi có thể giúp bạn tìm sân, xem giá và hướng dẫn đặt sân. Hãy hỏi tôi nhé! 😊";
        } else if (!suggestions.isEmpty()) {
            reply = "🏟️ Đây là những sân mà tôi tìm thấy cho bạn. Bạn có thể xem chi tiết bên dưới!";
        } else {
            reply = "Xin lỗi, tôi đang gặp sự cố kỹ thuật 😅 Bạn có thể thử lại sau hoặc sử dụng chat **Hỗ trợ trực tuyến** ở bên phải để được nhân viên hỗ trợ trực tiếp nhé! 💬";
        }

        return AIChatResponse.builder()
                .reply(reply)
                .courts(suggestions)
                .build();
    }

    // ========== Helper ==========

    private AIChatResponse.CourtSuggestion buildCourtSuggestion(Court court, String sportTypeName, List<CourtPrice> prices) {
        List<AIChatResponse.PriceInfo> priceInfos = prices.stream()
                .map(p -> AIChatResponse.PriceInfo.builder()
                        .startTime(p.getStartTime().format(TIME_FMT))
                        .endTime(p.getEndTime().format(TIME_FMT))
                        .price(p.getPrice())
                        .build())
                .collect(Collectors.toList());

        return AIChatResponse.CourtSuggestion.builder()
                .id(court.getId().toString())
                .name(court.getName())
                .location(court.getLocation())
                .sportType(sportTypeName)
                .openTime(court.getOpenTime() != null ? court.getOpenTime().format(TIME_FMT) : null)
                .closeTime(court.getCloseTime() != null ? court.getCloseTime().format(TIME_FMT) : null)
                .status(court.getStatus().name())
                .prices(priceInfos)
                .build();
    }
}
