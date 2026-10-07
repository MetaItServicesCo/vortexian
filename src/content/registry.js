// =====================================================================
// Editable site content
// ---------------------------------------------------------------------
// Every block of text/media an admin can change is declared here once:
//   - `fields` drive the generic admin form (/dashboard/content/<key>)
//   - `defaults` are what the site shows until an admin saves changes
//
// Field types: text | textarea | richtext | image | video | url | number
//              | boolean | icon | list (with nested `fields`)
// Rich text field names MUST end in "_html" (the API sanitises those).
// Image fields store their alt text in "<name>_alt" (or `altKey`); alt text
// is required. Mark CSS backgrounds `decorative: true` (no alt needed).
// Saved content is merged over defaults, so adding a field here is safe.
// =====================================================================

const visible = { name: "visible", label: "Show this section", type: "boolean" };

const pageMeta = (heroTitle, metaTitle, metaDescription) => ({
    fields: [
        {
            name: "hero_title",
            label: "Page heading (H1)",
            type: "text",
            help: "The page's main heading, shown in the top banner. Each page should have a unique H1 that includes its main keyword (e.g. \"About Vortexian Tech – IT & Recruitment Experts\").",
        },
        { name: "meta_title", label: "SEO title", type: "text", help: "Shown in browser tabs and Google results (≈60 characters)." },
        { name: "meta_description", label: "SEO description", type: "textarea", help: "Shown under the title in Google results (≈160 characters)." },
    ],
    defaults: { hero_title: heroTitle, meta_title: metaTitle, meta_description: metaDescription },
});

const linkFields = [
    { name: "label", label: "Label", type: "text" },
    { name: "href", label: "Link", type: "url", placeholder: "/contact or https://…" },
];

export const CONTENT_GROUPS = ["Global", "Home Page", "About Page", "Contact Page", "Career Page", "Services Page", "Portfolio Page", "Blog Page"];

