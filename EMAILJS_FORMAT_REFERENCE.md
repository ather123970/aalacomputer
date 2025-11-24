# EmailJS Email Format Reference ✅

## Email Template Parameters

The checkout system now sends emails with the following exact format:

```javascript
emailjs.send("service_r03n3pg", "template_7ih5zyg", {
  full_name: "Customer Full Name",
  email: "customer@email.com",
  phone: "+92 300 1234567",
  city: "Karachi",
  address: "123 Main Street",
  order_items: "1. Product Name\n   Price: Rs. 5,000\n   Qty: 1\n   Total: Rs. 5,000\n\n2. Product Name\n   Price: Rs. 3,000\n   Qty: 2\n   Total: Rs. 6,000",
  subtotal: "Rs. 11,000",
  shipping: "Free",
  tax: "Rs. 440 (4% COD)" // or "Included" for Bank Transfer
  total_amount: "Rs. 11,440",
  product_image: "https://example.com/product-image.jpg",
  payment_method: "Cash on Delivery" // or "Bank Transfer"
  payment_image: "" // Empty for now
}, "Y_CyOsWzg0DHn4Spg")
```

## Parameter Details

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `full_name` | String | Customer's full name | "John Doe" |
| `email` | String | Customer's email address | "john@example.com" |
| `phone` | String | Customer's phone number | "+92 300 1234567" |
| `city` | String | Customer's city | "Karachi" |
| `address` | String | Customer's street address | "123 Main St" |
| `order_items` | String | Formatted list of items | "1. Item\n   Price: Rs. X\n   Qty: Y\n   Total: Rs. Z" |
| `subtotal` | String | Subtotal with currency | "Rs. 11,000" |
| `shipping` | String | Shipping cost | "Free" |
| `tax` | String | Tax amount and type | "Rs. 440 (4% COD)" or "Included" |
| `total_amount` | String | Total order amount | "Rs. 11,440" |
| `product_image` | String | First product image URL | "https://..." |
| `payment_method` | String | Selected payment method | "Cash on Delivery" or "Bank Transfer" |
| `payment_image` | String | Payment proof image (optional) | "" |

## Tax Display Logic

```javascript
// For Cash on Delivery (COD)
tax: `Rs. ${tax.toFixed(2)} (4% COD)`
// Example: "Rs. 440.00 (4% COD)"

// For Bank Transfer
tax: "Included"
```

## Order Items Format

Each item is formatted as:
```
1. Product Name
   Price: Rs. 5,000
   Qty: 1
   Total: Rs. 5,000

2. Another Product
   Price: Rs. 3,000
   Qty: 2
   Total: Rs. 6,000
```

## Example Email Content

### Customer Details
- **Name**: Ahmed Khan
- **Email**: ahmed@example.com
- **Phone**: +92 300 1234567
- **City**: Karachi
- **Address**: 123 Main Street

### Order Items
1. Gaming PC
   Price: Rs. 50,000
   Qty: 1
   Total: Rs. 50,000

2. Monitor
   Price: Rs. 15,000
   Qty: 1
   Total: Rs. 15,000

### Order Summary
- **Subtotal**: Rs. 65,000
- **Shipping**: Free
- **Tax**: Rs. 2,600 (4% COD)
- **Total**: Rs. 67,600

### Payment Method
Cash on Delivery

## EmailJS Configuration

- **Service ID**: `service_r03n3pg`
- **Template ID**: `template_7ih5zyg`
- **Public Key**: `Y_CyOsWzg0DHn4Spg`
- **Recipient Email**: `aalacomputer1@gmail.com` (set in template)

## Implementation Location

**File**: `src/pages/CheckoutPage.jsx`
**Function**: `sendOrderEmail()`
**Lines**: 176-272

## Tax Calculation

```javascript
// Subtotal = Sum of all products
subtotal = item1.price × qty1 + item2.price × qty2 + ...

// Tax (only for COD)
if (payment_method === 'cod') {
  tax = subtotal × 0.04  // 4%
  tax_display = `Rs. ${tax.toFixed(2)} (4% COD)`
} else {
  tax_display = "Included"
}

// Total
total = subtotal + tax
```

## Testing

1. Fill checkout form with test data
2. Select "Cash on Delivery" to see 4% tax
3. Click "Place Order"
4. Check console for template parameters
5. Verify email received at `aalacomputer1@gmail.com`

## Notes

- All currency values include "Rs." prefix and comma formatting
- Order items are separated by double newlines
- Tax shows calculation method for COD
- Product image is the first item's image
- Payment image is currently empty (for future use)

---

**Status**: ✅ Production Ready
**Last Updated**: November 24, 2025
