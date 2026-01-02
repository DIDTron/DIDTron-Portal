import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  return (
    <div>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-privacy-title">
              Privacy Policy
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
            <h2>1. Introduction</h2>
            <p>
              DIDTron Communications ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our VoIP services and website.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Company name and business address</li>
              <li>Billing and payment information</li>
              <li>Government-issued identification (for KYC verification)</li>
              <li>Technical configuration preferences</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>We automatically collect certain information when you use our services:</p>
            <ul>
              <li>Call detail records (CDRs) including date, time, duration, and phone numbers</li>
              <li>IP addresses and device information</li>
              <li>Service usage patterns and analytics</li>
              <li>Error logs and diagnostic data</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>With service providers who assist in our operations</li>
              <li>With carriers and interconnection partners to complete calls</li>
              <li>To comply with legal obligations or respond to lawful requests</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information, 
              including encryption, access controls, and regular security assessments. We maintain 
              SOC 2 Type II certification and comply with industry best practices.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. Call detail records are retained for a minimum of 
              2 years for billing and regulatory purposes.
            </p>

            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <h2>8. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers, including Standard 
              Contractual Clauses where required.
            </p>

            <h2>9. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and deliver personalized content. You can control cookie preferences through your 
              browser settings.
            </p>

            <h2>10. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect 
              personal information from children.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material 
              changes by posting the new policy on our website and updating the "Last updated" date.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              DIDTron Communications<br />
              Privacy Team<br />
              Email: privacy@didtron.com<br />
              Phone: +1 (888) 555-0123
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
