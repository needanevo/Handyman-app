import os
from typing import List, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class QuoteEmailService:
    """
    Enhanced email service for sending detailed quotes with AI suggestions
    """
    
    def __init__(self):
        api_key = os.getenv("SENDGRID_API_KEY")
        if not api_key:
            raise ValueError("SENDGRID_API_KEY is required")
        
        self.client = SendGridAPIClient(api_key)
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "quotes@therealjohnson.com")
        self.company_name = os.getenv("COMPANY_NAME", "The Real Johnson Handyman Services")
        self.company_phone = os.getenv("COMPANY_PHONE", "(555) 123-4567")
        self.company_email = os.getenv("COMPANY_EMAIL", "info@therealjohnson.com")
    
    def _generate_quote_html(
        self,
        customer_name: str,
        quote_data: Dict[str, Any],
        ai_suggestion: Dict[str, Any] = None,
        customer_request: Dict[str, Any] = None
    ) -> str:
        """
        Generate beautiful HTML email for quote
        """
        
        # Format items
        items_html = ""
        for item in quote_data.get('items', []):
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong>{item['service_title']}</strong><br>
                    <small style="color: #666;">{item['description']}</small>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                    {item['quantity']}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    ${item['unit_price']:.2f}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                    <strong>${item['total_price']:.2f}</strong>
                </td>
            </tr>
            """
        
        # Customer request section (if provided)
        request_section = ""
        if customer_request:
            photo_urls = customer_request.get('photo_urls', [])
            photos_html = ""
            if photo_urls:
                photos_html = "<div style='margin-top: 15px;'><strong>Attached Photos:</strong><br>"
                for i, url in enumerate(photo_urls, 1):
                    photos_html += f"<a href='{url}' style='color: #2196F3; margin-right: 10px;'>Photo {i}</a>"
                photos_html += "</div>"
            
            preferred_dates = customer_request.get('preferred_dates', [])
            dates_html = ""
            if preferred_dates:
                dates_str = ", ".join(preferred_dates)
                dates_html = f"<p><strong>Preferred Dates:</strong> {dates_str}</p>"
            
            request_section = f"""
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your Request Details</h3>
                <p><strong>Description:</strong><br>{customer_request.get('description', 'N/A')}</p>
                <p><strong>Service Type:</strong> {customer_request.get('service_category', 'N/A')}</p>
                <p><strong>Urgency:</strong> {customer_request.get('urgency', 'Normal').title()}</p>
                {dates_html}
                {photos_html}
            </div>
            """
        
        # AI suggestion section (if provided)
        ai_section = ""
        if ai_suggestion:
            confidence_percent = int(ai_suggestion.get('confidence', 0) * 100)
            materials_list = ""
            for material in ai_suggestion.get('suggested_materials', []):
                materials_list += f"<li>{material}</li>"
            
            ai_section = f"""
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
                <h3 style="color: #1976d2; margin-top: 0;">🤖 AI Analysis</h3>
                <p><strong>Estimated Hours:</strong> {ai_suggestion.get('estimated_hours', 'N/A')} hours</p>
                <p><strong>Complexity Rating:</strong> {ai_suggestion.get('complexity_rating', 'N/A')}/5</p>
                <p><strong>Confidence Level:</strong> {confidence_percent}%</p>
                <p><strong>Reasoning:</strong><br>{ai_suggestion.get('reasoning', 'N/A')}</p>
                <div style="margin-top: 10px;">
                    <strong>Suggested Materials:</strong>
                    <ul style="margin: 5px 0;">
                        {materials_list}
                    </ul>
                </div>
            </div>
            """
        
        # Main HTML email template
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">
                                        {self.company_name}
                                    </h1>
                                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                                        Your Professional Quote
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333; margin-top: 0;">Hello {customer_name},</h2>
                                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                                        Thank you for choosing {self.company_name}! We've carefully reviewed your request 
                                        and prepared a detailed quote for your project.
                                    </p>
                                    
                                    {request_section}
                                    
                                    {ai_section}
                                    
                                    <!-- Quote Details -->
                                    <div style="margin: 30px 0;">
                                        <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                            Quote Breakdown
                                        </h3>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                                            <thead>
                                                <tr style="background: #f8f9fa;">
                                                    <th style="padding: 12px; text-align: left; color: #666; font-weight: 600;">Service</th>
                                                    <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                                                    <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Unit Price</th>
                                                    <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items_html}
                                                <tr>
                                                    <td colspan="3" style="padding: 12px; text-align: right; color: #666;">Subtotal:</td>
                                                    <td style="padding: 12px; text-align: right;">${quote_data.get('subtotal', 0):.2f}</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" style="padding: 12px; text-align: right; color: #666;">Trip Fee:</td>
                                                    <td style="padding: 12px; text-align: right;">${quote_data.get('trip_fee', 0):.2f}</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" style="padding: 12px; text-align: right; color: #666;">Tax ({quote_data.get('tax_rate', 0)*100:.1f}%):</td>
                                                    <td style="padding: 12px; text-align: right;">${quote_data.get('tax_amount', 0):.2f}</td>
                                                </tr>
                                                <tr style="background: #f8f9fa;">
                                                    <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #333;">
                                                        Total Amount:
                                                    </td>
                                                    <td style="padding: 15px; text-align: right; font-size: 24px; font-weight: bold; color: #667eea;">
                                                        ${quote_data.get('total_amount', 0):.2f}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- Quote Validity -->
                                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #856404;">
                                            <strong>⏰ This quote is valid for 30 days</strong> from the date of issue.
                                        </p>
                                    </div>
                                    
                                    <!-- Call to Action -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                                            Ready to get started? Accept this quote to schedule your service!
                                        </p>
                                        <a href="{os.getenv('APP_URL', 'https://therealjohnson.com')}/quotes/{quote_data.get('id')}" 
                                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; 
                                                  font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Accept Quote
                                        </a>
                                    </div>
                                    
                                    <!-- Contact Info -->
                                    <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px;">
                                        <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                            <strong>Questions?</strong> We're here to help!
                                        </p>
                                        <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                            📞 Phone: {self.company_phone}<br>
                                            ✉️ Email: {self.company_email}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f8f9fa; padding: 20px 30px; text-align: center;">
                                    <p style="color: #999; font-size: 12px; margin: 0;">
                                        © {datetime.now().year} {self.company_name}. All rights reserved.<br>
                                        Professional handyman services you can trust.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        return html
    
    async def send_quote_email(
        self,
        to_email: str,
        customer_name: str,
        quote_data: Dict[str, Any],
        ai_suggestion: Dict[str, Any] = None,
        customer_request: Dict[str, Any] = None
    ) -> bool:
        """
        Send detailed quote email with AI suggestions and customer request info
        
        Args:
            to_email: Customer email address
            customer_name: Customer's name
            quote_data: Quote details (items, totals, etc.)
            ai_suggestion: Optional AI analysis data
            customer_request: Optional original request data
            
        Returns:
            True if email sent successfully
        """
        try:
            html_content = self._generate_quote_html(
                customer_name=customer_name,
                quote_data=quote_data,
                ai_suggestion=ai_suggestion,
                customer_request=customer_request
            )
            
            message = Mail(
                from_email=Email(self.from_email),
                to_emails=To(to_email),
                subject=f"Your Quote from {self.company_name} - ${quote_data.get('total_amount', 0):.2f}",
                html_content=html_content
            )
            
            response = self.client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Quote email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending quote email: {e}")
            raise Exception(f"Failed to send quote email: {str(e)}")
    
    async def send_quote_received_notification(
        self,
        to_email: str,
        customer_name: str,
        service_category: str
    ) -> bool:
        """
        Send immediate confirmation email when quote request is received
        """
        try:
            html = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
                    <h2 style="color: #667eea;">Request Received! 🎉</h2>
                    <p>Hi {customer_name},</p>
                    <p>We've received your request for <strong>{service_category}</strong> services.</p>
                    <p>Our team is reviewing your project details and photos. You'll receive a detailed quote within 24 hours.</p>
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        Best regards,<br>
                        <strong>{self.company_name}</strong>
                    </p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=Email(self.from_email),
                to_emails=To(to_email),
                subject=f"Quote Request Received - {self.company_name}",
                html_content=html
            )
            
            response = self.client.send(message)
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            logger.error(f"Error sending confirmation email: {e}")
            return False