export const CONTENT_SECTIONS = [
    // ------------------------------------------------------------------ GLOBAL
    {
        key: "settings",
        group: "Global",
        title: "Basic Info",
        description: "Company name, logo, contact details, social links and default SEO.",
        fields: [
            { name: "site_name", label: "Company name", type: "text" },
            { name: "logo", label: "Logo", type: "image" },
            { name: "email", label: "General email", type: "text", help: "Shown in the top bar and footer. Also used on the Contact page if no Contact page email is set." },
            { name: "enquiries_email", label: "Contact page email (optional)", type: "text", help: "Shown on the Contact page. Leave empty to use the general email." },
            { name: "career_email", label: "Career email (optional)", type: "text", help: "Shown on the Career page for applicants who prefer to email their CV." },
            { name: "phone", label: "Primary phone", type: "text", help: "Shown in the footer, on the Contact page, and used by the floating call button. Write it as visitors should see it, e.g. +1 (214) 217-6302." },
            { name: "phone_secondary", label: "Second phone (optional)", type: "text", help: "Shown next to the primary phone in the footer and on the Contact page." },
            { name: "whatsapp", label: "WhatsApp number (optional)", type: "text", help: "International format, digits only, e.g. 12142176302. Adds WhatsApp buttons in the footer and the floating contact menu. Leave empty to hide them." },
            { name: "address", label: "Address", type: "textarea" },
            { name: "office_hours", label: "Office hours", type: "text" },
            { name: "facebook", label: "Facebook URL", type: "url" },
            { name: "linkedin", label: "LinkedIn URL", type: "url" },
            { name: "instagram", label: "Instagram URL", type: "url" },
            { name: "pinterest", label: "Pinterest URL", type: "url" },
            { name: "twitter", label: "X / Twitter URL", type: "url" },
            { name: "youtube", label: "YouTube URL", type: "url" },
            { name: "messenger", label: "Messenger URL", type: "url", help: "e.g. https://m.me/yourpage" },
            { name: "meta_title", label: "Default SEO title", type: "text", help: "Used for the home page and any page without its own title." },
            { name: "meta_description", label: "Default SEO description", type: "textarea" },
            { name: "og_image", label: "Social share image", type: "image", help: "Shown when links are shared on social media (1200×630)." },
        ],
        defaults: {
            site_name: "Vortexian Tech",
            logo: "/assets/images/logo-f.png",
            logo_alt: "Vortexian Tech logo",
            email: "farina@vortexiantech.com",
            enquiries_email: "info@vortexiantech.com",
            career_email: "",
            phone: "+92 335 4018789",
            phone_secondary: "",
            whatsapp: "923354018789",
            address: "",
            office_hours: "Monday - Friday 8:00 AM - 5:00 PM (CST)",
            facebook: "",
            linkedin: "",
            instagram: "",
            pinterest: "",
            twitter: "",
            youtube: "",
            messenger: "",
            meta_title: "Vortexian Tech | IT Solutions & Services",
            meta_description: "Innovative IT solutions, recruitment, and digital marketing services.",
            og_image: "",
        },
    },
    {
        key: "header",
        group: "Global",
        title: "Header & Navigation",
        description: "Top bar and main menu.",
        fields: [
            { name: "show_top_bar", label: "Show top bar (email & social icons)", type: "boolean" },
            {
                name: "menu",
                label: "Menu items",
                type: "list",
                itemLabel: "label",
                fields: [
                    ...linkFields,
                    { name: "children", label: "Dropdown items", type: "list", itemLabel: "label", fields: linkFields },
                ],
            },
            { name: "cta_label", label: "Button label", type: "text" },
            { name: "cta_link", label: "Button link", type: "url" },
        ],
        defaults: {
            show_top_bar: true,
            menu: [
                { label: "HOME", href: "/", children: [] },
                {
                    label: "SERVICES",
                    href: "/services",
                    children: [
                        { label: "Web Development", href: "/services" },
                        { label: "Digital Marketing", href: "/services" },
                    ],
                },
                { label: "CAREER", href: "/career", children: [] },
                {
                    label: "ABOUT",
                    href: "/about",
                    children: [
                        { label: "About Us", href: "/about" },
                        { label: "Portfolio", href: "/portfolio" },
                        { label: "Blog", href: "/blog" },
                    ],
                },
                { label: "CONTACT US", href: "/contact", children: [] },
            ],
            cta_label: "Get A Quote",
            cta_link: "/contact",
        },
    },
    {
        key: "footer",
        group: "Global",
        title: "Footer",
        description: "Footer text and links. Custom pages marked “Show in footer” are listed automatically.",
        fields: [
            { name: "about_heading", label: "About heading", type: "text" },
            { name: "about_text", label: "About text", type: "textarea" },
            { name: "explore_heading", label: "Links heading", type: "text" },
            { name: "explore_links", label: "Links", type: "list", itemLabel: "label", fields: linkFields },
            { name: "pages_heading", label: "Custom pages heading", type: "text", help: "Heading above pages from the Pages section (e.g. Legal)." },
            { name: "registered_heading", label: "Registration heading", type: "text" },
            {
                name: "registered_logos",
                label: "Registration logos",
                type: "list",
                itemLabel: "alt",
                fields: [
                    { name: "image", label: "Logo", type: "image", altKey: "alt" },
                ],
            },
            { name: "newsletter_heading", label: "Newsletter heading", type: "text" },
            { name: "newsletter_text", label: "Newsletter text", type: "textarea" },
            { name: "copyright", label: "Copyright line", type: "text", help: "{year} is replaced with the current year." },
        ],
        defaults: {
            about_heading: "About",
            about_text: "We work with a passion of taking challenges and creating new ones in advertising sector.",
            explore_heading: "Explore",
            explore_links: [
                { label: "Careers", href: "/career" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
            ],
            pages_heading: "Legal",
            registered_heading: "Registered by",
            registered_logos: [
                { image: "/assets/images/257769.svg", alt: "FBR" },
                { image: "/assets/images/SECP-Logo.png", alt: "SECP" },
            ],
            newsletter_heading: "Newsletter",
            newsletter_text: "Subscribe our newsletter to get our latest update & news",
            copyright: "© {year} Vortexian Tech | Designed & Developed By Primemax Digital",
        },
    },
    {
        key: "page_banner",
        group: "Global",
        title: "Page Banner",
        description: "Background image behind the title banner on inner pages.",
        fields: [{ name: "background_image", label: "Background image", type: "image", decorative: true }],
        defaults: {
            background_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80",
        },
    },

    // --------------------------------------------------------------- HOME PAGE
    {
        key: "home.hero",
        group: "Home Page",
        title: "Hero Video",
        fields: [
            visible,
            { name: "video", label: "Background video", type: "video" },
            { name: "poster", label: "Poster image", type: "image", decorative: true, help: "Shown while the video loads." },
            {
                name: "heading",
                label: "Home page heading (H1)",
                type: "text",
                help: "The home page's main heading for Google and screen readers. Include your main keywords.",
            },
            { name: "show_heading", label: "Show the heading over the video", type: "boolean", help: "Off: the heading is in the page for SEO and accessibility but not visible." },
        ],
        defaults: {
            visible: true,
            video: "/assets/video/video-6mb.mp4",
            poster: "",
            heading: "Vortexian Tech – IT Solutions, Recruitment & Digital Marketing",
            show_heading: false,
        },
    },
    {
        key: "home.recruitment",
        group: "Home Page",
        title: "Recruitment Banner",
        fields: [
            visible,
            { name: "heading_underlined", label: "Heading — underlined part", type: "text" },
            { name: "heading_highlight", label: "Heading — highlighted part", type: "text" },
            { name: "heading_rest", label: "Heading — rest", type: "text" },
            { name: "subheading", label: "Subheading", type: "text" },
            { name: "button_label", label: "Button label", type: "text" },
            { name: "button_link", label: "Button link", type: "url" },
            { name: "show_clock", label: "Show live clock", type: "boolean" },
        ],
        defaults: {
            visible: true,
            heading_underlined: "RECRUIT",
            heading_highlight: "WORKFORCES",
            heading_rest: "FOR COUNTRYWIDE PROJECTS",
            subheading: "Offering Limited Time Discount On Recruitment Services",
            button_label: "Get In Touch",
            button_link: "/contact",
            show_clock: true,
        },
    },
    {
        key: "home.banner",
        group: "Home Page",
        title: "Full-width Banner Image",
        fields: [
            visible,
            { name: "image", label: "Image", type: "image", altKey: "alt" },
            { name: "link", label: "Link (optional)", type: "url" },
        ],
        defaults: { visible: true, image: "/assets/images/rrrrrr.png", alt: "Vortexian Tech Banner Showcase", link: "" },
    },
    {
        key: "home.services",
        group: "Home Page",
        title: "Services Section",
        description: "Section heading. The service cards come from Manage Services.",
        fields: [
            visible,
            { name: "eyebrow", label: "Small label", type: "text" },
            { name: "heading", label: "Heading", type: "text" },
            { name: "text", label: "Intro text", type: "textarea" },
        ],
        defaults: {
            visible: true,
            eyebrow: "Our Services",
            heading: "We Shape the Perfect Solution.",
            text: "Empowering your business with innovative strategies and tailored solutions for sustainable growth.",
        },
    },
    {
        key: "home.about",
        group: "Home Page",
        title: "About Section",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "body_html", label: "Text", type: "richtext" },
            { name: "image", label: "Image", type: "image" },
        ],
        defaults: {
            visible: true,
            heading: "About Us",
            body_html:
                "<p>Welcome to <strong>Vortexian Tech</strong>, your all-in-one solution for navigating the complexities of modern business. Our diverse range of capabilities encompasses everything from payroll management and creative design to marketing strategies, technology solutions, and expert consultancy services. With a focus on innovation and efficiency, we empower businesses to streamline their operations, elevate their brand presence, and drive sustainable growth. At <strong>Vortexian Tech</strong>, we understand that every business is unique, which is why we offer tailored solutions to meet your specific needs and objectives.</p>" +
                "<p>Whether you're looking to optimize your payroll processes, unleash your creative potential, amplify your marketing efforts, harness the power of technology, or find the right talent to fuel your success, our dedicated team is here to guide you every step of the way. With our comprehensive capabilities and unwavering commitment to excellence, trust Vortexian Tech to be your trusted partner in achieving your business goals. At <strong>Vortexian Tech</strong>, your success is our priority, and we are dedicated to turning your challenges into opportunities. We pride ourselves on building lasting relationships with our clients, driven by trust, transparency, and a shared vision for the future. Join us and experience the transformative power of innovation and efficiency, propelling your business to new heights.</p>",
            image: "/assets/images/home-about.jpg",
            image_alt: "Vortexian Tech team in a meeting",
        },
    },
    {
        key: "home.perks",
        group: "Home Page",
        title: "Employee Perks",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "textarea" },
            {
                name: "items",
                label: "Perks",
                type: "list",
                itemLabel: "title",
                fields: [
                    { name: "title", label: "Title", type: "text" },
                    { name: "icon", label: "Icon", type: "icon" },
                    { name: "desc", label: "Description", type: "textarea" },
                ],
            },
        ],
        defaults: {
            visible: true,
            heading: "What We Do For Our\nEmployees",
            items: [
                { title: "Compensation", icon: "DollarSign", desc: "Competitive salary and performance bonuses. The company covers conferences, certifications, courses, and internet service." },
                { title: "Health & Wellness", icon: "Heart", desc: "We offer top-tier international medical coverage and pays for 100% of the insurance cost for its employees." },
                { title: "Family", icon: "Users", desc: "Parental leave, flexible vacation time and time-off policies. Kids + pet friendly office and liberal WFH policies." },
                { title: "Food", icon: "Utensils", desc: "We provide catered, gourmet meals every weekday and stock an impressive supply of cold-pressed juices and snacks." },
                { title: "Birthday Celebrations", icon: "Cake", desc: "Birthday celebrations include company-sponsored parties, gifts, and paid time off, ensuring all employees feel valued." },
                { title: "All Hands", icon: "Handshake", desc: "Weekly meetings dedicated to English proficiency and company news, plus a monthly Tech-Lunch meeting." },
                { title: "Access to Course and Certification", icon: "BookOpen", desc: "Employees have access to courses and certifications fully funded by the company, encouraging continuous development." },
                { title: "Employee Loan", icon: "Wallet", desc: "Employee loan programs offer financial assistance with favorable terms, helping staff manage personal expenses." },
                { title: "Paid Trainings", icon: "GraduationCap", desc: "The company provides paid trainings to employees, ensuring ongoing professional development and skill enhancement." },
                { title: "Gym Membership", icon: "Dumbbell", desc: "The company provides paid trainings to enhance employee skills and knowledge, supporting professional advancement." },
            ],
        },
    },
    {
        key: "home.stats",
        group: "Home Page",
        title: "Stats & Call to Action",
        fields: [
            visible,
            { name: "background_image", label: "Background image", type: "image", decorative: true },
            {
                name: "items",
                label: "Statistics",
                type: "list",
                itemLabel: "label",
                fields: [
                    { name: "value", label: "Number", type: "text" },
                    { name: "label", label: "Label", type: "text" },
                    { name: "icon", label: "Icon", type: "icon" },
                ],
            },
            { name: "cta_heading", label: "Call-to-action heading", type: "textarea" },
            { name: "cta_image", label: "Call-to-action image", type: "image" },
            { name: "cta_button_label", label: "Button label", type: "text" },
            { name: "cta_button_link", label: "Button link", type: "url" },
        ],
        defaults: {
            visible: true,
            background_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80",
            items: [
                { value: "8600", label: "Projects Completed", icon: "Briefcase" },
                { value: "680", label: "Active Clients", icon: "Users" },
                { value: "102", label: "Expert People", icon: "UserCheck" },
                { value: "7430", label: "Happy Clients", icon: "Star" },
            ],
            cta_heading: "Let’s Discuss How to\nMake your Business Better.",
            cta_image: "/assets/images/ceoo.png",
            cta_image_alt: "Vortexian Tech business consultant",
            cta_button_label: "Discover More",
            cta_button_link: "/about",
        },
    },
    {
        key: "home.testimonials",
        group: "Home Page",
        title: "Testimonials Section",
        description: "Section heading. Testimonials themselves are managed under Testimonials.",
        fields: [visible, { name: "eyebrow", label: "Small label", type: "text" }, { name: "heading", label: "Heading", type: "textarea" }],
        defaults: { visible: true, eyebrow: "Our Testimonials", heading: "What They're\nTalking About us." },
    },
    {
        key: "home.blog",
        group: "Home Page",
        title: "Blog Section",
        description: "Section heading. Posts come from Blog.",
        fields: [visible, { name: "eyebrow", label: "Small label", type: "text" }, { name: "heading", label: "Heading", type: "text" }],
        defaults: { visible: true, eyebrow: "From The Blog", heading: "Latest News & Articles from the Blog." },
    },
    {
        key: "home.contact",
        group: "Home Page",
        title: "Contact Form Section",
        fields: [
            visible,
            { name: "eyebrow", label: "Small label", type: "text" },
            { name: "heading", label: "Heading", type: "text" },
            { name: "button_label", label: "Button label", type: "text" },
            { name: "image", label: "Side image", type: "image" },
        ],
        defaults: {
            visible: true,
            eyebrow: "Contact Us",
            heading: "Drop us a Line.",
            button_label: "Send A Message",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80",
            image_alt: "Vortexian Tech office team at work",
        },
    },
    {
        key: "home.cta",
        group: "Home Page",
        title: "Bottom Call to Action",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "text", label: "Text", type: "text" },
            { name: "button_label", label: "Button label", type: "text" },
            { name: "button_link", label: "Button link", type: "url" },
        ],
        defaults: {
            visible: true,
            heading: "Unlock expert guidance and insight",
            text: "consult with us now for solutions tailored to your needs.",
            button_label: "Get A Quote",
            button_link: "/contact",
        },
    },

    // -------------------------------------------------------------- ABOUT PAGE
    {
        key: "page.about",
        group: "About Page",
        title: "Page Title & SEO",
        ...pageMeta("ABOUT US", "About Us | Vortexian Tech - Our Story & Mission", "Learn more about Vortexian Tech. We are a team of expert developers and strategists dedicated to providing innovative business solutions."),
    },
    {
        key: "about.ceo",
        group: "About Page",
        title: "CEO Message",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "message_html", label: "Message", type: "richtext" },
            { name: "name", label: "Name line", type: "text" },
            { name: "email", label: "Email line", type: "text" },
            { name: "image", label: "Photo", type: "image" },
        ],
        defaults: {
            visible: true,
            heading: "A Visionary Message from Our CEO: Pioneering Innovation at Vortexian Tech",
            message_html:
                "<p>At Vortexian Tech, we are driven by a relentless passion for innovation and excellence. Our commitment to pushing the boundaries of technology is at the heart of everything we do. From developing cutting-edge solutions to fostering a culture of collaboration and creativity, we strive to empower businesses and individuals alike to thrive in a digital world. As we continue to grow and evolve, our focus remains on delivering exceptional value to our clients, partners, and employees. Together, we are shaping the future of technology and creating opportunities for growth and success.</p>",
            name: "CEO: Farina Sadiq",
            email: "Email: farina@vortexiantech.com",
            image: "/assets/images/ceo.jpeg",
            image_alt: "Farina Sadiq, CEO of Vortexian Tech",
        },
    },
    {
        key: "about.who",
        group: "About Page",
        title: "Who We Are",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "body_html", label: "Text", type: "richtext" },
            { name: "image", label: "Image (optional)", type: "image", help: "Replaces the animated question-mark illustration." },
        ],
        defaults: {
            visible: true,
            heading: "Who We Are?",
            body_html:
                "<p>Welcome to <strong>Vortexian Tech</strong>, where our commitment to driving businesses towards unparalleled success is unwavering. We understand that in today’s rapidly evolving landscape, businesses require multifaceted support to thrive. That’s why we offer a comprehensive suite of services spanning staffing, payroll management, creativity, marketing, technology solutions, consultancy, and lead generation. Each of these capabilities is meticulously designed to address the diverse needs of our clients, empowering them to navigate challenges with confidence and seize opportunities with clarity.</p>",
            image: "",
        },
    },
    {
        key: "about.why",
        group: "About Page",
        title: "Why Choose Us",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "body_html", label: "Text", type: "richtext" },
            { name: "image", label: "Image (optional)", type: "image", help: "Replaces the animated magnifier illustration." },
        ],
        defaults: {
            visible: true,
            heading: "Why Choose Us?",
            body_html:
                "<p>At Vortexian Tech, we’re dedicated to delivering tailored, innovative <strong>IT solutions</strong> that drive business success. With a proven track record of excellence, we prioritize your unique needs, ensuring superior quality, expert support, and a customer-centric approach. Partner with us to elevate your technology strategy and achieve your business goals with confidence.</p>",
            image: "",
        },
    },
    {
        key: "about.team",
        group: "About Page",
        title: "Team Section",
        description: "Section heading. Members are managed under Team Management.",
        fields: [
            visible,
            { name: "eyebrow", label: "Small label", type: "text" },
            { name: "heading", label: "Heading — first line", type: "text" },
            { name: "heading_highlight", label: "Heading — highlighted line", type: "text" },
            { name: "watermark", label: "Background watermark word", type: "text" },
        ],
        defaults: { visible: true, eyebrow: "Meet The Minds", heading: "Architects of", heading_highlight: "Digital Innovation", watermark: "Vortexian" },
    },

    // ------------------------------------------------------------ CONTACT PAGE
    {
        key: "page.contact",
        group: "Contact Page",
        title: "Page Title & SEO",
        ...pageMeta("CONTACT US", "Contact Us | Vortexian Tech - Get A Quote", "Reach out to Vortexian Tech for advanced IT solutions and expert consultancy. Request a quote for your project today."),
    },
    {
        key: "contact.form",
        group: "Contact Page",
        title: "Quote Form",
        fields: [
            {
                name: "services",
                label: "Services clients can pick",
                type: "list",
                itemLabel: "name",
                fields: [{ name: "name", label: "Service", type: "text" }],
            },
            { name: "submit_label", label: "Submit button label", type: "text" },
            { name: "details_heading", label: "Contact details heading", type: "text" },
            { name: "phone_label", label: "Phone label", type: "text" },
            { name: "email_label", label: "Email label", type: "text" },
        ],
        defaults: {
            services: ["Digital Marketing", "Web Development", "App Development", "UI/UX Design", "Cloud Solutions", "Lead Generation"].map((name) => ({ name })),
            submit_label: "Submit Request Quote",
            details_heading: "Contact Details",
            phone_label: "Phone Operations",
            email_label: "Enterprise Mailbox",
        },
    },

    // ------------------------------------------------------------- CAREER PAGE
    {
        key: "page.career",
        group: "Career Page",
        title: "Page Title & SEO",
        ...pageMeta("CAREER", "Careers | Vortexian Tech - Join Our Professional Team", "Explore career opportunities at Vortexian Tech. We are looking for talented developers, designers, and innovators to join our countrywide projects."),
    },
    {
        key: "career.intro",
        group: "Career Page",
        title: "Intro Text",
        fields: [
            { name: "heading", label: "Heading", type: "text" },
            { name: "text_html", label: "Text", type: "richtext" },
        ],
        defaults: {
            heading: "Explore Exciting Career Opportunities at Vortexian Tech",
            text_html: "<p>Join the dynamic team at Vortexian Tech and embark on a rewarding career in the forefront of technology innovation.</p>",
        },
    },

    // ----------------------------------------------------------- SERVICES PAGE
    {
        key: "page.services",
        group: "Services Page",
        title: "Page Title & SEO",
        ...pageMeta("Our Services", "Enterprise Solutions & IT Capabilities | Vortexian Tech", "Explore our technical and creative digital capabilities. From cutting-edge UX/UI system models to server-side web development configurations."),
    },
    {
        key: "services.intro",
        group: "Services Page",
        title: "Intro",
        fields: [
            { name: "eyebrow", label: "Small label", type: "text" },
            { name: "heading", label: "Heading", type: "text" },
            { name: "heading_highlight", label: "Heading — highlighted part", type: "text" },
            { name: "text", label: "Text", type: "textarea" },
        ],
        defaults: {
            eyebrow: "Capabilities & Systems",
            heading: "Transforming Concepts into",
            heading_highlight: "Elite Architectures",
            text: "We decoupled from standard outdated WordPress frameworks to deliver staggering serverless speed, layout configuration flexibility, and pure organic positioning.",
        },
    },

    // ---------------------------------------------------------- PORTFOLIO PAGE
    {
        key: "page.portfolio",
        group: "Portfolio Page",
        title: "Page Title & SEO",
        ...pageMeta("PORTFOLIO", "Portfolio | Vortexian Tech - Showcasing Digital Excellence", "Explore our elite range of projects in web development, serverless applications, enterprise platforms, and custom digital architectures."),
    },

    // --------------------------------------------------------------- BLOG PAGE
    {
        key: "page.blog",
        group: "Blog Page",
        title: "Page SEO",
        fields: [
            { name: "meta_title", label: "SEO title", type: "text" },
            { name: "meta_description", label: "SEO description", type: "textarea" },
        ],
        defaults: {
            meta_title: "Blog | Latest Insights & Articles — Vortexian Tech",
            meta_description: "Read the latest articles from Vortexian Tech. Insights on software development, digital marketing, recruitment, and IT strategy.",
        },
    },
    {
        key: "blog.hero",
        group: "Blog Page",
        title: "Blog Hero",
        fields: [
            { name: "heading", label: "Heading", type: "text" },
            { name: "subheading", label: "Subheading", type: "text" },
            { name: "primary_label", label: "First button label", type: "text" },
            { name: "primary_link", label: "First button link", type: "url" },
            { name: "secondary_label", label: "Second button label", type: "text" },
            { name: "secondary_link", label: "Second button link", type: "url" },
            { name: "image", label: "Image", type: "image" },
            { name: "badges", label: "Floating badges", type: "list", itemLabel: "text", fields: [{ name: "text", label: "Text", type: "text" }] },
        ],
        defaults: {
            heading: "Read our latest blogs",
            subheading: "At Vortexian Tech we value your trust",
            primary_label: "Hire Talent Now →",
            primary_link: "/contact",
            secondary_label: "Find Job Now →",
            secondary_link: "/career",
            image: "/assets/images/ceo.jpeg",
            image_alt: "Farina Sadiq, CEO of Vortexian Tech",
            badges: [{ text: "Hire Faster" }, { text: "Pay-Per-Hire" }, { text: "Hire Through Expert" }],
        },
    },
    {
        key: "blog.trusted",
        group: "Blog Page",
        title: "Trusted By",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            {
                name: "logos",
                label: "Companies",
                type: "list",
                itemLabel: "name",
                fields: [
                    { name: "name", label: "Company name", type: "text" },
                    { name: "image", label: "Logo (optional)", type: "image" },
                ],
            },
        ],
        defaults: {
            visible: true,
            heading: "Trusted by leading companies",
            logos: ["NP Digital", "Parul University", "Justdial", "Quest Global", "Healthysure", "Mobile Programming"].map((name) => ({ name, image: "" })),
        },
    },
    {
        key: "blog.banner",
        group: "Blog Page",
        title: "Hiring Banner",
        description: "Shown on the blog list and at the end of each article.",
        fields: [
            visible,
            { name: "heading", label: "Heading", type: "text" },
            { name: "image", label: "Image", type: "image" },
            { name: "primary_label", label: "First button label", type: "text" },
            { name: "primary_link", label: "First button link", type: "url" },
            { name: "secondary_label", label: "Second button label", type: "text" },
            { name: "secondary_link", label: "Second button link", type: "url" },
        ],
        defaults: {
            visible: true,
            heading: "We understand the critical need for timely, high-quality hires!",
            image: "/assets/images/ceo.jpeg",
            image_alt: "Farina Sadiq, CEO of Vortexian Tech",
            primary_label: "Hire Talent Now",
            primary_link: "/contact",
            secondary_label: "Find Job Now",
            secondary_link: "/career",
        },
    },
];

export const SECTION_MAP = Object.fromEntries(CONTENT_SECTIONS.map((s) => [s.key, s]));

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Saved values win; lists are replaced wholesale (so items can be removed)
function merge(defaults, saved) {
    if (!isPlainObject(saved)) return defaults;
    const result = { ...defaults };
    for (const [key, value] of Object.entries(saved)) {
        result[key] = isPlainObject(defaults[key]) && isPlainObject(value) ? merge(defaults[key], value) : value;
    }
    return result;
}

export function resolveSection(key, saved) {
    return merge(SECTION_MAP[key]?.defaults || {}, saved?.[key]);
}

export function resolveAll(saved = {}) {
    return Object.fromEntries(CONTENT_SECTIONS.map((s) => [s.key, resolveSection(s.key, saved)]));
}
