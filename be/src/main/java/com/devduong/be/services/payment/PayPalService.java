package com.devduong.be.services.payment;

import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayPalService {

    private final PayPalHttpClient payPalHttpClient;

    public HttpResponse<Order> createOrder(Double amount, String currency, String returnUrl, String cancelUrl) throws IOException {
        log.info("Creating PayPal order for amount: {} {}", amount, currency);
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.checkoutPaymentIntent("CAPTURE");

        List<PurchaseUnitRequest> purchaseUnitRequests = new ArrayList<>();
        PurchaseUnitRequest purchaseUnitRequest = new PurchaseUnitRequest()
                .amountWithBreakdown(new AmountWithBreakdown()
                        .currencyCode(currency)
                        .value(String.format("%.2f", amount)));
        purchaseUnitRequests.add(purchaseUnitRequest);
        orderRequest.purchaseUnits(purchaseUnitRequests);

        ApplicationContext applicationContext = new ApplicationContext()
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .userAction("PAY_NOW")
                .shippingPreference("NO_SHIPPING");
        orderRequest.applicationContext(applicationContext);

        OrdersCreateRequest ordersCreateRequest = new OrdersCreateRequest().requestBody(orderRequest);
        
        try {
            HttpResponse<Order> response = payPalHttpClient.execute(ordersCreateRequest);
            log.info("PayPal order created successfully with ID: {}", response.result().id());
            return response;
        } catch (IOException e) {
            log.error("Error creating PayPal order: {}", e.getMessage());
            throw e;
        }
    }

    public HttpResponse<Order> captureOrder(String orderId) throws IOException {
        OrdersCaptureRequest ordersCaptureRequest = new OrdersCaptureRequest(orderId);
        return payPalHttpClient.execute(ordersCaptureRequest);
    }
}
