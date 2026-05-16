package com.devduong.be.controllers;

import com.devduong.be.entities.Payment;
import com.devduong.be.enums.PaymentMethod;
import com.devduong.be.enums.PaymentStatus;
import com.devduong.be.repositories.BookingRepository;
import com.devduong.be.repositories.PaymentRepository;
import com.devduong.be.services.payment.PayPalService;
import com.paypal.http.HttpResponse;
import com.paypal.orders.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/paypal")
@RequiredArgsConstructor
public class PayPalController {

    private final PayPalService payPalService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            Double amount = Double.valueOf(payload.get("amount").toString());
            String currency = payload.get("currency") != null ? payload.get("currency").toString() : "USD";
            String returnUrl = "http://localhost:5173/payment/success";
            String cancelUrl = "http://localhost:5173/payment/cancel";

            HttpResponse<Order> response = payPalService.createOrder(amount, currency, returnUrl, cancelUrl);
            Order order = response.result();
            String approveUrl = order.links().stream()
                    .filter(link -> "approve".equals(link.rel()))
                    .findFirst()
                    .map(com.paypal.orders.LinkDescription::href)
                    .orElse(null);
            
            return ResponseEntity.ok(Map.of(
                    "id", order.id(),
                    "status", order.status(),
                    "approveUrl", approveUrl
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/capture")
    @Transactional
    public ResponseEntity<?> captureOrder(@RequestBody Map<String, String> payload) {
        try {
            String orderId = payload.get("orderId");
            String bookingId = payload.get("bookingId");
            
            HttpResponse<Order> response = payPalService.captureOrder(orderId);
            
            if (response.result().status().equalsIgnoreCase("COMPLETED")) {
                // Update Booking and Payment
                com.devduong.be.entities.Booking booking = bookingRepository.findById(java.util.UUID.fromString(bookingId))
                        .orElseThrow(() -> new RuntimeException("Booking not found"));
                
                // Update Payment Method for both Booking and Payment
                booking.setPaymentMethod(PaymentMethod.PAYPAL);
                if (booking.getBookingStatus() == com.devduong.be.enums.BookingStatus.PENDING) {
                    booking.setBookingStatus(com.devduong.be.enums.BookingStatus.CONFIRMED);
                }
                bookingRepository.save(booking);
                
                Payment payment = paymentRepository.findByBookingId(booking.getId())
                        .orElseThrow(() -> new RuntimeException("Payment not found"));
                
                payment.setPaymentMethod(PaymentMethod.PAYPAL);
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(response.result().id());
                payment.setPaymentDate(java.time.LocalDateTime.now());
                paymentRepository.save(payment);
                
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "status", "COMPLETED",
                        "orderId", response.result().id()
                ));
            } else {
                return ResponseEntity.status(400).body(Map.of(
                        "success", false,
                        "status", response.result().status(),
                        "message", "Payment not completed"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
