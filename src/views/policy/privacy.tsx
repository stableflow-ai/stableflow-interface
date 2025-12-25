import { useState, useEffect } from "react";
import BackButton from "@/components/back-button";
import MainTitle from "@/components/main-title";

/// created by public/privacy-policy.25.12.2025.docx

export default function PrivacyPolicy() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      let scrollTop = 0;

      if (scrollContainer) {
        scrollTop = scrollContainer.scrollTop;
      } else {
        scrollTop = window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      }

      const shouldShow = scrollTop > 50;
      setShowBackToTop(shouldShow);
    };

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }

    handleScroll();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[1100px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        <BackButton className="absolute translate-x-[10px] translate-y-[-5px] md:translate-y-[10px] md:translate-x-[0px]" />
        <MainTitle className="!hidden md:!flex" />
        <div className="px-[10px] md:px-0 mt-[40px] mb-[40px]">
          <div className="bg-white/80 rounded-[12px] shadow-[0_0_10px_0_rgba(0,0,0,0.05)] p-[16px] md:p-[24px]">
            <div className="text-[20px] md:text-[24px] font-semibold mb-[12px]">Privacy Policy</div>
            <div className="privacy-policy max-w-none">
              <h1>PRIVACY POLICY OF NEAR-INTENTS INTERFACE</h1>
              <p><strong>Updated as of 25.12.2025</strong></p>

              <h2>1. About Us</h2>
              <p>
                <strong><span className="bg-[#ffff00]">[Eureka Labs Ltd.]</span> ("Company," "we," "us," or "our")</strong> values your privacy and We do our best effort to collect as minimum as possible any Personal Data. This Privacy Policy outlines how we handle data when you <strong>("You", Yours" or "User")</strong> access or use the following website-hosted user Interface, including but not limited to: <span className="bg-[#ffff00]">stableflow.ai, deposit.stableflow.ai</span>(and all features available via the Interface) (the "Interface" or "Website"). The Interface provide access to the decentralized NEAR Intents Protocol, which is not controlled or operated by the Company.
              </p>
              <p>
                This Privacy Policy applies only to the Interface activities and is valid for Users who are visitors to the Interface with regards to the Personal Data that they share and/or which is collected within the Interface. This Privacy Policy is not applicable to any Personal Data collected offline or via channels other than the Interface. Please read this Privacy Policy carefully to understand our policies and practices regarding your data and how it will be treated by the Interface.
              </p>
              <p>
                IF YOU DO NOT HAVE THE RIGHT, POWER AND AUTHORITY TO ACT ON BEHALF OF AND BIND THE BUSINESS, ORGANIZATION, OR OTHER ENTITY YOU REPRESENT, PLEASE DO NOT ACCESS OR OTHERWISE USE THE INTERFACE.
              </p>
              <p>
                Unless otherwise specified in this Privacy Policy, the terms used here have the same definitions as outlined in the UK GDPR (as defined in section 3(10), as supplemented by section 205(4), of the UK's Data Protection Act 2018) and the EU GDPR (General Data Protection Regulation (EU) 2016/679)) <strong>("GDPR")</strong>.
              </p>

              <h2>2. Changes to this Agreement</h2>
              <p>
                If our data processing practices change, we will update this Privacy Policy accordingly to let you know of them upfront and give you a possibility to either provide your consent, object to a particular processing, or undertake other action you are entitled to under the Regulation. Please keep track of any changes we may introduce to this Privacy Policy. Your continued access to and use of the Interface constitutes your awareness of all amendments made to this Privacy Policy as of the date of your accessing and use of the Interface. Therefore, we encourage You to review this Privacy Policy regularly as you shall be bound by it. If, for some reason, You are not satisfied with our personal data processing practices, your immediate recourse is to stop using the Interface. You do not have to inform us of this decision unless you intend to exercise some of the data protection rights stipulated by GDPR and defined below in this Privacy Policy.
              </p>

              <h2>3. Eligibility</h2>
              <p>
                By accessing our Interface, you represent and warrant that you are at least eighteen (18) years of age. If you are under the age of eighteen (18), you may not, under any circumstances or for any reason, use the Interface. Please report to us any instances involving the use of the Interface by individuals under the age of 18, should they come to your knowledge.
              </p>

              <h2>4. Data Collection in connection with the Interface</h2>
              <p>
                The Interface serve as a non-custodial tool that enables Users to interact with the NEAR Intents Protocol (the "<strong>Protocol</strong>"), which operates independently from the Company.
              </p>
              <p>
                We have no access to and will never ask for your private keys or wallet seed. Never trust anyone or any application that asks you to enter your private keys or wallet seed.
              </p>
              <p>
                To the maximum extent possible, we try to collect as little Personal Data from you as possible. Personal Data we collect:
              </p>
              <ul>
                <li>IP address, log files, domain server, data related to usage, performance, website security, traffic patterns, location information, browser and device information – only when you are using the Interface;</li>
                <li>Wallet addresses (public blockchain addresses), transaction, and balance information (blockchain data) that is accessible when interacting with the Interface; The legal basis for this processing is our legitimate interests, such as monitoring and improving the Interface, the proper protection of the Interface against risks, and partly the contract performance basis to provide you the Interface. Note that we are not responsible for your use of any of the blockchain and your data processed in these decentralized and permissionless networks;</li>
              </ul>
              <p>
                The Company may, but is not obliged to, engage third-parties advertising platforms that are triggered only when their technical features (so-called "pixels") are enabled through the Interface. The mentioned third-parties advertising platforms may collect Personal Data of Interface's visitors only with the purpose to optimize their advertising possibilities through their platforms, target you with their advertisements, and possibly share your data with other advertising platforms and agencies for further use. The Company may engage with the mentioned Personal Data of Interface visitors.
              </p>
              <p>
                In no event, are we going to ask you to share your private keys or wallet seed. Never trust anyone or any website that asks you to enter your private keys or wallet seed.
              </p>

              <h3>Blockchain Data</h3>
              <p>
                Please note that we are not responsible for (i) your use of Ethereum or any other blockchain and (ii) the use of your personal data as processed in these decentralized and permissionless blockchain networks. Your private key which you utilize to access your Ethereum or other blockchain funds and initiate transactions is stored only on your own device.
              </p>
              <p>
                You should also be aware that due to the inherent transparency of the blockchain networks, transactions that you approve when using the Interface may be publicly accessible. This includes, but is not limited to, your public sending address, the public address of the receiver, the amount sent or received, and any other data a user has chosen to include in a given transaction. Transactions and addresses available on blockchain may reveal personal data about the user's identity, and personal data can potentially be correlated now or in the future by any party who chooses to do so, including law enforcement. In addition, we may process publicly available data, including information obtained through blockchain intelligence and analytics services. This may involve analyzing blockchain transactions, wallet addresses, and other data accessible on public blockchains or related platforms to enhance the functionality of the Services, ensure security, and provide insights into blockchain activities. Certain elements, when combined with other information, may reveal your identity.
              </p>
              <p>
                We encourage you to review how privacy and transparency on the blockchain network work.
              </p>

              <h3>Why we may use your personal data</h3>
              <p>
                To clear any doubts, we may use Personal Data described above or any other Personal Data:
              </p>
              <ul>
                <li>on the basis of contract performance or necessity to enter into a contract (where the Personal Data is required for us to perform our undertakings and obligations in accordance with a contract we are entering into when you use our services, or where we are at the negotiations phase);</li>
                <li>on the basis of our or our processors' legitimate interests to protect the Interface, prevent any malicious and harmful activities to the Interface, maintain our technical systems healthily and secure, improve services and products by using aggregate statistics;</li>
                <li>to respond to legal requests of authorities, provide information upon court orders and judgments, or if we have a good-faith belief that such disclosure is necessary in order to comply with official investigations or legal proceedings initiated by governmental and/or law enforcement officials, or private parties, including but not limited to: in response to subpoenas, search warrants or court orders, and including other similar statutory obligations we or our processors are subjected to;</li>
                <li>on the basis of your consent; and</li>
                <li>on other legal bases set forth in the personal data protection laws.</li>
              </ul>

              <h3>Disclosure of Data</h3>
              <p>
                In continuation of legal bases for collecting and processing the Personal Data, We may disclose any Personal Data about you:
              </p>
              <ul>
                <li>in connection with a merger, division, restructuring, or other association change; or</li>
                <li>to our subsidiaries or affiliates (if any) only if necessary for operational purposes. If we must disclose any of your Personal Data in order to comply with official investigations or legal proceedings initiated by governmental and/or law enforcement officials, we may not be able to ensure that such recipients of your Personal Data will maintain the privacy or security of your Personal Data.</li>
              </ul>

              <h3>Data Retention Period</h3>
              <p>
                The Company maintains Personal Data exclusively within the time needed to follow prescribed herein legal purposes. When we no longer need Personal Data, the limitation period for storage of such Personal Data has expired, you have withdrawn your consent or objected to our or our processors' legitimate interests, we securely delete or destroy it unless the statutory requirements we, our processors or other controllers are subjected to stipulate otherwise. Aggregated data, which cannot directly identify a device/browser (or individual) and is used for purposes of reporting and analysis, is maintained for as long as commercially necessary till you object to the processing of such data or withdraw your consent.
              </p>
              <p>
                Sometimes legal requirements oblige us to retain certain data, for specific purposes, for an extended period of time. Reasons we might retain some data for longer periods of time include:
              </p>
              <ul>
                <li>Security, fraud & abuse prevention;</li>
                <li>Financial monitoring and record-keeping;</li>
                <li>Complying with legal or regulatory requirements;</li>
                <li>Ensuring the continuity of your interaction with the Interface.</li>
              </ul>

              <h2>5. Cookies and similar technologies</h2>
              <p>
                Our Website uses cookies and similar technologies (collectively "tools") provided either by us or by third parties.
              </p>
              <p>
                A cookie is a small text file stored on your device by your browser. They are useful since they allow us to recognize your device, in order for our Website to work properly or more efficiently. They can also be used to provide information to the owners of websites on how users engage with them. Without cookies or some other similar technology (e.g. web storage, fingerprints, tags, or pixels), we would have no way of 'remembering' our visitors. While most browsers accept these by default, you can adjust settings to reject or store them only with your consent. Refusing may impact your ability to use our Website seamlessly.
              </p>
              <p>
                In addition, we also use temporary cookies that are stored on your end device to optimize user-friendliness. If you visit our platform again to use our services, it will automatically recognize that you have already been with us and what entries and settings you have made so that you do not have to enter them again.
              </p>
              <p>
                Furthermore, we use cookies to statistically record the use of our Platform and to evaluate it for you for optimizing our Platform and further marketing. These cookies enable us to automatically recognize when you return to our Platform that you have already been with us.
              </p>
              <p>
                The data processed by cookies for the aforementioned purposes is justified to protect our legitimate interests and those of third parties.
              </p>
              <p>
                Most browsers automatically accept cookies. However, you can configure your browser so that no cookies are stored on your computer or a message always appears before a new cookie is created. However, the complete deactivation of cookies can lead to the fact that you cannot use all functions of our Platform.
              </p>

              <h2>6. Third-party apps and websites</h2>
              <p>
                Our Website may contains links to websites or apps that are not operated by us. When you click on a third-party link, you will be directed to that third-party's website or app. We have no control over the content, privacy policies, or practices of any of these third parties.
              </p>
              <p>
                We maintain a presence on social networks to communicate with you, our clients, and prospective clients, as well as to provide information about our Program, products, and services. If you have an account on the same network, it is possible that your information and media are made available to us, for example, when we access your profile.
              </p>
              <p>
                As soon as we transfer personal data into our own system, we are responsible for this independently. This is done to carry out pre-contractual steps or to fulfill a contract with you.
              </p>
              <p>
                Below is the list of social networks on which we are present:
              </p>
              <ul>
                <li>Telegram: Privacy policy;</li>
                <li>X: Privacy policy;</li>
              </ul>

              <h2>7. For how long do we store personal data</h2>
              <p>
                We retain personal data for the period necessary to fulfill the purposes for which it was collected, in accordance with the legal, regulatory and contractual obligations to which we are subject. Once this retention period is over, we delete the personal data or irreversibly anonymize it.
              </p>

              <h2>8. With whom we share personal data</h2>
              <h3>Our service providers</h3>
              <p>
                We collaborate with third-party entities ("service providers") to support the functioning of our Website. These service providers assist in various activities, such as analyzing service usage, facilitating payments, and providing IT infrastructure. They are granted access to your personal data solely to the extent required to carry out these tasks.
              </p>
              <p>
                Categories of service providers that can access your personal data:
              </p>
              <ul>
                <li>Cloud service, hosting and infrastructure providers;</li>
                <li>E-mailing service providers;</li>
                <li>Advertising and affiliate networks;</li>
                <li>IT and security services;</li>
                <li>Social media and content platforms;</li>
                <li>Professional advisers we use, such as accountants and lawyers;</li>
                <li>Other group entities that are involved in your matter.</li>
              </ul>

              <h2>9. Data Disclosure</h2>
              <p>
                We may disclose your personal data when we have a sincere belief that such disclosure is essential for the following purposes:
              </p>
              <ul>
                <li>To fulfil a legal obligation, which includes cases where such disclosure is required by law or in response to lawful requests from public authorities, such as a court or a government agency.</li>
                <li>To safeguard the security of our services and safeguard our rights or property.</li>
                <li>To prevent or investigate potential unlawful conduct related to our operations.</li>
              </ul>

              <h2>10. How we keep personal data safe</h2>
              <p>
                We implement reasonable technical and organizational security measures that we consider appropriate to safeguard your stored personal data from manipulation, loss, or unauthorized access by third parties. Our security measures are continuously updated to align with advancements in technology.
              </p>
              <p>
                We place significant emphasis on internal data privacy. Our staff and engaged service providers are bound by confidentiality and must comply with relevant data protection laws. Moreover, they are granted access to personal data only to the extent necessary for the performance of their respective duties or obligations.
              </p>
              <p>
                We value the security of your personal data; however, please bear in mind that no method of transmitting data over the internet or electronic storage can be guaranteed 100% secure. While we make every effort to employ commercially reasonable measures to protect your personal data, we cannot provide absolute security. We recommend employing antivirus software, firewalls, and similar tools to enhance the protection of your system.
              </p>

              <h2>11. Your Rights</h2>
              <p>
                You possess the following data protection rights. To exercise these rights, please reach out to us at the provided address or send an email to <a href="mailto:Joe@dapdap.org">Joe@dapdap.org</a>. Please be aware that we may ask you to verify your identity before addressing your requests.
              </p>
              <ul>
                <li><strong>Right to Access:</strong> You have the right to request a copy of your personal data, which we will furnish to you in an electronic format.</li>
                <li><strong>Right to Correction:</strong> You can request us to rectify any inaccuracies or incompleteness in your data.</li>
                <li><strong>Right to Withdraw Consent:</strong> If you've given your consent for the processing of your personal data, you have the right to withdraw it at any time, affecting future processing. This applies, for example, when you wish to opt out of marketing communications. Once we receive your withdrawal of consent, we will no longer process your information for the purpose(s) you initially consented to, unless there exists another legal basis for processing.</li>
                <li><strong>Right to Erasure:</strong> You have the right to request the deletion of your personal data when it is no longer necessary for the purposes it was collected, or if it was processed unlawfully.</li>
                <li><strong>Right to Restrict Processing:</strong> You can request the limitation of our processing of your personal data in cases where you believe it to be inaccurate, processed unlawfully, or no longer needed for the original purpose, but cannot be deleted due to legal obligations or your own request.</li>
                <li><strong>Right to Data Portability:</strong> You can request that we transmit your personal data to another data controller in a standard format (e.g., Excel), if you provided this data to us and we processed it based on your consent or to fulfill contractual obligations.</li>
                <li><strong>Right to Object to Processing:</strong> If the legal basis for processing your personal data is our legitimate interest, you have the right to object to such processing based on your specific situation. We will respect your request, unless we have a compelling legal basis for the processing that outweighs your interests or if we need to continue processing the data for legal defense purposes.</li>
                <li><strong>Right to File a Complaint with a Supervisory Authority:</strong> If you believe that the processing of your personal data violates data protection laws, you have the right to lodge a complaint with a data protection supervisory authority. In the EU and EEA, you can exercise this right by contacting a supervisory authority in your country of residence, workplace, or where you believe the infringement occurred. You can find a list of the relevant authorities here: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members" target="_blank" rel="noopener noreferrer">https://edpb.europa.eu/about-edpb/about-edpb/members</a>. The General Data Protection Regulation also gives you the right to lodge a complaint with a supervisory authority. The supervisory authority in the UK is the Information Commissioner's Office (<a href="https://ico.org.uk/" target="_blank" rel="noopener noreferrer">https://ico.org.uk/</a>).</li>
              </ul>
              <p>
                We will respond to your requests within 30 days of receiving them. This response period may be extended if the request is particularly complex, which we will inform you of promptly. Within this period, we will respond to your request or inform you of the reasons why your request cannot be met.
              </p>

              <h2>13. Contact Us</h2>
              <p>
                If you have any inquiries or concerns regarding this Privacy Policy, please do not hesitate to contact us at:
              </p>
              <p className="">
                <span className="bg-[#ffff00]">
                  Eureka Labs Ltd.
                </span>
                <br />
                <a className="bg-[#ffff00]" href="mailto:Joe@dapdap.org">Joe@dapdap.org</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed cursor-pointer bottom-[20px] right-[15px] transform md:right-[15px] z-50 w-[36px] h-[36px] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          style={{ backgroundColor: '#6284F5' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#243262'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6284F5'}
          aria-label="Back to Top"
        >
          <svg
            className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
      <style>
        {`
        .privacy-policy h1,.privacy-policy h2,.privacy-policy h3,.privacy-policy h4,.privacy-policy h5,.privacy-policy h6{margin:16px 0 8px;line-height:1.3;color:#0a0a0a;scroll-margin-top:80px}
        .privacy-policy h1{font-size:28px;font-weight:700}
        .privacy-policy h2{font-size:22px;font-weight:700}
        .privacy-policy h3{font-size:18px;font-weight:600}
        .privacy-policy h4{font-size:16px;font-weight:600}
        .privacy-policy h5{font-size:14px;font-weight:600}
        .privacy-policy h6{font-size:12px;font-weight:600}
        .privacy-policy p{margin:8px 0;color:#1f2937;line-height:1.6}
        .privacy-policy ul{margin:8px 0 8px 20px;list-style:disc}
        .privacy-policy ol{margin:8px 0 8px 20px;list-style:decimal}
        .privacy-policy li{margin:4px 0;color:#374151}
        .privacy-policy hr{border:none;border-top:1px solid rgba(0,0,0,0.08);margin:18px 0}
        .privacy-policy a{color:#0ea5e9;text-decoration:underline;transition:color 0.2s ease}
        .privacy-policy a:hover{color:#0284c7}
        html{scroll-behavior:smooth}
        .privacy-policy strong{font-weight:700;color:#111827}
        .privacy-policy em{font-style:italic;color:#374151}
        `}
      </style>
    </div>
  );
}
