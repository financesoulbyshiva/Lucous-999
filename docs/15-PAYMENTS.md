# 15 - Payment Gateway Subsystem: LUCOUS

## 1. Overview & Architecture

LUCOUS implements monetization through **Razorpay**, India's leading payment gateway. The payment pipeline handles paid course enrollments using server-side order generation and cryptographic signature verification.

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant UI as CoursesView Component
    participant RZP_JS as Razorpay Checkout.js
    participant API as Express API (:5000)
    participant RZP_API as Razorpay Servers
    participant DB as MongoDB

    Note over S,UI: 1. Initiation
    S->>UI: Clicks "Enroll now" on paid course (e.g., ₹499)
    UI->>API: POST /api/payments/order { courseId }
    API->>DB: prisma.course.findUnique(courseId)
    API->>RZP_API: POST v1/orders (amount: course.price in paise)
    RZP_API-->>API: Returns { id: "order_xyz", amount, currency }
    API->>DB: prisma.payment.create(status: "CREATED", order_id)
    API-->>UI: Returns { order: { id, amount, currency } }

    Note over UI,RZP_JS: 2. Checkout Modal
    UI->>RZP_JS: Injects checkout.js & opens payment modal
    S->>RZP_JS: Enters Card / UPI / Netbanking details
    RZP_JS->>RZP_API: Authorizes payment
    RZP_API-->>RZP_JS: Returns { razorpay_order_id, payment_id, signature }

    Note over UI,API: 3. Verification & Course Fulfillment
    RZP_JS-->>UI: Executes handler callback with tokens
    UI->>API: POST /api/payments/verify { orderId, paymentId, signature, courseId }
    API->>API: HMAC-SHA256(orderId + "|" + paymentId, SECRET)
    API->>API: crypto.timingSafeEqual(computed, signature)
    
    alt Signature Valid
        API->>DB: prisma.payment.update(status: "PAID")
        API->>DB: prisma.enrollment.create(studentId, courseId, status: "ENROLLED")
        API-->>UI: 200 OK { success: true, message: "Enrolled successfully" }
        UI->>UI: Refreshes student's enrolled courses list
    else Signature Invalid
        API->>DB: prisma.payment.update(status: "FAILED")
        API-->>UI: 400 Bad Request ("Payment verification failed")
    end
```

---

## 2. Currency & Denomination Convention

- **Unit:** **Paise** (1 INR = 100 paise).
- Stored as integers in both `Course.price` and `Payment.amount`.
- A course priced at ₹499 is stored as `49900`.
- **Free Courses:** `Course.price === 0`. Students enroll directly via `POST /api/enrollments` without invoking the payment gateway.

---

## 3. Configuration & Credentials

The backend verifies credentials via `razorpayConfigured()` ([`backend/server.js:1652`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1652)):
- `RAZORPAY_KEY_ID`: Public key identifier (safe for frontend exposure).
- `RAZORPAY_KEY_SECRET`: Secret key used for HTTP Basic auth and HMAC computation.
- `RAZORPAY_WEBHOOK_SECRET`: Secret used to sign incoming webhook events.

### Public Config Route (`GET /api/payments/config`)
Returns `{ success: true, configured: boolean, keyId: string | null }`. Exposes only the public key to the browser. The secret key never leaves the backend.

---

## 4. Webhook Pipeline (`POST /api/payments/webhook`)

Implemented in [`backend/server.js:1789`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L1789) to handle asynchronous payment confirmations:
1. **Raw Body Capture:** Enabled in [`backend/server.js:29-35`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L29) by storing `req.rawBody = buf` in `express.json()`.
2. **Signature Verification:**
   ```javascript
   const expected = crypto
     .createHmac("sha256", secret)
     .update(req.rawBody)
     .digest("hex");
   if (!safeEqual(expected, signature)) {
     return res.status(400).json({ success: false, message: "Invalid webhook signature" });
   }
   ```
3. **Fulfillment:** On `order.paid` or `payment.captured`, finds the associated course and creates an `Enrollment` record if not already present.

---

## 5. Identified Gaps & Edge Cases

| Issue | Impact | Location |
| :--- | :--- | :--- |
| **Teacher UI Denomination Confusion** | In `TeacherHome`, price input is labelled `Price (paise, 0 = free)`. Teachers expecting to enter ₹500 enter `500`, resulting in a price of ₹5.00. | [`src/components/teacher/teacher-home.tsx:188`](file:///c:/Shiva/Lucous2509-main/src/components/teacher/teacher-home.tsx#L188) |
| **No Refund Pipeline** | No refund API endpoints or webhook event handlers (`payment.refunded`) exist. | `backend/server.js` |
| **No Tax / GST Computation** | Invoices, GST numbers, and tax itemization are not implemented. | `backend/server.js` |
