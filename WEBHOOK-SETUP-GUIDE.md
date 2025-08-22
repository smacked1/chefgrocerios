# ChefGrocer Webhook Setup Guide

This guide explains how to configure webhooks for automatic subscription management across Stripe, App Store, and Play Store.

## 🎯 What Webhooks Do

Our webhook system automatically handles:
- ✅ Payment success notifications
- 🔄 Subscription renewals
- ❌ Cancellations and refunds
- 📱 Cross-platform subscription sync (Apple ↔ Web ↔ Android)

## 🔧 Webhook Endpoints

### Stripe Webhook
**URL**: `https://your-domain.replit.app/api/webhooks/stripe`
**Method**: POST
**Content-Type**: application/json

**Events to Subscribe To**:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### RevenueCat Webhook (Unified App Store + Play Store)
**URL**: `https://your-domain.replit.app/api/webhooks/revenuecat`
**Method**: POST
**Content-Type**: application/json

**Events Handled**:
- `INITIAL_PURCHASE`
- `RENEWAL`
- `CANCELLATION`
- `UNCANCELLATION`
- `REFUND`
- `SUBSCRIPTION_PAUSED`
- `EXPIRATION`

### Apple App Store Direct Webhook (Alternative)
**URL**: `https://your-domain.replit.app/api/webhooks/app-store`
**Method**: POST
**Content-Type**: application/json

### Google Play Store Direct Webhook (Alternative)
**URL**: `https://your-domain.replit.app/api/webhooks/play-store`
**Method**: POST
**Content-Type**: application/json

## 🚀 Setup Instructions

### 1. Stripe Webhook Setup

1. **Go to Stripe Dashboard**:
   - Navigate to: https://dashboard.stripe.com/webhooks

2. **Create New Endpoint**:
   - Click "Add endpoint"
   - URL: `https://your-domain.replit.app/api/webhooks/stripe`
   - Events: Select all subscription-related events listed above

3. **Get Webhook Secret**:
   - Copy the signing secret from the webhook details
   - Add to your environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

4. **Test the Webhook**:
   ```bash
   curl -X POST https://your-domain.replit.app/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type": "test_event"}'
   ```

### 2. RevenueCat Webhook Setup

1. **Go to RevenueCat Dashboard**:
   - Navigate to: https://app.revenuecat.com/projects

2. **Configure Webhook**:
   - Go to Project Settings → Integrations → Webhooks
   - URL: `https://your-domain.replit.app/api/webhooks/revenuecat`
   - Select all events

3. **Set Authorization** (Optional):
   - Add authorization header if needed
   - Update webhook handler to verify authorization

### 3. Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_... # or pk_test_... for testing

# RevenueCat Configuration (Optional)
REVENUECAT_API_KEY=rcak_...
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret
```

## 📱 Cross-Platform Subscription Sync

Our webhook system ensures that subscriptions purchased on any platform automatically unlock features across all platforms:

### Scenario 1: User Purchases on Web (Stripe)
1. User pays via Stripe on web
2. Stripe webhook notifies our backend
3. User's account is upgraded in database
4. Mobile app automatically detects upgrade

### Scenario 2: User Purchases on iPhone (App Store)
1. User pays via App Store in-app purchase
2. RevenueCat webhook notifies our backend
3. User's account is upgraded in database
4. Web app automatically detects upgrade

### Scenario 3: User Purchases on Android (Play Store)
1. User pays via Play Store in-app purchase
2. RevenueCat webhook notifies our backend
3. User's account is upgraded in database
4. Web and iOS apps automatically detect upgrade

## 🔒 Security Considerations

### Webhook Signature Verification

Our webhooks verify signatures to ensure authenticity:

```typescript
// Stripe signature verification
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

// RevenueCat uses HTTP basic auth or custom headers
// Implement based on your security requirements
```

### Rate Limiting

Webhooks are protected by rate limiting to prevent abuse.

## 🧪 Testing Webhooks

### Test with ngrok (Local Development)

1. **Install ngrok**: `npm install -g ngrok`

2. **Expose local server**:
   ```bash
   ngrok http 5000
   ```

3. **Update webhook URLs** to use ngrok URL:
   ```
   https://abc123.ngrok.io/api/webhooks/stripe
   ```

### Test with Stripe CLI

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Forward events to local server**:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```

3. **Trigger test events**:
   ```bash
   stripe trigger checkout.session.completed
   ```

## 📊 Monitoring Webhooks

### Check Webhook Logs

Monitor webhook processing in your application logs:

```bash
# View webhook logs
grep "webhook" server.log

# View subscription updates
grep "subscription" server.log
```

### Webhook Delivery Status

Check delivery status in respective dashboards:
- **Stripe**: Dashboard → Webhooks → View attempts
- **RevenueCat**: Dashboard → Integrations → Webhook logs

## 🚨 Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check URL is publicly accessible
   - Verify SSL certificate is valid
   - Check firewall settings

2. **Signature verification failing**:
   - Ensure webhook secret is correctly set
   - Check that raw body is being passed to verification
   - Verify timestamp tolerance

3. **Database not updating**:
   - Check user identification logic (email, app_user_id)
   - Verify database connection
   - Check for proper error handling

### Debug Webhook Calls

Add debug logging to webhook handlers:

```typescript
console.log('Webhook received:', {
  type: event.type,
  id: event.id,
  data: event.data
});
```

## 📈 Production Deployment

### Before Going Live

1. ✅ Test all webhook endpoints
2. ✅ Verify signature verification
3. ✅ Test subscription scenarios end-to-end
4. ✅ Set up monitoring and alerting
5. ✅ Configure proper error handling
6. ✅ Set up database backups

### Scaling Considerations

- Use queue system for webhook processing
- Implement idempotency to handle duplicate events
- Set up proper logging and monitoring
- Consider webhook retry logic for failed processing

## 💰 Revenue Impact

Proper webhook setup ensures:
- **No revenue leakage** from unprocessed payments
- **Instant feature unlocking** improves user experience
- **Cross-platform sync** reduces support requests
- **Automatic renewals** maintain recurring revenue

## 📞 Support

For webhook setup assistance:
- Email: dxmylesx22@gmail.com
- Check logs for detailed error messages
- Use webhook testing tools for debugging