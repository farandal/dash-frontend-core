/**
 * Default Terms Page
 * 
 * Terms of service page template.
 */
import React from 'react';
import DashDefaultStaticPage from './DashDefaultStaticPage';


interface DefaultTermsPageProps {
    companyName?: string;
    effectiveDate?: string;
    content?: string | React.ReactNode;
}

const DefaultTermsPage: React.FC<DefaultTermsPageProps> = ({
    companyName = 'Our Company',
    effectiveDate = new Date().toLocaleDateString(),
    content,
}) => {
    const defaultContent = (
        <div>
            <p><strong>Effective Date:</strong> {effectiveDate}</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing and using this service, you accept and agree to be bound by the terms 
                and provision of this agreement.
            </p>
            
            <h2>2. Use License</h2>
            <p>
                Permission is granted to temporarily access the materials (information or software) 
                on {companyName}'s website for personal, non-commercial transitory viewing only.
            </p>
            
            <h2>3. Disclaimer</h2>
            <p>
                The materials on {companyName}'s website are provided on an 'as is' basis. 
                {companyName} makes no warranties, expressed or implied, and hereby disclaims and 
                negates all other warranties including, without limitation, implied warranties or 
                conditions of merchantability, fitness for a particular purpose, or non-infringement 
                of intellectual property or other violation of rights.
            </p>
            
            <h2>4. Limitations</h2>
            <p>
                In no event shall {companyName} or its suppliers be liable for any damages 
                (including, without limitation, damages for loss of data or profit, or due to 
                business interruption) arising out of the use or inability to use the materials 
                on {companyName}'s website.
            </p>
            
            <h2>5. Contact Information</h2>
            <p>
                If you have any questions about these Terms, please contact us.
            </p>
        </div>
    );

    return (
        <DashDefaultStaticPage 
            title="Terms of Service"
            content={content || defaultContent}
        />
    );
};

export default DefaultTermsPage;
