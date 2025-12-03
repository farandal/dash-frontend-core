/**
 * Default Privacy Policy Page
 * 
 * Privacy policy page template.
 */
import React from 'react';
import DashDefaultStaticPage from './DashDefaultStaticPage';


interface DefaultPrivacyPageProps {
    companyName?: string;
    effectiveDate?: string;
    contactEmail?: string;
    content?: string | React.ReactNode;
}

const DefaultPrivacyPage: React.FC<DefaultPrivacyPageProps> = ({
    companyName = 'Our Company',
    effectiveDate = new Date().toLocaleDateString(),
    contactEmail = 'privacy@example.com',
    content,
}) => {
    const defaultContent = (
        <div>
            <p><strong>Effective Date:</strong> {effectiveDate}</p>
            
            <h2>1. Information We Collect</h2>
            <p>
                We collect information you provide directly to us, such as when you create an 
                account, make a purchase, or contact us for support.
            </p>
            
            <h2>2. How We Use Your Information</h2>
            <p>
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, and send you technical notices and support messages.
            </p>
            
            <h2>3. Information Sharing</h2>
            <p>
                We do not share your personal information with third parties except as described 
                in this privacy policy or with your consent.
            </p>
            
            <h2>4. Data Security</h2>
            <p>
                We take reasonable measures to help protect information about you from loss, theft, 
                misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
            
            <h2>5. Your Rights</h2>
            <p>
                You have the right to access, correct, or delete your personal information. 
                You may also have the right to restrict or object to certain processing of your data.
            </p>
            
            <h2>6. Cookies</h2>
            <p>
                We use cookies and similar tracking technologies to track activity on our service 
                and hold certain information to improve and analyze our service.
            </p>
            
            <h2>7. Changes to This Policy</h2>
            <p>
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new privacy policy on this page.
            </p>
            
            <h2>8. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
        </div>
    );

    return (
        <DashDefaultStaticPage 
            title="Privacy Policy"
            content={content || defaultContent}
        />
    );
};

export default DefaultPrivacyPage;
