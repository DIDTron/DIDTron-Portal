import { Badge } from "@/components/ui/badge";

export default function Terms() {
  return (
    <div>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-terms-title">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using DIDTron Communications' services ("Services"), you agree to be 
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not 
              use our Services.
            </p>

            <h2>2. Description of Services</h2>
            <p>DIDTron Communications provides:</p>
            <ul>
              <li>Voice termination services (wholesale and retail)</li>
              <li>Direct Inward Dialing (DID) number provisioning</li>
              <li>Cloud PBX and unified communications features</li>
              <li>SIP trunking services</li>
              <li>Related telecommunications services</li>
            </ul>

            <h2>3. Account Registration</h2>
            <p>
              To use our Services, you must create an account and provide accurate, complete information. 
              You are responsible for maintaining the confidentiality of your account credentials and 
              for all activities under your account.
            </p>

            <h2>4. Service Level Agreement</h2>
            <p>
              We provide a 99.99% uptime guarantee for our core voice services. Service credits may 
              be issued for qualifying outages according to our SLA policy. The SLA does not cover 
              scheduled maintenance, customer-caused issues, or force majeure events.
            </p>

            <h2>5. Acceptable Use Policy</h2>
            <p>You agree not to use our Services to:</p>
            <ul>
              <li>Transmit fraudulent, illegal, or harmful content</li>
              <li>Engage in robocalling, spam, or unsolicited communications</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Interfere with or disrupt our Services or networks</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Use the Services for illegal call routing or traffic pumping</li>
            </ul>

            <h2>6. Billing and Payment</h2>
            <h3>6.1 Prepaid Accounts</h3>
            <p>
              Prepaid customers must maintain a positive balance. Services may be suspended when 
              the balance reaches zero. Unused credits do not expire but are non-refundable.
            </p>
            <h3>6.2 Postpaid Accounts</h3>
            <p>
              Postpaid customers are invoiced monthly with Net-30 payment terms. Late payments 
              may incur interest charges and result in service suspension.
            </p>
            <h3>6.3 Disputes</h3>
            <p>
              Billing disputes must be submitted within 30 days of the invoice date. Undisputed 
              amounts remain due during the dispute resolution process.
            </p>

            <h2>7. Number Porting</h2>
            <p>
              We support number porting in accordance with applicable regulations. Porting timelines 
              vary by carrier and jurisdiction. You are responsible for ensuring you have the right 
              to port numbers to our service.
            </p>

            <h2>8. Emergency Services</h2>
            <p>
              VoIP services have limitations for emergency calling (911/112). You must register your 
              address for E911 services and understand the limitations compared to traditional phone 
              service. We are not liable for emergency service failures.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property associated with our Services remain 
              our property or that of our licensors. You may not use our marks without prior written 
              consent.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, DIDTron Communications shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, including loss 
              of profits, data, or business opportunities.
            </p>
            <p>
              Our total liability for any claim shall not exceed the amounts paid by you in the 
              twelve (12) months preceding the claim.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless DIDTron Communications, its officers, 
              directors, employees, and agents from any claims, damages, or expenses arising from 
              your use of the Services or violation of these Terms.
            </p>

            <h2>12. Termination</h2>
            <p>
              Either party may terminate the agreement with 30 days written notice. We may 
              immediately suspend or terminate your account for violations of these Terms or 
              non-payment. Upon termination, you remain liable for all accrued charges.
            </p>

            <h2>13. Modifications</h2>
            <p>
              We may modify these Terms at any time. Material changes will be communicated via 
              email or portal notification at least 30 days in advance. Continued use after 
              changes constitutes acceptance.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of New York, without regard to 
              conflict of law principles. Any disputes shall be resolved in the courts of New York 
              County, New York.
            </p>

            <h2>15. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and any applicable Service Orders, 
              constitute the entire agreement between you and DIDTron Communications.
            </p>

            <h2>16. Contact</h2>
            <p>
              For questions about these Terms, please contact:<br />
              DIDTron Communications<br />
              Legal Department<br />
              Email: legal@didtron.com<br />
              Phone: +1 (888) 555-0123
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
