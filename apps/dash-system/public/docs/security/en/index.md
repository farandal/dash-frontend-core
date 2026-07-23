# Security Policy

From confidential customer details, to payment information or simply menu catalogues and order history, our Merchants trust us to keep their data secure, private, and available whenever they need it. We take that responsibility seriously.

At DashAdmin, we maintain a security system that:

- **Prevents** all unauthorized access;
- **Supports** continuous monitoring for potential vulnerabilities; and
- **Embraces** ongoing, proactive improvement to stay on top of the latest security tools and threats.

---

## Data Protection

### In Transit

All merchant and customer data—including names, shipping and billing addresses, order information, menu data, and payment information—are transmitted using industry best practices:

- We use **TLS 1.2 and TLS 1.3** secure channels
- We support both **128-bit and 256-bit** encryption configurations, depending on the browser
- **SSL version 2 and SSL version 3 are never used** in our systems
- We strictly enforce the use of modern, secure protocols to protect data integrity and confidentiality

### At Rest

We use **Amazon Web Services (AWS)** servers to host all user data. We make extensive use of their built-in firewalls and virtual private networks to protect your data against unauthorized remote access.

- AWS data centers undergo annual certifications to ensure they meet the highest standards of physical and virtual security
- All stored data is encrypted using AES-256 encryption
- Database credentials and API keys are stored in AWS Secrets Manager

You can read more about [AWS security practices](https://aws.amazon.com/security/).

---

## Data Reliability

All user data is automatically backed up on AWS servers with multiple redundant copies:

- **Automatic daily backups** of all system data
- **Hourly incremental backups** of critical databases
- Backups are stored across **multiple Availability Zones (A-Z)**
- Additional **off-site backup copies** retained for at least 30 days
- User activity and access to backups is recorded for audit purposes under **AWS CloudTrail**
- Regular backup restoration tests to ensure data recovery capabilities

---

## Data Privacy

We make it a priority to be transparent in how we collect, use, and handle your information when you use our website and software.

- We comply with **Chilean Law 19.628** on the Protection of Private Life
- We follow international data protection standards and best practices
- We implement data minimization principles—we only collect what we need

Please see our full [Privacy Policy](/docs/privacy) for more details.

---

## Report a Vulnerability

If you discover any security vulnerability in DashAdmin, please email us at: **security@dashadmin.cl**

We'll do our best to fix it right away.

- We welcome and appreciate responsible disclosure from security researchers
- We commit to acknowledging receipt of your vulnerability report within 48 hours
- We will keep you informed about the remediation progress
- We do not pursue legal action against researchers who follow responsible disclosure practices

---

## Access Controls

### For Merchants (Restaurant Operators)

We verify Merchant account access through multiple security layers:

- **OAuth 2.0 based authentication** with store-code/email/password combination
- **Two-Factor Authentication (2FA)** is available and strongly recommended for all merchants
- Passwords are stored using **bcrypt hashing with unique salts** per user
- **Automated challenge-response tests (CAPTCHA)** to prevent brute-force attacks and automated access attempts
- Session management with automatic timeout for inactive sessions
- Login attempt monitoring and automatic account lockout after multiple failed attempts

### For Customers (End Users)

We verify Customer account access through:

- **Email/password-based authentication**
- Passwords are stored with **unique salts and secure hashing**
- **Automated challenge-response tests** to prevent automated attacks
- Optional passwordless authentication via magic links

### Infrastructure Access

For Identity and Access Management to our production systems, we rely on **AWS IAM**:

- **Role-based access control (RBAC)** with principle of least privilege
- Granular privileges granted only to key personnel
- Multi-factor authentication required for all infrastructure access
- Regular access reviews and automatic deprovisioning
- All access logged and monitored

---

## Incident Management and Disaster Recovery

We maintain comprehensive incident response and disaster recovery procedures:

### Backup Strategy
- **Hourly backups** of all databases
- Files backed up automatically after upload
- Backups tested regularly for integrity
- Stored on **multiple A-Z locations** plus off-site for at least **30 days**

### Incident Response
- We practice **regular recovery drills**
- Dedicated **Infrastructure Team** manages incident procedures
- Documented incident response playbooks for various scenarios
- In the event of an incident, we contact your account owner and work with you throughout the resolution

### Business Continuity
- Multi-region deployment capability
- Automatic failover systems
- Regular disaster recovery testing
- Recovery Time Objective (RTO) and Recovery Point Objective (RPO) defined and maintained

---

## External Audits and Compliance

We engage with external security experts to maintain the highest security standards:

- **Periodic security audits** performed by external experts
- We are committed to clarifying and resolving any relevant issues found by external auditors
- Automated vulnerability scanning and penetration testing
- Code security reviews as part of our development process

### Compliance Status

We are actively working toward the following certifications:

- ISO 27001 (Information Security Management)
- SOC 2 Type II (Service Organization Control)

For more details about our security practices or past audit results, please contact: **security@dashadmin.cl**

---

## Network Security

Our network security measures include:

- **Web Application Firewall (WAF)** protection
- **DDoS mitigation** through AWS Shield
- Network segmentation and isolation
- Intrusion detection and prevention systems
- Regular vulnerability assessments
- Continuous security monitoring and alerting

---

## Application Security

We follow secure development practices:

- **Secure Software Development Lifecycle (SSDLC)**
- Regular code reviews with security focus
- Dependency vulnerability scanning
- Input validation and output encoding
- Protection against OWASP Top 10 vulnerabilities
- Regular security training for development team

---

## Physical Security

Our infrastructure is hosted in AWS data centers that provide:

- 24/7 security personnel
- Biometric access controls
- Video surveillance
- Environmental controls (fire suppression, climate control)
- Redundant power and network connectivity

---

## Contact Information

For security-related inquiries or to report a vulnerability:

**Email:** info+security@dashadmin.cl  
**General Support:** info@dashadmin.cl  

---

_Last reviewed: January 16, 2026_
